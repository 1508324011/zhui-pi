# Amplicon 16S/ITS Workflows

## Standard route

1. Start with demultiplexed paired FASTQ plus metadata, primers, and run information.
2. QC with FastQC/MultiQC or QIIME2 summaries; inspect per-cycle quality and overlap feasibility.
3. Remove primers/adapters with cutadapt or QIIME2 cutadapt. Primer leftovers corrupt ASV inference.
4. Denoise with DADA2 or Deblur. For DADA2, choose truncation lengths from quality profiles and required paired-end overlap.
5. Build ASV table and representative sequences. Track reads through filtering, denoising, merging, and chimera removal.
6. Assign taxonomy with a database matching the marker and organism scope: SILVA or GTDB for 16S, UNITE for ITS.
7. Remove contaminants using negative controls, prevalence/frequency logic, and obvious non-target taxa such as mitochondria/chloroplast when appropriate.
8. Produce diversity, ordination, and differential abundance only after sample/feature QC.

## QC gates

- Primer/adapters removed before denoising.
- Overall pass-through after filtering/denoising is typically expected to stay above 70%; lower values need an explicit failure explanation.
- Paired-end merge success is typically expected above 80% when the insert and truncation lengths are compatible.
- Chimera fraction under 25% is a useful starting gate; higher values suggest primer, library, or truncation problems.
- Paired-end reads retain enough overlap after truncation; DADA2 merging failures usually mean truncation is too aggressive or insert sizes are incompatible.
- Read retention is reported per step; sudden drops are investigated, not ignored.
- Chimera rate is plausible for the assay; extreme chimera removal suggests primer/library issues.
- Negative controls do not dominate low-biomass samples.
- Mock community results are checked when available.
- Genus-level assignment above 80% is a practical sanity check for common 16S studies; report the rank actually supported by the marker/database.
- Rarefaction or depth curves should approach a plateau before alpha-diversity claims are made.
- Taxonomy database, classifier, marker region, and version are recorded.

## Differential abundance

Use compositional methods such as ANCOM-BC2, ALDEx2, MaAsLin2, or a method justified by the design. Include covariates and random effects only when metadata supports them. Avoid unadjusted tests on relative abundance.

## Common traps

- Treating OTUs and ASVs as interchangeable. ASVs preserve exact sequence variants; OTUs cluster by identity.
- Claiming species-level biology from short 16S regions without validation.
- Running rarefaction before every downstream analysis. Rarefaction can help diversity comparisons but is not a universal normalization method.
- Ignoring extraction blanks in low-biomass studies.
- Mixing SILVA/GTDB/UNITE results without naming the database and marker.
- Using 16S/PICRUSt2 predictions as measured functional metagenomics.
