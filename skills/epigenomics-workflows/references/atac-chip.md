# ATAC-seq And ChIP-seq

## ATAC-seq Route

1. Confirm library type, paired-end status, genome build, blacklist, replicates, and whether the goal is peaks, differential accessibility, footprinting, motif activity, or enhancer-gene linking.
2. Run read QC and trim Nextera adapters if observed.
3. Align with Bowtie2/BWA/chromap using assay-appropriate insert-size and filtering.
4. Remove mitochondrial reads and blacklist regions according to the project policy.
5. Apply duplicate handling carefully. Bulk ATAC often removes duplicates; single-cell and low-input data need assay-aware policy.
6. Shift Tn5 insertions when the downstream peak caller or footprinting method expects insertion-centered signal.
7. Call peaks with MACS3/Genrich/HMMRATAC and construct a fixed universe before differential testing.
8. Run QC: TSS enrichment, FRiP, fragment-size periodicity, replicate concordance, NRF/PBC if available.
9. Differential accessibility uses a fixed peak universe and replicate-aware methods such as DiffBind, csaw, DESeq2, or edgeR.

ATAC traps:

- MACS3 `-f BAMPE` ignores shift/extend options; do not pretend the shift was applied.
- A universal MAPQ threshold is not portable across aligners.
- TSS enrichment and FRiP thresholds are assay- and species-dependent; report the threshold used.
- Differential accessibility is invalid if each condition has a different peak universe.

## ChIP-seq Route

1. Identify target type: transcription factor, sharp histone mark, or broad histone mark.
2. Confirm IP, input control, replicates, antibody, genome build, blacklist, and expected peak width.
3. Align and filter reads; mark duplicates according to library complexity and target.
4. Call peaks with MACS3/HOMER using narrow or broad mode as appropriate.
5. For replicates, use IDR or a documented consensus strategy.
6. Annotate peaks with project-specific GTF when available; fall back to standard TxDb only when no project annotation exists.
7. Run motif enrichment for TF or regulatory questions.
8. Run differential binding only after peak universe and sample sheet are fixed.

ChIP traps:

- Input control is not optional for most serious ChIP-seq interpretation.
- Broad marks need broad peak settings and different QC expectations.
- Generic fragment-size assumptions are weak; estimate fragment size or justify the fallback.

## Minimum Outputs

- FASTQ/alignment QC summary.
- Peak files and peak counts per sample or consensus set.
- QC metrics including FRiP and replicate concordance.
- Differential result table if requested.
- Annotated peaks, motif results, and genome build/resource versions.
