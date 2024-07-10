import { TableData } from "../../../types/types";
import { useMemo } from "react";
import { useDataStore } from "../../../store/store";
import { MaterialReactTable, MRT_ColumnDef } from "material-react-table";

const VariantSummaryStats = (props: {}) => {
  const clientData: TableData = useDataStore((state) => state.clientData)!;
  const columns = useMemo<MRT_ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "pop",
        header: "population",
        filterFn: "contains",
        muiFilterTextFieldProps: { placeholder: "population" },
      },
      {
        accessorKey: "max",
        header: "max AF",
        filterFn: "greaterThan",
        muiFilterTextFieldProps: { placeholder: "max" },
      },
      {
        accessorKey: "min",
        header: "min AF",
        filterFn: "greaterThan",
        muiFilterTextFieldProps: { placeholder: "min" },
      },
    ],
    []
  );
  return (
    <MaterialReactTable
      columns={columns}
      data={clientData.freq_summary}
      enableColumnActions={true}
      enableColumnFilters={true}
      enablePagination={false}
      enableSorting={true}
      enableBottomToolbar={false}
      enableTopToolbar={false}
      initialState={{
        showColumnFilters: true,
        density: "compact",
        sorting: [{ id: "max", desc: true }],
      }}
      muiTableBodyCellProps={{
        sx: {
          fontSize: "0.75rem",
        },
      }}
    />
  );
};

export default VariantSummaryStats;
