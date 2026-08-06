# Compositional Statistics and QC

Microbiome tables are sparse, compositional, and batch-sensitive. The statistical plan should match that structure.

## Table QC

- Verify sample IDs align across feature table, taxonomy, tree, and metadata.
- Filter features by prevalence and abundance with thresholds stated before testing.
- Inspect library sizes and missing metadata.
- Decide whether rare samples or low-depth samples should be excluded before normalization.

## Diversity and ordination

- Alpha diversity: Shannon, Simpson, observed features, Chao1/ACE where appropriate.
- Beta diversity: Bray-Curtis, Jaccard, weighted/unweighted UniFrac when a valid tree exists.
- Ordination: PCoA/NMDS; show variance explained for PCoA where available.
- PERMANOVA: include formula/covariates and permutations; check dispersion with PERMDISP or equivalent.

## Differential abundance

Prefer methods designed for compositional/sparse data:

- ANCOM-BC2 for bias-corrected abundance and covariate-aware designs.
- ALDEx2 for centered log-ratio Monte Carlo inference.
- MaAsLin2 for multivariable association modeling with careful normalization/transform choices.
- DESeq2 only when explicitly justified and with microbiome caveats; do not present it as the default microbiome DA method.

## QC gates

- Metadata variables are not perfectly confounded with batch/run.
- Dispersion is checked when PERMANOVA is used.
- Multiple-testing correction is reported.
- Effect sizes accompany p-values.
- Feature prevalence filters are reproducible.

## Common traps

- Interpreting PERMANOVA as group centroid difference when dispersion differs.
- Running ordinary t-tests on relative abundance.
- Using taxonomic agglomeration without naming the rank and aggregation rule.
- Reporting p-values without effect sizes or prevalence.
- Treating zeros as ordinary missing values.
