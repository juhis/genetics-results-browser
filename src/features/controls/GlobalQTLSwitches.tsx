import { Box, FormControlLabel, Switch, Typography } from "@mui/material";
import { DataType, QTLType } from "../../types/types";
import { useMemo, ReactElement } from "react";
import { useDataStore } from "../../store/store";

const GlobalQTLSwitches = (props: { isNotReadyYet: boolean }) => {
  const toggledQTLTypes: Record<QTLType, boolean> = useDataStore((state) => state.toggledQTLTypes);
  const toggleQTLType = useDataStore((state) => state.toggleQTLType);
  const toggledDataTypes: Record<DataType, boolean> = useDataStore(
    (state) => state.toggledDataTypes
  );

  const qtlTypeSwitches: ReactElement<"FormControlLabel">[] = useMemo(
    () =>
      (Object.keys(toggledQTLTypes) as Array<keyof typeof toggledQTLTypes>).map((QTLType) => {
        return (
          <FormControlLabel
            key={QTLType}
            control={
              <Switch
                checked={toggledQTLTypes[QTLType]}
                disabled={
                  props.isNotReadyYet ||
                  (!toggledDataTypes["eQTL"] &&
                    !toggledDataTypes["sQTL"] &&
                    !toggledDataTypes["pQTL"])
                }
                onChange={() => {
                  toggleQTLType(QTLType);
                }}
              />
            }
            label={`Include ${QTLType.toLowerCase()}-QTLs`}
          />
        );
      }),
    [toggledQTLTypes, toggleQTLType, props.isNotReadyYet, toggledDataTypes]
  );

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          paddingLeft: "20px",
          paddingRight: "20px",
        }}>
        <div>Only for eQTL Catalogue for now</div>
        {qtlTypeSwitches}
      </Box>
    </>
  );
};

export default GlobalQTLSwitches;
