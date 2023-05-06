import { MRT_ColumnDef } from "material-react-table";
import { ApiResponseMeta, DatasetMap, PhenoMap, SummaryTableRow } from "../../../types/types";
import { PhenoTooltip } from "../../tooltips/PhenoTooltip";
import { filterContainsWithTooltip } from "../utils/tableutil";
export const getVariantSummaryTableColumns = (
  phenoMap: PhenoMap,
  datasetMap: DatasetMap,
  meta: ApiResponseMeta
): MRT_ColumnDef<SummaryTableRow>[] => {
  let cols: MRT_ColumnDef<SummaryTableRow>[] = [
    {
      accessorFn: (row) => phenoMap[row.pheno.resource + ":" + row.pheno.phenocode].data_type,
      header: "type",
      filterFn: "contains",
      //filterVariant: 'multi-select',
      //filterSelectOptions: props.data.assoc.resources,
      muiTableHeadCellFilterTextFieldProps: { placeholder: "type" },
      size: 65,
    },
    {
      accessorFn: (row) => {
        // if dataset metadata is available, use it to display dataset name
        const dataset = datasetMap[row.dataset];
        const datasetName = dataset
          ? `${dataset.study_label}:${dataset.sample_group}:${dataset.quant_method}`
          : row.dataset;
        return datasetName;
      },
      header: "dataset",
      filterFn: "contains",
      muiTableHeadCellFilterTextFieldProps: { placeholder: "dataset" },
      size: 150,
    },
    {
      accessorFn: (row) => {
        const phenos = [row.pheno];
        const resource = meta.assoc.resources.find((r) => r.resource == phenos[0].resource) || null;
        return (
          <PhenoTooltip
            resource={resource}
            phenos={phenos}
            content=<span>{row.pheno.phenostring}</span>
          />
        );
      },
      header: "phenotype",
      id: "phenotype",
      filterFn: filterContainsWithTooltip,
      sortingFn: "alphanumeric",
      muiTableHeadCellFilterTextFieldProps: { placeholder: "phenotype" },
    },
    {
      accessorKey: "total",
      header: "total variants",
      id: "total",
      filterFn: "greaterThan",
      sortingFn: "alphanumeric",
      muiTableHeadCellFilterTextFieldProps: { placeholder: "total" },
      size: 50,
    },
    {
      accessorKey: "up",
      header: "risk variants",
      filterFn: "greaterThan",
      sortingFn: "alphanumeric",
      muiTableHeadCellFilterTextFieldProps: { placeholder: "risk" },
      size: 50,
    },
    {
      accessorKey: "down",
      header: "protective variants",
      filterFn: "greaterThan",
      sortingFn: "alphanumeric",
      muiTableHeadCellFilterTextFieldProps: { placeholder: "protective" },
      size: 50,
    },
  ];
  return cols;
};
