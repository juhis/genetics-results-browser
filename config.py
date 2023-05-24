import logging

log_level = logging.INFO

authentication = False
login = {"GOOGLE_LOGIN_CLIENT_ID": "XXX", "GOOGLE_LOGIN_CLIENT_SECRET": "YYY"}
group_auth = {
    "GROUPS": ["group@domain.org"],
    "SERVICE_ACCOUNT_FILE": "/path/to/service-account.json",
    "DOMAIN": "domain.org",
    "DELEGATED_ACCOUNT": "admin@domain.org",
}

metadata_db = "/mnt/disks/data/meta.db"

rsid_db = {
    "file": "/mnt/disks/data/gnomad/gnomad.genomes.v3.1.2.rsid.db",
}

gnomad = {
    "file": "/mnt/disks/data/gnomad/gnomad.genomes.v3.1.2.sites.all.vep95.gencode29.tsv.bgz",
    "populations": ["afr", "amr", "asj", "eas", "fin", "mid", "nfe", "oth", "sas"],
    "url": "https://gnomad.broadinstitute.org/variant/[VARIANT]?dataset=gnomad_r3",
    "version": "3.1.2",
}

assoc = {
    "file": "/mnt/disks/data/assoc_resources_public_20230522.tsv.gz",
    # not all resources in the data file need to be listed here
    # if a resource is not listed here, data for it won't be fetched and it will not be shown in the UI
    "resources": [
        {
            "resource": "FinnGen",
            "data_types": ["GWAS"],
            "pheno_urls": [
                {
                    "url": "https://r9.finngen.fi/pheno/[PHENOCODE]",
                    "label": "FinnGen Pheweb",
                },
                {
                    "url": "https://r9.risteys.finngen.fi/endpoints/[PHENOCODE]",
                    "label": "FinnGen Risteys",
                },
            ],
            "p_thres": 5e-3,
        },
        {
            "resource": "Open_Targets",
            "data_types": ["GWAS"],
            "pheno_urls": [
                {
                    "url": "https://genetics.opentargets.org/study/[PHENOCODE]",
                    "label": "Open Targets study",
                }
            ],
            "p_thres": 5e-3,
        },
        {
            "resource": "eQTL_Catalogue_R6",
            "data_types": ["eQTL", "pQTL", "sQTL"],
            "pheno_urls": [
                {
                    "url": "https://www.ebi.ac.uk/eqtl/Studies",
                    "label": "eQTL Catalogue studies",
                }
            ],
            "p_thres": 5e-3,
        },
        {
            "resource": "deCODE",
            "data_types": ["pQTL"],
            "pheno_urls": [
                {
                    "url": "https://doi.org/10.1038/s41588-021-00978-w",
                    "label": "Nat Genet 2021",
                }
            ],
            "p_thres": 5e-3,
        },
    ],
}

finemapped = {
    "file": "/mnt/disks/data/finemapped_resources_public_20230522.tsv.gz",
    "resources": [
        {"resource": "eQTL_Catalogue_R6", "data_types": ["eQTL", "pQTL", "sQTL"]},
        {"resource": "FinnGen", "data_types": ["GWAS"]},
        {"resource": "UKBB_119", "data_types": ["GWAS"]},
        {"resource": "BBJ_79", "data_types": ["GWAS"]},
    ],
}

max_query_variants = 2000
