---
name: ngs-read-processing
description: End-to-end NGS read preprocessing skill for FASTQ QC, trimming, alignment, BAM/CRAM post-processing, validation, and handoff to variant calling or RNA quantification. Use for workflows spanning FastQC/MultiQC/fastp/Cutadapt, BWA/Bowtie2/STAR/HISAT2, samtools sorting/indexing/markdup/stats, read-group handling, UMI/amplicon/RNA-seq QC. For assay-specific microbiome/metagenomics analysis with DADA2, QIIME2, Kraken2, MetaPhlAn, HUMAnN, or Bracken, use microbiome-metagenomics-workflows. For low-level BAM/VCF Python I/O use pysam; for primary variant detection use variant-calling.
---

# NGS Read Processing

Use this skill when the user needs a sequencing-read workflow, not just a library call. It covers the boring but failure-prone middle of NGS analysis: FASTQ quality control, adapter and quality trimming, reference alignment, BAM/CRAM post-processing, validation, and a clean handoff to downstream variant calling or expression workflows.

## When To Use

Use this skill for requests involving:

- FASTQ quality reports, FastQC, MultiQC, fastp, Cutadapt, Trimmomatic, contamination screening, UMI handling, or RNA-seq QC.
- Aligning short reads to a reference with BWA-MEM2, Bowtie2, STAR, or HISAT2.
- Sorting, indexing, marking duplicates, validating, filtering, or summarizing SAM/BAM/CRAM files as part of a production workflow.
- Preparing analysis-ready BAM/CRAM for variant calling, RNA quantification, ChIP/ATAC, or downstream QC.
- Debugging high adapter content, low mapping rate, abnormal duplication, strandedness mistakes, reference mismatch, or failed BAM validation.

Do not use this skill for simple Python file I/O; use `pysam` for low-level SAM/BAM/CRAM/VCF/FASTA access. Do not use it for primary variant detection from an already prepared BAM; use `variant-calling`. Do not use it for end-to-end microbiome/metagenomics interpretation after read QC; use `microbiome-metagenomics-workflows`.

## Operating Loop

1. **Classify the assay and downstream goal.** Distinguish WGS, WES, panel, bulk RNA-seq, ChIP-seq, ATAC-seq, amplicon, UMI, or metagenomic data before choosing tools. The aligner and duplicate policy depend on this decision.
2. **Lock the metadata.** Confirm sample names, read pairing, lane structure, read groups, reference build, adapter/UMI design, and strandedness. Do not invent read-group fields; ask for missing boundary metadata when it affects reproducibility.
3. **QC raw reads first.** Produce per-sample QC and a cohort summary before trimming. Trimming without a baseline hides the real failure mode.
4. **Trim or filter only for observed problems.** Adapter contamination, low-quality tails, poly-G tails, and UMI extraction are real reasons. Do not blindly trim every dataset the same way.
5. **Align with the assay-appropriate mapper.** DNA short reads usually use BWA-MEM2; local/small references often use Bowtie2; bulk RNA-seq uses STAR or HISAT2. Record the reference build and index source.
6. **Post-process by downstream contract.** Coordinate sort and index for most downstream tools; name sort only when a tool explicitly needs it. Mark duplicates for WGS/WES/panel workflows, but treat amplicon and UMI assays separately.
7. **Validate the BAM/CRAM before handoff.** Run `samtools quickcheck`, mapping statistics, duplicate statistics, insert-size checks when relevant, and reference/contig consistency checks.
8. **Report gates, not just commands.** A workflow is not done because commands ran. It is done when QC thresholds are recorded and failures are named.

## Decision Points

| Situation | Default path | Notes |
| --- | --- | --- |
| Human WGS/WES/panel FASTQ to analysis-ready BAM | fastp or FastQC/MultiQC, BWA-MEM2, samtools sort/markdup/index, validation | Preserve read groups; hand off to `variant-calling` for calls. |
| Bulk RNA-seq FASTQ to aligned BAM | FastQC/MultiQC, adapter/rRNA checks, STAR or HISAT2, gene-body and strandedness QC | Do not mark duplicates unless the assay design justifies it. |
| Amplicon sequencing | Assay-specific trimming/clipping, aligner chosen for target design, amplicon-aware duplicate policy | Routine duplicate removal can destroy signal. |
| UMI libraries | UMI extraction/grouping before deduplication | Prefer UMI-aware tools over coordinate-only duplicate marking. |
| Existing BAM needs cleanup | Validate sort order, reference, indices, flags, duplicates, and coverage | Do not rewrite BAMs without knowing downstream requirements. |

## QC Gates

Treat these as starting gates, not universal law. Report the exact metric, tool, threshold, and observed value.

| Stage | Typical gate | What failure usually means |
| --- | --- | --- |
| FASTQ after QC/trimming | Q30 over 85 percent; adapter content under 1 percent | Library/prep issue, wrong adapter, aggressive trimming needed, or bad run. |
| DNA alignment | Mapping rate over 95 percent; properly paired over 90 percent | Wrong reference/build, contamination, low complexity, or library issue. |
| Duplicate marking | WGS under 30 percent; exome/targeted under 50 percent | Low input, over-amplification, target design, or expected panel behavior. |
| RNA-seq QC | rRNA under 10 percent ideal; over 20 percent concerning; TIN under 50 concerning | Degradation, depletion failure, strandedness mismatch, or sample quality problem. |
| BAM validation | `quickcheck` clean; index matches BAM; contig names and reference MD5 compatible | Broken file, wrong reference, or unsafe downstream input. |

## Failure Policy

Crash loudly on missing files, reference mismatch, invalid sort order, corrupt BAM/CRAM, or impossible sample metadata. Do not add fallback branches that silently switch references, skip duplicate handling, ignore failed QC, or continue after validation fails. Production compatibility beats theoretical cleverness.

## Reference Files

- `references/read-qc.md` - FASTQ QC, trimming, contamination, UMI, and RNA-specific QC patterns.
- `references/alignment-and-bam.md` - Aligner selection, read-group handling, SAM/BAM/CRAM post-processing, validation, and common traps.
- `references/variant-handoff.md` - Minimal read-to-variant handoff and what must be true before invoking `variant-calling`.

Read only the reference that matches the user request. Keep command snippets explicit and parameterized; do not pretend defaults are universal.
