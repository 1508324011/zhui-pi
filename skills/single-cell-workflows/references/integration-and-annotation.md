# Integration And Annotation

## Integration Discipline

Integration is not cleanup. It changes the geometry of the data. Use it when the unwanted technical effect is visible and separable from the biology you need to preserve.

Before integration, check:

- Whether condition, donor, chemistry, or tissue is confounded with batch.
- Whether rare populations disappear after correction.
- Whether known marker gradients are preserved.
- Whether integration should happen on all cells or within major lineages.

## Common Routes

| Situation | Route | Notes |
| --- | --- | --- |
| Same modality, many batches | Harmony, Scanorama, scVI, Seurat CCA or RPCA | Compare unintegrated and integrated embeddings. |
| Reference labels available | scANVI, CellTypist, SingleR, Azimuth | Keep confidence scores and unresolved labels. |
| Atlas query | `cellxgene-census` | Use versioned Census releases for reproducibility. |
| Strong donor effects | Model donor as covariate | Do not regress out disease if disease is donor-confounded. |
| Multi-condition DE | Pseudobulk by sample | Cell-level tests inflate confidence when samples are the true replicates. |

## Annotation Workflow

1. Build a marker panel from tissue knowledge before looking at automated labels.
2. Annotate broad lineages first, then subcluster where justified.
3. Use automated tools as evidence, not authority.
4. Resolve conflicts with marker expression, tissue context, and reference confidence.
5. Keep labels hierarchical, such as `lineage`, `cell_type`, and `cell_state`.
6. Mark ambiguous clusters as ambiguous instead of forcing a name.

## Marker Sanity Checks

- Check positive markers and negative markers.
- Inspect expression on UMAP and per-cluster dot plots.
- Watch for ambient RNA genes and dissociation-stress signatures.
- Do not call cell states from one marker alone.

## Output Contract

- Integrated and unintegrated embeddings if integration was used.
- Annotation table with marker evidence and confidence.
- Reference/database version for automated annotation.
- Cluster marker table and plots.
- Notes on unresolved or merged clusters.
