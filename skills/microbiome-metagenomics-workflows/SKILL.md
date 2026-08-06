---
name: microbiome-metagenomics-workflows
description: End-to-end microbiome and metagenomics workflow skill for 16S/ITS amplicon and shotgun metagenomic analyses from FASTQ or feature tables to ASVs/OTUs, taxonomy, diversity, compositional differential abundance, functional profiling, AMR, strain tracking, and reports. Use this whenever the user mentions DADA2, QIIME2, phyloseq, vegan, ALDEx2, ANCOM-BC2, MaAsLin2, PICRUSt2, Kraken2, Bracken, MetaPhlAn, HUMAnN, AMRFinderPlus, ResFinder, MASH, sourmash, fastANI, inStrain, ASV/OTU/BIOM tables, SILVA/GTDB/UNITE taxonomy, alpha/beta diversity, UniFrac, PERMANOVA, or compositional microbiome statistics. For a single scikit-bio API call use scikit-bio; for generic FASTQ QC/trimming only use ngs-read-processing; for bulk RNA-seq differential expression use omics-differential-workflows.
---

# Microbiome and Metagenomics Workflows

Use this skill when the biological question is about a microbial community, not just a file format or one library call. The job is to route the assay, enforce compositional statistics, and make the output defensible enough that diversity, taxonomic, functional, AMR, and strain-level claims are not artifacts of preprocessing.

Keep the boundary clean. Use `scikit-bio` for direct Python APIs such as UniFrac, PCoA, PERMANOVA, FASTA/Newick/BIOM handling, or sequence objects. Use `ngs-read-processing` for generic FASTQ QC and trimming before a microbiome-specific workflow begins. Use this skill when the request spans DADA2/QIIME2, Kraken2/Bracken, MetaPhlAn/HUMAnN, compositional differential abundance, AMR profiling, strain tracking, or microbiome reporting.

## Operating Loop

1. Classify the assay before naming tools: 16S/ITS amplicon, shotgun metagenomics, precomputed ASV/OTU/BIOM table, functional table, AMR gene table, or strain-tracking problem.
2. Lock metadata: sample IDs, run/lane, primer set or shotgun protocol, read layout, negative/extraction controls, mock community, batch, body site/environment, host depletion, and outcome variables.
3. Route to the smallest correct branch. Amplicon workflows should not pretend to recover species-level functions; shotgun workflows should not use amplicon diversity defaults without checking the count structure.
4. QC at each irreversible step: raw reads, denoising/classification, contaminants, feature prevalence, library depth, taxonomy confidence, and batch/control behavior.
5. Treat microbial abundance as compositional. Avoid plain t-tests on relative abundance. Prefer methods designed for sparsity, zero inflation, and compositional effects.
6. Report claims at the right level: alpha/beta diversity, differential taxa, pathways, AMR genes, or strains are different evidence types and should not be conflated.

## Branch Router

| User request | Default route | Read next |
| --- | --- | --- |
| 16S/ITS paired FASTQ to ASVs/taxonomy/diversity | DADA2 or QIIME2 amplicon pipeline | `references/amplicon_16s_its.md` |
| ASV/OTU/BIOM table to diversity and ordination | Table QC, normalization/rarefaction decision, UniFrac/Bray-Curtis, PERMANOVA | `references/compositional_statistics_qc.md` |
| Shotgun reads to taxa/species abundance | Kraken2 + Bracken or MetaPhlAn, with database/version discipline | `references/shotgun_taxonomic_profiling.md` |
| Shotgun reads to pathways/functions | HUMAnN with taxonomic profiling and pathway normalization | `references/functional_amr_strain.md` |
| AMR genes or resistance profiling | AMRFinderPlus, ResFinder, CARD/RGI, or curated gene families | `references/functional_amr_strain.md` |
| Strain tracking, transmission, or relatedness | MASH/sourmash/fastANI/inStrain depending on resolution | `references/functional_amr_strain.md` |
| Figures/reporting | Stacked bars, heatmaps, ordination, diversity plots, method limits | `references/visualization_reporting.md` |

## Default Output Contract

For a workflow answer, return:

- the chosen branch and why adjacent branches were not used;
- required inputs and metadata, including controls;
- command or code skeletons only where the upstream metadata is known;
- QC gates and failure modes at each stage;
- statistical model choices for diversity or differential abundance;
- expected output files and how to interpret them;
- claim limits, especially taxonomic rank, compositionality, database versions, and control contamination.

## QC Principles

- Controls are first-class data. Negative controls catch kit/lab contamination; mock communities reveal primer/database/classifier behavior.
- Database versions are part of the result. SILVA, GTDB, UNITE, Kraken2 databases, MetaPhlAn marker databases, HUMAnN databases, and AMR databases change labels and abundances.
- Rarefaction is acceptable for some diversity visualizations but should not be treated as the universal normalization strategy for differential abundance.
- Compositional differential abundance should use tools such as ANCOM-BC2, ALDEx2, MaAsLin2, Songbird, or method-appropriate alternatives; state their assumptions.
- PERMANOVA needs dispersion checks. A significant PERMANOVA with unequal dispersion may be a variance result, not a centroid shift.
- Shotgun functional conclusions need adequate taxonomic and pathway support. Do not infer functions from 16S as if they were measured shotgun pathways.

## Failure Policy

Crash loudly on mismatched sample IDs, missing controls, unknown primer/database versions, impossible taxonomy ranks, absent metadata for the modeled covariate, broken BIOM tables, or an analysis that asks for species/strain/function claims from data that cannot support them. Do not add fallback branches that silently switch databases, ignore controls, or reinterpret a failed classifier as a biological negative.

## Reference Files

- `references/microbiome_router.md` - branch selection and near-miss routing.
- `references/amplicon_16s_its.md` - DADA2/QIIME2 16S/ITS workflows, ASV/taxonomy, amplicon QC.
- `references/shotgun_taxonomic_profiling.md` - Kraken2/Bracken, MetaPhlAn, shotgun taxonomic profiling, database discipline.
- `references/functional_amr_strain.md` - HUMAnN, pathway abundance, AMR detection, strain tracking.
- `references/compositional_statistics_qc.md` - diversity, ordination, PERMANOVA, compositional differential abundance.
- `references/visualization_reporting.md` - reporting patterns and figure requirements.

Read only the references matching the branch. If the request is a near miss, route to the narrower skill instead of pulling this workflow into a single library call.
