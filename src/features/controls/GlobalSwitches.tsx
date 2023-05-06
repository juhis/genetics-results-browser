import { Box, Divider, FormControl, FormControlLabel, Switch } from "@mui/material";
import { DataType } from "../../types/types";
import { useMemo, ReactElement } from "react";
import { useDataStore } from "../../store/store";
import { useServerQuery } from "../../store/serverQuery";

const GlobalSwitches = (props: {}) => {
  const variantInput: string = useDataStore((state) => state.variantInput)!;
  const toggledDataTypes: Record<DataType, boolean> = useDataStore(
    (state) => state.toggledDataTypes
  );
  const toggleDataType = useDataStore((state) => state.toggleDataType);
  const toggledGWASTypes: Record<string, boolean> = useDataStore((state) => state.toggledGWASTypes);
  const toggleGWASType = useDataStore((state) => state.toggleGWASType);

  const { isError, isFetching, isLoading } = useServerQuery(
    variantInput,
    useDataStore((state) => state.setServerData)
  );
  const isNotDone = isError || isFetching || isLoading;

  const dataTypeSwitches: ReactElement<"FormControlLabel">[] = useMemo(
    () =>
      (Object.keys(toggledDataTypes) as Array<keyof typeof toggledDataTypes>).map((dataType) => {
        return (
          <FormControlLabel
            key={dataType}
            control={
              <Switch
                checked={toggledDataTypes[dataType]}
                disabled={isNotDone}
                onChange={() => {
                  toggleDataType(dataType);
                }}
              />
            }
            label={`Include ${dataType}`}
          />
        );
      }),
    [toggledDataTypes, toggleDataType, isNotDone]
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
                  disabled={isNotDone || !toggledDataTypes["GWAS"]}
                  onChange={() => {
                    toggleGWASType(gwasType);
                  }}
                />
              }
              label={`Include ${gwasType} GWAS`}
            />
          );
        })}
      </FormControl>
    ),
    [toggledDataTypes, toggledGWASTypes, toggleGWASType, isNotDone]
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

export default GlobalSwitches;
