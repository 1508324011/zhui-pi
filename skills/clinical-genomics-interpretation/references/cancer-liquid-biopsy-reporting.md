# Cancer Liquid Biopsy Reporting

## Branch Selection

| Input | Route | Do Not Do |
|---|---|---|
| Deep targeted ctDNA panel | Low-VAF calling review, UMI support, CHIP filtering | Do not skip CHIP review. |
| sWGS cfDNA | Tumor fraction/CNV with ichorCNA-like tools | Do not use as point mutation detection. |
| Fragmentomics | Fragment-size and coverage pattern evidence | Do not treat as mutation evidence. |
| Serial samples | Longitudinal tumor fraction/VAF dynamics | Do not compare without baseline/timepoint metadata. |

## cfDNA And ctDNA QC

- Confirm pre-analytical metadata: tube type, processing delay, hemolysis, extraction, storage
- Expected cfDNA modal fragment size is about 167 bp; practical acceptable peak is 150-180 bp
- UMI consensus evidence should support claims below 1% VAF
- CHIP genes must be reviewed before interpreting plasma variants as tumor-derived
- Low VAF claims require depth, strand, UMI family, background error, and panel context

## Tumor Fraction Interpretation

- sWGS 0.1-1x is the intended input range for ichorCNA-style tumor fraction
- >=10% tumor fraction: high signal
- 3-10%: intermediate signal; report uncertainty and QC context
- <3%: near lower-confidence zone; avoid strong negative/positive claims

## Longitudinal Monitoring

Sort samples by timepoint and preserve treatment dates. Report baseline, nadir, current value, and assay used.

Suggested qualitative classes:

- Complete molecular response: signal near undetectable after baseline positivity
- Major molecular response: >2 log reduction from baseline
- Partial molecular response: substantial but incomplete reduction
- Stable/progression: no meaningful reduction or rising signal

## Report Handoff

Pass structured evidence to `clinical-reports` or `clinical-decision-support` only after:

- Variant/cfDNA signal provenance is clear
- CHIP review is explicit
- Trial or therapy links cite source and date
- VUS/weak/low-confidence evidence remains labeled as such
