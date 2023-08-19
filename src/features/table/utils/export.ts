import { MRT_ColumnDef, MRT_TableInstance } from "material-react-table";

import {
  AssocRecord,
  FineMappedRecord,
  GroupedFineMappedRecord,
  PhenoMap,
  VariantRecord,
  TableData,
  DatasetMap,
} from "../../../types/types";
import { ExportToCsv } from "export-to-csv";
import { getAssociationTableColumns } from "../tables/VariantAssocTable.columns";
import { pValRepr } from "./tableutil";

const csvExporter = new ExportToCsv({
  fieldSeparator: "\t",
  filename: "variant_annotation",
  quoteStrings: "",
  decimalSeparator: ".",
  showLabels: true,
  useBom: false, //never
  useKeysAsHeaders: true,
  useTextFile: true,
});

// TODO these functions are complicated and error prone if the tables are changed and should be refactored
// perhaps munging the data to a more direct export format helps
// or make all HTML columns use the same format, e.g. give a value prop
// or use the meta property of the columns
export const handleMainTableExport = (
  table: MRT_TableInstance<VariantRecord>,
  columns: MRT_ColumnDef<VariantRecord>[]
) => {
  const dataExport = table.getRowModel().rows.map((row) => {
    return columns.reduce((p, c) => {
      const colId = c.id as string;
      let val = row.getValue(colId) as any;
      // not entirely sure why this is necessary, but it is
      if (typeof val === "undefined") {
        p[c.header] = "NA";
      } else {
        val = val!;
        if (typeof val === "number") {
          p[c.header] = String(val);
        } else if (typeof val === "string") {
          p[c.header] = val || "NA";
        } else if (val.props.gnomadData !== undefined) {
          // gnomad AF
          p[c.header] = val.props.gnomadData.AF || "NA";
        } else if (
          val.props.children &&
          typeof val.props.children === "object" &&
          val.props.children.length === 4
        ) {
          // up/down arrows expected
          p[c.header] = `${val.props.children[1]}/${val.props.children[3]}`;
        } else if (val.props.children && typeof val.props.children === "object") {
          // two values expected
          console.log(val);
          p[c.header] = val.props.children[1].props.children || "NA";
        } else if (val.props.children && val.props.children !== undefined) {
          if (val.props.children.props !== undefined) {
            // tooltipped value
            p[c.header] = val.props.children.props.children || "NA";
          } else {
            // styled value
            p[c.header] = val.props.children || "NA";
          }
        } else if (val.props.content && val.props.content.props.children) {
          // tooltipped value
          p[c.header] = val.props.content.props.children || "NA";
        } else {
          console.warn(`unhandled export field will be NA: ${colId}`);
          p[c.header] = "NA";
        }
      }
      return p;
    }, {} as Record<string, string>);
  });
  csvExporter.generateCsv(dataExport);
};

export const handleFineMappingTableExport = (
  table: MRT_TableInstance<VariantRecord>,
  mainTableColumns: MRT_ColumnDef<VariantRecord>[],
  columns: MRT_ColumnDef<GroupedFineMappedRecord>[]
) => {
  console.log(mainTableColumns);
  const dataExport = table
    .getRowModel()
    .rows.map((row) => {
      // TODO make modular, use the same code as the main table
      const mainTableMainCols = mainTableColumns
        .slice(0, 5)
        .map((col) => [col.header, col.id as string]);
      const mainTableColsExport = mainTableMainCols.reduce((p, c) => {
        const val = (row.getValue(c[1]) || "NA") as any;
        if (typeof val === "object") {
          console.log(val);
          if (val.props.gnomadData) {
            //@ts-ignore
            p[c[0]] = val.props.gnomadData.AF || "NA";
          } else if (val.props.children && val.props.children.length === 4) {
            // up/down arrows expected
            p[c[0]] = `${val.props.children[1]}/${val.props.children[3]}`;
          } else if (val.props.children && val.props.children[1]) {
            // two values
            p[c[0]] = val.props.children[1].props.children || "NA";
          } else if (val.props.children && val.props.children !== undefined) {
            if (val.props.children.props !== undefined) {
              // tooltipped value
              p[c[0]] = val.props.children.props.children || "NA";
            } else {
              // styled value
              p[c[0]] = val.props.children || "NA";
            }
          } else if (val.props.content && val.props.content.props.children) {
            // tooltipped value
            p[c[0]] = val.props.content.props.children || "NA";
          } else {
            console.warn(`possible unhandled export field will be NA: ${c[1]}`);
            p[c[0]] = "NA";
          }
        } else {
          p[c[0]] = String(val);
        }
        return p;
      }, {} as Record<string, string>);
      return row.original.finemapped.data.map((fm) => {
        const fmCols = columns.reduce((p, c) => {
          const hdr = c.header;
          if (hdr == "trait") {
            // TODO phenostring
            p[hdr] = fm.phenocode;
          } else {
            const colId = c.id
              ? (c.id as keyof FineMappedRecord)
              : (c.accessorKey as keyof FineMappedRecord);
            p[hdr] = String(fm[colId]) || "NA";
          }
          return p;
        }, {} as Record<string, string>);
        return {
          ...mainTableColsExport,
          ...fmCols,
        };
      });
    })
    .flat();
  csvExporter.generateCsv(dataExport);
};

