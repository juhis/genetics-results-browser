import { MRT_ColumnDef } from "material-react-table";
import {
  ApiResponseMeta,
  DatasetMap,
  DatasetSummaryTableRow,
  PhenoMap,
  PhenoSummaryTableRow,
} from "../../../types/types";
import { PhenoTooltip } from "../../tooltips/PhenoTooltip";
import { filterContainsWithTooltip } from "../utils/tableutil";

export const getTissueSummaryTableColumns = (
  phenoMap: PhenoMap,
  datasetMap: DatasetMap,
  meta: ApiResponseMeta,
  has_betas: boolean
): MRT_ColumnDef<DatasetSummaryTableRow>[] => {
  let cols: MRT_ColumnDef<DatasetSummaryTableRow>[] = [
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
      muiFilterTextFieldProps: { placeholder: "dataset" },
      size: 150,
    },
    {
      accessorKey: "total",
      header: "variants",
      filterFn: "greaterThan",
      sortingFn: "alphanumeric",
      muiFilterTextFieldProps: { placeholder: "variants" },
      size: 50,
    },
  ];
  return cols;
};
