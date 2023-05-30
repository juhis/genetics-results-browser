import { Box, IconButton, TextField } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import { useState } from "react";
import { useDataStore } from "../../store/store";

const GlobalThresholds = (props: { isNotReadyYet: boolean }) => {
  // keep track of the threshold string values in the text fields here
  // only update the store when necessary
  const [pThresholdStr, setPThresholdStr] = useState(useDataStore.getState().pThreshold.toString());
  const [pipThresholdStr, setPipThresholdStr] = useState(
    useDataStore.getState().pipThreshold.toString()
  );

  const setPThreshold = useDataStore((state) => state.setPThreshold);
  const setPipThreshold = useDataStore((state) => state.setPipThreshold);

  const updatePThreshold = (value: string) => {
    setPThresholdStr(value);
    let p = Number(value); // e.g. "5e" will become NaN
    if (p > 1 || p <= 0 || isNaN(p)) {
      p = 1;
    }
    // only update if actual new number in the field
    if (p != useDataStore.getState().pThreshold) {
      setPThreshold(p);
    }
  };

  const updatePipThreshold = (value: string) => {
    setPipThresholdStr(value);
    let pip = Number(value);
    if (pip < 0 || isNaN(pip)) {
      pip = 0;
    }
    // only update if actual new number in the field
    if (pip != useDataStore.getState().pipThreshold) {
      setPipThreshold(pip);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        paddingLeft: "20px",
        paddingRight: "20px",
        justifyContent: "space-between",
      }}>
      <TextField
        id="p_thres"
        label="p-value threshold"
        value={pThresholdStr}
        variant="standard"
        disabled={props.isNotReadyYet}
        onChange={(event) => {
          updatePThreshold(event.target.value);
        }}
        InputProps={{
          endAdornment: (
            <IconButton
              sx={{ visibility: pThresholdStr !== "" ? "visible" : "hidden" }}
              disabled={props.isNotReadyYet}
              onClick={() => {
                updatePThreshold("");
              }}>
              <ClearIcon />
            </IconButton>
          ),
        }}
      />
      <TextField
        id="pip_thres"
        label="PIP threshold"
        value={pipThresholdStr}
        variant="standard"
        disabled={props.isNotReadyYet}
        onChange={(event) => {
          updatePipThreshold(event.target.value);
        }}
        InputProps={{
          endAdornment: (
            <IconButton
              sx={{ visibility: pipThresholdStr !== "" ? "visible" : "hidden" }}
              disabled={props.isNotReadyYet}
              onClick={() => {
                updatePipThreshold("");
              }}>
              <ClearIcon />
            </IconButton>
          ),
        }}
      />
    </Box>
  );
};

export default GlobalThresholds;
