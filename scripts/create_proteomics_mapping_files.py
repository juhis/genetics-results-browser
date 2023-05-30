# gsutil ls gs://finngen-production-library-green/omics/proteomics/release_2023_03_02/data/Olink/pQTL/*.gz | \
# xargs -I{} basename {} .txt.gz | sed 's/Olink_Batch1_//' > fg_olink_probes

# gsutil ls gs://finngen-production-library-green/omics/proteomics/release_2023_03_02/data/Somascan/pQTL/*.gz | \
# xargs -I{} basename {} .txt.gz | sed 's/SomaScan_Batch2_//' > fg_soma_probes
# but this is not needed as all probes are already in the mapping file

# gsutil ls gs://zz-red/Omics/Proteomics/deCODE/pQTL/*.gz | \
# xargs -I{} basename {} .txt.gz | sed 's/deCODE_//' > decode_soma_probes
# this also is not needed because there are no probes in decode that would not be in fg

import pandas as pd
import numpy as np

chr_set = set(
    [
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        "11",
        "12",
        "13",
        "14",
        "15",
        "16",
        "17",
        "18",
        "19",
        "20",
        "21",
        "22",
        "X",
        "Y",
        "MT",
    ]
)

# SomaScan

a = pd.read_csv("Soma_info_all.csv")
a.to_csv("Soma_info_all.tsv", sep="\t", index=False, na_rep="NA")
a["EntrezGeneID"] = a["EntrezGeneID"].astype(str)

b = pd.read_csv("mart_export_entrez.tsv", sep="\t").rename(
    columns={"NCBI gene (formerly Entrezgene) ID": "EntrezGeneID"}
)
b = b[~np.isnan(b["EntrezGeneID"])]
b["EntrezGeneID"] = b["EntrezGeneID"].astype(int)
b["EntrezGeneID"] = b["EntrezGeneID"].astype(str)
a.merge(b, how="left", on="EntrezGeneID").astype(
    {"Gene start (bp)": "Int64", "Gene end (bp)": "Int64", "Strand": "Int64"}
).to_csv("Soma_info_all_ensembl.tsv", sep="\t", index=False, na_rep="NA")

# Olink

a = pd.read_csv("fg_olink_probes", names=["geneName"])

b = pd.read_csv("mart_export_gene_name.tsv", sep="\t").rename(
    columns={"Gene name": "geneName"}
)
b = b[b["Chromosome/scaffold name"].isin(chr_set)]
b["Gene start (bp)"] = b.groupby("geneName")["Gene start (bp)"].transform("min")
b["Gene end (bp)"] = b.groupby("geneName")["Gene end (bp)"].transform("max")
b.drop_duplicates("geneName", inplace=True)

a.merge(b, how="left", on="geneName").astype(
    {"Gene start (bp)": "Int64", "Gene end (bp)": "Int64", "Strand": "Int64"}
).to_csv("olink_probe_map_ensembl.tsv", sep="\t", index=False, na_rep="NA")
