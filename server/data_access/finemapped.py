import sqlite3
from typing import Any
import pysam
import threading
import timeit
from collections import OrderedDict as od, defaultdict as dd

from datatypes import (
    FineMappedResult,
    FineMappedResults,
)
from variant import Variant
from singleton import Singleton


class Finemapped(object, metaclass=Singleton):
    def _init_tabix(self) -> None:
        self.tabix: dict[int, pysam.TabixFile] = dd(
            lambda: pysam.TabixFile(self.conf["finemapped"]["file"], parser=None)  # type: ignore
        )
        self.headers = od(
            {
                h: i
                for i, h in enumerate(
                    self.tabix[threading.get_ident()].header[0].split("\t")
                )
            }
        )

    def __init__(self, conf: dict[str, Any]) -> None:
        self.conf = conf
        self._init_tabix()
        self.rsid_conn: dict[int, sqlite3.Connection] = dd(
            lambda: sqlite3.connect(conf["finemapped"]["metadata_db"])
        )
        self.finemapped_resources = set(
            [resource["resource"] for resource in self.conf["finemapped"]["resources"]]
        )

    def get_finemapped(self, variant: Variant) -> FineMappedResults:
        start_time = timeit.default_timer()
        finemapped: list[FineMappedResult] = []
        found_resources = set()
        tabix_iter = self.tabix[threading.get_ident()].fetch(
            variant.chr, variant.pos - 1, variant.pos
        )
        for row in tabix_iter:
            data = row.split("\t")
            resource = data[self.headers["#resource"]]
            if (
                data[self.headers["ref"]] == variant.ref
                and data[self.headers["alt"]] == variant.alt
                # skip results for resources not in the config
                and resource in self.finemapped_resources
            ):
                found_resources.add(resource)
                data_type = data[self.headers["data_type"]]
                dataset = data[self.headers["dataset"]]
                phenocode = data[self.headers["trait"]]
                result: FineMappedResult = {
                    "resource": resource,
                    "dataset": dataset,
                    "data_type": data_type,
                    "phenocode": phenocode
                    if data_type != "sQTL"
                    else dataset + ":" + phenocode,
                    "mlog10p": float(data[self.headers["mlog10p"]]),
                    "beta": float(data[self.headers["beta"]]),
                    "se": float(data[self.headers["se"]]),
                    "pip": float(data[self.headers["pip"]]),
                    "cs_size": int(data[self.headers["cs_size"]]),
                    "cs_min_r2": float(data[self.headers["cs_min_r2"]]),
                }
                finemapped.append(result)
        end_time = timeit.default_timer() - start_time
        return {
            "variant": str(variant),
            "finemapped": {
                "data": sorted(finemapped, key=lambda x: -float(x["pip"])),
                # keep order of resources from the config
                "resources": [
                    resource["resource"]
                    for resource in self.conf["finemapped"]["resources"]
                    if resource["resource"] in found_resources
                ],
            },
            "time": end_time,
        }
