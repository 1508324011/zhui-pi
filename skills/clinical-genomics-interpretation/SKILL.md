---
name: clinical-genomics-interpretation
description: End-to-end post-calling clinical genomics interpretation workflow skill for germline, somatic, pharmacogenomic, GWAS/PRS, liquid biopsy, and trial-matching evidence synthesis. Use for ClinVar/ACMG-style variant prioritization, gnomAD/GWAS evidence, ClinPGx/CPIC pharmacogenomics, COSMIC cancer evidence, ctDNA/liquid-biopsy interpretation, CHIP filtering, tumor fraction, longitudinal monitoring, and clinical report handoff. For raw read processing use ngs-read-processing; for primary variant calling use variant-calling; for single-source database lookup use the database-specific skills. For non-clinical population-level causal genomics inference, use causal-genomics-workflows.
license: Unknown
---

# Clinical Genomics Interpretation

## Purpose

Use this skill for the interpretation layer after variants, annotations, or liquid-biopsy signals already exist. It assembles evidence across clinical databases, population frequencies, pharmacogenomics, cancer resources, and trial eligibility into a reproducible decision-support workflow.

This is not a diagnosis engine. Preserve evidence levels, review status, genome build, source versions, and uncertainty. A VUS is not actionable just because it appears in a report.

## When To Use

Use this skill when the request involves:

- Prioritizing called variants with ClinVar, gnomAD, computational evidence, inheritance, or disease context
- Synthesizing germline or somatic evidence into an interpretation-ready table
- Applying ACMG/AMP-style evidence categories or preparing a handoff to clinical reporting
- Combining ClinPGx/CPIC evidence with genotypes for pharmacogenomic interpretation
- Matching variants, biomarkers, disease, or drugs to relevant clinical trials
- Interpreting COSMIC/cancer gene/mutational signature evidence in a precision-oncology workflow
- Analyzing liquid biopsy outputs: ctDNA low-VAF calls, tumor fraction, CHIP filtering, fragmentomics, or longitudinal monitoring
- Creating a structured evidence packet for `clinical-reports` or `clinical-decision-support`

Do not use this skill for:

- FASTQ QC, alignment, or BAM preparation; use `ngs-read-processing`
- Primary germline, somatic, joint, structural, or long-read variant calling; use `variant-calling`
- A single ClinVar, ClinPGx, GWAS, COSMIC, or ClinicalTrials.gov API lookup; use the database skill directly
- Population-level causal genomics analyses such as Mendelian randomization, colocalization, fine-mapping, mediation, or instrument construction; use `causal-genomics-workflows`
- Writing the final clinical report document; use `clinical-reports` or `clinical-decision-support` after evidence synthesis
- Bedside medical advice or autonomous diagnosis

## Operating Loop

1. Classify the input: germline VCF, somatic VCF, pharmacogenomic genotypes, PRS/GWAS evidence, liquid-biopsy panel, sWGS, or longitudinal samples.
2. Lock provenance: sample ID, phenotype/disease, genome build, transcript set, variant caller, annotation versions, database releases, and intended use.
3. Reject missing prerequisites before interpreting: no build, no sample identity, no caller provenance, no coverage/VAF context, or no analysis scope.
4. Retrieve source evidence only from the narrowest useful database skill: ClinVar, ClinPGx, GWAS Catalog, COSMIC, ClinicalTrials.gov, or chemical/drug databases.
5. Apply branch-specific filters and QC gates before ranking.
6. Separate evidence from recommendation: keep source assertions, confidence, conflicts, and limitations visible.
7. Emit a handoff table with variants/signals, evidence, confidence, unresolved issues, and downstream report targets.
8. Crash loudly when evidence is inconsistent; do not silently coerce genome builds, star-allele nomenclature, cancer type, drug name, or trial eligibility.

## Decision Points

| Scenario | Primary Route | Notes |
|---|---|---|
| Germline VCF prioritization | ClinVar + gnomAD/GWAS + inheritance | Keep VUS separate from actionable variants. |
| Somatic tumor VCF interpretation | COSMIC + cancer genes + signatures + trial matching | Do not reuse germline filters as somatic rules. |
| Pharmacogenomics | ClinPGx/CPIC evidence + genotype/star allele | Phenoconversion and dosing claims need explicit evidence source. |
| Polygenic risk or trait association | GWAS Catalog/PRS evidence | Report ancestry and model limitations. |
| Liquid biopsy targeted panel | Low-VAF mutation evidence + CHIP filtering | CHIP filtering is mandatory before tumor interpretation. |
| Liquid biopsy sWGS | Tumor fraction and CNV context | Do not use sWGS as a point-mutation detector. |
| Serial ctDNA monitoring | Baseline-relative longitudinal trend | Preserve timepoints and treatment context. |
| Trial matching | Biomarker/disease/drug/location/status filters | Use `clinicaltrials-database` for API calls; this skill owns evidence synthesis. |

## QC Gates

| Stage | Gate |
|---|---|
| Variant input | Genome build and transcript set match annotation resources. |
| Germline frequency | Default rare threshold is AF < 0.01; stricter modes use 0.001 or 0.0001. |
| ClinVar evidence | Prefer Pathogenic/Likely pathogenic with review status; preserve conflicts and VUS. |
| ctDNA panel | Depth should support claimed VAF; VAF >1% is robust, 0.5-1% needs UMI support, <0.1% is not reliable by default. |
| cfDNA fragment QC | Modal fragment size should be around 150-180 bp; mononucleosome fraction should be visible. |
| CHIP | DNMT3A/TET2/ASXL1/PPM1D/JAK2/SF3B1/SRSF2/TP53 and context-specific CHIP genes must be reviewed. |
| Tumor fraction | ichorCNA/sWGS is strongest near 0.1-1x; <3% tumor fraction is near the practical lower-confidence zone. |
| PGx | Star allele, diplotype, phenotype, and guideline source must be recorded. |
| Trial matching | Recruiting status, eligibility criteria, geography, biomarker, intervention, and trial phase must remain separate fields. |

## Failure Policy

Stop and surface the exact blocker when:

- The genome build or transcript source is missing or mixed
- A called variant lacks coverage/VAF/context required for the claim
- A PGx genotype cannot be mapped unambiguously to the claimed allele nomenclature
- A ctDNA interpretation lacks CHIP review
- A trial match is inferred from disease name alone without biomarker/eligibility checks
- A report would turn VUS, weak association, or low-confidence ctDNA signal into an actionable conclusion

## Reference Files

- `references/variant-evidence-and-prioritization.md` - germline/somatic evidence aggregation, frequency thresholds, VUS handling, and prioritization output.
- `references/pharmacogenomics-and-trials.md` - ClinPGx/CPIC handoff, PGx evidence, HLA/drug safety, PRS/GWAS evidence, and clinical trial matching.
- `references/cancer-liquid-biopsy-reporting.md` - liquid biopsy branches, ctDNA low-VAF interpretation, CHIP filtering, tumor fraction, fragmentomics, longitudinal monitoring, and report handoff.
