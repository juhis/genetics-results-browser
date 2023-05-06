import { styled, Tooltip, tooltipClasses, TooltipProps } from "@mui/material";

export const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: "#ffffff",
    color: "rgba(0, 0, 0, 0.87)",
    maxWidth: 1024,
    fontSize: theme.typography.pxToRem(16),
    border: "1px solid #dadde9",
  },
}));
