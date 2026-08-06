# TCR/BCR Repertoire Workflows

## MiXCR route from FASTQ

1. Identify receptor, organism, protocol, UMI status, and whether data are amplicon, RNA-seq, or 10x VDJ.
2. Use MiXCR `analyze` presets when the protocol matches: `generic-tcr-amplicon`, `generic-bcr-amplicon`, `generic-tcr-amplicon-umi`, `rnaseq-tcr`, `rnaseq-bcr`, `10x-vdj-tcr`, `10x-vdj-bcr`, or kit-specific presets such as `takara-human-tcr-v2`.
3. For custom workflows, use align -> refineTagsAndSort when UMI/tag logic exists -> assemble -> exportClones.
4. Export clone tables with cloneId, readCount, cloneFraction, nucleotide CDR3, amino-acid CDR3, V/D/J hits, and chain.
5. Review MiXCR reports before downstream statistics.

## VDJtools route from clonotype tables

1. Convert MiXCR outputs when needed with `vdjtools Convert -S mixcr`.
2. Confirm columns: count, frequency, CDR3 nucleotide, CDR3 amino acid, V, D, J.
3. Compute diversity with `CalcDiversityStats`: Shannon, Simpson, Chao1, Gini, d50.
4. Compute overlap with `OverlapPair` or `CalcPairwiseDistances`: F2, frequency-weighted Jaccard, Jaccard, Morisita-Horn.
5. Analyze spectratype and segment usage with `CalcSpectratype` and `CalcSegmentUsage`.
6. Track clones across samples/timepoints with `TrackClonotypes` or `JoinSamples`.

## QC gates

- MiXCR successfully aligned reads over 80% is usually good; investigate lower values.
- V/J assignment over 70% is a practical starting gate for clean targeted repertoire data.
- CDR3 found in over 70% of aligned reads is usually expected for clean targeted repertoire data.
- Clonotype count is interpreted relative to depth, tissue, receptor, and protocol.
- Diversity comparisons require depth awareness; report rarefaction/downsampling if used.
- Receptor chain and clonotype definition are stated.

## Common traps

- Mixing nucleotide and amino-acid clonotype definitions without saying so.
- Comparing diversity across samples with very different read depth.
- Treating public/shared clones as antigen specificity without validation.
- Using a non-UMI preset on UMI libraries or ignoring UMI tags.
- Comparing segment usage without consistent reference species/gene annotation.
