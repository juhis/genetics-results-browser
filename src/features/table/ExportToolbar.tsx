import { Box, Button } from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import {
  handleFineMappingTableExport,
  handleAssocTableExport,
  handleMainTableExport,
} from "./utils/export";
import { MRT_TableInstance } from "material-react-table";
import { VariantRecord, TableData, Phenotype } from "../../types/types";
import { getVariantMainTableColumns } from "./tables/VariantMainTable.columns";
import { getFineMappingTableColumns } from "./tables/VariantFineMappedTable.columns";
import { useDataStore } from "../../store/store";
import { useServerQuery } from "../../store/serverQuery";

const ExportButtons = (props: { table: MRT_TableInstance<VariantRecord> }) => {
  const variantInput: string = useDataStore((state) => state.variantInput)!;
  const clientData: TableData = useDataStore((state) => state.clientData)!;
  const cisWindow: number = useDataStore((state) => state.cisWindow);
  const selectedPheno: Phenotype | undefined = useDataStore((state) => state.selectedPheno);
  const selectedPopulation: string | undefined = useDataStore((state) => state.selectedPopulation);

  const { isError, isFetching, isLoading } = useServerQuery(variantInput);

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
              variantInput,
              props.table,
              getVariantMainTableColumns(
                clientData,
                cisWindow,
                selectedPheno,
                selectedPopulation,
                true
              )
            );
          }}
          startIcon={<FileDownloadIcon />}
          variant="contained">
          export Variants table
        </Button>
        <Button
          disabled={isError || isFetching || isLoading}
          color="primary"
          onClick={() => {
            handleFineMappingTableExport(
              variantInput,
              clientData.phenos,
              clientData.data.length,
              props.table,
              getVariantMainTableColumns(
                clientData,
                cisWindow,
                selectedPheno,
                selectedPopulation,
                true
              ),
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
            handleAssocTableExport(
              variantInput,
              clientData.phenos,
              clientData.data.length,
              props.table,
              getVariantMainTableColumns(
                clientData,
                cisWindow,
                selectedPheno,
                selectedPopulation,
                true
              ),
              clientData.phenos,
              clientData.datasets,
              clientData.meta
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
