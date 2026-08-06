# CLIP-seq Branch

## SOP

1. Extract UMIs using the exact protocol-specific pattern.
2. Trim adapters and low-quality sequence.
3. Align with STAR or another aligner configured for short reads and expected mismatch/crosslink behavior.
4. Filter alignments and perform UMI-aware deduplication.
5. Call peaks or crosslink sites with CLIPper, PureCLIP, or an assay-appropriate caller.
6. Annotate peaks by genomic feature and transcript region.
7. Run motif discovery and replicate-overlap analysis.

## QC Gates

- Mapping rate greater than 50% for usable libraries.
- Deduplicated unique rate greater than 20%.
- FRiP greater than 0.1 as a default enrichment gate.
- Peak count between 1,000 and 50,000 for typical successful RBP CLIP assays.
- Peak width commonly 20-100 nt, depending on caller and assay.
- At least two replicates should share a meaningful peak set for strong claims.

## Traps

- UMI pattern mismatch ruins deduplication and every downstream enrichment estimate.
- Calling peaks before deduplication inflates PCR artifacts.
- iCLIP/eCLIP/PAR-CLIP crosslink positions have strand and read-end conventions; interpret them by assay.
- No input or SMInput control makes background-sensitive claims fragile.
