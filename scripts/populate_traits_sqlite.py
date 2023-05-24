#!/usr/bin/env python3

# adapted from https://github.com/FINNGEN/genotype_browser/blob/main/scripts/populate_sqlite.py

import gzip
import json
import timeit
import sqlite3
import argparse

# TODO pub_date should be a date, not a string
CREATE_STMT = """
CREATE TABLE IF NOT EXISTS trait (
    resource TEXT NOT NULL,
    data_type TEXT NOT NULL CHECK( data_type IN ('GWAS','eQTL','pQTL','sQTL') ),
    trait_type TEXT NOT NULL CHECK( trait_type IN ('continuous','case-control')),
    phenocode TEXT NOT NULL,
    phenostring TEXT NOT NULL,
    category TEXT,
    chromosome TEXT,
    gene_start UNSIGNED INTEGER,
    gene_end UNSIGNED INTEGER,
    strand SMALLINT,
    num_samples UNSIGNED INTEGER,
    num_cases UNSIGNED INTEGER,
    num_controls UNSIGNED INTEGER,
    pub_author TEXT,
    pub_date TEXT,
    PRIMARY KEY (resource, phenocode)
)
"""

INSERT_TEMPLATE = (
    "INSERT INTO trait VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
)


def main():
    parser = argparse.ArgumentParser(
        description="Script for populating fine-mapping dataset/trait sqlite3 db from tab-delimited files."
    )
    parser.add_argument("db_name", help="sqlite3 db file to be created or overwritten")
    parser.add_argument(
        "--drop_table", help="drop existing db table", action="store_true"
    )
    args = parser.parse_args()
    populate_traits(args)


def generate_entries_eqtl_cat(resource, filename, data_type):
    """
    Generator for eQTL Catalogue entries to be inserted into the sqlite3 db.
    Reads the input gzipped tsv eQTL Catalogue metadata file and yields a tuple for each row.
    """
    with gzip.open(filename, "rt") as f:
        h = {h: i for i, h in enumerate(f.readline().strip().split("\t"))}
        for line in f:
            s = line.strip().split("\t")
            yield (
                (
                    resource,
                    data_type,
                    "continuous",
                    s[h["phenotype_id"]],
                    s[h["gene_name"]],
                    None,
                    s[h["chromosome"]],
                    s[h["gene_start"]],
                    s[h["gene_end"]],
                    s[h["strand"]],
                    None,
                    None,
                    None,
                    None,
                    None,
                )
            )


def generate_entries_eqtl_cat_with_dataset(
    resource, dataset, filename_template, data_type
):
    with gzip.open(filename_template.replace("[STUDY]", dataset), "rt") as f:
        h = {h: i for i, h in enumerate(f.readline().strip().split("\t"))}
        for line in f:
            s = line.strip().split("\t")
            yield (
                (
                    resource,
                    data_type,
                    "continuous",
                    dataset + ":" + s[h["phenotype_id"]],
                    s[h["gene_name"]],
                    None,
                    s[h["chromosome"]],
                    s[h["gene_start"]],
                    s[h["gene_end"]],
                    s[h["strand"]],
                    None,
                    None,
                    None,
                    None,
                    None,
                )
            )


def generate_entries_ukbb_bbj(filename):
    with open(filename, "rt") as f:
        h = {h: i for i, h in enumerate(f.readline().strip().split("\t"))}
        for line in f:
            s = line.strip().split("\t")
            yield (
                (
                    s[h["cohort"]],
                    "GWAS",
                    "continuous" if s[h["n_cases"]] == "NA" else "case-control",
                    s[h["trait"]],
                    s[h["description"]],
                    None,
                    None,
                    None,
                    None,
                    None,
                    int(s[h["n_samples"]]),
                    int(s[h["n_cases"]]) if s[h["n_cases"]] != "NA" else None,
                    int(s[h["n_controls"]]) if s[h["n_controls"]] != "NA" else None,
                    "Kanai",
                    "2021-09-05",
                )
            )


def generate_entries_opentargets(resource, filename):
    with open(filename, "r") as f:
        ot_phenos = json.load(f)
    for p in ot_phenos.values():
        yield (
            (
                resource,
                "GWAS",
                "continuous" if p["n_cases"] == "None" else "case-control",
                p["study_id"],
                p["trait_reported"],
                p["trait_category"],
                None,
                None,
                None,
                None,
                int(p["n_initial"]),
                int(p["n_cases"]) if p["n_cases"] != "None" else None,
                int(p["n_initial"]) - int(p["n_cases"])
                if p["n_cases"] != "None"
                else None,
                p["pub_author"],
                p["pub_date"],
            )
        )


def generate_entries_finngen(resource, filename, date):
    with open(filename, "r") as f:
        phenos = json.load(f)
    for p in phenos:
        yield (
            (
                resource,
                "GWAS",
                "continuous" if p["num_controls"] == 0 else "case-control",
                p["phenocode"],
                p["phenostring"],
                p["category"],
                None,
                None,
                None,
                None,
                p["num_cases"]
                if p["num_controls"] == 0
                else p["num_cases"] + p["num_controls"],
                None if p["num_controls"] == 0 else p["num_cases"],
                None if p["num_controls"] == 0 else p["num_controls"],
                "FinnGen",
                date,
            )
        )


