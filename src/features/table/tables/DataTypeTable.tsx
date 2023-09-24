import { Box, Divider, useTheme } from "@mui/material";
import MaterialReactTable from "material-react-table";

import { naInfSort, variantSort } from "../utils/sorting";
import VariantAssocTable from "./VariantAssocTable";
import VariantFinemappedTable from "./VariantFinemappedTable";
import { Phenotype, TableData, VariantRecord } from "../../../types/types";
import { useMemo, useState } from "react";
import ExportButtons from "../ExportToolbar";
import { useDataStore } from "../../../store/store";
import { useServerQuery } from "../../../store/serverQuery";
import { filterRows } from "../../../store/munge";
import { getDataTypeTableColumns } from "./DataTypeTable.columns";

const DataTypeTable = (props: {
  phenotype?: Phenotype;
  showTraitCounts: boolean;
  enableTopToolbar: boolean;
}) => {
  const theme = useTheme();
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 20,
  });

  const variantInput: string = useDataStore((state) => state.variantInput)!;
  const serverData: TableData | undefined = useDataStore((state) => state.serverData);
  const toggledDataTypesTurnedOn: Record<string, boolean> = useDataStore(
    (state) => state.toggledDataTypesTurnedOn
  );
  const toggledTraitTypes: Record<string, boolean> = useDataStore(
    (state) => state.toggledGWASTypes
  );
  const toggledQTLTypes: Record<string, boolean> = useDataStore((state) => state.toggledQTLTypes);
  const cisWindow: number = useDataStore((state) => state.cisWindow);
  const pThreshold: number = useDataStore((state) => state.pThreshold);
  const pipThreshold: number = useDataStore((state) => state.pipThreshold);

  const { error, isError, isFetching, isLoading } = useServerQuery(variantInput);

  const columns = getDataTypeTableColumns(serverData!, cisWindow);

  const tableData: VariantRecord[] = useMemo(() => {
    return filterRows(
      serverData!,
      toggledDataTypesTurnedOn,
      toggledTraitTypes,
      toggledQTLTypes,
      cisWindow,
      pThreshold,
      pipThreshold,
      undefined,
      true
    ).data;
  }, [serverData, toggledTraitTypes, toggledQTLTypes, cisWindow, pThreshold, pipThreshold]);

  return (
    <MaterialReactTable
      data={tableData ?? []}
      columns={columns}
      enableTopToolbar={props.enableTopToolbar}
      enableColumnFilterModes
      initialState={{
        showColumnFilters: true,
        density: "compact",
        columnOrder: ["mrt-row-expand"].concat(columns.map((c) => c.id!)),
        columnVisibility: { af_hidden: false },
      }}
      state={{
        isLoading: isLoading,
        showAlertBanner: isError,
        showProgressBars: isFetching,
        pagination,
        columnOrder: ["mrt-row-expand"].concat(columns.map((c) => c.id!)),
      }}
      onPaginationChange={setPagination}
      onColumnOrderChange={(newOrder) => {
        console.log(newOrder);
      }}
      renderDetailPanel={({ row }) => (
        <Box
          sx={{
            display: "grid",
            margin: "auto",
            gridTemplateColumns: "20fr 1fr 20fr",
            width: "100%",
          }}>
          <VariantFinemappedTable data={row.original} />
          <Divider sx={{ margin: "auto" }} orientation="vertical" />
          <VariantAssocTable variantData={row.original} />
        </Box>
      )}
      muiTableProps={{
        sx: {
          tableLayout: "fixed",
        },
      }}
      muiTableBodyCellProps={{
        sx: {
          fontSize: "0.75rem",
        },
      }}
      muiToolbarAlertBannerProps={
        isError
          ? {
              color: "error",
              // @ts-ignore
              children: error.response?.data?.message || error.message,
            }
          : undefined
      }
      muiTablePaginationProps={{
        rowsPerPageOptions: [10, 20, 100, 1000],
      }}
      muiTableBodyRowProps={({ row }) => ({
        sx: {
          backgroundColor:
            Number(row.original.value) % 2 == 1 ? theme.palette.background.default : "inherit",
        },
      })}
      sortingFns={{
        naInfSort,
        variantSort,
      }}
      // would be great to have the global filter but
      // 1) it's not working with the detail panel (perhaps possible to include an extra field in the main table column definitions for this?)
      // 2) tooltipped columns are not searchable without a custom filter
      enableGlobalFilter={false}
      //globalFilterFn="contains"
      //enableGlobalFilterRankedResults={false}
    />
  );
};

export default DataTypeTable;
