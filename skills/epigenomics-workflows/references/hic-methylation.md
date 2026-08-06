# Hi-C And Methylation

## Hi-C Route

1. Confirm protocol, restriction enzyme if relevant, genome build, chromosome sizes, resolution goals, and replicates.
2. Align reads with Hi-C-aware settings such as BWA-MEM2 `-SP5M` patterns when appropriate.
3. Parse, sort, deduplicate, and split pairs with pairtools or project-standard tooling.
4. Generate cooler/mcool matrices at selected resolutions.
5. Balance matrices and inspect coverage artifacts before calling biology.
6. Call compartments at coarse resolution, TADs/insulation at intermediate resolution, and loops/dots at high resolution when coverage supports it.
7. Compare conditions only after the same bins, balancing policy, and masks are used.

Hi-C QC checkpoints:

- Valid pairs often >50%.
- Cis contacts often >70%, depending on protocol and organism.
- Duplicate rate and dangling-end/self-circle categories reviewed.
- Balanced matrices should not show unexplained stripes, empty chromosomes, or coverage cliffs.

## Methylation Route

1. Confirm WGBS, RRBS, targeted bisulfite, or array-like methylation input.
2. Prepare bisulfite genome and align with Bismark or project-standard aligner.
3. Extract methylation calls with strand/context handling recorded.
4. Filter CpGs/regions by coverage. Avoid testing sites with unstable low coverage.
5. Choose beta values for interpretability and M-values or count models for statistical testing as appropriate.
6. Run per-CpG testing and DMR detection with methylKit, bsseq, DSS, limma, or equivalent.
7. Annotate DMRs to genomic features and nearby genes, then interpret with pathway or regulatory context.

Methylation traps:

- Coverage and conversion controls matter more than nominal p-values.
- Delta-beta effect size should accompany statistical significance.
- Strand/context handling must be explicit for CpG, CHG, and CHH contexts.
- DMR callers have different smoothing and minimum-CpG assumptions; report them.

## Minimum Outputs

- Pair statistics or Bismark reports.
- Matrix or methylation-call files with index/version notes.
- Feature calls: compartments/TADs/loops or CpG/DMR tables.
- QC plots and parameter choices.
- Differential result tables with effect sizes and adjusted p-values.
