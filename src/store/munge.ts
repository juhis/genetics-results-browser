import {
  Phenotype,
  VariantRecord,
  TableData,
  GroupedAssocRecord,
  AssocRecord,
  PhenoMap,
  AssocResource,
  FineMappedRecord,
  GroupedFineMappedRecord,
  FineMappedResource,
  SummaryTableData,
  DataType,
  QTLType,
} from "../types/types";

const groupAssocPhenos = (d: AssocRecord[], phenos: PhenoMap) => {
  return Object.values(
    d.reduce((p, c) => {
      const pheno = phenos[c.resource + ":" + c.phenocode];
      const groupId: string =
        c.resource +
        ":" +
        c.dataset +
        ":" +
        pheno.phenostring +
        ":" +
        (c.beta > 0 ? "up" : c.beta < 0 ? "down" : "NA");
      if (p[groupId] === undefined) {
        p[groupId] = {
          id: groupId,
          resource: pheno.resource,
          dataset: c.dataset,
          data_type: c.data_type,
          phenostring: pheno.phenostring,
          phenocode: [pheno.phenocode],
          mlogp: [c.mlogp],
          beta: [c.beta],
          sebeta: [c.sebeta],
          count: 1,
        };
      } else {
        p[groupId]["phenocode"].push(pheno.phenocode);
        p[groupId]["mlogp"].push(c.mlogp);
        p[groupId]["beta"].push(c.beta);
        p[groupId]["sebeta"].push(c.sebeta);
        p[groupId]["count"] += 1;
      }
      return p;
    }, {} as Record<string, GroupedAssocRecord>)
  );
};

const countAssocPhenos = (d: GroupedAssocRecord[], resources: Array<AssocResource>) => {
  const total = {
    up: d.filter((d) => d.beta[0] > 0).length,
    down: d.filter((d) => d.beta[0] < 0).length,
    // placeholder phenos have beta 0..
    total: d.filter((d) => d.beta[0] != 0).length,
  };
  const datasetsInitial = resources
    .map((d) => d.resource)
    .reduce((p, c) => {
      p[c] = {
        up: 0,
        down: 0,
        total: 0,
      };
      return p;
    }, {} as Record<string, { up: number; down: number; total: 0 }>);
  const resource = d.reduce((p, c) => {
    if (c.beta[0] > 0) {
      p[c.resource].up += 1;
      p[c.resource].total += 1;
    } else if (c.beta[0] < 0) {
      p[c.resource].down += 1;
      p[c.resource].total += 1;
    }
    return p;
  }, datasetsInitial);
  const dqtl = d.filter((d) => d.data_type.endsWith("QTL"));
  const qtl = {
    up: dqtl.filter((d) => d.beta[0] > 0).length,
    down: dqtl.filter((d) => d.beta[0] < 0).length,
    total: dqtl.length,
  };
  const deqtl = dqtl.filter((d) => d.data_type === "eQTL");
  const eqtl = {
    up: deqtl.filter((d) => d.beta[0] > 0).length,
    down: deqtl.filter((d) => d.beta[0] < 0).length,
    total: deqtl.length,
  };
  const dpqtl = dqtl.filter((d) => d.data_type === "pQTL");
  const pqtl = {
    up: dpqtl.filter((d) => d.beta[0] > 0).length,
    down: dpqtl.filter((d) => d.beta[0] < 0).length,
    total: dpqtl.length,
  };
  const dsqtl = dqtl.filter((d) => d.data_type === "sQTL");
  const sqtl = {
    up: dsqtl.filter((d) => d.beta[0] > 0).length,
    down: dsqtl.filter((d) => d.beta[0] < 0).length,
    total: dsqtl.length,
  };
  const dedqtl = dqtl.filter((d) => d.data_type === "edQTL");
  const edqtl = {
    up: dedqtl.filter((d) => d.beta[0] > 0).length,
    down: dedqtl.filter((d) => d.beta[0] < 0).length,
    total: dedqtl.length,
  };
  const dgwas = d.filter((d) => d.data_type === "GWAS");
  const gwas = {
    up: dgwas.filter((d) => d.beta[0] > 0).length,
    down: dgwas.filter((d) => d.beta[0] < 0).length,
    total: dgwas.length,
  };
  return { total, resource, eqtl, pqtl, sqtl, edqtl, qtl, gwas };
};
// convert array to a deduped array:
// only one item per dataset/trait/direction, with possibly multiple molecular_trait_ids
// otherwise e.g. GTEx exons could be too many crowding out other datasets
// TODO is this still necessary now that eQTL Catalogue only has top cs?
const groupFineMappedTraits = (d: FineMappedRecord[]) => {
  // sort here by dataset, then by trait, then by direction, then by molecular_trait_id, then by pip
  // to make sure that exons will be in sorted order in grouping
  d.sort((a, b) => {
    if (a.dataset < b.dataset) {
      return -1;
    } else if (a.dataset > b.dataset) {
      return 1;
    } else if (a.phenocode < b.phenocode) {
      return -1;
    } else if (a.phenocode > b.phenocode) {
      return 1;
    } else if (a.beta < 0 && b.beta > 0) {
      return -1;
    } else if (a.beta > 0 && b.beta < 0) {
      return 1;
    } else if (a.phenocode < b.phenocode) {
      return -1;
    } else if (a.phenocode > b.phenocode) {
      return 1;
    } else if (a.pip > b.pip) {
      return -1;
    } else if (a.pip < b.pip) {
      return 1;
    }
    return 0;
  });
  const grouped = Object.values(
    d.reduce((p, c) => {
      const groupId: string = c.dataset + ":" + c["phenocode"] + ":" + (c.beta > 0 ? "up" : "down");
      if (p[groupId] === undefined) {
        p[groupId] = {
          id: groupId,
          resource: c.resource,
          dataset: c.dataset,
          data_type: c.data_type,
          phenocode: [c.phenocode],
          mlog10p: [c.mlog10p],
          beta: [c.beta],
          pip: [c.pip],
          cs_size: [c.cs_size],
          cs_min_r2: [c.cs_min_r2],
          count: 1,
          max_pip: c.pip,
        };
      } else {
        p[groupId]["phenocode"].push(c.phenocode);
        p[groupId]["mlog10p"].push(c.mlog10p);
        p[groupId]["beta"].push(c.beta);
        p[groupId]["pip"].push(c.pip);
        p[groupId]["cs_size"].push(c.cs_size);
        p[groupId]["cs_min_r2"].push(c.cs_min_r2);
        p[groupId]["count"] += 1;
        p[groupId]["max_pip"] = Math.max(p[groupId]["max_pip"], c.pip);
      }
      return p;
    }, {} as Record<string, GroupedFineMappedRecord>)
  );
  // sort groups by max PIP descending
  grouped.sort((a, b) => {
    if (a.max_pip > b.max_pip) {
      return -1;
    } else if (a.max_pip < b.max_pip) {
      return 1;
    }
    return 0;
  });
  return grouped;
};

