#!/usr/bin/env bash

assoc_file="assoc_resources_finngen_version_20240115.tsv.gz"
par_file="`basename ${assoc_file} .tsv.gz`.chrX.par_anno.tsv.gz"

time tabix -h ${assoc_file} X: | awk '
BEGIN{FS=OFS="\t"} NR==1{print $0,"is_par"} NR>1{par=0; if(($6>=10001 && $6<=2781479) || ($6>=155701383 && $6<=156030895)) par=1; print $0,par}
' | bgzip -@4 > ${par_file}

zcat ${par_file} | awk '
BEGIN{FS=OFS="\t"} NR>1{if($12==1) par[$1]++; else nopar[$1]++} END{for(i in par) print "par",i,par[i]; for(i in nopar) print "nopar",i,nopar[i]}
' > ${par_file}.stats
