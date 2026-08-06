# Microbiome Router

Use this file to decide whether the request belongs to `microbiome-metagenomics-workflows` or a narrower skill.

## Use this workflow skill

- Raw or processed 16S/ITS amplicon analysis with DADA2, QIIME2, phyloseq, SILVA, GTDB, UNITE, ASV/OTU tables, diversity, or differential abundance.
- Shotgun metagenomic analysis with Kraken2, Bracken, MetaPhlAn, HUMAnN, AMR profiling, or strain tracking.
- Multi-step microbiome interpretation from feature table to alpha/beta diversity, ordination, PERMANOVA, compositional differential abundance, and reporting.
- Requests that ask which tool or branch to use for microbial communities.

## Route elsewhere

- Single scikit-bio API call, for example `beta_diversity`, UniFrac distance, PCoA, or PERMANOVA on an already prepared table: use `scikit-bio`.
- Generic FASTQ QC/trimming/adapter removal with no microbiome-specific downstream question: use `ngs-read-processing`.
- Bulk RNA-seq differential expression or pathway enrichment: use `omics-differential-workflows`.
- Proteomics/metabolomics abundance workflows: use `proteomics-metabolomics-workflows`.
- Direct pathway database lookup: use the relevant database skill.

## Required intake questions

Ask only for missing facts that change the route:

- Assay: 16S, ITS, shotgun metagenomics, metatranscriptomics, or existing table.
- Input state: FASTQ, demultiplexed reads, ASV/OTU table, taxonomy table, BIOM, pathway table, or AMR table.
- Controls: negative extraction/control blanks, mock community, spike-ins, and batch layout.
- Metadata: sample IDs, group labels, body site/environment, run/lane, primer set, host species, and covariates.
- Databases: SILVA/GTDB/UNITE/Kraken/MetaPhlAn/HUMAnN/AMR database versions.

## Claims by data type

| Data | Safe claims | Unsafe claims |
| --- | --- | --- |
| 16S/ITS | ASV-level patterns, genus/family-level trends, community diversity, broad predicted function with caveats | high-confidence species/strain function, AMR genes, transmission |
| Shotgun metagenomics | species-level profiling where database supports it, pathway abundance, AMR gene families, strain tracking with enough depth | absolute abundance without spike-in/qPCR, function without database/version caveats |
| Feature table only | diversity, ordination, differential abundance if metadata and normalization are sound | read-level QC, denoising quality, taxonomy method reconstruction |
