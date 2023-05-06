from typing import Any, TypedDict
import pysam
import threading
import timeit
import json
from collections import OrderedDict as od, defaultdict as dd
from exceptions import VariantNotFoundException
from singleton import Singleton
from typing import TypedDict


class Csq_dict(TypedDict):
    gene_ids: list[str]
    consequences: set[str]


class GnomAD(object, metaclass=Singleton):
    def __init__(self, conf) -> None:
        self.conf = conf
        self._init_tabix()

    def get_gnomad(self, variant) -> dict[str, Any]:
        start_time: float = timeit.default_timer()
        try:
            tabix_iter = self.tabix_gnomad[threading.get_ident()].fetch(
                variant.chr, variant.pos - 1, variant.pos
            )
        except ValueError:
            raise VariantNotFoundException("chromosome not found")
        gnomad = None
        for row in tabix_iter:
            data = row.split("\t")
            if (
                data[self.gnomad_headers["ref"]] == variant.ref
                and data[self.gnomad_headers["alt"]] == variant.alt
            ):
                gnomad = self._get_gnomad_fields(data)
                break
        if gnomad is None:
            raise VariantNotFoundException("variant not found")
        gnomad["consequences"] = self._group_gnomad_consequences(gnomad["consequences"])
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

    def _get_gnomad_fields(self, data) -> dict[str, Any]:
        gnomad: dict[str, Any] = od()
        for h in self.gnomad_headers:
            if (
                data[self.gnomad_headers[h]] == "NA"
                or data[self.gnomad_headers[h]] == ""
            ):
                gnomad[h] = None if h.lower() != "consequences" else []
            elif h.lower() == "consequences":
                gnomad[h] = json.loads(data[self.gnomad_headers[h]])
            elif h.lower() == "pos" or h.lower() == "an":
                gnomad[h] = int(data[self.gnomad_headers[h]])
            elif h.lower().startswith("af"):
                gnomad[h] = float(data[self.gnomad_headers[h]])
            elif h.lower() == "most_severe":
                gnomad[h] = (
                    data[self.gnomad_headers[h]]
                    .replace("_variant", "")
                    .replace("_", " ")
                )
            else:
                gnomad[h] = data[self.gnomad_headers[h]]
        return gnomad

    def _group_gnomad_consequences(self, consequences) -> list[dict[str, str]]:
        csq: dict[str, Csq_dict] = dd(lambda: {"gene_ids": [], "consequences": set()})
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
