import math
import numpy as np
import pysam
import threading
import timeit
from collections import OrderedDict as od, defaultdict as dd

import scipy as sp  # type: ignore
from datatypes import (
    AssociationResult,
    AssociationResults,
)
from singleton import Singleton


class Datafetch(object, metaclass=Singleton):
    def _init_tabix(self) -> None:
        self.tabix_assoc: dict[int, pysam.TabixFile] = dd(
            lambda: pysam.TabixFile(self.conf["assoc"]["file"], parser=None)  # type: ignore
        )
        self.assoc_headers: dict[str, int] = od(
            {
                h: idx
                for idx, h in enumerate(
                    self.tabix_assoc[threading.get_ident()].header[0].split("\t")
                )
            }
        )

    def __init__(self, conf) -> None:
        self.conf = conf
        self._init_tabix()
        self.assoc_resource_ids = set(
            [resource["resource"] for resource in self.conf["assoc"]["resources"]]
        )
        # NA resource placeholder
        self.assoc_resource_ids.add("NA")

    def get_assoc(self, variant) -> AssociationResults:
        start_time = timeit.default_timer()
        assoc: list[AssociationResult] = []
        resources = set()
        tabix_iter = self.tabix_assoc[threading.get_ident()].fetch(
            variant.chr, variant.pos - 1, variant.pos
        )
        for row in tabix_iter:
            d = row.split("\t")
            ref = d[self.assoc_headers["ref"]]
            alt = d[self.assoc_headers["alt"]]
            resource = d[self.assoc_headers["#resource"]]
            if (
                ref == variant.ref
                and alt == variant.alt
                and resource
                in self.assoc_resource_ids  # skip results for resources not in the config
            ):
                dataset = d[self.assoc_headers["dataset"]]
                data_type = d[self.assoc_headers["data_type"]]
                phenocode = d[self.assoc_headers["trait"]]
                beta = float(d[self.assoc_headers["beta"]])
                sebeta = float(d[self.assoc_headers["se"]])
                mlogp = float(d[self.assoc_headers["mlog10p"]])
                # if mlog10p is missing, calculate it from beta and se
                # this is off when t distribution was used for the original
                # but we don't currently have sample size available here to use t distribution
                # this will be a lot off if there would be case/control studies
                # TODO prepare the data up front so that mlog10p is always available
                if mlogp == np.inf:
                    mlogp = -sp.stats.norm.logsf(abs(beta) / sebeta) / math.log(
                        10
                    ) - math.log10(2)
                assoc.append(
                    {
                        "resource": resource,
                        "dataset": dataset,
                        "data_type": data_type,
                        "phenocode": phenocode
                        if data_type != "sQTL"
                        else dataset + ":" + phenocode,
                        "mlogp": mlogp,
                        "beta": beta,
                        "sebeta": sebeta,
                    }
                )
                resources.add(resource)
        # return also placeholders so that the frontend can show something when data are filtered
        for resource in self.assoc_resource_ids:
            placeholder: AssociationResult = {
                "resource": resource,
                "dataset": "NA",
                "data_type": "NA",
                "phenocode": "NA",
                # the NA resource will be before the others in sorted order
                # feels hacky but is useful for the frontend
                "mlogp": 0 if resource == "NA" else -1,
                "beta": 0,
                "sebeta": 0,
            }
            assoc.append(placeholder)
        assoc = sorted(assoc, key=lambda x: -float(x["mlogp"]))
        end_time = timeit.default_timer() - start_time
        return {
            "variant": str(variant),
            "assoc": {
                "data": assoc,
                "resources": sorted(list(resources)),
            },
            "time": end_time,
        }
