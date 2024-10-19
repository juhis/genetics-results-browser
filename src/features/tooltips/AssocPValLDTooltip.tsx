import { AssocResource, GroupedAssocRecord, Phenotype } from "../../types/types";
import { variantSort } from "../table/utils/sorting";
import { pValRepr } from "../table/utils/tableutil";
import { HtmlTooltip } from "./HtmlTooltip";

export const AssocPValLDTooltip = (props: {
  variant: string;
  phenos: Phenotype[];
  resource: AssocResource | null;
  content: JSX.Element;
  row: GroupedAssocRecord;
}) => {
  const n_ld_vars = props.row.ld.filter((x) => x).length;
  if (n_ld_vars === 0) {
    console.error("No LD variants found for this variant, shouldn't happen.");
  }
  let title;
  if (n_ld_vars === 1) {
    title = <div>This result is for a variant in LD with your input variant.</div>;
  } else {
    title = <div>These results are for variants in LD with your input variant.</div>;
  }
  const tables = props.row.ld.map((_, idx) => (
    <table key={idx} style={{ marginTop: "10px" }}>
      <tbody>
        <tr>
          <td>LD variant</td>
          <td>
            {props.row.lead_chr[idx]}-{props.row.lead_pos[idx]}-{props.row.lead_ref[idx]}-
            {props.row.lead_alt[idx]}
          </td>
        </tr>
        <tr>
          <td>distance</td>
          <td>{props.row.lead_pos[idx]! - Number(props.variant.split("-")[1])} bp</td>
        </tr>
        <tr>
          <td>study</td>
          <td>
            <a
              target="_blank"
              href={`https://genetics.opentargets.org/study/${props.row.phenocode[idx]}`}>
              {props.row.phenocode[idx]}
            </a>
          </td>
        </tr>
        <tr>
          <td>samples</td>
          <td>{props.phenos[idx].num_samples}</td>
        </tr>
        <tr>
          <td>publication</td>
          <td>
            {props.phenos[idx].pub_author} {props.phenos[idx].pub_date!.split("-")[0]}
          </td>
        </tr>
        <tr>
          <td>p-value</td>
          <td>{pValRepr(props.row.mlogp[idx])}</td>
        </tr>
        <tr>
          <td>beta</td>
          <td>{props.row.beta[idx] === 0 ? "N/A" : props.row.beta[idx].toPrecision(3)}</td>
        </tr>
      </tbody>
    </table>
  ));
  return (
    <HtmlTooltip
      title=<>
        {title}
        {tables}
      </>>
      {props.content}
    </HtmlTooltip>
  );
};
