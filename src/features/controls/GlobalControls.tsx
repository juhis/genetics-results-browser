import { Box, Divider, FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import { useDataStore } from "../../store/store";
import { useServerQuery } from "../../store/serverQuery";
import GlobalThresholds from "./GlobalThresholds";
import GlobalSwitches from "./GlobalSwitches";
import GnomadPopChoice from "./GnomadPopChoice";

const GlobalControls = () => {
  const variantInput: string = useDataStore((state) => state.variantInput)!;
  const { isError, isFetching, isLoading } = useServerQuery(
    variantInput,
    useDataStore((state) => state.setServerData)
  );
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
        {/* <Box sx={{ display: "flex", flexDirection: "row", alignItems: "flex-end" }}>
          <Autocomplete
            //disablePortal
            disabled={isNotDone}
            id="phenotype-select"
            options={
              clientData
                ? Object.values(clientData.phenos)
                    .filter((pheno) => toggledGWASTypes[pheno.trait_type] && !pheno.is_na)
                    .sort((a, b) => (b.num_cases || b.num_samples) - (a.num_cases || a.num_samples))
                : []
            }
            getOptionLabel={(option) =>
              // these are needed for searching
              `${option.phenocode.split(":").slice(1).join(":")} ${option.phenostring} ${
                option.pub_author || ""
              }`
            }
            renderOption={(prps, pheno) => (
              <span {...prps}>
                {pheno.phenostring}
                <br />
                {pheno.pub_author
                  ? pheno.pub_author + " " + pheno.pub_date!.split("-")[0]
                  : pheno.phenocode}
                <br />
                {pheno.num_cases ? pheno.num_cases + " cases" : pheno.num_samples + " samples"}
              </span>
            )}
            sx={{ width: 300 }}
            renderInput={(params) => <TextField {...params} label="Show association for trait" />}
            onChange={(event, newValue: Phenotype | null) => {
              setSelectedPheno(newValue ?? undefined);
            }}
          />
        </Box> */}
      </Box>
    </>
  );
};

export default GlobalControls;
