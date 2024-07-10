import { useState, useMemo, ReactElement } from "react";
import { Box, Typography, FormControlLabel, Switch, FormGroup } from "@mui/material";
import { MaterialReactTable } from "material-react-table";
import type { MRT_ColumnDef } from "material-react-table";

import { VariantRecord, GroupedFineMappedRecord, TableData, DataType } from "../../../types/types";
import { naInfSort } from "../utils/sorting";
import { getFineMappingTableColumns } from "./VariantFineMappedTable.columns";
import { UpDownIcons } from "../UpDownIcons";
import { useDataStore } from "../../../store/store";

const VariantFinemappedTable = (props: { data: VariantRecord }) => {
  const [toggled, setToggled] = useState(
    props.data.finemapped.resources.reduce((p, c) => {
      p[c] = true;
      return p;
    }, {} as Record<string, boolean>)
  );

  const pipThreshold = useDataStore((state) => state.pipThreshold);
  const clientData: TableData = useDataStore((state) => state.clientData)!;

  const columns = useMemo<MRT_ColumnDef<GroupedFineMappedRecord>[]>(
    () => getFineMappingTableColumns(clientData.phenos, clientData.datasets),
    [clientData]
  );

  const switches: ReactElement<"table"> = useMemo(() => {
    const gwasResources = clientData.meta.finemapped.resources
      .filter((resource) => resource.data_types.includes(DataType.GWAS))
      .map((resource) => resource.resource);
    const qtlResources = clientData.meta.finemapped.resources
      .filter((resource) => resource.data_types.some((data_type) => data_type.includes("QTL")))
      .map((resource) => resource.resource);
    const ctrls = [gwasResources, qtlResources].map((resources) =>
      resources.map((resource) => {
        return (
          <FormControlLabel
            key={resource}
            control={
              <Switch
                defaultChecked
                disabled={props.data.finemapped.counts.resource[resource].total === 0}
                onChange={() => {
                  handleSwitchChange(resource);
                }}
              />
            }
            label=<div>
              <span style={{ paddingRight: "8px" }}>{resource.replace(/_/g, " ")}</span>
              <UpDownIcons
                up={props.data.finemapped.counts.resource[resource].up}
                down={props.data.finemapped.counts.resource[resource].down}
              />
            </div>
          />
        );
      })
    );
    return (
      <table>
        <tbody>
          <tr>
            <td>
              <Typography sx={{ fontWeight: "bold" }}>GWAS</Typography>
            </td>
            <td>
              <div>{ctrls[0]}</div>
            </td>
          </tr>
          <tr>
            <td>
              <Typography sx={{ fontWeight: "bold" }}>QTL</Typography>
            </td>
            <td>
              <div>{ctrls[1]}</div>
            </td>
          </tr>
        </tbody>
      </table>
    );
  }, [props.data.finemapped.counts.resource, toggled]);

  const handleSwitchChange = (key: string) => {
    setToggled({
      ...toggled,
      [key]: !toggled[key],
    });
  };

  const filteredData = useMemo(() => {
    return props.data.finemapped.groupedData!.filter((d) => toggled[d.resource]);
  }, [props.data.finemapped.groupedData, toggled]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      <Typography sx={{ marginBottom: "10px", fontWeight: "bold" }}>
        Fine-mapping results
      </Typography>
      <Typography sx={{ marginBottom: "10px" }}>
        This table shows fine-mapping results for the selected variant.
        <br />
        The variant must be in a credible set of a trait{" "}
        {pipThreshold > 0
          ? `with PIP greater than the chosen threshold of
        ${pipThreshold}`
          : ""}{" "}
        for the trait to be included here.
      </Typography>
      <FormGroup sx={{ display: "flex", flexDirection: "row" }}>{switches}</FormGroup>
      <MaterialReactTable
        columns={columns}
        data={filteredData}
        enableTopToolbar={false}
        initialState={{
          showColumnFilters: true,
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
        sortingFns={{
          naInfSort,
        }}
      />
    </Box>
  );
};

export default VariantFinemappedTable;
