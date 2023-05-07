import type { MRT_ColumnDef } from "material-react-table";
import { DatasetMap, GroupedAssocRecord, PhenoMap, TableData } from "../../../types/types";
import { filterAbsGreaterThanHTML, filterContainsWithTooltip, pValRepr } from "../utils/tableutil";
import { PhenoTooltip } from "../../tooltips/PhenoTooltip";
import { UpOrDownIcon } from "../UpDownIcons";

export const getAssociationTableColumns = (
  phenoMap: PhenoMap,
  datasetMap: DatasetMap,
  meta: TableData["meta"]
): MRT_ColumnDef<GroupedAssocRecord>[] => [
  {
    accessorFn: (row) => phenoMap[row.resource + ":" + row.phenocode[0]].data_type,
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
      const phenos = row.phenocode.map((phenocode) => phenoMap[row.resource + ":" + phenocode]);
      const resource = meta.assoc.resources.find((r) => r.resource == phenos[0].resource)!;
      return (
        <PhenoTooltip
          resource={resource}
          phenos={phenos}
          row={row}
          content=<span>
            {row.count == 1 ? row.phenostring : row.phenostring + " (" + row.count + ")"}
          </span>
        />
      );
    },
    header: "phenotype or gene",
    filterFn: filterContainsWithTooltip,
    muiTableHeadCellFilterTextFieldProps: { placeholder: "phenotype or gene" },
  },
  {
    accessorFn: (row) => pValRepr(row.mlogp[0]),
    id: "mlogp",
    header: "p-value",
    sortingFn: "naInfSort",
    sortDescFirst: true,
    filterFn: "lessThan",
    muiTableHeadCellFilterTextFieldProps: { placeholder: "p-value" },
    size: 60,
  },
  {
    accessorFn: (row) => <UpOrDownIcon value={row.beta[0]} withValue precision={3} />,
    id: "beta",
    header: "beta",
    sortingFn: "naInfSort",
    sortDescFirst: true,
    filterFn: filterAbsGreaterThanHTML,
    muiTableHeadCellFilterTextFieldProps: { placeholder: "beta" },
    size: 60,
  },
];
