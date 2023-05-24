import { FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";

const GlobalAssocFinemapSwitches = (props: { isNotReadyYet: boolean }) => {
  return (
    <FormControl sx={{ paddingRight: "20px" }}>
      <RadioGroup defaultValue="assoc" name="assoc-finemapped-buttons-group">
        <FormControlLabel
          value="assoc"
          disabled={props.isNotReadyYet}
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
  );
};

export default GlobalAssocFinemapSwitches;