const countFineMappedTraits = (
  d: GroupedFineMappedRecord[],
  resources: Array<FineMappedResource>
) => {
  const total = {
    up: d.filter((d) => d.beta[0] > 0).length,
    down: d.filter((d) => d.beta[0] < 0).length,
    total: d.length,
  };
  const resourcesInitial = resources
    .map((d) => d.resource)
    .reduce((p, c) => {
      p[c] = {
        up: 0,
        down: 0,
        total: 0,
      };
      return p;
    }, {} as Record<string, { up: number; down: number; total: 0 }>);
  const resource = d.reduce((p, c) => {
    if (c.beta[0] > 0) {
      p[c.resource].up += 1;
    } else {
      p[c.resource].down += 1;
    }
    p[c.resource].total += 1;
    return p;
  }, resourcesInitial);
  const dqtl = d.filter((d) => d.data_type.endsWith("QTL"));
  const qtl = {
    up: dqtl.filter((d) => d.beta[0] > 0).length,
    down: dqtl.filter((d) => d.beta[0] < 0).length,
    total: dqtl.length,
  };
  const deqtl = dqtl.filter((d) => d.data_type === "eQTL");
  const eqtl = {
    up: deqtl.filter((d) => d.beta[0] > 0).length,
    down: deqtl.filter((d) => d.beta[0] < 0).length,
    total: deqtl.length,
  };
  const dpqtl = dqtl.filter((d) => d.data_type === "pQTL");
  const pqtl = {
    up: dpqtl.filter((d) => d.beta[0] > 0).length,
    down: dpqtl.filter((d) => d.beta[0] < 0).length,
    total: dpqtl.length,
  };
  const dsqtl = dqtl.filter((d) => d.data_type === "sQTL");
  const sqtl = {
    up: dsqtl.filter((d) => d.beta[0] > 0).length,
    down: dsqtl.filter((d) => d.beta[0] < 0).length,
    total: dsqtl.length,
  };
  const dedqtl = dqtl.filter((d) => d.data_type === "edQTL");
  const edqtl = {
    up: dedqtl.filter((d) => d.beta[0] > 0).length,
    down: dedqtl.filter((d) => d.beta[0] < 0).length,
    total: dedqtl.length,
  };
  const dgwas = d.filter((d) => d.data_type === "GWAS");
  const gwas = {
    up: dgwas.filter((d) => d.beta[0] > 0).length,
    down: dgwas.filter((d) => d.beta[0] < 0).length,
    total: dgwas.length,
  };
  return { total, resource, eqtl, pqtl, sqtl, edqtl, qtl, gwas };
};

