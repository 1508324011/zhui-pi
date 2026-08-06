# QC To Clustering

## Inputs To Confirm

- Data source: Cell Ranger folder, `filtered_feature_bc_matrix.h5`, Matrix Market, CSV, `.h5ad`, `.rds`, or existing object.
- Assay: droplet scRNA-seq, nuclei, CITE-seq RNA component, multiome RNA component, or plate-based data.
- Metadata: sample, donor, batch, condition, chemistry, tissue, expected cell count, and mitochondrial gene naming convention.
- Output contract: filtered object, exploratory plots, cluster markers, annotation table, or downstream integration input.

## Baseline Workflow

1. Load raw counts and make feature names unique.
2. Calculate QC metrics: total counts, detected genes, mitochondrial fraction, ribosomal fraction, and top expressed genes.
3. Plot QC distributions per sample or batch before choosing cutoffs.
4. Filter cells and genes using observed distributions.
5. Detect doublets with a method compatible with the ecosystem, such as Scrublet, DoubletFinder, scDblFinder, or Solo.
6. Preserve raw counts in `.layers['counts']`, `.raw`, or a Seurat assay before normalization.
7. Normalize with log-normalization, SCTransform, or model-aware setup depending on downstream method.
8. Select highly variable genes, scale where appropriate, run PCA, inspect elbow and variance, then compute neighbors and UMAP.
9. Sweep clustering resolutions and pick a resolution supported by markers and known tissue biology.
10. Find markers with a method compatible with the normalization and design.

## Practical Starting Points

| Step | Starting Point |
| --- | --- |
| Minimum genes | 200 to 500, adjusted by tissue and platform. |
| Maximum genes | 2,500 to 5,000 for typical PBMC-like data; inspect high-end tails for doublets. |
| Mitochondrial fraction | Often 10 to 20 percent; nuclei and stressed tissue need context. |
| HVGs | Start near 2,000 to 3,000 for standard scRNA-seq. |
| PCs | Start with 30 to 50, then inspect elbow and marker stability. |
| Clustering resolution | Sweep 0.2 to 1.2 instead of using one hard-coded value. |

## Report Minimum

- Cell and gene counts before and after filtering.
- QC thresholds and why they were chosen.
- Doublet method, expected rate, removed cells, and score distribution.
- Normalization method and whether raw counts were preserved.
- PCA/UMAP/neighbors parameters.
- Clustering resolutions tried and chosen.
- Marker table and plots for major clusters.
