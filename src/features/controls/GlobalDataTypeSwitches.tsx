import { Box, Divider, FormControl, FormControlLabel, Switch } from "@mui/material";
import { DataType } from "../../types/types";
import { useMemo, ReactElement } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useDataStore } from "../../store/store";

const GlobalDataTypeSwitches = (props: { isNotReadyYet: boolean }) => {
  const toggledDataTypes: Record<DataType, boolean> = useDataStore(
    (state) => state.toggledDataTypes
  );
  const toggleDataType = useDataStore((state) => state.toggleDataType);
  const toggledGWASTypes: Record<string, boolean> = useDataStore((state) => state.toggledGWASTypes);
  const toggleGWASType = useDataStore((state) => state.toggleGWASType);

  useHotkeys("g", () => toggleDataType(DataType.GWAS));
  useHotkeys("e", () => toggleDataType(DataType.EQTL));
  useHotkeys("p", () => toggleDataType(DataType.PQTL));
  useHotkeys("s", () => toggleDataType(DataType.SQTL));

  useHotkeys("b", () => toggleGWASType("case-control"));
  useHotkeys("q", () => toggleGWASType("continuous"));

  const dataTypeSwitches: ReactElement<"FormControlLabel">[] = useMemo(
    () =>
      (Object.keys(toggledDataTypes) as Array<keyof typeof toggledDataTypes>).map((dataType) => {
        return (
          <FormControlLabel
            key={dataType}
            control={
              <Switch
                checked={toggledDataTypes[dataType]}
                disabled={props.isNotReadyYet}
                onChange={() => {
                  toggleDataType(dataType);
                }}
              />
            }
            label={`[${dataType.slice(0, 1).toUpperCase()}] Include ${dataType}`}
          />
        );
      }),
    [toggledDataTypes, toggleDataType, props.isNotReadyYet]
  );

  const gwasTypeSwitches: ReactElement<"FormControl"> = useMemo(
    () => (
      <FormControl disabled={!toggledDataTypes["GWAS"]}>
        {Object.keys(toggledGWASTypes).map((gwasType) => {
          return (
            <FormControlLabel
              key={gwasType}
              control={
                <Switch
                  checked={toggledGWASTypes[gwasType]}
                  disabled={props.isNotReadyYet || !toggledDataTypes["GWAS"]}
                  onChange={() => {
                    toggleGWASType(gwasType);
                  }}
                />
              }
              label={`[${gwasType == "case-control" ? "B" : "Q"}] Include ${gwasType} GWAS`}
            />
          );
        })}
      </FormControl>
    ),
    [toggledDataTypes, toggledGWASTypes, toggleGWASType, props.isNotReadyYet]
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
        {dataTypeSwitches}
      </Box>
      <Divider sx={{ margin: "auto" }} orientation="vertical" />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          paddingLeft: "20px",
          paddingRight: "20px",
        }}>
        {gwasTypeSwitches}
      </Box>
    </>
  );
};

export default GlobalDataTypeSwitches;
