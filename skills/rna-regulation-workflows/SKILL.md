---
name: rna-regulation-workflows
description: "End-to-end RNA regulatory mechanism workflows across alternative splicing, small RNA-seq, Ribo-seq, CLIP/eCLIP/iCLIP/PAR-CLIP, epitranscriptomics, MeRIP-seq, m6A, direct RNA, RNA structure, and chemical probing. Use this skill whenever the user mentions rMATS, leafcutter, MAJIQ, SUPPA2, PSI, isoform switching, NMD, miRDeep2, miRge3, isomiR, miRNA targets, ribosome profiling, P-site offset, 3-nt periodicity, translation efficiency, ORF discovery, ribosome stalling, CLIPper, PureCLIP, UMI deduplication, RBP peaks, RNA motifs, exomePeak2, MACS3 for MeRIP, m6Anet, DRACH, RNAfold, RNAalifold, SHAPE, DMS, or RNA probing. Do not use for ordinary bulk DESeq2 plus GSEA, raw read preprocessing only, ATAC/ChIP/Hi-C/methylation epigenomics, or generic Scanpy analysis."
---

# RNA Regulation Workflows

Use this skill when the user is asking for RNA mechanism, not just differential expression. The first decision is the assay branch; the second is whether controls and QC are strong enough to support a regulatory claim.

## Scope Boundary

Use this skill for:

- Alternative splicing, PSI, intron usage, isoform switching, poison exons, and NMD consequences.
- Small RNA-seq, miRNA discovery, isomiR analysis, and miRNA target interpretation.
- Ribo-seq, ribosome footprints, P-site calibration, triplet periodicity, translation efficiency, ORF discovery, and stalling.
- CLIP-family assays for RBP binding, crosslink sites, peaks, motifs, and target annotation.
- Epitranscriptomics workflows such as MeRIP-seq, m6A differential modification, direct RNA modification calling, and motif/metagene checks.
- RNA structure prediction and probing-constrained folding with SHAPE, DMS, or related assays.

Do not use this skill for:

- Ordinary bulk RNA-seq counts with DESeq2 and enrichment; use `omics-differential-workflows` or `pydeseq2`.
- Read QC, trimming, and alignment as the whole task; use `ngs-read-processing`.
- ATAC-seq, ChIP-seq, Hi-C, or DNA methylation regulatory workflows; use `epigenomics-workflows`.
- Standard single-cell clustering or annotation; use `single-cell-workflows` or `scanpy`.

## Branch Router

Pick one primary branch before planning commands:

- **Splicing**: rMATS, leafcutter, MAJIQ, SUPPA2, PSI, junction reads, sashimi plots, isoform switch, NMD.
- **Small RNA**: adapter-dependent small RNA reads, 18-30 nt size selection, miRDeep2, miRge3, novel miRNA, isomiR, miRNA target prediction.
- **Ribo-seq**: ribosome-protected fragments, P-site offset, 3-nt periodicity, translation efficiency, ORF discovery, ribosome stalling.
- **CLIP-seq**: eCLIP, iCLIP, PAR-CLIP, UMI extraction, crosslink sites, RBP peaks, motif analysis, SMInput or input controls.
- **Epitranscriptomics**: MeRIP/IP-input, m6A, DRACH motif, stop-codon enrichment, exomePeak2, m6Anet, direct RNA modification calling.
- **RNA structure**: RNAfold, RNAalifold, partition function, SHAPE-MaP, DMS-MaPseq, probing-constrained folding.

If the prompt spans multiple branches, keep branch outputs separate and integrate only at the interpretation layer. Do not merge incompatible QC metrics into one generic report.

## Common Operating Rules

1. **State assay branch and controls.** Regulatory claims depend on branch-specific controls: paired RNA-seq for Ribo-seq, IP/Input for MeRIP, SMInput/input for CLIP, untreated controls for probing, and batch-aware replicates for splicing.
2. **Preserve strand and protocol metadata.** Small RNA adapters, CLIP UMI patterns, Ribo-seq footprint lengths, and probing chemistry are not interchangeable defaults.
3. **Run branch QC before inference.** Weak periodicity, failed deduplication, missing IP/Input pairing, or poor junction support invalidates downstream interpretation.
4. **Use two tools when one tool is fragile.** For splicing, prefer rMATS plus leafcutter or another independent junction method when design allows.
5. **Separate discovery from mechanism.** Novel miRNAs, new ORFs, peaks, and modification sites need stricter support than differential testing on known features.
6. **Report effect direction in biological units.** Use dPSI, translation efficiency, peak enrichment, modification log fold change, or paired/unpaired reactivity rather than only p-values.

## Branch Shortcuts

- Splicing branch: read `references/branch_splicing.md`.
- Small RNA branch: read `references/branch_small_rna.md`.
- Ribo-seq branch: read `references/branch_riboseq.md`.
- CLIP-seq branch: read `references/branch_clipseq.md`.
- Epitranscriptomics branch: read `references/branch_epitranscriptomics.md`.
- RNA structure branch: read `references/branch_rna_structure.md`.
- For mixed prompts, start with `references/rna_regulation_router.md` and `references/rna_regulation_common_qc.md`.

## Failure Policy

Do not make a regulatory mechanism claim when the branch gate fails. Say exactly which gate failed and what data would repair it. Examples: no paired RNA-seq for TE, no UMI dedup for CLIP peak calling, no IP/Input pairing for MeRIP differential m6A, weak 3-nt periodicity for Ribo-seq, or no probing control for structure interpretation.
