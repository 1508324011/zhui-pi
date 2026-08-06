# RNA Regulation Common QC

## Shared Gates

- Confirm sample sheet, group labels, batches, and replicate pairing before running branch models.
- Confirm genome build and GTF/GFF annotation version match all BAMs and count matrices.
- Preserve strandedness. Wrong strandedness is a silent failure for junctions, CLIP peaks, and RNA modification signals.
- Report mapping, duplicate rate, insert or footprint length distribution, feature assignment, and replicate concordance.
- Use effect-size thresholds with FDR. P-values alone are weak mechanism evidence.

## Controls by Branch

- Splicing: biological replicates, consistent junction annotation, and batch-aware design where possible.
- Small RNA: correct adapter trimming and expected 21-23 nt miRNA peak.
- Ribo-seq: rRNA depletion, triplet periodicity, read-length-specific P-site offset, and paired RNA-seq for TE.
- CLIP-seq: UMI extraction pattern, deduplication, input or SMInput control, and replicate peak overlap.
- MeRIP/m6A: matched IP/Input pairs, replicate enrichment, motif and metagene validation.
- RNA structure: untreated control at minimum, denatured control when possible, and sufficient per-position depth.

## Interpretation Discipline

- Regulatory mechanism requires branch-specific evidence, not only differential abundance.
- Keep novel feature discovery separate from known-feature differential testing.
- Visualize sentinel events: sashimi for splicing, length distributions for small RNA, periodicity plots for Ribo-seq, peak browser tracks for CLIP/MeRIP, and reactivity profiles for structure.
