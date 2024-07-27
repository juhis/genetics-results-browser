import { MRT_ColumnDef } from "material-react-table";
import { ApiResponseMeta, DatasetMap, TissueSummaryTableRow, PhenoMap } from "../../../types/types";

export const getTissueSummaryTableColumns = (): MRT_ColumnDef<TissueSummaryTableRow>[] => {
  let cols: MRT_ColumnDef<TissueSummaryTableRow>[] = [
    {
      accessorKey: "tissue",
      header: "tissue",
      filterFn: "contains",
      muiFilterTextFieldProps: { placeholder: "tissue" },
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
