---
name: proteomics-metabolomics-workflows
description: End-to-end mass-spectrometry omics workflow skill for LC-MS/MS proteomics and LC-MS/GC-MS metabolomics from raw or exported data to QC, normalization, differential abundance, annotation, pathway interpretation, and report handoff. Use for MaxQuant/DIA-NN/proteinGroups, mzML/mzTab/MGF, pyOpenMS/OpenMS, XCMS/MS-DIAL, peptide/protein inference, LFQ/TMT/SILAC/DIA, spectral library workflows, matchms candidate ranking, HMDB/Metabolomics Workbench/PubChem/ChEMBL annotation, metabolite confidence levels, QC samples, missingness, imputation, limma/DEqMS/proDA, and multi-omics handoff. For pyOpenMS API details use pyopenms; for spectrum-level similarity use matchms; for direct compound lookup use database skills.
license: Unknown
---

# Proteomics Metabolomics Workflows

## Purpose

Use this skill for study-level mass-spectrometry omics workflows. It coordinates proteomics and metabolomics data import, QC, normalization, missingness handling, differential abundance, annotation, and pathway or multi-omics handoff.

Keep tool APIs separate from workflow decisions. Use `pyopenms` for direct OpenMS/Python operations, `matchms` for spectrum-level matching, and chemical database skills for single-source lookup.

## When To Use

Use this skill when the request involves:

- Processing MaxQuant `proteinGroups.txt`, DIA-NN reports, mzML/mzTab/MGF, or exported MS feature matrices
- Proteomics QC, contaminant/reverse filtering, missingness, normalization, imputation, protein inference, or differential abundance
- LFQ, TMT/iTRAQ, SILAC, DIA, PTM, or spectral-library proteomics study workflows
- Untargeted LC-MS/GC-MS metabolomics with XCMS/MS-DIAL-style peak detection, RT alignment, grouping, gap filling, QC normalization, and statistics
- Metabolite annotation using m/z, retention time, MS/MS library match, HMDB, Metabolomics Workbench, PubChem, ChEMBL, KEGG, or RefMet evidence
- Mapping significant proteins/metabolites to pathways or preparing a multi-omics interpretation handoff

Do not use this skill for:

- A single pyOpenMS class/function/API question; use `pyopenms`
- A single cosine or modified-cosine spectral similarity task; use `matchms`
- A direct HMDB, Metabolomics Workbench, PubChem, or ChEMBL lookup; use the database skill
- General cheminformatics descriptors, PAINS, or molecular filtering; use `rdkit` or `medchem`
- Raw instrument acquisition method development

## Operating Loop

1. Classify the assay: LFQ/TMT/SILAC/DIA proteomics, PTM proteomics, untargeted metabolomics, lipidomics, targeted metabolomics, or exported feature table.
2. Lock metadata: sample sheet, condition, batch, injection order, QC samples, instrument mode, search engine, database, FDR, and output versions.
3. Import and clean: remove contaminants/reverse/only-by-site proteins or blank/QC artifacts before statistics.
4. Choose normalization and imputation based on assay and missingness; do not hide systematic missingness as random noise.
5. Run QC gates before differential testing.
6. Choose statistics: limma default, DEqMS/proDA/MSstats for proteomics-specific designs, appropriate targeted or untargeted metabolomics testing.
7. Annotate with confidence levels and database provenance.
8. Export matrices, differential tables, QC plots, annotation evidence, parameters, and unresolved warnings.

## Decision Points

| Scenario | Primary Route | Notes |
|---|---|---|
| MaxQuant LFQ proteomics | Filter contaminants/reverse, log2 LFQ, missingness, limma/DEqMS | Keep `proteinGroups.txt` column provenance. |
| DIA-NN proteomics | Report import, protein matrix, normalization, limma/MSstats | Preserve run and library mode. |
| TMT/iTRAQ | Channel/reference normalization and protein summarization | Batch and bridge channels matter. |
| PTM proteomics | Site localization and modification-specific inference | Separate site-level and protein-level conclusions. |
| XCMS metabolomics | Peak detection, RT alignment, grouping, gap filling, QC normalization | Tune parameters from peak width and RT behavior. |
| MS-DIAL export | Validate exported alignment table, annotation fields, and areas | Do not assume XCMS field names. |
| Spectral matching | Use `matchms` for spectrum scores, synthesize here | Candidate ranking is not final ID without evidence level. |
| Pathway handoff | Map significant proteins/metabolites to pathway IDs | Preserve identifier and annotation confidence. |

## QC Gates

| Stage | Gate |
|---|---|
| Proteomics import | More than 1000 protein groups is a basic sanity check for typical discovery data. |
| Contaminant filtering | Remove contaminants, reverse hits, and only-by-site entries before downstream stats. |
| Proteomics missingness | Sample missingness should generally stay below 40%; remove proteins with excessive missingness before imputation. |
| Proteomics QC | Replicates should cluster by biology after normalization; unexpected PCA/correlation patterns require batch review. |
| Metabolomics peak detection | More than 1000 features is a minimal sanity check; good untargeted runs often exceed this. |
| RT alignment | Retention-time deviation should be controlled; >30 s drift requires parameter or run review. |
| Feature grouping | Grouping success should be reasonable, roughly >60% unless assay-specific reasons exist. |
| QC samples | QC feature RSD/CV should usually be <30% for retained features. |
| Annotation | m/z-only annotation is low confidence; MS/MS/library/RT/database evidence should be reported separately. |

## Failure Policy

Stop instead of smoothing over:

- Missing sample metadata or mismatched sample names
- No QC samples when QC-based normalization is requested
- Unclear proteomics search/database/FDR settings
- High missingness interpreted without missingness mechanism review
- Metabolite IDs assigned from m/z alone as if confirmed
- Mixed feature-matrix orientation or renamed columns with no provenance
- Pathway interpretation from unqualified ambiguous metabolite/protein identifiers

## Reference Files

- `references/proteomics-lcms-workflow.md` - MaxQuant/DIA-NN/pyOpenMS proteomics import, QC, normalization, imputation, differential abundance, PTM/DIA/TMT variants.
- `references/metabolomics-annotation-qc.md` - XCMS/MS-DIAL routes, QC samples, RT alignment, feature matrices, spectral matching, annotation confidence, and targeted metabolomics.
- `references/multiomics-pathway-handoff.md` - pathway mapping, identifier discipline, multi-omics handoff, database use, and common reporting traps.
