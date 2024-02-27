# adapted from
# https://github.com/FINNGEN/commons/blob/master/variant_annotation/scripts/hail_functions.py

# get population AFs and VEP consequences and genes from gnomAD (can re-vep also - as of gnomad 3 newer gencode versions contained more noncoding genes that can overshadow good coding annotations)
# running gencode v29 (vep 95) gave more coding genes than v35 (vep 101)
# https://gnomad.broadinstitute.org/help/vep
# could also use a new gencode version but filtering its transcripts to coding
# for gnomad 4.0 no re-vep was done

# after running for both genomes and exomes, merged the files (requires a lot of disk space for sorting - TODO better output sorted by chr pos alleles in this script):
# cat
# <(zcat gnomad.exomes.v4.0.sites.tsv.bgz | head -1 | awk '{print $0"\tgenome_or_exome"}') \
# <(sort -m -T . -k1,1V -k2,2g -k3,3 -k4,4 \
# <(zcat gnomad.exomes.v4.0.sites.tsv.bgz | awk 'NR>1 {print $0"\te"}' | sort -T . -k1,1V -k2,2g -k3,3 -k4,4) \
# <(zcat gnomad.genomes.v4.0.sites.tsv.bgz | awk 'NR>1 {print $0"\tg"}' | sort -T . -k1,1V -k2,2g -k3,3 -k4,4) \
# ) | bgzip -@4 > gnomad.genomes.exomes.v4.0.sites.tsv.bgz && \
# tabix -s 1 -b 2 -e 2 gnomad.genomes.exomes.v4.0.sites.tsv.bgz

# to start a cluster:
# (only use a high number of workers if sure that this works)
# hailctl dataproc start gnomad --region europe-west1 --zone europe-west1-b --num-workers 10 --max-idle 30m --subnet projects/finngen-refinery-dev/regions/europe-west1/subnetworks/default
#
# to run the job:
# hailctl dataproc submit gnomad --region europe-west1 gnomad_tsv.py --overwrite
#
# to stop the cluster:
# (don't rely on the automatic idle shutdown)
# hailctl dataproc stop gnomad --region europe-west1

import hail as hl

DATA_TYPE = "genomes"


def filter_table(table):
    # MUC5B:
    # return table.filter(
    #    (table.locus == hl.Locus.parse("chr11:1219991", "GRCh38"))
    #    & (table.alleles[1] == "T")
    # )
    # chr21:
    # return table.filter(table.locus.contig == "chr21")
    # passing:
    # return table.filter(hl.len(table.filters) == 0)
    # non-passing:
    # return table.filter(hl.len(table.filters) > 0)
    return table


def annotate_table(table):
    canon_pc = table.vep.transcript_consequences.filter(
        lambda x: (x.canonical == 1)
        & (x.biotype == "protein_coding")
        & (x.gene_symbol_source != "Clone_based_ensembl_gene")
        & (x.consequence_terms.contains(table.vep.most_severe_consequence))
    )

    most_severe = table.vep.transcript_consequences.filter(
        lambda x: (x.biotype == "protein_coding")
        & (x.gene_symbol_source != "Clone_based_ensembl_gene")
        & (x.consequence_terms.contains(table.vep.most_severe_consequence))
    )

    most_severe_others = table.vep.transcript_consequences.filter(
        lambda x: (x.consequence_terms.contains(table.vep.most_severe_consequence))
    )

    return table.annotate(
        chr=table.locus.contig.replace("^chr", ""),
        pos=hl.int32(table.locus.position),
        ref=table.alleles[0],
        alt=table.alleles[1],
        rsids=hl.str(",").join(table.rsid),
        filters=hl.str(",").join(table.filters),
        AN=table.freq[table.freq_index_dict["adj"]].AN,
        AF=table.freq[table.freq_index_dict["adj"]].AF,
        AF_afr=table.freq[table.freq_index_dict["afr_adj"]].AF,
        AF_amr=table.freq[table.freq_index_dict["amr_adj"]].AF,
        AF_asj=table.freq[table.freq_index_dict["asj_adj"]].AF,
        AF_eas=table.freq[table.freq_index_dict["eas_adj"]].AF,
        AF_fin=table.freq[table.freq_index_dict["fin_adj"]].AF,
        AF_mid=table.freq[table.freq_index_dict["mid_adj"]].AF,
        AF_nfe=table.freq[table.freq_index_dict["nfe_adj"]].AF,
        AF_remaining=table.freq[table.freq_index_dict["remaining_adj"]].AF,
        AF_sas=table.freq[table.freq_index_dict["sas_adj"]].AF,
        consequences=hl.array(
            hl.set(
                table.vep.transcript_consequences.map(
                    lambda x: hl.struct(
                        gene_symbol=x.gene_symbol,
                        gene_id=x.gene_id,
                        consequences=x.consequence_terms,
                        gene_symbol_source=x.gene_symbol_source,
                        canonical=x.canonical,
                        biotype=x.biotype,
                    )
                )
            )
        ),
        most_severe=table.vep.most_severe_consequence,
        gene_most_severe=hl.if_else(
            hl.any(
                lambda x: (x.canonical == 1)
                & (x.biotype == "protein_coding")
                & (x.gene_symbol_source != "Clone_based_ensembl_gene")
                & (x.consequence_terms.contains(table.vep.most_severe_consequence)),
                table.vep.transcript_consequences,
            ),
            canon_pc.first().gene_symbol,
            hl.if_else(
                hl.any(
                    lambda x: (x.biotype == "protein_coding")
                    & (x.gene_symbol_source != "Clone_based_ensembl_gene")
                    & (x.consequence_terms.contains(table.vep.most_severe_consequence)),
                    table.vep.transcript_consequences,
                ),
                most_severe.first().gene_symbol,
                most_severe_others.first().gene_symbol,
                missing_false=True,
            ),
            missing_false=True,
        ),
    )


def export(table, outfile):
    table.select(
        "rsids",
        "filters",
        "AN",
        "AF",
        "AF_afr",
        "AF_amr",
        "AF_asj",
        "AF_eas",
        "AF_fin",
        "AF_mid",
        "AF_nfe",
        "AF_remaining",
        "AF_sas",
        "most_severe",
        "gene_most_severe",
        "consequences",
    ).export(outfile)


table = hl.read_table(
    f"gs://gcp-public-data--gnomad/release/4.0/ht/{DATA_TYPE}/gnomad.{DATA_TYPE}.v4.0.sites.ht"
)

table = filter_table(table)
# rerun VEP
# table = hl.vep(table, "gs://hail-eu-vep/vep95-GRCh38-loftee-gcloud.json")
table = (
    annotate_table(table).rename({"chr": "#chr"}).key_by("#chr", "pos", "ref", "alt")
)
export(
    table,
    f"gs://gnomad2/{DATA_TYPE}_4.0/gnomad.{DATA_TYPE}.v4.0.sites.v2.tsv.bgz",
)
