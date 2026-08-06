# Spatial Graphs And Domains

## Graph Construction

Choose a graph that matches the platform geometry.

| Platform | Graph Style | Notes |
| --- | --- | --- |
| Visium | Grid-aware or k-nearest spots | Six-neighbor defaults are common, but verify tissue layout. |
| Xenium or MERFISH | Radius or k-nearest cells | Use physical distance units when possible. |
| Slide-seq or Stereo-seq | Radius or bin-neighbor graph | Density varies; inspect local neighborhoods. |
| Segmented proteomics | Cell centroid graph | Segmentation quality affects every graph metric. |

Always report coordinate system, graph method, radius or k, and whether disconnected components were expected.

## Spatial Statistics

Common analyses:

- Moran autocorrelation for spatially variable genes.
- Neighborhood enrichment between clusters or cell types.
- Co-occurrence across spatial distance.
- Ligand-receptor or communication analysis with spatial constraints.
- Spatially aware differential expression between domains or tissue regions.

Interpretation rules:

- Spatial autocorrelation is sensitive to graph choice.
- Abundant cell types can dominate enrichment unless normalized.
- Distance-binned co-occurrence needs enough cells or spots per bin.
- Spatially variable genes should be checked on tissue images, not only tables.

## Domain Detection

Separate three concepts:

1. Expression-only clusters from transcriptomic similarity.
2. Spatial domains from spatially constrained clustering.
3. Tissue annotations from histology or expert labels.

A good report compares them instead of pretending they are the same.

Minimum output:

- Domain labels on tissue image.
- Marker genes or features for each domain.
- Agreement or disagreement with transcriptomic clusters.
- Sensitivity to graph parameters or resolution.
- Tissue-region interpretation and caveats.
