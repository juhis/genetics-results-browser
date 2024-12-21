#!/usr/bin/env bash

zcat $1 | awk '
BEGIN {
    FS=OFS="\t";
}
NR==1 {
    for(i=1;i<=NF;i++) h[$i]=i;
}
NR>1 && $h["gene_most_severe"] != "NA" {
    if(!($h["gene_most_severe"] in mini) || (mini[$h["gene_most_severe"]] > $h["pos"])) {
        chr[$h["gene_most_severe"]]=$h["#chr"];
        mini[$h["gene_most_severe"]]=$h["pos"];
    }
    if(!($h["gene_most_severe"] in maxi) || (maxi[$h["gene_most_severe"]] < $h["pos"])) {
        maxi[$h["gene_most_severe"]]=$h["pos"];
    }
}
END {
    for (gene in chr) print gene,chr[gene],mini[gene],maxi[gene];
}' | sort -k2,2V -k3,3g -k4,4g
