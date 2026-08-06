# Single-Cell VDJ Integration

Use this branch when VDJ clonotypes must be related to cell states, clusters, samples, treatment, or expression programs.

## Standard route

1. Load gene expression into AnnData/Seurat and load 10x VDJ or AIRR data.
2. Attach immune receptor data with scirpy or equivalent tooling.
3. Run chain QC: multichain, orphan, extra, ambiguous, missing chains.
4. Define clonotypes with explicit receptor arms and chain pairing strategy.
5. Categorize expansion: singleton, small clone, expanded clone, hyperexpanded clone; thresholds should be stated.
6. Associate clonotypes with clusters, cell states, tissue, condition, timepoint, and markers.
7. Report V/J usage, repertoire overlap, diversity, and clonotype-state enrichment where supported.

## scirpy defaults to name explicitly

- `ir.pp.ir_dist` distance definition.
- `ir.tl.define_clonotypes` parameters.
- `receptor_arms` choice, often `all` when paired chains matter.
- `dual_ir` choice, often `primary_only` for conservative calls.

## QC gates

- VDJ barcodes match expression barcodes at expected rate.
- Multichain/orphan/ambiguous rates are reported.
- Clonotype definition is consistent across samples.
- Cell-state annotations are marker-supported before receptor-state claims.
- Subject/sample is modeled; public clonotypes across people are not treated like within-subject expansion.

## Common traps

- Using generic single-cell clustering conclusions as receptor specificity evidence.
- Ignoring dual TCR or multichain cells.
- Calling expansion without depth/sample context.
- Merging clonotypes across subjects without a public-clone rationale.
- Forgetting that CDR3 amino acid identity and nucleotide identity answer different questions.
