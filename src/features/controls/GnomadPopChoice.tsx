import { Autocomplete, TextField } from "@mui/material";
import { TableData } from "../../types/types";
import { useDataStore } from "../../store/store";

const GnomadPopChoice = (props: { isNotReadyYet: boolean }) => {
  const clientData: TableData | undefined = useDataStore((state) => state.clientData);
  const setSelectedPopulation = useDataStore((state) => state.setSelectedPopulation);

  return (
    <Autocomplete
      sx={{ width: 200, paddingLeft: "20px" }}
      disabled={props.isNotReadyYet}
      id="phenotype-select"
      options={clientData?.meta.gnomad.populations || []}
      getOptionLabel={(option) => option}
      renderOption={(optionProps, pop) => {
        const { key, ...rest } = optionProps;
        return (
          <span key={key} {...rest}>
            {pop}
          </span>
        );
      }}
      renderInput={(params) => <TextField {...params} label="AF gnomAD population" />}
      onChange={(event, newValue: string | null) => {
        setSelectedPopulation(newValue !== null ? newValue : undefined);
      }}
    />
  );
};

export default GnomadPopChoice;
