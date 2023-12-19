export type GeneInfo = {
  _id: string;
  symbol: string;
  name: string;
  summary: string;
};

export type TableData = {
  data: Array<VariantRecord>;
  has_betas: boolean;
  has_custom_values: boolean;
  most_severe: Array<string>;
  phenos: PhenoMap;
  datasets: DatasetMap;
  input_variants: InputVariants;
  meta: ApiResponseMeta;
};

export type VariantRecord = {
  variant: string;
  beta: number | undefined;
  value: string | undefined;
  anno: {
    rsid?: string;
    most_severe: string;
    gene_most_severe?: string;
    AF: number;
  };
  gnomad: GnomadRecord;
  assoc: {
    data: Array<AssocRecord>;
    groupedData: Array<GroupedAssocRecord>;
    counts: {
      resource: Record<string, { up: number; down: number; total: number }>;
      total: { up: number; down: number; total: number };
      eqtl: { up: number; down: number; total: number };
      pqtl: { up: number; down: number; total: number };
      sqtl: { up: number; down: number; total: number };
      edqtl: { up: number; down: number; total: number };
      qtl: { up: number; down: number; total: number };
      gwas: { up: number; down: number; total: number };
    };
    resources: Array<string>;
  };
  finemapped: {
    data: Array<FineMappedRecord>;
    groupedData: Array<GroupedFineMappedRecord>;
    counts: {
      resource: Record<string, { up: number; down: number; total: number }>;
      eqtl: { up: number; down: number; total: number };
      pqtl: { up: number; down: number; total: number };
      sqtl: { up: number; down: number; total: number };
      edqtl: { up: number; down: number; total: number };
      qtl: { up: number; down: number; total: number };
      gwas: { up: number; down: number; total: number };
      total: { up: number; down: number; total: number };
    };
    resources: Array<string>;
  };
};

export type PhenoMap = Record<string, Phenotype>;
export type DatasetMap = Record<string, Dataset>;

export type InputVariants = {
  found: Array<string>;
  not_found: Array<string>;
  unparsed: Array<string>;
  rsid_map: Record<string, Array<string>>;
};

export type Phenotype = {
  resource: string;
  data_type: DataType;
  phenocode: string;
  phenostring: string;
  chromosome?: string;
  gene_start?: number;
  gene_end?: number;
  strand?: number;
  num_cases: number;
  num_samples: number;
  trait_type: string;
  pub_author?: string;
  pub_date?: string;
  is_na?: boolean;
};

export type Dataset = {
  resource: string;
  data_type: DataType;
  dataset_id: string;
  study_id?: string;
  study_label: string;
  sample_group?: string;
  tissue_id?: string;
  tissue_label?: string;
  condition_label?: string;
  sample_size?: number;
  quant_method?: string;
};

export type ApiResponseMeta = {
  gnomad: {
    populations: Array<string>;
    version: string;
    url: string;
  };
  assoc: {
    resources: Array<AssocResource>;
  };
  finemapped: {
    resources: Array<FineMappedResource>;
  };
};

export type AssocRecord = {
  resource: string;
  dataset: string;
  data_type: DataType;
  phenocode: string;
  mlogp: number;
  beta: number;
  sebeta: number;
  beta_input?: number;
};

export type GroupedAssocRecord = {
  id: string;
  resource: string;
  dataset: string;
  data_type: DataType;
  phenostring: string;
  phenocode: string[];
  mlogp: number[];
  beta: number[];
  sebeta: number[];
  count: number;
};

export type AssocResource = {
  resource: string;
  data_types: DataType[];
  pheno_urls?: URLWithLabel[];
  file: string;
  p_thres: number;
};

export type FineMappedRecord = {
  resource: string;
  dataset: string;
  data_type: DataType;
  phenocode: string;
  cs_size: number;
  cs_min_r2: number;
  mlog10p: number;
  beta: number;
  se: number;
  pip: number;
};

export type GroupedFineMappedRecord = {
  id: string;
  resource: string;
  dataset: string;
  data_type: DataType;
  phenocode: string[];
  mlog10p: number[];
  beta: number[];
  pip: number[];
  cs_size: number[];
  cs_min_r2: number[];
  max_pip: number;
  count: number;
};

export enum DataType {
  GWAS = "GWAS",
  EQTL = "eQTL",
  PQTL = "pQTL",
  SQTL = "sQTL",
  EDQTL = "edQTL",
  NA = "NA",
}

export enum QTLType {
  CIS = "CIS",
  TRANS = "TRANS",
}

export type FineMappedResource = {
  resource: string;
  data_types: DataType[];
};

export type GnomadRecord = {
  exomes?: GnomadVariantRecord;
  genomes: GnomadVariantRecord;
};

export type GnomadVariantRecord = {
  AF: number;
  rsids: string;
  most_severe: string;
  gene_most_severe: string;
  filters: string | null;
  consequences: Array<{ gene_symbol: string; consequence: string }>;
  // population AF_pop fields omitted here for maintainability
};

export type URLWithLabel = {
  url: string;
  label: string;
};

export type SummaryTableData = Array<SummaryTableRow>;

export type SummaryTableRow = {
  pheno: Phenotype;
  dataset: string;
  total: number;
  consistent: number;
  opposite: number;
};
