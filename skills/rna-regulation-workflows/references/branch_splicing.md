# Alternative Splicing Branch

## SOP

1. Run FASTQ QC and adapter/quality trimming when needed.
2. Align with STAR using cohort-style two-pass splice junction discovery.
3. Check junction-level QC: known junction ratio, saturation, overhang, read support, and strandedness.
4. Run differential splicing with rMATS and leafcutter when design allows.
5. Filter events by FDR, dPSI, and junction read support.
6. Generate sashimi plots for sentinel events.
7. Optionally assess isoform switching, coding consequence, poison exons, and NMD direction.

## QC Gates

- STAR two-pass or equivalent cohort junction discovery for novel junction work.
- Splice junction overhang at least 8 nt.
- FDR < 0.05 for differential events.
- Absolute dPSI > 0.1 for interpretable effect size.
- Junction reads >= 10 for retained events.

## Traps

- rMATS is not friendly to complex batch/confounder designs. Use leafcutter or explicit regression designs when batches matter.
- Very low replicate designs, especially n=2, are weak for empirical splicing methods and should not drive strong claims.
- Poison exon PSI increase often predicts lower protein via NMD. Do not read direction backwards.
- 10X 3-prime single-cell data is not suitable for transcriptome-wide splicing claims.
