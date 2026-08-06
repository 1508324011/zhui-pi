# Quantification And Count QC

## Inputs To Confirm

- Sample sheet with exact sample IDs, condition, batch, donor/pairing, time point, and library type.
- Input state: FASTQ, BAM, featureCounts table, STAR GeneCounts, Salmon/kallisto `quant.sf`, or a merged count matrix.
- Reference transcriptome/genome, GTF/GFF version, transcript-to-gene mapping, and strandedness.
- Whether the downstream model needs gene-level counts, transcript-level estimates, or a visualization-only matrix.

## Quantification Routes

| Input | Route | Checks |
| --- | --- | --- |
| Paired RNA-seq FASTQ | fastp/MultiQC then Salmon or STAR + featureCounts | Q30, adapters, rRNA, strandedness, mapping/assignment rate. |
| Salmon/kallisto outputs | tximport or tximeta | Use proper `tx2gene`; retain length correction; record index/transcriptome version. |
| Aligned BAM | featureCounts | Match strandedness, paired-end flags, annotation, multi-mapping policy. |
| Count matrix | Ingest directly | Samples as columns or rows must be explicit; counts must be non-negative integers for count models. |

## Count Matrix Discipline

- Keep raw counts for DESeq2/edgeR/PyDESeq2. Use VST, rlog, logCPM, TPM, or CPM for visualization and clustering only unless the chosen statistical model explicitly expects transformed values.
- Filter low-expression genes with a documented rule such as edgeR `filterByExpr` or a count-per-sample minimum tied to the design.
- Join metadata by stable sample IDs. Never rely on column order without checking equality.
- Check sample swaps with PCA, library size, sex markers if applicable, known controls, and replicate clustering.

## Minimum QC Report

- Number of samples and genes before/after filtering.
- Library sizes or mapped/assigned reads per sample.
- Quantification route and reference annotation versions.
- PCA or sample-distance outlier summary.
- Any dropped sample or gene filtering rule with counts.