# TODO deCODE gene strand, start, end
def generate_entries_decode_pqtl(
    resource, filename_probemap, filename_probelist, num_samples, date
):
    with open(filename_probemap, "r") as f:
        h = {h: i for i, h in enumerate(f.readline().strip().split("\t"))}
        probe2gene = {
            line.strip()
            .split("\t")[h["AptName"]]: line.strip()
            .split("\t")[h["geneName"]]
            for line in f
        }
    with open(filename_probelist, "r") as f:
        for line in f:
            p = line.strip().split("\t")
            # for missing gene names keep probe name
            phenostring = probe2gene[p[0]] if p[0] in probe2gene else p[0]
            yield (
                (
                    resource,
                    "pQTL",
                    "continuous",
                    p[0],
                    phenostring,
                    None,
                    None,
                    None,
                    None,
                    None,
                    num_samples,
                    None,
                    None,
                    "deCODE genetics",
                    date,
                )
            )


def populate_traits(args):
    start_time = timeit.default_timer()
    conn = sqlite3.connect(args.db_name)
    c = conn.cursor()
    if args.drop_table:
        print("Dropping trait table if it exists...")
        c.execute("DROP TABLE IF EXISTS trait")
        print(str(timeit.default_timer() - start_time) + " seconds dropping table")
        start_time = timeit.default_timer()
    c.execute(CREATE_STMT)
    print("Populating trait table...")
    print("eQTL Catalogue")
    for file in [
        (
            "/mnt/disks/data/eqtl_catalogue_r6/metadata/Affy_Human_Gene_1_0_ST_Ensembl_96_phenotype_metadata.tsv.gz",
            "eQTL",
        ),
        (
            "/mnt/disks/data/eqtl_catalogue_r6/metadata/HumanHT-12_V4_Ensembl_96_phenotype_metadata.tsv.gz",
            "eQTL",
        ),
        (
            "/mnt/disks/data/eqtl_catalogue_r6/metadata/SomaLogic_Ensembl_96_phenotype_metadata.tsv.gz",
            "pQTL",
        ),
        (
            "/mnt/disks/data/eqtl_catalogue_r6/metadata/exon_counts_Ensembl_105_phenotype_metadata.tsv.gz",
            "eQTL",
        ),
        (
            "/mnt/disks/data/eqtl_catalogue_r6/metadata/gene_counts_Ensembl_105_phenotype_metadata.tsv.gz",
            "eQTL",
        ),
        (
            "/mnt/disks/data/eqtl_catalogue_r6/metadata/transcript_usage_Ensembl_105_phenotype_metadata.tsv.gz",
            "eQTL",
        ),
        (
            "/mnt/disks/data/eqtl_catalogue_r6/metadata/txrevise_Ensembl_105_phenotype_metadata.tsv.gz",
            "eQTL",
        ),
    ]:
        c.executemany(
            INSERT_TEMPLATE,
            generate_entries_eqtl_cat("eQTL_Catalogue_R6", file[0], file[1]),
        )
    print("eQTL Catalogue - Leafcutter")
    for line in open(
        "/mnt/disks/data/eqtl_catalogue_r6/leafcutter_studies", "rt"
    ).readlines():
        c.executemany(
            INSERT_TEMPLATE,
            generate_entries_eqtl_cat_with_dataset(
                "eQTL_Catalogue_R6",
                line.strip(),
                "/mnt/disks/data/eqtl_catalogue_r6/metadata/leafcutter_[STUDY]_Ensembl_105_phenotype_metadata.tsv.gz",
                "sQTL",
            ),
        )

    print("Open Targets")
    c.executemany(
        INSERT_TEMPLATE,
        generate_entries_opentargets(
            "Open_Targets",
            "/mnt/disks/data/opentargets/ot_studies_no_finngen_22.09.json",
        ),
    )

    print("FinnGen")
    c.executemany(
        INSERT_TEMPLATE,
        generate_entries_finngen(
            "FinnGen", "/mnt/disks/data/finngen-r9-pheno-list.json", "2022-04-04"
        ),
    )

    print("UK Biobank / BBJ")
    c.executemany(
        INSERT_TEMPLATE,
        generate_entries_ukbb_bbj("/mnt/disks/data/ukb_bbj_traits.tsv"),
    )

    print("deCODE")
    c.executemany(
        INSERT_TEMPLATE,
        generate_entries_decode_pqtl(
            "deCODE",
            "/mnt/disks/data/SomaScan_probe_map.tsv",
            "/mnt/disks/data/decode_probes",
            35559,
            "2021-12-02",
        ),
    )
    conn.commit()
    conn.close()
    print(str(timeit.default_timer() - start_time) + " seconds populating traits")


if __name__ == "__main__":
    main()
