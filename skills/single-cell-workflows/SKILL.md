---
name: single-cell-workflows
description: End-to-end single-cell workflow skill for scRNA-seq, CITE-seq, 10X Multiome, scATAC, perturb-seq, lineage tracing, cell communication, and annotation from count matrices or Cell Ranger outputs to QC reports, integrated objects, clusters, markers, and annotated cell types. Use for multi-step Scanpy, Seurat, scvi-tools, Scrublet, CellTypist, SingleR, Azimuth, Signac, ArchR, Pertpy, Cassiopeia, LIANA, NicheNet workflows. For immune receptor repertoire or VDJ-centered workflows with MiXCR, VDJtools, Immcantation, scirpy clonotype analysis, TCR/BCR repertoire, neoantigen, or TCR-epitope questions, use immune-repertoire-immunoinformatics-workflows. For individual Scanpy APIs use scanpy; for AnnData format operations use anndata; for atlas queries use cellxgene-census.
---

# Single-Cell Workflows

## Purpose

Use this skill as the top-level planner for single-cell analyses that span multiple steps, tools, or decisions. It turns raw count matrices, Cell Ranger outputs, integrated objects, or multi-modal assays into a reproducible analysis plan with explicit QC gates, normalization choices, integration strategy, clustering, marker discovery, annotation, and downstream interpretation.

Keep library-level details in the library skills. Use `scanpy` for specific Scanpy API code, `anndata` for `.h5ad` or AnnData structure work, `scvi-tools` for model-level probabilistic methods, and `cellxgene-census` for atlas queries.

## When To Use

Use this skill for requests like:

- Build a full scRNA-seq workflow from 10X or count matrices to annotated cell types.
- Decide QC thresholds, doublet strategy, normalization, HVG selection, PCs, clustering resolution, and marker calls.
- Integrate multiple samples, donors, batches, or conditions with Harmony, Seurat, scVI, scANVI, RPCA, or CCA.
- Analyze CITE-seq, 10X Multiome, paired scRNA plus scATAC, or WNN-style multimodal data.
- Add perturb-seq, CRISPR guide assignment, Mixscape/Pertpy analysis, lineage tracing, RNA velocity, trajectory, or cell-cell communication.
- Compare automated annotation methods such as CellTypist, SingleR, Azimuth, scANVI, or reference atlas transfer.

Do not use it for a single function signature, a one-line `.h5ad` read/write operation, or a database lookup. Route those to `scanpy`, `anndata`, or `cellxgene-census`. If VDJ clonotypes, scirpy receptor analysis, TCR/BCR repertoire, or neoantigen/TCR-epitope evidence is central, route to `immune-repertoire-immunoinformatics-workflows` instead.

## Operating Loop

1. Classify assay and data state: raw counts, Cell Ranger output, filtered matrix, existing AnnData/Seurat object, CITE-seq, multiome, perturb-seq, or lineage data.
2. Lock metadata before analysis: sample, donor, batch, condition, chemistry, library type, expected cell recovery, reference build, and feature namespace.
3. QC before normalization. Inspect UMI counts, detected genes, mitochondrial fraction, ribosomal fraction, ambient RNA, doublet rate, and batch-specific failures.
4. Preserve raw counts in a layer or assay before log transforms, SCTransform, or model input.
5. Choose integration only after seeing whether the batch effect is technical, biological, or confounded with condition.
6. Cluster by resolution sweep, not one magic value. Report the chosen resolution and the biological reason.
7. Annotate with marker evidence and reference-transfer evidence. Never accept automated labels without marker sanity checks.
8. Save reproducible outputs: filtered object, metadata table, QC plots, cluster markers, annotation table, analysis parameters, and session/package versions.

## Decision Points

| Situation | Default Route | Notes |
| --- | --- | --- |
| Standard 10X scRNA-seq | QC to clustering to markers to annotation | Scanpy or Seurat are both valid; choose by project ecosystem. |
| Many samples or donors | Batch-aware integration | Check whether condition is confounded before regression or correction. |
| CITE-seq | RNA plus ADT joint analysis | Keep protein counts and RNA counts separate before totalVI or WNN. |
| 10X Multiome | Separate RNA and ATAC QC, then WNN/MultiVI | ATAC gates include TSS enrichment and nucleosome signal. |
| Perturb-seq | Guide assignment before DE | Track guide multiplicity and non-targeting controls. |
| Trajectory or RNA velocity | Validate lineage biology first | Do not infer pseudotime from arbitrary clusters without a biological axis. |
| Cell communication | Annotated cell types first | Garbage labels create garbage ligand-receptor networks. |

## QC Gates

| Stage | Gate |
| --- | --- |
| Loading | Expected cell count, feature naming, sample metadata, and raw count layer are present. |
| Cell QC | Thresholds are chosen from sample-specific distributions, not copied blindly. |
| Doublets | Method, expected doublet rate, and removed cell count are recorded. |
| Normalization | Raw counts remain available for models and differential testing. |
| Integration | Batch mixing improves without erasing known biology. |
| Clustering | Clusters have marker support and are stable across nearby resolutions. |
| Annotation | Automated labels are reconciled with canonical markers and tissue context. |
| Output | Final object, marker table, plots, and parameter log are written. |

## Reference Files

- `references/qc-to-clustering.md` for scRNA-seq loading, QC, doublets, normalization, PCA, UMAP, clustering, and marker discovery.
- `references/integration-and-annotation.md` for batch integration, reference transfer, marker-based annotation, and atlas comparisons.
- `references/multimodal-and-advanced.md` for CITE-seq, multiome, scATAC, perturb-seq, lineage tracing, trajectory, and communication workflows.
