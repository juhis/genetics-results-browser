import { Link, Typography } from "@mui/material";
import MaterialReactTable, { MRT_ColumnDef } from "material-react-table";
import { useConfigQuery } from "../../store/serverQuery";
import { useMemo, useState } from "react";

const About = () => {
  const { data } = useConfigQuery();
  const [datasets, setDatasets] = useState([]);

  useMemo(() => {
    if (data) {
      const dsets = {};
      data.assoc.resources.forEach((dataset: any) => {
        if (!(dataset.resource in dsets)) {
          //TODO typing
          //@ts-ignore
          dsets[dataset.resource] = dataset;
        }
        //@ts-ignore
        dsets[dataset.resource].assoc = true;
      });
      data.finemapped.resources.forEach((dataset: any) => {
        if (!(dataset.resource in dsets)) {
          //@ts-ignore
          dsets[dataset.resource] = dataset;
        }
        //@ts-ignore
        dsets[dataset.resource].finemapped = true;
      });
      setDatasets(Object.values(dsets));
    }
  }, [data]);

  const columns: MRT_ColumnDef[] = [
    {
      accessorFn: (row: any) => {
        return (
          <Link href={row.url} color="inherit" target="_blank">
            {row.resource.replace(/_/g, " ")}
          </Link>
        );
      },
      header: "resource",
      size: 65,
    },
    {
      accessorKey: "version",
      header: "version",
      size: 65,
    },
    {
      accessorFn: (row: any) => {
        return row.data_types.join(", ");
      },
      header: "data types",
      size: 65,
    },
    {
      accessorFn: (row: any) => {
        return row.assoc ? "yes" : "no";
      },
      header: "association results",
      size: 65,
    },
    {
      accessorFn: (row: any) => {
        return row.finemapped ? "yes" : "no";
      },
      header: "fine-mapping results",
      size: 65,
    },
    {
      accessorKey: "n_traits",
      header: "traits",
      size: 65,
    },
  ];

  return (
    <>
      <Typography>
        This variant annotation and interpretation tool came out of a need to interpret lists of
        genetic variants.
        <br />
        Suppose you've run a GWAS and have 100 hits. How many of them are novel?
        <br />
        What other disease or molecular traits do some of those variants affect and are the effect
        directions consistent?
        <br />
        Are your variants likely to be causal based on fine-mapping and variant consequence?
        <br />
        This tool helps you answer these kinds of questions while also allowing for deep dives to
        the effects of individual variants.
      </Typography>
      <Typography>
        <br />
        The tool was devised by Juha Karjalainen and Mark Daly with significant input from Mary Pat
        Reeve and Masahiro Kanai.
      </Typography>
      <Typography>
        <br />
        source code in{" "}
        <Link target="_blank" href="https://github.com/juhis/genetics-results-browser">
          GitHub
        </Link>
      </Typography>
      <Typography variant="h6" sx={{ marginTop: "20px" }}>
        Currently included datasets
      </Typography>
      <MaterialReactTable
        columns={columns}
        data={datasets}
        enableTopToolbar={false}
        enableColumnFilters={false}
        initialState={{
          density: "compact",
        }}
        muiTableProps={{
          sx: {
            tableLayout: "fixed",
          },
        }}
        muiTableBodyCellProps={{
          sx: {
            fontSize: "0.75rem",
          },
        }}
        muiTableBodyProps={{
          sx: {
            "& tr:nth-of-type(even)": {
              backgroundColor: "#333333",
            },
          },
        }}
      />
      <Typography>
        FinnGen results from Open Targets are not shown in this tool - more recent FinnGen results
        are shown instead
      </Typography>
    </>
  );
};

export default About;
