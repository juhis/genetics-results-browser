import { Link, Typography, useTheme } from "@mui/material";
import { useDataStore } from "../../store/store";
import { GnomadRecord, GnomadVariantRecord } from "../../types/types";
import { HtmlTooltip } from "./HtmlTooltip";
import { ChartOptions, Plugin, TooltipItem } from "chart.js";
import { Bar } from "react-chartjs-2";
import { Chart, CategoryScale, LinearScale, BarElement, Tooltip } from "chart.js";

Chart.register(CategoryScale, LinearScale, BarElement, Tooltip);

export const VariantGnomadToolTip = (props: { variant: string; gnomadData: GnomadRecord }) => {
  const theme = useTheme();

  const gnomadVersion = useDataStore((state) => state.clientData!.meta.gnomad.version);
  const gnomadUrl = useDataStore((state) => state.clientData!.meta.gnomad.url);
  const selectedPopulation = useDataStore((state) => state.selectedPopulation);
  const gnomadData = props.gnomadData[
    props.gnomadData.preferred as keyof GnomadRecord
  ]! as GnomadVariantRecord;
  const maxLogFreq = 5;

  const af_pops = Object.keys(gnomadData).filter((k) => k.startsWith("AF_"));
  const labels = af_pops.map((pop) => pop.replace("AF_", ""));
  // take log and then reverse the scale with 1e-maxLogFreq as minimum frequency
  const dataValues = af_pops.map(
    (pop) =>
      maxLogFreq +
      Math.max(-maxLogFreq, Math.log10(gnomadData[pop as keyof GnomadVariantRecord] as number))
  );
  const textValues = af_pops.map((pop) =>
    gnomadData[pop as keyof GnomadVariantRecord] == null
      ? "NA"
      : gnomadData[pop as keyof GnomadVariantRecord] == 0
      ? "0"
      : (gnomadData[pop as keyof GnomadVariantRecord]! as number) < 0.01
      ? (gnomadData[pop as keyof GnomadVariantRecord] as number).toExponential(1)
      : (gnomadData[pop as keyof GnomadVariantRecord] as number).toPrecision(2)
  );

  const data = {
    labels,
    datasets: [
      {
        label: `gnomAD ${gnomadVersion} ${props.gnomadData.preferred} allele frequency`,
        data: dataValues,
        backgroundColor: theme.palette.primary.main,
        categoryPercentage: 0.95,
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          callback: (_, index) => (index === maxLogFreq ? "" : `1e-${maxLogFreq - index}`),
        },
        grid: {
          drawOnChartArea: true,
          color: (context) => {
            if (context.tick && context.index === maxLogFreq) {
              return "rgba(0, 0, 0, 0)";
            }
            return "#E0E0E0";
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context: TooltipItem<"bar">) => {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            label += `${context.label} AF ${textValues[context.dataIndex]}`;
            return label;
          },
        },
      },
    },
    animation: false,
  };

  const plugins: Plugin<"bar">[] = [
    {
      id: "dataLabelsOnTop",
      afterDraw: (chart: Chart) => {
        const ctx = chart.ctx;
        chart.data.datasets.forEach((_, i) => {
          const meta = chart.getDatasetMeta(i);
          if (!meta.hidden) {
            meta.data.forEach((element, index) => {
              ctx.fillStyle = "rgb(255, 255, 255)";
              ctx.textAlign = "center";
              ctx.textBaseline = "bottom";
              const dataString = textValues[index] == "0" ? "" : textValues[index];
              ctx.fillText(dataString, element.x, element.y + 15);
            });
          }
        });
      },
    },
  ];

  const filterDisplay =
    gnomadData.filters != null ? (
      <>
        <span style={{ color: theme.palette.error.main }}>
          This variant hasn't passed gnomAD QC.{" "}
          {gnomadData.filters.indexOf("AC0") > -1
            ? "No sample had a high quality genotype at this variant site."
            : "Allele frequencies may not be reliable."}
          <br />
          gnomAD QC filter{gnomadData.filters.split(",").length > 1 ? "s" : ""}:{" "}
          {gnomadData.filters.split(",").join(", ")}
        </span>
        <br />
      </>
    ) : (
      <></>
    );
  const popmaxAfDispl =
    gnomadData.popmax.af < 0.001
      ? gnomadData.popmax.af.toExponential(1)
      : gnomadData.popmax.af.toPrecision(2);
  const popminAfDispl =
    gnomadData.popmin.af < 0.001
      ? gnomadData.popmin.af.toExponential(1)
      : gnomadData.popmin.af.toPrecision(2);
  const popsNotAvailable = af_pops
    .filter((pop) => gnomadData[pop as keyof GnomadVariantRecord] == null)
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
    gnomadData.popmax.af === 0 ? (
      <></>
    ) : (
      <span>
        AF ranges between populations from{" "}
        {gnomadData.popmin.af == 0
          ? "0 to " + gnomadData.popmax.pop.replace("AF_", "") + " " + popmaxAfDispl
          : gnomadData.popmin.pop.replace("AF_", "") +
            " " +
            popminAfDispl +
            " to " +
            gnomadData.popmax.pop.replace("AF_", "") +
            " " +
            popmaxAfDispl}
      </span>
    );

  return (
    <HtmlTooltip
      title={
        <div style={{ display: "flex", flexDirection: "column", width: "500px" }}>
          <Typography variant="h6" sx={{ paddingBottom: "10px" }}>
            gnomAD {gnomadVersion} {props.gnomadData.preferred} allele frequency
          </Typography>
          {filterDisplay}
          {afRangeDispl}
          {popsNotAvailableDispl}
          <Bar data={data} options={options} plugins={plugins} />
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
          color: gnomadData.filters ? theme.palette.error.main : "inherit",
        }}>
        {selectedPopulation === undefined
          ? gnomadData.AF.toPrecision(2)
          : (
              gnomadData[`AF_${selectedPopulation}` as keyof GnomadVariantRecord] as number
            ).toPrecision(2)}
      </span>
    </HtmlTooltip>
  );
};
