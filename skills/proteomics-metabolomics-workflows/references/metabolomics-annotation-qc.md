# Metabolomics Annotation QC

## Inputs To Confirm

- Raw mzML/mzXML, XCMS object/export, MS-DIAL alignment table, MGF/MSP libraries, or targeted concentration matrix
- Mode: LC-MS, GC-MS, lipidomics, targeted assay, or untargeted discovery
- QC samples, blanks, injection order, batch, ion mode, adduct rules, retention-time standards, and sample metadata

## XCMS-Style Route

1. Load raw data with sample metadata.
2. Choose peak detection parameters from expected peak width, ppm, noise, and instrument mode.
3. Align retention time and inspect drift.
4. Group peaks into features and gap fill.
5. Remove blank/QC artifacts and features with excessive missingness.
6. Normalize using QC-aware or study-appropriate method.
7. Run PCA, QC-RSD, batch, and injection-order checks.
8. Test differential abundance and annotate features.

## MS-DIAL Route

Validate the exported alignment table before statistics:

- Feature ID, m/z, RT, area/intensity columns, annotation score, adduct, MS/MS match, and sample columns
- Matrix orientation and sample name mapping
- Whether MS-DIAL already performed peak detection, alignment, gap filling, and annotation attempts

## Annotation Confidence

| Evidence | Confidence |
|---|---|
| Authentic standard with RT/MS/MS match | Highest |
| MS/MS library match with precursor/adduct/RT support | High |
| Accurate mass + isotope/adduct + database candidate | Medium |
| m/z-only candidate | Low; report as putative only |

Use `matchms` for spectrum-level scoring, `hmdb-database` and `metabolomics-workbench-database` for metabolite resources, and `pubchem-database`/`chembl-database` for chemical cross-reference. This workflow owns the evidence synthesis.

## QC Gates

- Feature count >1000 for typical discovery runs
- Retention-time deviation controlled; investigate >30 s drift
- Feature grouping success roughly >60% unless assay-specific
- QC feature RSD/CV <30% for retained features
- Blanks and carryover reviewed before biological conclusions

## Targeted Metabolomics

Targeted assays need calibration, internal standards, LOD/LOQ, accuracy, precision, and dilution checks. Do not analyze targeted concentration data as untargeted peak intensity unless the user explicitly requests exploratory analysis.
