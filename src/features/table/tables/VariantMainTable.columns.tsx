import { MRT_ColumnDef } from "material-react-table";
import { Phenotype, VariantRecord, TableData } from "../../../types/types";
import {
  filterContainsWithTooltip,
  filterAbsGreaterThanHTML,
  filterLessThanHTML,
  pValRepr,
} from "../utils/tableutil";
import { PhenoTooltip } from "../../tooltips/PhenoTooltip";
import { ConsequenceTooltip } from "../../tooltips/ConsequenceTooltip";
import { VariantGnomadToolTip } from "../../tooltips/VariantGnomadTooltip";
import { UpOrDownIcon } from "../UpDownIcons";

export const getVariantMainTableColumns = (
  data: TableData,
  selectedPheno: Phenotype | undefined,
  selectedPopulation: string | undefined,
  showTraitCounts: boolean
): MRT_ColumnDef<VariantRecord>[] => {
  let cols: MRT_ColumnDef<VariantRecord>[] = [];
  if (data?.is_grouped) {
    cols = [
      {
        accessorFn: (row) => row.group,
        header: "group",
        id: "group",
        filterFn: "equals",
        muiTableHeadCellFilterTextFieldProps: { placeholder: "group" },
        size: 10,
      },
      {
        accessorFn: (row) => row.value,
        header: "value",
        id: "value",
        filterFn: "greaterThan",
        muiTableHeadCellFilterTextFieldProps: { placeholder: "value" },
        size: 100,
      },
    ];
  }
  cols = cols.concat([
    {
      accessorKey: "variant",
      header: "variant",
      id: "variant",
      filterFn: "contains",
      sortingFn: "variantSort",
      muiTableHeadCellFilterTextFieldProps: { placeholder: "variant" },
      size: 100,
    },
    {
      accessorFn: (row) => row.gnomad.rsids,
      id: "rsid",
      header: "rsid",
      filterFn: "contains",
      muiTableHeadCellFilterTextFieldProps: { placeholder: "rsid" },
      size: 80,
    },
    {
      accessorFn: (row) => <VariantGnomadToolTip variant={row.variant} gnomadData={row.gnomad} />,
      id: selectedPopulation === undefined ? "gnomad.AF" : `gnomad.AF_${selectedPopulation}`,
      header: `gnomAD ${selectedPopulation || ""} AF`,
      filterFn: filterLessThanHTML,
      muiTableHeadCellFilterTextFieldProps: { placeholder: "AF" },
      sortingFn: "naInfSort",
      sortDescFirst: false,
      size: 80,
    },
    {
      accessorFn: (row) =>
        selectedPopulation === undefined
          ? row.gnomad.AF
          : row.gnomad[`AF_${selectedPopulation}` as keyof typeof row.gnomad],
      id: "af_hidden",
      header: "AF",
    },
    {
      accessorFn: (row) => (
        <ConsequenceTooltip row={row} content=<span>{row.gnomad.most_severe}</span> />
      ),
      id: "most_severe",
      header: "most severe",
      filterFn: filterContainsWithTooltip,
      filterVariant: "multi-select",
      filterSelectOptions: data ? data["most_severe"].map((ms) => ({ text: ms, value: ms })) : [],
      muiTableHeadCellFilterTextFieldProps: { placeholder: "most severe" },
      enableSorting: false,
      size: 100,
    },
    {
      accessorFn: (row) => (
        <ConsequenceTooltip
          row={row}
          content=<span>
            {row.gnomad.gene_most_severe === "NA" ? "" : row.gnomad.gene_most_severe}
          </span>
        />
      ),
      id: "gene_most_severe",
      header: "gene",
      filterFn: filterContainsWithTooltip,
      muiTableHeadCellFilterTextFieldProps: { placeholder: "gene" },
      enableSorting: false,
      size: 80,
    },
  ]);
  if (showTraitCounts) {
    cols = cols.concat([
      {
        accessorKey: "assoc.counts.total.total",
        header: "traits",
        // need dot notation for naInfSort
        id: "assoc.counts.total.total",
        sortingFn: "naInfSort",
        sortDescFirst: true,
        size: 60,
      },
      {
        accessorKey: "assoc.counts.total.up",
        header: "traits_up",
        Header: ({ column }) => (
          <>
            <UpOrDownIcon value={1} />
            traits
          </>
        ),
        // need dot notation for naInfSort
        id: "assoc.counts.total.up",
        sortingFn: "naInfSort",
        sortDescFirst: true,
        size: 60,
      },
      {
        accessorKey: "assoc.counts.total.down",
        header: "traits_down",
        Header: ({ column }) => (
          <>
            <UpOrDownIcon value={-1} />
            traits
          </>
        ),
        // need dot notation for naInfSort
        id: "assoc.counts.total.down",
        sortingFn: "naInfSort",
        sortDescFirst: true,
        size: 60,
      },
    ]);
  }
  cols = cols.concat([
    {
      accessorFn: (row) => {
        const phenos = row.assoc.groupedData[0].phenocode.map(
          (phenocode) =>
            data.phenos[row.assoc.groupedData[0].resource + ":" + phenocode] ||
            // sQTLs have dataset in the phenocode
            data.phenos[
              row.assoc.groupedData[0].resource +
                ":" +
                row.assoc.groupedData[0].dataset +
                ":" +
                phenocode
            ]
        );
        const resource =
          data.meta.assoc.resources.find((r) => r.resource == phenos[0].resource) || null;
        return (
          <PhenoTooltip
            resource={resource}
            phenos={phenos}
            row={row.assoc.groupedData[0]}
            content=<span style={phenos[0].is_na ? { color: "gray" } : {}}>
              {row.assoc.groupedData[0].count == 1
                ? row.assoc.groupedData[0].phenostring
                : row.assoc.groupedData[0].phenostring +
                  " (" +
                  row.assoc.groupedData[0].count +
                  ")"}
            </span>
          />
        );
      },
      header: selectedPheno ? "selected association" : "top association",
      id: "top_pheno",
      filterFn: filterContainsWithTooltip,
      enableSorting: false,
      muiTableHeadCellFilterTextFieldProps: {
        placeholder: selectedPheno ? "selected association" : "top association",
      },
    },
    {
      accessorFn: (row) => (
        <span style={row.assoc.groupedData[0].mlogp[0] <= 0 ? { color: "gray" } : {}}>
          {pValRepr(row.assoc.groupedData[0].mlogp[0])}
        </span>
      ),
      header: "p-value",
      // need dot notation for naInfSort
      id: "assoc.groupedData.0.mlogp.0",
      filterFn: filterLessThanHTML,
      muiTableHeadCellFilterTextFieldProps: { placeholder: "p-value" },
      sortingFn: "naInfSort",
      sortDescFirst: true,
      size: 70,
    },
    {
      accessorFn: (row) => {
        const assoc = row.assoc.groupedData[0];
        const arrow = <UpOrDownIcon value={assoc.beta[0]} />;
        return (
          <div>
            {arrow}
            <span style={assoc.mlogp[0] <= 0 ? { color: "gray" } : {}}>
              {assoc.beta[0].toFixed(2)}
            </span>
          </div>
        );
      },
      header: "beta",
      // need dot notation for naInfSort
      id: "assoc.groupedData.0.beta.0",
      filterFn: filterAbsGreaterThanHTML,
      muiTableHeadCellFilterTextFieldProps: { placeholder: "beta" },
      sortingFn: "naInfSort",
      sortDescFirst: true,
      size: 70,
    },
  ]);
  return cols;
};
