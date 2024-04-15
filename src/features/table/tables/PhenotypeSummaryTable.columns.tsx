import { MRT_ColumnDef } from "material-react-table";
import { ApiResponseMeta, DatasetMap, PhenoMap, PhenoSummaryTableRow } from "../../../types/types";
import { PhenoTooltip } from "../../tooltips/PhenoTooltip";
import { filterContainsWithTooltip } from "../utils/tableutil";

export const getPhenoSummaryTableColumns = (
  phenoMap: PhenoMap,
  datasetMap: DatasetMap,
  meta: ApiResponseMeta,
  has_betas: boolean
): MRT_ColumnDef<PhenoSummaryTableRow>[] => {
  let cols: MRT_ColumnDef<PhenoSummaryTableRow>[] = [
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
      header: "trait",
      id: "trait",
      filterFn: filterContainsWithTooltip,
      sortingFn: "alphanumeric",
      muiTableHeadCellFilterTextFieldProps: { placeholder: "trait" },
    },
    {
      accessorKey: "total",
      header: "variants",
      filterFn: "greaterThan",
      sortingFn: "alphanumeric",
      muiTableHeadCellFilterTextFieldProps: { placeholder: "variants" },
      size: 50,
    },
  ];
  if (has_betas) {
    cols = cols.concat([
      {
        accessorKey: "consistent",
        header: "consistent",
        filterFn: "greaterThan",
        sortingFn: "alphanumeric",
        muiTableHeadCellFilterTextFieldProps: { placeholder: "consistent" },
        size: 50,
      },
      {
        accessorKey: "opposite",
        header: "opposite",
        filterFn: "greaterThan",
        sortingFn: "alphanumeric",
        muiTableHeadCellFilterTextFieldProps: { placeholder: "opposite" },
        size: 50,
      },
    ]);
  }
  return cols;
};
