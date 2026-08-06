# RNA Structure Branch

## SOP

1. For sequence-only analysis, run RNAfold with both MFE and partition-function outputs.
2. For conserved families, run RNAalifold or another comparative method when homologs are available.
3. For probing assays, process SHAPE-MaP or DMS-MaPseq into per-base reactivity profiles.
4. Run constrained folding with reactivity data and compare against unconstrained predictions.
5. Report local confidence, paired/unpaired support, and control quality.

## QC Gates

- Partition-function or base-pair probability output is required; MFE alone is too brittle.
- SHAPE/DMS reactivity below 0.3 supports paired bases; above 0.7 supports unpaired bases as a practical interpretation guide.
- ShapeMapper-style workflows commonly need minimum per-position depth around 5,000 for stable reactivity.
- Untreated control is required, and denatured control is strongly preferred.

## Traps

- ViennaRNA defaults do not model pseudoknots. Say this before interpreting pseudoknot-prone RNAs.
- DMS primarily reports A/C accessibility and should not be treated as equivalent to SHAPE chemistry.
- Probing without control samples is descriptive at best and weak for mechanism claims.
