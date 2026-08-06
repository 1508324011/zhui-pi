# Pharmacogenomics And Trials

## Pharmacogenomics Route

Use `clinpgx-database` for direct ClinPGx/CPIC/label queries, then synthesize here.

Confirm:

- Gene, allele nomenclature, diplotype, phenotype, drug, indication, guideline source, and update date
- Whether phenoconversion, co-medications, ancestry, or copy-number alleles matter
- Whether the requested output is research evidence, CDS draft, or report handoff

Do not silently translate star alleles or phenotypes. If nomenclature is ambiguous, stop and ask for the calling convention or source report.

## PGx Output Contract

- Gene and diplotype/star alleles
- Predicted phenotype and confidence
- Drug and indication context
- CPIC/FDA/label/source evidence with date
- Evidence strength and limitations
- Downstream action target: report handoff, CDS draft, or data table

## GWAS And PRS Evidence

GWAS Catalog evidence is population-level association evidence. Preserve:

- rsID/variant, trait, effect allele, effect size, p-value, study accession, ancestry, and PMID
- Whether the result is a candidate association, PRS input, or contextual evidence
- Limitations from ancestry mismatch, LD, phenotype definition, and study design

## Clinical Trial Matching

Use `clinicaltrials-database` for API retrieval. This workflow owns interpretation of match quality.

Keep these fields separate:

- Condition, biomarker, variant/gene, drug/intervention, line of therapy, phase, status, location, eligibility criteria, NCT ID
- Exact inclusion/exclusion text that supports or blocks the match
- Match class: direct biomarker match, disease-only match, drug-class match, or weak contextual match

Never claim eligibility from a disease or gene keyword alone. Trial matching is a screening handoff, not enrollment advice.
