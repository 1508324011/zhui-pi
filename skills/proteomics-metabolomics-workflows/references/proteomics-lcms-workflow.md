# Proteomics LC-MS Workflow

## Inputs To Confirm

- Data source: MaxQuant, DIA-NN, mzML, mzTab, mzIdentML, evidence table, proteinGroups table, or pyOpenMS outputs
- Acquisition: LFQ, TMT/iTRAQ, SILAC, DIA, PTM enrichment, or targeted proteomics
- Sample metadata, condition, batch, injection order, search database, decoy strategy, FDR thresholds, and normalization plan

## Baseline Proteomics Route

1. Import data and preserve original column names.
2. Remove contaminants, reverse hits, and only-by-site identifications.
3. Extract quantitative matrix and log2-transform nonzero intensities.
4. Review missingness per sample and per protein.
5. Normalize with assay-appropriate method.
6. Impute only after missingness review; do not impute all-zero or all-missing proteins.
7. Run PCA/correlation/boxplot QC.
8. Fit differential abundance model and export statistics.

## Statistics Choices

| Need | Method |
|---|---|
| Standard LFQ group comparison | limma with robust/trend empirical Bayes |
| Peptide-count-aware protein statistics | DEqMS |
| Missingness-aware proteomics | proDA or MSstats where appropriate |
| Feature-level complex designs | MSstats |
| TMT/iTRAQ | Channel normalization, reference channel handling, then moderated statistics |

## QC And Reporting Minimum

- Number of proteins imported and retained
- Percent removed as contaminants/reverse/only-by-site
- Missingness per sample and per protein
- Normalization and imputation method with rationale
- PCA/correlation plots and batch notes
- Differential table with protein IDs, log fold change, p-value, adjusted p-value, missingness, and annotation

## Common Traps

- Running stats before contaminant filtering
- Treating left-censored missingness as random missingness without review
- Using quantile normalization blindly on high-missing LFQ data
- Mixing peptide-level, protein-level, and site-level inference in one table
- Reporting protein inference without noting shared peptides or grouping ambiguity
