import logging

log_level = logging.INFO

authentication = True
authentication_file = "/mnt/disks/data/finngen_auth_prod.json"

metadata_db = "/mnt/disks/data/meta_finngen_version_20240709.db"

rsid_db = {
    "file": "/mnt/disks/data/gnomad/gnomad.genomes.exomes.v4.0.rsid.db",
}

gnomad = {
    "file": "/mnt/disks/data/gnomad/gnomad.genomes.exomes.v4.0.sites.v2.tsv.bgz",
    "populations": ["afr", "amr", "asj", "eas", "fin", "mid", "nfe", "oth", "sas"],
    "url": "https://gnomad.broadinstitute.org/variant/[VARIANT]?dataset=gnomad_r4",
    "version": "4.0",
}

ld_assoc = {
    "file": "/mnt/disks/data/ot_v2d_no_finngen_22.09_with_studycols.tsv.gz",
    "resources": [
        {
            "resource": "Open_Targets",
            "version": "October 2022",
            "data_types": ["GWAS"],
        }
    ]
}

assoc = {
    "file": "/mnt/disks/data/assoc_resources_finngen_version_20240709.tsv.gz",
    # not all resources in the data file need to be listed here
    # if a resource is not listed here, data for it will not be shown in the UI
    "resources": [
        {
            "resource": "FinnGen_UKBB_meta",
            "version": "R12",
            "data_types": ["GWAS"],
            "n_traits": "873",
            "url": "https://www.finngen.fi/en/for_researchers",
            "pheno_urls": [
                {
                    "url": "https://metaresults-ukbb.finngen.fi/pheno/[PHENOCODE]",
                    "label": "FinnGen/UKBB meta Pheweb",
                },
                {
                    "url": "https://r12.risteys.finregistry.fi/endpoints/[PHENOCODE]",
                    "label": "FinnGen Risteys",
                },
            ],
            "p_thres": 5e-3,
        },
        {
            "resource": "FinnGen",
            "version": "R12",
            "data_types": ["GWAS"],
            "n_traits": "2,469",
            "url": "https://finngen.gitbook.io/documentation/methods/phewas",
            "pheno_urls": [
                {
                    "url": "https://r12.finngen.fi/pheno/[PHENOCODE]",
                    "label": "FinnGen Pheweb",
                },
                {
                    "url": "https://r12.risteys.finregistry.fi/endpoints/[PHENOCODE]",
                    "label": "FinnGen Risteys",
                },
            ],
            "p_thres": 5e-3,
        },
        {
            "resource": "FinnGen_pQTL",
            "version": "SomaScan 2023-03-02, Olink 2023-10-11",
            "data_types": ["pQTL"],
            "n_traits": "SomaScan 7,596, Olink 2,925",
            "url": "https://finngen.gitbook.io/documentation/methods/pqtl-analysis",
            "pheno_urls": [
                {
                    "url": "https://r12.finngen.fi/gene/[GENE]",
                    "label": "FinnGen Pheweb",
                }
            ],
            "p_thres": 5e-3,
        },
        {
            "resource": "FinnGen_eQTL",
            "version": "2023-10-05",
            "data_types": ["eQTL"],
            "n_traits": "26,624 genes, 35 predicted cell types",
            "url": "https://www.finngen.fi/en/for_researchers",
            "pheno_urls": [
                {
                    "url": "https://r12.finngen.fi/gene/[GENE]",
                    "label": "FinnGen Pheweb",
                }
            ],
            "p_thres": 5e-3,
        },
        {
            "resource": "UKBB_pQTL",
            "version": "2024-01-30",
            "data_types": ["pQTL"],
            "n_traits": "Olink 2,655",
            # "url": "https://www.biorxiv.org/content/10.1101/2022.06.17.496443v1.full",
            "url": None,
            "pheno_urls": [
                {
                    "url": "https://www.finngen.fi/en/for_researchers",
                    "label": "FinnGen analysis",
                }
            ],
            "p_thres": 5e-3,
        },
        {
            "resource": "Open_Targets",
            "version": "October 2022",
            "data_types": ["GWAS"],
            "n_traits": "54,385",
            "url": "https://genetics.opentargets.org",
            "pheno_urls": [
                {
                    "url": "https://genetics.opentargets.org/study/[PHENOCODE]",
                    "label": "Open Targets study",
                }
            ],
            "p_thres": 5e-3,
        },
        {
            "resource": "eQTL_Catalogue_R7",
            "version": "R7",
            "data_types": ["eQTL", "pQTL", "sQTL"],
            "n_traits": "1,000,000+",
            "url": "https://www.ebi.ac.uk/eqtl/",
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
            "version": "2021",
            "data_types": ["pQTL"],
            "n_traits": "4,907",
            "url": "https://doi.org/10.1038/s41588-021-00978-w",
            "pheno_urls": [
                {
                    "url": "https://doi.org/10.1038/s41588-021-00978-w",
                    "label": "Nat Genet 2021",
                }
            ],
            "p_thres": 5e-3,
        },
        {
            "resource": "GTEx_v8_edQTL",
            "version": "2022",
            "data_types": ["edQTL"],
            "n_traits": "156,396",
            "url": "https://doi.org/10.1038/s41586-022-05052-x",
            "pheno_urls": [
                {
                    "url": "https://doi.org/10.1038/s41586-022-05052-x",
                    "label": "Nature 2022",
                }
            ],
            "p_thres": 1e-6,
        },
    ],
}

finemapped = {
    "file": "/mnt/disks/data/finemapped_resources_finngen_version_20240709.tsv.gz",
    "resources": [
        {
            "resource": "eQTL_Catalogue_R7",
            "version": "R7",
            "data_types": ["eQTL", "pQTL", "sQTL"],
            "n_traits": "1,000,000+",
            "url": "https://www.ebi.ac.uk/eqtl/",
        },
        {
            "resource": "FinnGen",
            "version": "R12",
            "data_types": ["GWAS"],
            "n_traits": "2,469",
            "url": "https://finngen.gitbook.io/documentation/methods/phewas",
        },
        {
            "resource": "FinnGen_pQTL",
            "version": "SomaScan 2023-03-02, Olink 2023-10-11",
            "data_types": ["pQTL"],
            "n_traits": "SomaScan 7,596, Olink 2,925",
            "url": "https://finngen.gitbook.io/documentation/methods/pqtl-analysis",
        },
        {
            "resource": "FinnGen_eQTL",
            "version": "2023-10-05",
            "data_types": ["eQTL"],
            "n_traits": "26,624 genes, 35 predicted cell types",
            "url": "https://www.finngen.fi/en/for_researchers",
        },
        {
            "resource": "UKBB_pQTL",
            "version": "2024-01-30",
            "data_types": ["pQTL"],
            "n_traits": "Olink 2,655",
            # "url": "https://www.biorxiv.org/content/10.1101/2022.06.17.496443v1.full",
            "url": None,
            "pheno_urls": [
                {
                    "url": "https://www.finngen.fi/en/for_researchers",
                    "label": "FinnGen analysis",
                }
            ],
            "p_thres": 5e-3,
        },
        {
            "resource": "UKBB_119",
            "version": "2021",
            "data_types": ["GWAS"],
            "n_traits": "119",
            "url": "https://www.medrxiv.org/content/10.1101/2021.09.03.21262975v1.full",
        },
        {
            "resource": "BBJ_79",
            "version": "2021",
            "data_types": ["GWAS"],
            "n_traits": "79",
            "url": "https://www.medrxiv.org/content/10.1101/2021.09.03.21262975v1.full",
        },
    ],
}

max_query_variants = 2000
