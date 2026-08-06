# RNA Regulation Router

## Fast Branch Selection

- **Alternative splicing** when the task mentions junctions, exons, introns, PSI, dPSI, rMATS, leafcutter, MAJIQ, SUPPA2, sashimi, isoform switch, or NMD.
- **Small RNA-seq** when the task mentions miRNA, piRNA, siRNA, small RNA adapters, 18-30 nt reads, miRDeep2, miRge3, isomiR, or target prediction.
- **Ribo-seq** when the task mentions RPF, ribosome footprint, P-site, 3-nt periodicity, translation efficiency, ORF, upstream ORF, elongation, or stalling.
- **CLIP-seq** when the task mentions RBP binding, eCLIP, iCLIP, PAR-CLIP, crosslink site, UMI deduplication, CLIPper, PureCLIP, peak, motif, or SMInput.
- **Epitranscriptomics** when the task mentions MeRIP, m6A, m5C, pseudouridine, IP/Input, exomePeak2, m6Anet, DRACH, or direct RNA modification calling.
- **RNA structure** when the task mentions RNAfold, RNAalifold, MFE, partition function, SHAPE, DMS, mutate-map-rescue, reactivity, or probing-constrained folding.

## Routing Rules

1. If the user asks only for FASTQ QC, trimming, alignment, BAM sorting, or read-group setup, route to `ngs-read-processing`.
2. If the user asks only for bulk gene-level differential expression and pathway analysis, route to `omics-differential-workflows` or `pydeseq2`.
3. If the user asks for chromatin or DNA regulation, route to `epigenomics-workflows`.
4. If the user asks for RNA regulatory mechanism, stay here and choose a branch.
5. If the user mixes branches, plan each branch independently and integrate conclusions at the end.

## Minimum Metadata to Request or Infer

- Organism, genome build, annotation version, strandedness, read layout, read length, and replicate design.
- Library protocol and branch-specific controls.
- Batch variables and covariates.
- Whether outputs are exploratory, publication-grade, or production pipeline deliverables.
