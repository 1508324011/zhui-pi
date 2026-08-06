# Visualization and Reporting

## Figures

- Stacked bar plots: show top taxa/pathways and group the rest as `Other`; state rank and abundance scale.
- Heatmaps: use transformed/normalized abundance appropriate to the question; cluster only when distance is meaningful.
- Alpha diversity: box/violin plus points; report test and correction.
- Beta diversity: ordination with distance metric, variance explained, PERMANOVA p-value, and dispersion check.
- Differential abundance: volcano/effect-size plot with prevalence and adjusted p-values.
- AMR/functional profiles: separate gene family, pathway, and organism-stratified views.

## Report skeleton

1. Data and assay type.
2. Database/tool versions.
3. QC summary and excluded samples/features.
4. Taxonomic or functional profiling results.
5. Diversity/statistical results with model formula.
6. Differential abundance/AMR/strain results where applicable.
7. Limitations: compositionality, controls, taxonomic rank, database dependence, and unsupported claims.

## Minimum reproducibility details

- Tool versions and database versions.
- Primer/marker or shotgun protocol.
- Read filtering/host depletion settings.
- Feature filtering thresholds.
- Normalization and transform choices.
- Statistical model formula and multiple-testing correction.
