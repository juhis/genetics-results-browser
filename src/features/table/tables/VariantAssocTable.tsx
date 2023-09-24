import { ReactElement, useMemo, useState } from "react";
import { Box, Typography, FormControlLabel, Switch, FormGroup } from "@mui/material";
import MaterialReactTable from "material-react-table";
import type { MRT_ColumnDef } from "material-react-table";
import { VariantRecord, TableData, GroupedAssocRecord, DataType } from "../../../types/types";
import { naInfSort } from "../utils/sorting";
import { getAssociationTableColumns } from "./VariantAssocTable.columns";
import { UpDownIcons } from "../UpDownIcons";
import { useDataStore } from "../../../store/store";
import { renderPThreshold } from "../utils/tableutil";

const VariantAssocTable = (props: { variantData: VariantRecord }) => {
  const clientData: TableData = useDataStore((state) => state.clientData)!;
  const pThreshold = useDataStore((state) => state.pThreshold);
  const [toggled, setToggled] = useState(
    clientData.meta.assoc.resources
      .map((r) => r.resource)
      .reduce((p, c) => {
        p[c] = true;
        return p;
      }, {} as Record<string, boolean>)
  );
  const cisWindow: number = useDataStore((state) => state.cisWindow);

  const columns = useMemo<MRT_ColumnDef<GroupedAssocRecord>[]>(
    () =>
      getAssociationTableColumns(
        props.variantData.variant,
        cisWindow,
        clientData.phenos,
        clientData.datasets,
        clientData.meta
      ),
    [clientData, props.variantData.variant]
  );

  const switches: ReactElement<"table"> = useMemo(() => {
    const gwasResources = clientData.meta.assoc.resources
      .filter((resource) => resource.data_types.includes(DataType.GWAS))
      .map((resource) => resource.resource);
    // show first pQTL resources and then other QTL resources
    const qtlResources = clientData.meta.assoc.resources
      .filter((resource) => resource.data_types.some((data_type) => data_type.includes("QTL")))
      .sort((a, b) => {
        if (a.data_types.length == 1 && a.data_types[0].includes("pQTL")) {
          return -1;
        } else if (
          a.data_types.some((data_type) => data_type.includes("pQTL")) &&
          !b.data_types.some((data_type) => data_type.includes("pQTL"))
        ) {
          return -1;
        } else if (b.data_types.length == 1 && b.data_types[0].includes("pQTL")) {
          return 1;
        } else if (
          b.data_types.some((data_type) => data_type.includes("pQTL")) &&
          !a.data_types.some((data_type) => data_type.includes("pQTL"))
        ) {
          return 1;
        } else {
          return 0;
        }
      })
      .map((resource) => resource.resource);
    const ctrls = [gwasResources, qtlResources].map((resources) =>
      resources.map((resource, i) => {
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
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)" }}>
                {ctrls[0]}
              </div>
            </td>
          </tr>
          <tr>
            <td>
              <Typography sx={{ fontWeight: "bold" }}>QTL</Typography>
            </td>
            <td>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)" }}>
                {ctrls[1]}
              </div>
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

  const filteredData = useMemo(() => {
    return props.variantData.assoc.groupedData!.filter(
      (d) => toggled[d.resource] && !clientData.phenos[d.resource + ":" + d.phenocode[0]].is_na
    );
  }, [props.variantData.assoc.groupedData, toggled]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      <Typography sx={{ marginBottom: "10px", fontWeight: "bold" }}>Association results</Typography>
      <Typography sx={{ marginBottom: "10px" }}>
        This table shows association results for the selected variant.
        <br />
        Associations with p-value less than {renderPThreshold(clientData, pThreshold)} are shown.
      </Typography>
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
