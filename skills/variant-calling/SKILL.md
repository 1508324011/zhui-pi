---
name: variant-calling
description: End-to-end variant calling workflow skill for germline, somatic, joint, structural, and long-read variant detection from prepared BAM/CRAM or FASTQ handoff. Use for GATK HaplotypeCaller, DeepVariant, bcftools, Mutect2, Strelka2, Manta/Delly/GRIDSS, Sniffles2/cuteSV, VCF normalization/filtering/QC/annotation, ClinVar/ACMG handoff. For downstream neoantigen, MHC binding, pVACtools, HLA vaccine candidate, or TCR-epitope workflows after variant calling, use immune-repertoire-immunoinformatics-workflows. For read QC/alignment use ngs-read-processing; for raw ClinVar/GWAS/Ensembl lookups use database skills.
---

# Variant Calling

Use this skill when the user needs a variant-calling workflow or an opinionated choice among callers, filters, QC checks, and annotation steps. It starts from analysis-ready BAM/CRAM or from an explicit handoff from `ngs-read-processing`.

## When To Use

Use this skill for requests involving:

- Germline SNP/indel calling with GATK HaplotypeCaller, DeepVariant, or bcftools.
- Joint genotyping, GVCF workflows, cohort VCF construction, or filtering strategy.
- Tumor-normal or tumor-only somatic calling with Mutect2, Strelka2, contamination filtering, panel of normals, orientation bias, or cancer annotation.
- Structural variant detection with Manta, Delly, GRIDSS, SURVIVOR, Sniffles2, cuteSV, or long-read SV pipelines.
- VCF/BCF normalization, decomposition, filtering, statistics, indexing, consensus sequence generation, or annotation with VEP/SnpEff/ClinVar.
- Clinical or research interpretation handoff after primary calls are made.

Do not use this skill for raw FASTQ QC or read alignment; use `ngs-read-processing`. Do not use it for a single ClinVar, GWAS, or Ensembl lookup; use the relevant database skill. Do not use it for downstream neoantigen ranking, MHC binding prediction, pVACtools vaccine-candidate prioritization, or TCR-epitope workflows; use `immune-repertoire-immunoinformatics-workflows`. Do not use it for low-level Python VCF iteration; use `pysam`.

## Input Contract

Before variant calling, verify:

- BAM/CRAM is coordinate-sorted and indexed.
- Reference build is known and matches all resources.
- Read groups and sample names are correct.
- Duplicate policy, base quality strategy, and interval targets are known.
- Coverage, mapping rate, and contamination concerns are visible.
- Known-sites resources, panel of normals, germline resource, BED intervals, and annotation cache versions are recorded where used.

If these are missing, fix or request them before inventing a caller command. Bad inputs produce clean-looking bad VCFs.

## Caller Decision Tree

| Situation | Default path | Notes |
| --- | --- | --- |
| Quick small-variant calling, non-model organisms, small projects | `bcftools mpileup` plus `bcftools call` | Simple and transparent; filtering is manual. |
| Human production germline SNP/indel | GATK HaplotypeCaller or DeepVariant | Prefer GVCF for cohorts; use build-matched known-sites resources. |
| Highest precision single-sample germline calls | DeepVariant | Containerized path is common; match model type to WGS/WES/PacBio/ONT. |
| Cohort germline genotyping | GVCF production then joint genotyping | GenotypeGVCFs/GenomicsDB or GLnexus depending on caller stack. |
| Tumor-normal somatic SNV/indel | Mutect2 or Strelka2 | Matched normal, PON, contamination, and orientation-bias filters matter. |
| Short-read structural variants | Manta, Delly, GRIDSS, then optional SURVIVOR merge | Do not treat SV calls like small variants. |
| Long-read structural variants | minimap2 alignment, Sniffles2 or cuteSV | Report read N50, coverage, platform, and support thresholds. |

## Workflow Discipline

1. **Separate caller class from filter class.** Calling, normalization, filtering, annotation, and interpretation are different stages. Keep intermediate VCFs.
2. **Normalize before comparing or annotating.** Split multiallelics and left-align indels with a build-matched reference.
3. **Use cohort-aware filters only when the data supports them.** VQSR needs enough variants and appropriate truth resources; small panels often need hard filters.
4. **Never apply germline filters to somatic calls.** Tumor-normal VAF, contamination, strand/orientation artifacts, and PON evidence are different data structures.
5. **QC the VCF as a dataset.** Count variants, PASS rate, Ti/Tv, SNP/indel ratio, known-site overlap, sample missingness, sex checks when relevant, and outliers.
6. **Annotate after basic QC.** VEP/SnpEff/ClinVar/gnomAD annotation is downstream evidence; it does not rescue poor calls.
7. **Write the handoff.** State caller versions, reference, resource versions, filters, thresholds, and failure modes.

## QC Gates

| Stage | Typical gate | Notes |
| --- | --- | --- |
| Pre-call BAM | Sorted, indexed, reference-compatible, read groups present | Fail before calling if this is false. |
| Germline WGS small variants | Ti/Tv about 2.0-2.1; dbSNP/known-site overlap high for human | Exact values vary by build, ancestry, caller, and filters. |
| Germline exome | Ti/Tv often about 2.8-3.0 after confident filtering | Target design shifts expectations. |
| Somatic calls | PASS count, VAF distribution, contamination, orientation artifacts reviewed | Matched normal and PON quality dominate false positives. |
| SV calls | Support reads, size distribution, caller intersection when possible | Initial long-read filter often starts around QUAL 20 and SV length at least 50 bp. |

## Reference Files

- `references/germline-small-variants.md` - bcftools, GATK, DeepVariant, joint calling, and filtering choices.
- `references/somatic-and-sv.md` - Mutect2/Strelka2, contamination/orientation filtering, short-read SV, and long-read SV.
- `references/vcf-qc-annotation.md` - VCF normalization, stats, filtering, annotation, and clinical handoff boundaries.

Use the smallest workflow that answers the user's biological question, but do not skip validation just to make a command line shorter.
