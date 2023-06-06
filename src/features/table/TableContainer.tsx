import VariantMainTable from "./tables/VariantMainTable";
import QueryVariantInfo from "../input/QueryVariantInfo";
import InputForm from "../input/InputForm";
import { useDataStore } from "../../store/store";
import { Box, Tab, Tabs, Typography } from "@mui/material";
import TabPanel from "@mui/lab/TabPanel";
import { TabContext } from "@mui/lab";
import GlobalControlContainer from "../controls/GlobalControlContainer";
import PhenotypeSummaryTable from "./tables/PhenotypeSummaryTable";
import VariantSummaryStats from "./tables/PopulationSummaryTable";
import { useServerQuery } from "../../store/serverQuery";
import { useEffect } from "react";

const TableContainer = () => {
  const activeTab = useDataStore((state) => state.activeTab);
  const setActiveTab = useDataStore((state) => state.setActiveTab);
  const setServerData = useDataStore((state) => state.setServerData);
  const clientData = useDataStore((state) => state.clientData);
  const pThreshold = useDataStore((state) => state.pThreshold);
  const variantInput = useDataStore((state) => state.variantInput);

  // set data state when the result from the query or cache updates
  const { data } = useServerQuery(variantInput);
  useEffect(() => {
    if (data) {
      setServerData(data);
    }
  }, [data]);

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
      {variantInput !== undefined ? (
        <>
          <QueryVariantInfo />
          <GlobalControlContainer />
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
                <Box flex="5" display="flex" flexDirection="column" sx={{ paddingTop: "10px" }}>
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
