# VCF QC, Normalization, Filtering, And Annotation

This reference covers operations after raw calls are produced.

## Normalize Before Comparison

```bash
bcftools norm -f reference.fa -m -any -Oz -o calls.norm.vcf.gz calls.raw.vcf.gz
bcftools index calls.norm.vcf.gz
```

Use the same reference build used for calling. Normalization against the wrong build corrupts alleles.

## Basic Statistics

```bash
bcftools stats calls.norm.vcf.gz > qc/calls.stats.txt
bcftools view -f PASS calls.norm.vcf.gz -Oz -o calls.pass.vcf.gz
bcftools index calls.pass.vcf.gz
```

Track total variants, PASS variants, SNPs, indels, Ti/Tv, singleton rate for cohorts, missingness, depth distributions, and sample outliers.

## Filtering Boundaries

- VQSR is appropriate only with enough variant count and build-matched truth/training sets.
- Hard filters should be stated as policy, not hidden in shell history.
- Somatic filters should account for VAF, contamination, strand/orientation artifacts, mapping artifacts, and PON evidence.
- SV filters should account for length, read support, caller support, breakpoint quality, and known difficult regions.

## Annotation

Use VEP, SnpEff, ANNOVAR, or a project-standard annotator. Record cache/database versions and reference build.

For clinical significance lookup, use `clinvar-database` for direct ClinVar queries. For consequence prediction and Ensembl IDs, use `ensembl-database`. For trait association evidence, use `gwas-database`. This skill orchestrates the variant workflow; database skills provide focused lookup evidence.

## Interpretation Handoff

The handoff should include normalized VCF path, PASS VCF path, stats report, annotation command/version, resources used, unresolved QC concerns, and whether the output is research-only or intended for a clinical interpretation workflow.
