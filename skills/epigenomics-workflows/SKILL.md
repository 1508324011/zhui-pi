---
name: epigenomics-workflows
description: End-to-end epigenomics workflow skill for ATAC-seq, ChIP-seq, Hi-C, and DNA methylation analyses from reads or prepared alignments to peaks, accessibility, binding, chromatin contacts, methylation calls, differential testing, motif or pathway interpretation, and QC reports. Use for MACS3, HOMER, DiffBind, csaw, TOBIAS, chromVAR, Bismark, methylKit, bsseq, cooler, cooltools, pairtools, HiCExplorer, ENCODE-style QC, consensus peaksets, FRiP/TSS enrichment, compartments, TADs, loops, DMRs, and cross-assay regulatory interpretation. For BAM-to-bigWig or heatmap commands use deeptools; for genomic interval ML use geniml; for high-performance interval operations use gtars.
---

# Epigenomics Workflows

## Purpose

Use this skill for assay-level epigenomics workflows where the deliverable is biological interpretation plus QC, not just one command. It covers ATAC-seq, ChIP-seq, Hi-C, and DNA methylation as connected pipelines.

Keep low-level implementation in the tool skills. Use `deeptools` for concrete bigWig/heatmap/profile commands, `gtars` for high-performance interval operations, `geniml` for genomic interval machine learning, `ngs-read-processing` for generic read QC/alignment mechanics, and `omics-differential-workflows` for expression-style count-matrix DE/pathway analysis.

## When To Use

Use this skill for requests that involve:

- ATAC-seq from FASTQ/BAM to QC, peak calling, consensus peaks, differential accessibility, TF footprinting, motif variability, co-accessibility, or enhancer-gene linking.
- ChIP-seq from FASTQ/BAM to narrow/broad peaks, input controls, replicate concordance, IDR, FRiP, fingerprint plots, annotation, motifs, super-enhancers, or differential binding.
- Hi-C/contact data from reads/pairs/cooler matrices to balancing, compartments, TADs, loops, differential contacts, or contact visualization.
- Bisulfite/RRBS/methylation data from Bismark alignment to methylation extraction, per-CpG testing, DMRs, beta/M values, and DMR annotation.
- Cross-assay regulatory interpretation that combines accessibility, binding, contacts, methylation, motifs, and expression.

Do not use this skill for:

- A single `bamCoverage`, `computeMatrix`, or `plotHeatmap` command; use `deeptools`.
- Generic BED overlap/tokenization/region embeddings; use `gtars` or `geniml`.
- Single-cell ATAC/multiome cell clustering; use `single-cell-workflows` unless the focus is bulk epigenomic regulatory interpretation.
- RNA differential expression or enrichment alone; use `omics-differential-workflows`.

## Operating Loop

1. Classify the assay, library type, controls, replicates, genome build, and expected biological output.
2. Lock reference assets: genome FASTA, chromosome sizes, blacklist, annotation GTF, genome build, mappability, restriction fragments if Hi-C, and CpG context if methylation.
3. Run read/alignment QC before assay-specific calls. Do not proceed with corrupted BAMs, wrong genome build, or missing controls.
4. Apply assay-specific preprocessing rather than generic NGS defaults. ATAC, ChIP, Hi-C, and bisulfite each have different duplicate, filtering, shifting, and normalization rules.
5. Generate primary features: peaks, consensus peaksets, contact matrices, methylation calls, or DMRs.
6. Quantify across samples and run differential tests only after replicate and QC checks pass.
7. Interpret features with motif, pathway, gene, contact, or regulatory context while preserving the assay-specific uncertainty.
8. Report QC thresholds, commands/resources, and failure points with final outputs.

## Decision Points

| Assay | Primary Route | Key Checks |
| --- | --- | --- |
| ATAC-seq | fastp, Bowtie2/BWA/chromap, ATAC filtering/shift, MACS3/Genrich, consensus peaks, DiffBind/csaw, TOBIAS/chromVAR | Mitochondrial fraction, TSS enrichment, FRiP, fragment periodicity, replicate concordance. |
| ChIP-seq | QC/alignment, IP plus input control, MACS3/HOMER, IDR or consensus, ChIPseeker/HOMER annotation, DiffBind | Input control, narrow vs broad mark, FRiP, NSC/RSC, peak count, replicate concordance. |
| Hi-C | BWA-MEM2, pairtools, cooler/mcool, ICE balancing, cooltools compartments/TADs/loops | Valid pairs, cis/trans fraction, duplicate rate, coverage uniformity, matrix artifacts. |
| Methylation | Bismark genome prep/alignment, methylation extractor, methylKit/bsseq/DSS, per-CpG and DMR testing | Bisulfite conversion, coverage distribution, CpG context, strand handling, beta/M-value choice. |
| Cross-assay | Harmonize coordinates and gene mappings before integration | Do not mix genome builds or incompatible peak/matrix resolutions. |

## QC Gates

| Stage | Gate |
| --- | --- |
| Read QC | Q30 and adapters acceptable; assay-specific contamination and fragment distributions reviewed. |
| Alignment | Mapping rate, duplicate policy, chromosome naming, blacklist/mitochondrial handling, and index validity recorded. |
| ATAC | TSS enrichment commonly >5 and ideally >10; FRiP commonly >20%; nucleosome-free and mono/di-nucleosome peaks visible. |
| ChIP | FRiP >1% and ideally >5% depending on target; fingerprint separates IP/input; peak count plausible for TF or histone mark. |
| Hi-C | Valid pairs often >50%; cis contacts often >70%; balanced matrix has no obvious striping or coverage artifacts. |
| Methylation | Coverage thresholds and conversion controls checked; DMRs require effect size and statistical support. |
| Differential analysis | Replicate-aware design; normalization choice justified; peak/contact/CpG universe fixed before testing. |

## Failure Policy

Fail loudly on genome-build mismatches, missing input controls, missing blacklist/annotation when required, invalid cooler resolution, incomplete Bismark reports, unbalanced design matrices, or inconsistent peak universes. Do not silently switch references, skip failed QC, or merge assays with incompatible coordinates.

## Reference Files

- `references/atac-chip.md` - ATAC-seq and ChIP-seq read-to-peak workflows, QC, differential accessibility/binding, motifs and footprinting.
- `references/hic-methylation.md` - Hi-C and methylation workflows, contact matrices, compartments/TADs/loops, methylation calls and DMRs.
- `references/regulatory-integration.md` - Consensus regions, motif/pathway interpretation, enhancer-gene links, cross-assay integration, and reporting.