export const handleAssocTableExport = (
  table: MRT_TableInstance<VariantRecord>,
  mainTableColumns: MRT_ColumnDef<VariantRecord>[],
  phenos: PhenoMap,
  datasets: DatasetMap,
  meta: TableData["meta"]
) => {
  const assocColumns = getAssociationTableColumns(undefined, 0, phenos, datasets, meta);
  const dataExport = table
    .getRowModel()
    .rows.map((row) => {
      // TODO make modular, use the same code as the main table
      const mainTableMainCols = mainTableColumns
        .slice(0, 5)
        .map((col) => [col.header, col.id as string]);
      const mainTableColsExport = mainTableMainCols.reduce((p, c) => {
        const val = (row.getValue(c[1]) || "NA") as any;
        if (typeof val === "object") {
          if (val.props.gnomadData) {
            //@ts-ignore
            p[c[0]] = val.props.gnomadData.AF || "NA";
          } else if (val.props.children && val.props.children.length === 4) {
            // up/down arrows expected
            p[c[0]] = `${val.props.children[1]}/${val.props.children[3]}`;
          } else if (val.props.children && val.props.children[1]) {
            // two values
            p[c[0]] = val.props.children[1].props.children || "NA";
          } else if (val.props.children && val.props.children !== undefined) {
            if (val.props.children.props !== undefined) {
              // tooltipped value
              p[c[0]] = val.props.children.props.children || "NA";
            } else {
              // styled value
              p[c[0]] = val.props.children || "NA";
            }
          } else if (val.props.content && val.props.content.props.children) {
            // tooltipped value
            p[c[0]] = val.props.content.props.children || "NA";
          } else {
            console.warn(`possible unhandled export field will be NA: ${c[1]}`);
            p[c[0]] = "NA";
          }
        } else {
          p[c[0]] = String(val);
        }
        return p;
      }, {} as Record<string, string>);
      const assocData = row.original.assoc.data.map((assoc) => {
        const assocCols = assocColumns.reduce((p, c) => {
          const hdr = c.header;
          if (hdr == "resource") {
            p[hdr] = assoc.resource;
          } else if (hdr == "dataset") {
            p[hdr] = assoc.dataset;
          } else if (hdr == "type") {
            p[hdr] = assoc.data_type;
          } else if (hdr === "trait") {
            // TODO we want the phenostring here
            p[hdr] = assoc.phenocode;
          } else if (hdr == "p-value") {
            p[hdr] = pValRepr(assoc.mlogp);
          } else {
            const colId = c.id ? (c.id as keyof AssocRecord) : (c.accessorKey as keyof AssocRecord);
            p[hdr] = String(assoc[colId]) || "NA";
          }
          return p;
        }, {} as Record<string, string>);
        return {
          ...mainTableColsExport,
          ...assocCols,
        };
      });
      // omitting placeholder phenotypes
      return assocData.filter((v) => Number(v["p-value"]) < 1);
    })
    .flat();
  csvExporter.generateCsv(dataExport);
};
