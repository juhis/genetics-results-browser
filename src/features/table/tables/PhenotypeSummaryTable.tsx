import { useTheme } from "@mui/material";
import MaterialReactTable, { MRT_ColumnDef } from "material-react-table";

import { naInfSort, variantSort } from "../utils/sorting";
import { SummaryTableRow, TableData } from "../../../types/types";
import { useMemo, useState } from "react";
import { getVariantSummaryTableColumns } from "./PhenotypeSummaryTable.columns";
import { useDataStore } from "../../../store/store";
import { useServerQuery } from "../../../store/serverQuery";
import { summarize } from "../../../store/munge";
import VariantMainTable from "./VariantMainTable";

const PhenotypeSummaryTable = (props: {}) => {
  const theme = useTheme();
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 20,
  });

  const clientData: TableData = useDataStore((state) => state.clientData)!;

  const { isError, isFetching, isLoading } = useServerQuery(
    useDataStore((state) => state.variantInput)!,
    useDataStore((state) => state.setServerData)
  );

  const summaryData = useMemo(() => summarize(clientData), [clientData]);
  const columns = useMemo<MRT_ColumnDef<SummaryTableRow>[]>(() => {
    return getVariantSummaryTableColumns(clientData.phenos, clientData.datasets, clientData.meta);
  }, [summaryData]);

  return (
    <MaterialReactTable
      data={summaryData}
      columns={columns}
      //renderTopToolbarCustomActions={({ table }) => <ExportButtons table={table} />}
      enableTopToolbar={false}
      enableColumnFilters={true}
      initialState={{
        showColumnFilters: true,
        density: "compact",
        sorting: [{ id: "total", desc: true }],
      }}
      renderDetailPanel={({ row }) => (
        <VariantMainTable
          phenotype={row.original.pheno}
          showTraitCounts={false}
          enableTopToolbar={false}
        />
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
              //@ts-ignore
              children: props.error.response?.data?.message || props.error.message,
            }
          : undefined
      }
      muiTablePaginationProps={{
        rowsPerPageOptions: [10, 20, 100, 1000],
      }}
      onPaginationChange={setPagination}
      state={{
        isLoading: isLoading,
        showAlertBanner: isError,
        showProgressBars: isFetching,
        pagination,
      }}
      sortingFns={{
        naInfSort,
        variantSort,
      }}
      enableGlobalFilter={false}
    />
  );
};

export default PhenotypeSummaryTable;
