const ChangeLog = () => {
  return (
    <>
      <span>Feb 27th 2024:</span>
      <ul>
        <li>
          Updated UKBB pQTL association and fine-mapping results from 1,459 to 2,655 proteins
          (analysis by Zhili Zheng / FinnGen)
        </li>
        <li>
          Unassigned population is now called "remaining" and not "oth" (in gnomAD, "oth" was used
          until gnomAD 3 and "remaining" is used in gnomAD 4)
        </li>
      </ul>
      <span>Jan 21st 2024:</span>
      <ul>
        <li>Added FinnGen R12 + UKBB meta-analysis association results</li>
        <li>
          Show gnomAD exomes allele frequency only when exomes allele number is higher than genomes
          allele number
        </li>
        <li>Give a note when a variant is in gnomAD but has allele count zero</li>
        <li>Updated rsids to gnomAD 4.0</li>
        <li>Fixed population AF summary table</li>
      </ul>
      <span>Dec 19th 2023:</span>
      <ul>
        <li>
          Updated allele frequencies to gnomAD 4.0 - exome data is used instead of genome data when
          available
        </li>
        <li>Updated FinnGen EA5 priority variant list</li>
        <li>Fixed extra "gene symbol" text sometimes appearing in the gene column</li>
      </ul>
      <span>Nov 6th 2023:</span>
      <ul>
        <li>Added FinnGen snRNA-seq eQTL results from the first 3 batches</li>
        <li>Updated FinnGen Olink pQTL results from 2 batches to 3 batches</li>
        <li>Updated FinnGen GWAS results from R11 to R12</li>
        <li>Added last updated text to site header</li>
      </ul>
      <span>Sep 26th 2023:</span>
      <ul>
        <li>Release for FinnGen partners in the F2F meeting</li>
        <li>Added UKBB pQTL results</li>
        <li>Updates based on beta reviewer comments: </li>
        <li>Fixed and enriched exported data tables</li>
        <li>Added data type comparison table</li>
        <li>Added gene description tooltip and other small improvements</li>
      </ul>
      <span>Aug 19th 2023:</span>
      <ul>
        <li>Closed beta review</li>
      </ul>
    </>
  );
};

export default ChangeLog;
