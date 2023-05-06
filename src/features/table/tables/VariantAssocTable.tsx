import { ReactElement, useMemo, useState } from "react";
import { Box, Typography, FormControlLabel, Switch, FormGroup } from "@mui/material";
import MaterialReactTable from "material-react-table";
import type { MRT_ColumnDef } from "material-react-table";
import { VariantRecord, TableData, GroupedAssocRecord, DataType } from "../../../types/types";
import { naInfSort } from "../utils/sorting";
import { getAssociationTableColumns } from "./VariantAssocTable.columns";
import { UpDownIcons } from "../UpDownIcons";
import { useDataStore } from "../../../store/store";

const VariantAssocTable = (props: { variantData: VariantRecord }) => {
  const clientData: TableData = useDataStore((state) => state.clientData)!;
  const [toggled, setToggled] = useState(
    clientData.meta.assoc.resources
      .map((r) => r.resource)
      .reduce((p, c) => {
        p[c] = true;
        return p;
      }, {} as Record<string, boolean>)
  );

  const columns = useMemo<MRT_ColumnDef<GroupedAssocRecord>[]>(
    () => getAssociationTableColumns(clientData.phenos, clientData.datasets, clientData.meta),
    [clientData]
  );

  const switches: ReactElement<"table"> = useMemo(() => {
    const gwasResources = clientData.meta.assoc.resources
      .filter((resource) => resource.data_types.includes(DataType.GWAS))
      .map((resource) => resource.resource);
    const qtlResources = clientData.meta.assoc.resources
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
                disabled={props.variantData.assoc.counts.resource[resource].total === 0}
                onChange={() => {
                  handleSwitchChange(resource);
                }}
              />
            }
            label=<div>
              <span style={{ paddingRight: "8px" }}>{resource.replace(/_/g, " ")}</span>
              <UpDownIcons
                up={props.variantData.assoc.counts.resource[resource].up}
                down={props.variantData.assoc.counts.resource[resource].down}
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
  }, [props.variantData.assoc.counts.resource, toggled]);

  const handleSwitchChange = (key: string) => {
    setToggled({
      ...toggled,
      [key]: !toggled[key],
    });
  };

  console.log(props.variantData.assoc.groupedData);
  console.log(toggled);

  const filteredData = useMemo(() => {
    return props.variantData.assoc.groupedData!.filter(
      (d) => toggled[d.resource] && !clientData.phenos[d.resource + ":" + d.phenocode[0]].is_na
    );
  }, [props.variantData.assoc.groupedData, toggled]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      <Typography sx={{ marginBottom: "10px", fontWeight: "bold" }}>Association results</Typography>
      <FormGroup sx={{ display: "flex", flexDirection: "row" }}>{switches} </FormGroup>
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

export default VariantAssocTable;
