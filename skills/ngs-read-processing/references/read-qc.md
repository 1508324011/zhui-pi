# Read QC And Trimming

This reference covers FASTQ quality control and preprocessing before alignment. Preserve the raw QC evidence; do not overwrite it with post-trimming reports.

## Inputs To Confirm

- Sample sheet, sample IDs, lane IDs, library type, paired-end or single-end status.
- Adapter kit, expected read length, UMI structure, and whether poly-G trimming is needed.
- Assay type: WGS, WES, panel, RNA-seq, ChIP-seq, ATAC-seq, amplicon, or metagenomics.
- Downstream contract: variant calling, quantification, peak calling, contamination check, or archive QC.

## Baseline QC

Run FastQC and MultiQC, or fastp with JSON/HTML output, before changing reads.

```bash
fastqc -t 8 -o qc/raw sample_R1.fastq.gz sample_R2.fastq.gz
multiqc -o qc/raw qc/raw
```

Use fastp when one tool should both report and trim:

```bash
fastp \
  -i sample_R1.fastq.gz -I sample_R2.fastq.gz \
  -o sample.trimmed_R1.fastq.gz -O sample.trimmed_R2.fastq.gz \
  --detect_adapter_for_pe \
  --thread 8 \
  --html qc/sample.fastp.html \
  --json qc/sample.fastp.json
```

## Common Decisions

| Finding | Action |
| --- | --- |
| Adapter content over 1 percent | Trim adapters with fastp or Cutadapt; record the adapter source. |
| Low-quality tails | Trim only the affected tails; do not shorten all reads blindly. |
| Poly-G tails from two-color instruments | Enable poly-G trimming in fastp. |
| Unexpected GC distribution | Check contamination, wrong organism, or library design before proceeding. |
| Severe overrepresented sequences | Identify them; do not assume adapters. |
| UMI present in reads | Extract or annotate UMI before alignment or duplicate marking. |

## RNA-Seq Checks

- rRNA under 10 percent is good; over 20 percent deserves investigation.
- Confirm strandedness early; a wrong strandedness assumption corrupts quantification.
- Inspect gene-body coverage for 3-prime or 5-prime bias.
- TIN under 50 is a degradation warning, not a silent exclusion rule.

## Reporting Minimum

Report raw read count, post-trim read count, percent retained, Q30, adapter content, GC pattern, duplication estimate, and any failed module. The user needs evidence, not just a command log.
