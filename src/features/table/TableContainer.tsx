import VariantMainTable from "./tables/VariantMainTable";
import QueryVariantInfo from "../input/QueryVariantInfo";
import InputForm from "../input/InputForm";
import { useDataStore } from "../../store/store";
import { Box, Tab, Tabs, Typography } from "@mui/material";
import TabPanel from "@mui/lab/TabPanel";
import { TabContext } from "@mui/lab";
import GlobalControls from "../controls/GlobalControls";
import PhenotypeSummaryTable from "./tables/PhenotypeSummaryTable";
import VariantSummaryStats from "./tables/PopulationSummaryTable";

const TableContainer = () => {
  const activeTab = useDataStore((state) => state.activeTab);
  const setActiveTab = useDataStore((state) => state.setActiveTab);
  const clientData = useDataStore((state) => state.clientData);
  const pThreshold = useDataStore((state) => state.pThreshold);

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
  };

  // TODO if the threshold is the same across resources, just show the number
  const renderPThreshold = (thres: number): string => {
    if (thres === 1) {
      return clientData!.meta.assoc.resources.map((r) => `${r.p_thres} (${r.resource})`).join(", ");
    }
    return `the chosen threshold of ${thres}`;
  };

  return (
    <>
      <InputForm />
      {useDataStore((state) => state.variantInput) !== undefined ? (
        <>
          <QueryVariantInfo />
          <GlobalControls />
          <TabContext value={activeTab}>
            <Tabs value={activeTab} onChange={handleTabChange} aria-label="table_selection_tabs">
              <Tab value="variants" label="variants" disabled={clientData === undefined} />
              <Tab value="summary" label="summary" disabled={clientData === undefined} />
            </Tabs>
            <TabPanel value="variants" sx={{ padding: 0 }}>
              <VariantMainTable enableTopToolbar={true} showTraitCounts={true} />
            </TabPanel>
            <TabPanel value="summary" sx={{ padding: 0 }}>
              <Box display="flex" flexDirection="row">
                <Box flex="2" display="flex" flexDirection="column" sx={{ paddingTop: "10px" }}>
                  <Typography sx={{ marginBottom: "10px", fontWeight: "bold" }}>
                    Phenotype association counts
                  </Typography>
                  <Typography sx={{ marginBottom: "10px" }}>
                    This table shows the number of variants associated with each phenotype with
                    p-value less than {renderPThreshold(pThreshold)}.
                  </Typography>
                  <PhenotypeSummaryTable />
                </Box>
                <Box
                  flex="1"
                  display="flex"
                  flexDirection="column"
                  sx={{ paddingTop: "10px", paddingLeft: "10px" }}>
                  <Typography sx={{ marginBottom: "10px", fontWeight: "bold" }}>
                    Population allele frequencies
                  </Typography>
                  <Typography sx={{ marginBottom: "10px" }}>
                    This table shows the number of variants with maximum or minimum allele frequency
                    in each population.
                  </Typography>
                  <VariantSummaryStats />
                </Box>
              </Box>
            </TabPanel>
          </TabContext>
        </>
      ) : (
        <></>
      )}
    </>
  );
};

export default TableContainer;
