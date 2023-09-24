import { MRT_ColumnDef } from "material-react-table";
import { VariantRecord, TableData, DataType } from "../../../types/types";
import { filterContainsWithTooltip } from "../utils/tableutil";
import { PhenoTooltip } from "../../tooltips/PhenoTooltip";
import { ConsequenceTooltip } from "../../tooltips/ConsequenceTooltip";
import { isQTLInCis, isQTLInTrans } from "../../../store/munge";

// TODO loop out the data types
export const getDataTypeTableColumns = (
  data: TableData,
  cisWindow: number
): MRT_ColumnDef<VariantRecord>[] => {
  const cols: MRT_ColumnDef<VariantRecord>[] = [
    {
      accessorKey: "variant",
      header: "variant",
      id: "variant",
      filterFn: "contains",
      sortingFn: "variantSort",
      muiTableHeadCellFilterTextFieldProps: { placeholder: "variant" },
      size: 70,
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
      header: "most severe gene",
      filterFn: filterContainsWithTooltip,
      muiTableHeadCellFilterTextFieldProps: { placeholder: "gene" },
      enableSorting: false,
      size: 70,
    },
    {
      accessorKey: "assoc.counts.gwas.total",
      header: "GWAS traits",
      // need dot notation for naInfSort
      id: "assoc.counts.gwas.total",
      muiTableHeadCellFilterTextFieldProps: { placeholder: "filter" },
      sortingFn: "naInfSort",
      sortDescFirst: true,
      size: 60,
    },
    {
      accessorKey: "assoc.counts.eqtl.total",
      header: "eQTL traits",
      // need dot notation for naInfSort
      id: "assoc.counts.eqtl.total",
      muiTableHeadCellFilterTextFieldProps: { placeholder: "filter" },
      sortingFn: "naInfSort",
      sortDescFirst: true,
      size: 60,
    },
    {
      accessorKey: "assoc.counts.pqtl.total",
      header: "pQTL traits",
      // need dot notation for naInfSort
      id: "assoc.counts.pqtl.total",
      muiTableHeadCellFilterTextFieldProps: { placeholder: "filter" },
      sortingFn: "naInfSort",
      sortDescFirst: true,
      size: 60,
    },
    {
      accessorKey: "assoc.counts.sqtl.total",
      header: "sQTL traits",
      // need dot notation for naInfSort
      id: "assoc.counts.sqtl.total",
      muiTableHeadCellFilterTextFieldProps: { placeholder: "filter" },
      sortingFn: "naInfSort",
      sortDescFirst: true,
      size: 60,
    },
    {
      accessorFn: (row) => {
        let topAssoc = row.assoc.groupedData.find((d) => d.data_type === "GWAS");
        if (topAssoc === undefined) {
          // if no significant result, use the placeholder
          topAssoc = row.assoc.groupedData.find((d) => d.data_type === DataType.NA);
        }
        if (topAssoc === undefined) {
          console.log("no top association for " + row.variant);
          return "This should not happen";
        }
        // TODO why complain about undefined?
        topAssoc = topAssoc!;
        const phenos = topAssoc.phenocode.map(
          (phenocode) =>
            // @ts-ignore
            data.phenos[topAssoc.resource + ":" + phenocode] ||
            // sQTLs have dataset in the phenocode
            // @ts-ignore
            data.phenos[topAssoc.resource + ":" + topAssoc.dataset + ":" + phenocode]
        );
        const resource =
          data.meta.assoc.resources.find((r) => r.resource == phenos[0].resource) || null;
        const qtlNote =
          row.variant === undefined
            ? ""
            : isQTLInCis(row.variant, phenos[0], cisWindow)
            ? " [cis]"
            : isQTLInTrans(row.variant, phenos[0], cisWindow)
            ? " [trans]"
            : "";
        return (
          <PhenoTooltip
            resource={resource}
            phenos={phenos}
            row={topAssoc}
            content=<span style={phenos[0].is_na ? { color: "gray" } : {}}>
              {topAssoc.count == 1
                ? topAssoc.phenostring
                : topAssoc.phenostring + " (" + topAssoc.count + ")"}
              {qtlNote}
            </span>
          />
        );
      },
      header: "top GWAS",
      id: "top_gwas",
      filterFn: filterContainsWithTooltip,
      enableSorting: false,
      muiTableHeadCellFilterTextFieldProps: {
        placeholder: "top GWAS",
      },
      size: 150,
    },
    {
      accessorFn: (row) => {
        let topAssoc = row.assoc.groupedData.find((d) => d.data_type === DataType.EQTL);
        if (topAssoc === undefined) {
          // if no significant result, use the placeholder
          topAssoc = row.assoc.groupedData.find((d) => d.data_type === DataType.NA);
        }
        if (topAssoc === undefined) {
          console.log("no top association for " + row.variant);
          return "This should not happen";
        }
        // TODO why still complain about undefined?
        topAssoc = topAssoc!;
        const phenos = topAssoc.phenocode.map(
          (phenocode) =>
            // @ts-ignore
            data.phenos[topAssoc.resource + ":" + phenocode] ||
            // sQTLs have dataset in the phenocode
            // @ts-ignore
            data.phenos[topAssoc.resource + ":" + topAssoc.dataset + ":" + phenocode]
        );
        const resource =
          data.meta.assoc.resources.find((r) => r.resource == phenos[0].resource) || null;
        const qtlNote =
          row.variant === undefined
            ? ""
            : isQTLInCis(row.variant, phenos[0], cisWindow)
            ? " [cis]"
            : isQTLInTrans(row.variant, phenos[0], cisWindow)
            ? " [trans]"
            : "";
        return (
          <PhenoTooltip
            resource={resource}
            phenos={phenos}
            row={topAssoc}
            content=<span style={phenos[0].is_na ? { color: "gray" } : {}}>
              {topAssoc.count == 1
                ? topAssoc.phenostring
                : topAssoc.phenostring + " (" + topAssoc.count + ")"}
              {qtlNote}
            </span>
          />
        );
      },
      header: "top eQTL",
      id: "top_eqtl",
      filterFn: filterContainsWithTooltip,
      enableSorting: false,
      muiTableHeadCellFilterTextFieldProps: {
        placeholder: "top eQTL",
      },
      size: 70,
    },
    {
      accessorFn: (row) => {
        let topAssoc = row.assoc.groupedData.find((d) => d.data_type === DataType.PQTL);
        if (topAssoc === undefined) {
          // if no significant result, use the placeholder
          topAssoc = row.assoc.groupedData.find((d) => d.data_type === DataType.NA);
        }
        if (topAssoc === undefined) {
          console.log("no top association for " + row.variant);
          return "This should not happen";
        }
        // TODO why still complain about undefined?
        topAssoc = topAssoc!;
        const phenos = topAssoc.phenocode.map(
          (phenocode) =>
            // @ts-ignore
            data.phenos[topAssoc.resource + ":" + phenocode] ||
            // sQTLs have dataset in the phenocode
            // @ts-ignore
            data.phenos[topAssoc.resource + ":" + topAssoc.dataset + ":" + phenocode]
        );
        const resource =
          data.meta.assoc.resources.find((r) => r.resource == phenos[0].resource) || null;
        const qtlNote =
          row.variant === undefined
            ? ""
            : isQTLInCis(row.variant, phenos[0], cisWindow)
            ? " [cis]"
            : isQTLInTrans(row.variant, phenos[0], cisWindow)
            ? " [trans]"
            : "";
        return (
          <PhenoTooltip
            resource={resource}
            phenos={phenos}
            row={topAssoc}
            content=<span style={phenos[0].is_na ? { color: "gray" } : {}}>
              {topAssoc.count == 1
                ? topAssoc.phenostring
                : topAssoc.phenostring + " (" + topAssoc.count + ")"}
              {qtlNote}
            </span>
          />
        );
      },
      header: "top pQTL",
      id: "top_pqtl",
      filterFn: filterContainsWithTooltip,
      enableSorting: false,
      muiTableHeadCellFilterTextFieldProps: {
        placeholder: "top pQTL",
      },
      size: 70,
    },
    {
      accessorFn: (row) => {
        let topAssoc = row.assoc.groupedData.find((d) => d.data_type === DataType.SQTL);
        if (topAssoc === undefined) {
          // if no significant result, use the placeholder
          topAssoc = row.assoc.groupedData.find((d) => d.data_type === DataType.NA);
        }
        if (topAssoc === undefined) {
          console.log("no top association for " + row.variant);
          return "This should not happen";
        }
        // TODO why still complain about undefined?
        topAssoc = topAssoc!;
        const phenos = topAssoc.phenocode.map(
          (phenocode) =>
            // @ts-ignore
            data.phenos[topAssoc.resource + ":" + phenocode] ||
            // sQTLs have dataset in the phenocode
            // @ts-ignore
            data.phenos[topAssoc.resource + ":" + topAssoc.dataset + ":" + phenocode]
        );
        const resource =
          data.meta.assoc.resources.find((r) => r.resource == phenos[0].resource) || null;
        const qtlNote =
          row.variant === undefined
            ? ""
            : isQTLInCis(row.variant, phenos[0], cisWindow)
            ? " [cis]"
            : isQTLInTrans(row.variant, phenos[0], cisWindow)
            ? " [trans]"
            : "";
        return (
          <PhenoTooltip
            resource={resource}
            phenos={phenos}
            row={topAssoc}
            content=<span style={phenos[0].is_na ? { color: "gray" } : {}}>
              {topAssoc.count == 1
                ? topAssoc.phenostring
                : topAssoc.phenostring + " (" + topAssoc.count + ")"}
              {qtlNote}
            </span>
          />
        );
      },
      header: "top sQTL",
      id: "top_sqtl",
      filterFn: filterContainsWithTooltip,
      enableSorting: false,
      muiTableHeadCellFilterTextFieldProps: {
        placeholder: "top sQTL",
      },
      size: 70,
    },
  ];
  return cols;
};