// change placeholder text according to p-value threshold
// this is quite a function
const changePlaceholderPhenostring = (
  resources: AssocResource[],
  selectedPheno: Phenotype | undefined,
  changePheno: Phenotype,
  p: number
) => {
  if (p < 1) {
    changePheno.phenostring =
      selectedPheno === undefined
        ? `No p < ${p} associations`
        : `No p < ${p} association with selected phenotype`;
  } else {
    changePheno.phenostring =
      selectedPheno === undefined
        ? `No associations ${resources
            .map((r) => `p < ${r.p_thres} in ${r.resource}`)
            .join(" or ")}`
        : `No p < ${
            resources.find((r) => r.resource == selectedPheno.resource)!.p_thres
          } association with selected phenotype`;
  }
};

export const isQTLInCis = (variant: string, p: Phenotype, cisWindow: number) => {
  const chr = variant.split("-")[0];
  if (
    !p.data_type.endsWith("QTL") ||
    p.chromosome !== chr ||
    p.gene_start === undefined ||
    p.gene_end === undefined ||
    p.strand === undefined
  ) {
    return false;
  }
  const pos = Number(variant.split("-")[1]);
  const start = p.strand === 1 ? p.gene_start : p.gene_end;
  return pos - cisWindow * 1e6 < start && pos + cisWindow * 1e6 > start;
};

export const isQTLInTrans = (variant: string, p: Phenotype, cisWindow: number) => {
  const chr = variant.split("-")[0];
  if (
    !p.data_type.endsWith("QTL") ||
    p.gene_start === undefined ||
    p.gene_end === undefined ||
    p.strand === undefined
  ) {
    return false;
  }
  if (p.chromosome !== chr) {
    return true;
  }
  return !isQTLInCis(variant, p, cisWindow);
};

export const filterRows = (
  data: TableData,
  assocTypes: Record<DataType, boolean>,
  gwasTypes: Record<string, boolean>,
  qtlTypes: Record<QTLType, boolean>,
  cisWindow: number,
  p: number,
  pip: number,
  pheno: Phenotype | undefined,
  keepPlaceholders: boolean
): TableData => {
  const startTime = performance.now();
  let newData = structuredClone(data.data) as VariantRecord[];
  newData.forEach((d) => {
    if (pheno === undefined) {
      // keep associations whose trait type is selected and with p-value < p
      // possibly keep the placeholders for no association
      d.assoc.data = d.assoc.data.filter((a) => {
        const assocPheno = data.phenos[a.resource + ":" + a.phenocode];
        return (
          (assocTypes[assocPheno.data_type] &&
            (assocPheno.data_type !== "GWAS" || gwasTypes[assocPheno.trait_type]) &&
            (!isQTLInCis(d.variant, assocPheno, cisWindow) || qtlTypes["CIS"]) &&
            (!isQTLInTrans(d.variant, assocPheno, cisWindow) || qtlTypes["TRANS"]) &&
            a.mlogp > -Math.log10(p)) ||
          (keepPlaceholders && assocPheno.is_na)
        );
      });
    } else {
      // keep association whose trait type is selected and with p-value < p of the given phenotype
      // possibly keep the given phenotype's placeholder for no association
      d.assoc.data = d.assoc.data.filter((a) => {
        const assocPheno = data.phenos[a.resource + ":" + a.phenocode];
        return (
          (assocTypes[assocPheno.data_type] &&
            (assocPheno.data_type !== "GWAS" || gwasTypes[assocPheno.trait_type]) &&
            (!isQTLInCis(d.variant, assocPheno, cisWindow) || qtlTypes["CIS"]) &&
            (!isQTLInTrans(d.variant, assocPheno, cisWindow) || qtlTypes["TRANS"]) &&
            a.mlogp > -Math.log10(p) &&
            a.resource == pheno.resource &&
            a.phenocode == pheno.phenocode) ||
          (keepPlaceholders && assocPheno.is_na && assocPheno.resource === assocPheno.resource)
        );
      });
    }
    if (d.assoc.data.length > 0) {
      const firstPheno = data.phenos[d.assoc.data[0].resource + ":" + d.assoc.data[0].phenocode];
      if (firstPheno.is_na) {
        changePlaceholderPhenostring(data.meta.assoc.resources, pheno, firstPheno, p);
      }
    }
    d.finemapped.data = d.finemapped.data.filter((a) => a.pip >= pip);
    d.assoc.groupedData = groupAssocPhenos(d.assoc.data, data.phenos);
    d.assoc.counts = countAssocPhenos(d.assoc.groupedData, data.meta.assoc.resources);
    d.finemapped.groupedData = groupFineMappedTraits(d.finemapped.data);
    d.finemapped.counts = countFineMappedTraits(
      d.finemapped.groupedData,
      data.meta.finemapped.resources
    );
  });
  if (!keepPlaceholders) {
    // actually filter out variants with no associations
    newData = newData.filter((d) => d.assoc.data.length > 0);
  }
  console.info(`${(performance.now() - startTime) / 1000} seconds to filter rows`);
  return { ...data, data: newData };
};

