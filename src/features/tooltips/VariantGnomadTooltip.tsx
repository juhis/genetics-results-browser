import { Link, Typography, useTheme } from "@mui/material";
//TODO using plotly increases the bundle size by 8MB uncompressed!
import Plot from "react-plotly.js";
import { useDataStore } from "../../store/store";
import { GnomadRecord } from "../../types/types";
import { HtmlTooltip } from "./HtmlTooltip";

export const VariantGnomadToolTip = (props: { variant: string; gnomadData: GnomadRecord }) => {
  const theme = useTheme();

  const gnomadVersion = useDataStore((state) => state.clientData!.meta.gnomad.version);
  const gnomadUrl = useDataStore((state) => state.clientData!.meta.gnomad.url);
  const selectedPopulation = useDataStore((state) => state.selectedPopulation);

  const af_pops = Object.keys(props.gnomadData).filter((k) => k.startsWith("AF_"));

  const trace: Plotly.Data[] = [
    {
      x: af_pops.map((pop) => pop.replace("AF_", "")),
      // take log and then reverse the scale with 1e-5 as minimum frequency
      y: af_pops.map(
        (pop) => 5 + Math.max(-5, Math.log10(props.gnomadData[pop as keyof GnomadRecord] as number))
      ),
      text: af_pops.map((pop) =>
        props.gnomadData[pop as keyof GnomadRecord] == null
          ? "NA"
          : props.gnomadData[pop as keyof GnomadRecord] == 0
          ? "0"
          : (props.gnomadData[pop as keyof GnomadRecord]! as number) < 0.01
          ? (props.gnomadData[pop as keyof GnomadRecord] as number).toExponential(1)
          : (props.gnomadData[pop as keyof GnomadRecord] as number).toPrecision(2)
      ),
      textposition: "auto",
      type: "bar",
      hovertemplate: "%{x} AF %{text}<extra></extra>",
      marker: { color: theme.palette.primary.main },
    },
  ];
  const layout: Partial<Plotly.Layout> = {
    font: {
      family: "Roboto, Helvetica, Arial, sans-serif",
      size: 11.4286,
      color: "#000",
    },
    width: 500,
    height: 250,
    yaxis: {
      range: [0, 5],
      nticks: 6,
      tickmode: "array",
      tickvals: [0, 1, 2, 3, 4, 5],
      ticktext: ["1e-5", "1e-4", "1e-3", "1e-2", "1e-1", ""],
      gridwidth: 1,
    },
    xaxis: {
      tickangle: 0,
    },
    bargap: 0.05,
    margin: {
      b: 40,
      r: 10,
      t: 20,
      l: 30,
    },
  };
  const filterDisplay =
    props.gnomadData.filters != null ? (
      <>
        <span style={{ color: theme.palette.error.main }}>
          This variant hasn't passed gnomAD QC.{" "}
          {props.gnomadData.filters.indexOf("AC0") > -1
            ? "No sample had a high quality genotype at this variant site."
            : "Allele frequencies may not be reliable."}
          <br />
          gnomAD QC filter{props.gnomadData.filters.split(",").length > 1 ? "s" : ""}:{" "}
          {props.gnomadData.filters.split(",").join(", ")}
        </span>
        <br />
      </>
    ) : (
      <></>
    );
  //TODO server-side calculation?
  // plenty of casting because populations are not typed
  let popmax = af_pops.reduce(
    (p, c) =>
      (props.gnomadData[p.pop as keyof GnomadRecord] as number) >
      (props.gnomadData[c as keyof GnomadRecord]! as number)
        ? p
        : { pop: c, af: props.gnomadData[c as keyof GnomadRecord] as number },
    {
      pop: af_pops[0],
      af: props.gnomadData[af_pops[0] as keyof GnomadRecord] as number,
    }
  );
  let popmin = af_pops.reduce(
    (p, c) =>
      (((props.gnomadData[p.pop as keyof GnomadRecord] as number) <
        (props.gnomadData[c as keyof GnomadRecord] == null
          ? Number.MAX_SAFE_INTEGER
          : (props.gnomadData[c as keyof GnomadRecord] as number))) as unknown as number)
        ? p
        : { pop: c, af: props.gnomadData[c as keyof GnomadRecord] as number },
    {
      pop: af_pops[0],
      af: props.gnomadData[af_pops[0] as keyof GnomadRecord] as number,
    }
  );
  const popmaxAfDispl = popmax.af < 0.001 ? popmax.af.toExponential(1) : popmax.af.toPrecision(2);
  const popminAfDispl = popmin.af < 0.001 ? popmin.af.toExponential(1) : popmin.af.toPrecision(2);
  const popsNotAvailable = af_pops
    .filter((pop) => props.gnomadData[pop as keyof GnomadRecord] == null)
    .map((pop) => pop.replace("AF_", ""));
  const popsNotAvailableDispl =
    popsNotAvailable.length > 1 ? (
      <span>Populations {popsNotAvailable.join(", ")} don't have this site called in gnomAD</span>
    ) : popsNotAvailable.length == 1 ? (
      <span>Population {popsNotAvailable[0]} doesn't have this site called in gnomAD</span>
    ) : (
      <></>
    );
  const afRangeDispl =
    popmax.af === 0 ? (
      <></>
    ) : (
      <span>
        AF ranges between populations from{" "}
        {popmin.af == 0
          ? "0 to " + popmax.pop.replace("AF_", "") + " " + popmaxAfDispl
          : popmin.pop.replace("AF_", "") +
            " " +
            popminAfDispl +
            " to " +
            popmax.pop.replace("AF_", "") +
            " " +
            popmaxAfDispl}
      </span>
    );

  return (
    <HtmlTooltip
      title={
        <div style={{ display: "flex", flexDirection: "column" }}>
          <Typography variant="h6" sx={{ paddingBottom: "10px" }}>
            gnomAD {gnomadVersion} genomes allele frequency
          </Typography>
          {filterDisplay}
          {afRangeDispl}
          {popsNotAvailableDispl}
          <Plot data={trace} layout={layout} config={{ displayModeBar: false }} />
          <Link
            color="inherit"
            href={gnomadUrl.replace("[VARIANT]", props.variant)}
            target="_blank">
            Go to gnomAD variant page
          </Link>
        </div>
      }>
      <span
        style={{
          color: props.gnomadData.filters ? theme.palette.error.main : "inherit",
        }}>
        {selectedPopulation === undefined
          ? props.gnomadData.AF.toPrecision(2)
          : (
              props.gnomadData[`AF_${selectedPopulation}` as keyof GnomadRecord] as number
            ).toPrecision(2)}
      </span>
    </HtmlTooltip>
  );
};
