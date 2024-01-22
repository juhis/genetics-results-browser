from typing import Any, Optional, TypedDict
import pysam
import threading
import timeit
import json
from collections import OrderedDict as od, defaultdict as dd
from exceptions import ACZeroException, VariantNotFoundException
from singleton import Singleton
from typing import TypedDict
from variant import Variant


class Csq(TypedDict):
    gene_ids: list[str]
    consequences: set[str]


class Csq_dict(TypedDict):
    gene_symbol: str
    consequence: str


class GnomAD(object, metaclass=Singleton):
    def __init__(self, conf: dict[str, Any]) -> None:
        self.conf = conf
        self._init_tabix()

    def get_gnomad(self, variant: Variant) -> dict[str, Any]:
        start_time: float = timeit.default_timer()
        try:
            tabix_iter = self.tabix_gnomad[threading.get_ident()].fetch(
                variant.chr, variant.pos - 1, variant.pos
            )
        except ValueError:
            raise VariantNotFoundException("chromosome not found")
        gnomad = {"exomes": None, "genomes": None}
        for row in tabix_iter:
            data = row.split("\t")
            if (
                data[self.gnomad_headers["ref"]] == variant.ref
                and data[self.gnomad_headers["alt"]] == variant.alt
            ):
                data = self._get_gnomad_fields(data)
                if data["genome_or_exome"] == "e":
                    gnomad["exomes"] = data
                elif data["genome_or_exome"] == "g":
                    gnomad["genomes"] = data

        if gnomad["exomes"] is None and gnomad["genomes"] is None:
            raise VariantNotFoundException(f"variant {variant} not found")

        if (
            gnomad["exomes"] is None
            or (
                gnomad["exomes"]["filters"] is not None
                and "AC0" in gnomad["exomes"]["filters"]
            )
        ) and (
            gnomad["genomes"] is None
            or (
                gnomad["genomes"]["filters"] is not None
                and "AC0" in gnomad["genomes"]["filters"]
            )
        ):
            raise ACZeroException(f"AC0 for {variant}")

        # calculate min and max AFs over populations
        for ge in ["exomes", "genomes"]:
            if gnomad[ge] is not None:
                popmax_pop = "NA"
                popmax_af = 0
                popmin_pop = "NA"
                popmin_af = 1
                for k in gnomad[ge].keys():
                    if k.startswith("AF_") and gnomad[ge][k] is not None:
                        if gnomad[ge][k] > popmax_af:
                            popmax_af = gnomad[ge][k]
                            popmax_pop = k.replace("AF_", "")
                        if gnomad[ge][k] < popmin_af:
                            popmin_af = gnomad[ge][k]
                            popmin_pop = k.replace("AF_", "")
                gnomad[ge]["popmax"] = {"pop": popmax_pop, "af": popmax_af}
                gnomad[ge]["popmin"] = {"pop": popmin_pop, "af": popmin_af}

        # prefer exomes over genomes only if AN in exomes is higher than AN in genomes
        gnomad["preferred"] = "genomes"
        if gnomad["genomes"] is None or (
            gnomad["exomes"] is not None
            and gnomad["exomes"]["AN"] > gnomad["genomes"]["AN"]
        ):
            gnomad["preferred"] = "exomes"

        end_time: float = timeit.default_timer() - start_time

        return {
            "variant": str(variant),
            "gnomad": gnomad,
            "time": end_time,
        }

    def _init_tabix(self) -> None:
        self.tabix_gnomad: dict[int, pysam.TabixFile] = dd(
            lambda: pysam.TabixFile(self.conf["gnomad"]["file"], parser=None)  # type: ignore
        )
        self.gnomad_headers: dict[str, int] = od(
            {
                h: i
                for i, h in enumerate(
                    self.tabix_gnomad[threading.get_ident()].header[0].split("\t")
                )
            }
        )

    def summarize_freq(self, data: list[Any]) -> list[dict[str, str | int | float]]:
        gn = [d["gnomad"] for d in data]
        max_freqs = {}
        for c in gn:
            max_freq = max(
                (
                    (k.split("_")[1], v)
                    for k, v in (c.get("exomes") or c.get("genomes")).items()
                    if k.startswith("AF_") and v is not None
                ),
                key=lambda x: x[1],
                default=("", 0),
            )
            max_freqs[max_freq[0]] = max_freqs.get(max_freq[0], 0) + 1

        min_freqs = {}
        for c in gn:
            min_freq = min(
                (
                    (k.split("_")[1], v)
                    for k, v in (c.get("exomes") or c.get("genomes")).items()
                    if k.startswith("AF_") and v is not None
                ),
                key=lambda x: x[1],
                default=("", 1),
            )
            min_freqs[min_freq[0]] = min_freqs.get(min_freq[0], 0) + 1

        all_pops = [
            k.split("_")[1]
            for k in data[0]["gnomad"]["genomes"].keys()
            if k.startswith("AF_")
        ]
        all_pops_freqs = [
            {
                "pop": pop,
                "max": max_freqs.get(pop, 0),
                "maxPerc": max_freqs.get(pop, 0) / len(gn),
                "min": min_freqs.get(pop, 0),
                "minPerc": min_freqs.get(pop, 0) / len(gn),
            }
            for pop in all_pops
        ]

        return all_pops_freqs

    # workaround for Union with empty list
    # https://stackoverflow.com/questions/58906541/incompatible-types-in-assignment-expression-has-type-listnothing-variabl
    def _get_empty_csq(self) -> list[Csq_dict]:
        return []

    def _get_gnomad_fields(
        self, data: dict[int, str | int | float]
    ) -> dict[str, str | int | float | Optional[list[Csq_dict]]]:
        gnomad: dict[
            str,
            str | int | float | Optional[list[Csq_dict]],
        ] = od()
        for h in self.gnomad_headers:
            if (
                data[self.gnomad_headers[h]] == "NA"
                or data[self.gnomad_headers[h]] == ""
            ):
                gnomad[h] = (
                    None if h.lower() != "consequences" else self._get_empty_csq()
                )
            elif h.lower() == "consequences":
                gnomad[h] = self._group_gnomad_consequences(
                    json.loads(str(data[self.gnomad_headers[h]]))
                )
            elif h.lower() == "pos" or h.lower() == "an":
                gnomad[h] = int(data[self.gnomad_headers[h]])
            elif h.lower().startswith("af"):
                gnomad[h] = float(data[self.gnomad_headers[h]])
            elif h.lower() == "most_severe":
                gnomad[h] = (
                    str(data[self.gnomad_headers[h]])
                    .replace("_variant", "")
                    .replace("_", " ")
                )
            else:
                gnomad[h] = data[self.gnomad_headers[h]]
        return gnomad

    def _group_gnomad_consequences(
        self, consequences: list[dict[str, str]]
    ) -> list[Csq_dict]:
        csq: dict[str, Csq] = dd(lambda: {"gene_ids": [], "consequences": set()})
        for c in consequences:
            csq[c["gene_symbol"]]["gene_ids"].append(c["gene_id"])
            csq[c["gene_symbol"]]["consequences"].update(c["consequences"])
        return [
            {
                "gene_symbol": k,
                "consequence": c.replace("_variant", "").replace("_", " "),
            }
            for k, v in csq.items()
            for c in v["consequences"]
        ]
