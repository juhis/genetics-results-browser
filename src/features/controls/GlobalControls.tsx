import { Box, Divider, FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import { useDataStore } from "../../store/store";
import { useServerQuery } from "../../store/serverQuery";
import GlobalThresholds from "./GlobalThresholds";
import GlobalSwitches from "./GlobalSwitches";
import GnomadPopChoice from "./GnomadPopChoice";

const GlobalControls = () => {
  const variantInput: string = useDataStore((state) => state.variantInput)!;
  const { isError, isFetching, isLoading } = useServerQuery(variantInput);
  const isNotDone = isError || isFetching || isLoading;

  return (
    <>
      <Box
        sx={{
          display: "flex",
          gap: "1rem",
          p: "0.5rem",
          flexWrap: "wrap",
          flexDirection: "row",
        }}>
        <Box sx={{ display: "flex", flexDirection: "row" }}>
          <FormControl sx={{ paddingRight: "20px" }}>
            <RadioGroup defaultValue="assoc" name="assoc-finemapped-buttons-group">
              <FormControlLabel
                value="assoc"
                disabled={isNotDone}
                control={<Radio />}
                label="Show associations in main tables"
              />
              <FormControlLabel
                value="finemapped"
                disabled={true}
                control={<Radio />}
                label="Show fine-mapping in main tables"
              />
            </RadioGroup>
          </FormControl>
          <Divider sx={{ margin: "auto" }} orientation="vertical" />
          <GlobalSwitches />
          <Divider sx={{ margin: "auto" }} orientation="vertical" />
          <GlobalThresholds />
          <Divider sx={{ margin: "auto" }} orientation="vertical" />
          <GnomadPopChoice />
        </Box>
      </Box>
    </>
  );
};

export default GlobalControls;
