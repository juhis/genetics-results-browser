import { Link, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { GeneInfo } from "../../types/types";
import { HtmlTooltip } from "./HtmlTooltip";

const GeneTooltip = (props: { geneName: string; content: JSX.Element }) => {
  const [geneInfo, setGeneInfo] = useState(undefined as GeneInfo | undefined);

  useEffect(() => {
    fetch(`https://mygene.info/v3/query?q=symbol:${props.geneName}`)
      .then((result) => {
        return result.json();
      })
      .then((data) => {
        const geneId = data.hits[0]?._id;
        if (!geneId) {
          throw new Error(`gene symbol ${props.geneName} not found from mygene.info`);
        }
        return fetch(`https://mygene.info/v3/gene/${geneId}`);
      })
      .then((result) => {
        return result.json();
      })
      .then((data) => {
        setGeneInfo(data);
      })
      .catch((error) => {
        setGeneInfo({
          _id: "NA",
          symbol: "NA",
          name: "NA",
          summary: error.message,
        });
      });
  }, []);

  return geneInfo === undefined ? (
    <HtmlTooltip title="loading...">
      <div>{props.geneName}</div>
    </HtmlTooltip>
  ) : geneInfo._id == "NA" ? (
    <div>{geneInfo.summary}</div>
  ) : (
    <HtmlTooltip
      title={
        <div>
          <div style={{ fontWeight: "bold" }}>{geneInfo?.symbol}</div>
          <div>{geneInfo?.name}</div>
          <br />
          <div>{geneInfo?.summary}</div>
          <div>
            <Link href={`https://www.ncbi.nlm.nih.gov/gene/${geneInfo?._id}`}>NCBI</Link>
          </div>
        </div>
      }>
      {props.content}
    </HtmlTooltip>
  );
};
export default GeneTooltip;