export const summarize = (data: TableData): SummaryTableData => {
  const startTime = performance.now();
  data.data.forEach((d) => {
    d.assoc.data.forEach((a) => {
      a.beta_input = d.beta;
    });
  });
  const assocs: AssocRecord[] = data.data.flatMap((d) => d.assoc.data);
  // TODO keys of phenoCounts not used
  const phenoCounts = assocs.reduce((p, c) => {
    const id = c.resource + ":" + c.dataset + ":" + c.phenocode;
    p[id] = {
      resource: c.resource,
      dataset: c.dataset,
      phenocode: c.phenocode,
      consistent:
        ((p[id]?.consistent as number) || 0) +
        (c.beta_input !== undefined && c.beta * c.beta_input > 0 ? 1 : 0),
      opposite:
        ((p[id]?.opposite as number) || 0) +
        (c.beta_input !== undefined && c.beta * c.beta_input < 0 ? 1 : 0),
      total: ((p[id]?.total as number) || 0) + (c.beta != 0 ? 1 : 0),
    };
    return p;
  }, {} as Record<string, Record<string, number | string>>);
  const summaryTableData: SummaryTableData = Object.entries(phenoCounts)
    .sort((a, b) => (b[1].total as number) - (a[1].total as number))
    .map((d) => ({
      pheno: data.phenos[d[1].resource + ":" + d[1].phenocode],
      dataset: d[1].dataset as string,
      total: d[1].total as number,
      consistent: d[1].consistent as number,
      opposite: d[1].opposite as number,
    }))
    .filter((d) => !d.pheno.is_na);
  console.info(`${(performance.now() - startTime) / 1000} seconds to summarize over phenotypes`);
  return summaryTableData;
};

// TODO server-side? client-side filtering doesn't affect this
export const summarizeFreq = (data: TableData) => {
  const startTime = performance.now();
  const gn = data.data.map((d) => d.gnomad);

  const maxFreqs = gn.reduce((p, c) => {
    const maxFreq = Object.entries(c)
      .filter((d) => d[0].startsWith("AF_"))
      .reduce(
        // @ts-ignore
        (p1, c1) => {
          const pop = c1[0].split("_")[1];
          return c1[1] != null && c1[1] > p1.af ? { pop: pop, af: c1[1] } : p1;
        },
        { pop: "", af: 0 }
      );
    // @ts-ignore
    p[maxFreq.pop] = (p[maxFreq.pop] || 0) + 1;
    return p;
  }, {} as Record<string, number>);

  const minFreqs = gn.reduce((p, c) => {
    const minFreq = Object.entries(c)
      .filter((d) => d[0].startsWith("AF_"))
      .reduce(
        // @ts-ignore
        (p1, c1) => {
          const pop = c1[0].split("_")[1];
          return c1[1] != null && c1[1] < p1.af ? { pop: pop, af: c1[1] } : p1;
        },
        { pop: "", af: 1 }
      );
    // @ts-ignore
    p[minFreq.pop] = (p[minFreq.pop] || 0) + 1;
    return p;
  }, {} as Record<string, number>);

  const allPops = Object.keys(data.data[0].gnomad)
    .filter((d) => d.startsWith("AF_"))
    .map((d) => d.split("_")[1]);
  const allPopsFreqs = allPops.map((pop) => ({
    pop: pop,
    max: maxFreqs[pop] || 0,
    maxPerc: (maxFreqs[pop] || 0) / gn.length,
    min: minFreqs[pop] || 0,
    minPerc: (minFreqs[pop] || 0) / gn.length,
  }));

  console.info(`${(performance.now() - startTime) / 1000} seconds to summarize frequencies`);

  return allPopsFreqs;
};
