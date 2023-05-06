#!/usr/bin/env python3

# adapted from https://github.com/FINNGEN/genotype_browser/blob/main/scripts/populate_sqlite.py

# ran with:
# ./populate_rsid_sqlite.py \
# /mnt/disks/data/gnomad/gnomad.genomes.v3.1.2.sites.all.vep95.gencode29.tsv.bgz \
# /mnt/disks/data/gnomad/gnomad.genomes.v3.1.2.rsid.db \
# --chr \#chr --pos pos --ref ref --alt alt --rs rsids

import gzip
import timeit
import sqlite3
import argparse


def main():
    parser = argparse.ArgumentParser(
        description="Script for populating rsid sqlite3 db from a tab-delimited file."
    )
    parser.add_argument(
        "input_file",
        help="variant annotation file with at least cpra columns and an rsid column",
    )
    parser.add_argument("db_name", help="sqlite3 db file to be created or overwritten")
    parser.add_argument(
        "--chr", help="chromosome column name in the input file", required=True
    )
    parser.add_argument(
        "--pos", help="position column name in the input file", required=True
    )
    parser.add_argument(
        "--ref", help="reference allele column name in the input file", required=True
    )
    parser.add_argument(
        "--alt", help="alternate allele column name in the input file", required=True
    )
    parser.add_argument(
        "--rs", help="rsid(s) column name in the input file", required=True
    )
    args = parser.parse_args()
    populate_rsids(args)


def generate_entries(args):
    """
    Generator for entries to be inserted into the sqlite3 db.
    Reads the input gzipped tsv file and yields a tuple for each row.
    Each tuple contains the chromosome, position, reference allele, alternate allele, and rsid.
    In case of multiple rsids (assumed comma-separated), each rsid is yielded separately.
    Removes possible chr prefix from the chromosome, and replaces 23, 24, 25, and 26 with X, Y, XY, and MT, respectively.
    """
    with gzip.open(args.input_file, "rt") as f:
        h = {h: i for i, h in enumerate(f.readline().strip().split("\t"))}
        for line in f:
            s = line.strip().split("\t")
            rsids = s[h[args.rs]].split(",")
            for rsid in rsids:
                if not rsids[0].startswith("rs"):
                    continue
                yield (
                    (
                        s[h[args.chr]]
                        .replace("chr", "")
                        .replace("23", "X")
                        .replace("24", "Y")
                        .replace("25", "XY")
                        .replace("26", "MT"),
                        int(s[h[args.pos]]),
                        s[h[args.ref]],
                        s[h[args.alt]],
                        rsid.strip(),
                    )
                )


def populate_rsids(args):
    """
    Creates and populates a sqlite3 table containing the chromosome, position, reference
    allele, alternate allele, and rsid for each variant in the input file.
    Indexes the rsid column.
    """
    start_time = timeit.default_timer()
    conn = sqlite3.connect(args.db_name)
    c = conn.cursor()
    c.execute("DROP TABLE IF EXISTS rsid")
    c.execute(
        "CREATE TABLE rsid (chr text, pos integer, ref text, alt text, rsid text)"
    )
    c.executemany(
        "INSERT INTO rsid VALUES (?, ?, ?, ?, ?)",
        generate_entries(args),
    )
    print(str(timeit.default_timer() - start_time) + " seconds populating rsids")
    start_time = timeit.default_timer()
    c.execute("CREATE INDEX rsid_idx ON rsid (rsid ASC)")
    print(
        str(timeit.default_timer() - start_time) + " seconds creating index for rsids"
    )
    conn.commit()
    conn.close()


if __name__ == "__main__":
    main()
