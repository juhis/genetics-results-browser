#!/usr/bin/env python3

import timeit
import sqlite3
import argparse

INSERT_TEMPLATE = "INSERT INTO dataset VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"


def main():
    parser = argparse.ArgumentParser(
        description="Script for populating fine-mapping dataset/trait sqlite3 db from tab-delimited files."
    )
    parser.add_argument("db_name", help="sqlite3 db file to be created or overwritten")
    parser.add_argument(
        "--drop_table", help="drop existing db table", action="store_true"
    )
    args = parser.parse_args()
    populate_datasets(args)


def generate_entries_eqtl_cat(resource, filename):
    with open(filename, "r") as f:
        h = {h: i for i, h in enumerate(f.readline().strip().split("\t"))}
        for line in f:
            p = line.strip().split("\t")
            yield (
                (
                    resource,
                    "pQTL"
                    if p[h["quant_method"]].lower() == "aptamer"
                    else "sQTL"
                    if p[h["quant_method"]].lower() == "leafcutter"
                    else "eQTL",
                    p[h["dataset_id"]],
                    p[h["study_id"]],
                    p[h["study_label"]],
                    p[h["sample_group"]],
                    p[h["tissue_id"]],
                    p[h["tissue_label"]],
                    p[h["condition_label"]],
                    p[h["sample_size"]],
                    p[h["quant_method"]],
                )
            )


def populate_datasets(args):
    start_time = timeit.default_timer()
    conn = sqlite3.connect(args.db_name)
    c = conn.cursor()
    if args.drop_table:
        print("Dropping dataset table if it exists...")
        c.execute("DROP TABLE IF EXISTS dataset")
    c.execute(
        """
        CREATE TABLE IF NOT EXISTS dataset (
          resource TEXT NOT NULL,
          data_type TEXT NOT NULL CHECK( data_type IN ('GWAS','eQTL','pQTL','sQTL') ),
          dataset_id NOT NULL PRIMARY KEY,
          study_id TEXT,
          study_label TEXT NOT NULL,
          sample_group TEXT,
          tissue_id TEXT,
          tissue_label TEXT,
          condition_label TEXT,
          sample_size UNSIGNED INTEGER,
          quant_method TEXT
        )
        """
    )
    print("Populating dataset table...")
    print("eQTL Catalogue")
    c.executemany(
        INSERT_TEMPLATE,
        generate_entries_eqtl_cat(
            "eQTL_Catalogue_R6",
            "/mnt/disks/data/eqtl_catalogue_r6/dataset_metadata.tsv",
        ),
    )
    conn.commit()
    conn.close()
    print(str(timeit.default_timer() - start_time) + " seconds populating datasets")


if __name__ == "__main__":
    main()
