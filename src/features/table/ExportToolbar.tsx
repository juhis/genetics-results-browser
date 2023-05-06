import { Box, Button, useTheme } from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import {
  handleFineMappingTableExport,
  handleGWASTableExport,
  handleMainTableExport,
} from "./utils/export";
import { MRT_TableInstance } from "material-react-table";
import { VariantRecord, TableData, Phenotype } from "../../types/types";
import { getVariantMainTableColumns } from "./tables/VariantMainTable.columns";
import { getFineMappingTableColumns } from "./tables/VariantFineMappedTable.columns";
import { useDataStore } from "../../store/store";
import { useServerQuery } from "../../store/serverQuery";

const ExportButtons = (props: { table: MRT_TableInstance<VariantRecord> }) => {
  const theme = useTheme();

  const variantInput: string = useDataStore((state) => state.variantInput)!;
  const clientData: TableData = useDataStore((state) => state.clientData)!;
  const selectedPheno: Phenotype | undefined = useDataStore((state) => state.selectedPheno);
  const selectedPopulation: string | undefined = useDataStore((state) => state.selectedPopulation);

  const { isError, isFetching, isLoading } = useServerQuery(
    variantInput,
    useDataStore((state) => state.setServerData)
  );

  return (
    <Box
      sx={{
        display: "flex",
        gap: "1rem",
        p: "0.5rem",
        flexWrap: "wrap",
        flexDirection: "column",
      }}>
      <Box
        sx={{
          display: "flex",
          gap: "1rem",
          p: "0.5rem",
          flexWrap: "wrap",
          flexDirection: "row",
        }}>
        <Button
          disabled={isError || isFetching || isLoading}
          color="primary"
          onClick={() => {
            handleMainTableExport(
              props.table,
              getVariantMainTableColumns(clientData, selectedPheno, selectedPopulation, true)
            );
          }}
          startIcon={<FileDownloadIcon />}
          variant="contained">
          export main table
        </Button>
        <Button
          disabled={isError || isFetching || isLoading}
          color="primary"
          onClick={() => {
            handleFineMappingTableExport(
              props.table,
              getVariantMainTableColumns(clientData, selectedPheno, selectedPopulation, true),
              getFineMappingTableColumns(clientData.phenos, clientData.datasets)
            );
          }}
          startIcon={<FileDownloadIcon />}
          variant="contained">
          export fine-mapping results
        </Button>
        <Button
          disabled={isError || isFetching || isLoading}
          color="primary"
          onClick={() => {
            handleGWASTableExport(
              props.table,
              getVariantMainTableColumns(clientData, selectedPheno, selectedPopulation, true),
              clientData.phenos,
              clientData.datasets,
              clientData.meta,
              theme
            );
          }}
          startIcon={<FileDownloadIcon />}
          variant="contained">
          export association results
        </Button>
      </Box>
    </Box>
  );
};

export default ExportButtons;
