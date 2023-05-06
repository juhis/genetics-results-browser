import { ReactElement } from "react";
import { useTheme } from "@mui/material";
import NorthIcon from "@mui/icons-material/North";
import SouthIcon from "@mui/icons-material/South";

export const UpDownIcons = (props: { up: number; down: number }): ReactElement => {
  const theme = useTheme();
  return (
    <>
      <NorthIcon sx={{ fontSize: "0.75rem", color: theme.palette.error.main }} />
      {props.up}
      <SouthIcon sx={{ fontSize: "0.75rem", color: theme.palette.info.main }} />
      {props.down}
    </>
  );
};

interface UpOrDownIconProps {
  value: number;
  withValue?: boolean;
  precision?: number;
}

export const UpOrDownIcon = (props: UpOrDownIconProps): ReactElement => {
  const theme = useTheme();
  const { value, withValue = false, precision = 3 } = props;
  return value > 0 ? (
    <>
      <NorthIcon sx={{ fontSize: "0.75rem", color: theme.palette.error.main }} />
      {withValue ? value.toPrecision(precision) : null}
    </>
  ) : value < 0 ? (
    <>
      <SouthIcon sx={{ fontSize: "0.75rem", color: theme.palette.info.main }} />
      {withValue ? value.toPrecision(precision) : null}
    </>
  ) : (
    <></>
  );
};
