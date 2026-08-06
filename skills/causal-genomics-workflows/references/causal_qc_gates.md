# Causal QC Gates

These gates are defaults for workflow design and claim grading. Tighten them for clinical, industrial, or high-cost follow-up decisions.

## Heritability and Genetic Correlation

- LDSC mean chi-square should be greater than 1.02 for stable downstream interpretation.
- SNP heritability standard error should be less than 0.02 when using heritability as a decision point.
- LDSC intercept ratio should be less than 0.3.
- Absolute genetic correlation greater than 0.3 triggers correlated-horizontal-pleiotropy-aware analysis with CAUSE, LHC-MR, or a similarly explicit model.

## Instruments

- Two-sample MR: F-statistic greater than 10.
- One-sample MR: prefer F-statistic greater than 20.
- Drop palindromic A/T or C/G variants near MAF 0.5 unless allele frequency resolves orientation clearly.
- Use ancestry-matched LD for clumping and report clump r2 and window.
- Report how many instruments were selected, dropped, harmonized, and retained.

## MR Claim Gates

- Strong MR evidence requires IVW, MR-Egger, weighted median, and weighted mode to agree in effect direction.
- Treat MR-Egger as a sensitivity estimator, not the primary estimator, when I2GX or NOME is below 0.9.
- Heterogeneity, MR-Egger intercept, MR-PRESSO, Steiger, and leave-one-out checks must not contradict the main claim.
- Sample overlap must be stated. UKB-on-UKB or same-biobank exposure/outcome designs need explicit bias discussion or alternative methods.

## Colocalization

- PP.H4 >= 0.7 supports triangulation when paired with other evidence.
- PP.H4 >= 0.8 is a reasonable publication-grade threshold.
- PP.H4 >= 0.95 is a conservative industrial or high-confidence threshold.
- p12 sensitivity is mandatory. A claim that collapses under plausible p12 priors is fragile.
- Use coloc.susie or equivalent multi-signal logic when the locus has multiple independent signals.

## Fine-Mapping

- SuSiE `estimate_s_rss` lambda should be below 0.05.
- Credible set purity should have `min_abs_corr >= 0.5`.
- LD reference ancestry and genome build must match the summary statistics.
- Fine-mapping and coloc results are not trustworthy when LD mismatch diagnostics fail.

## TWAS and Gene-Level Prioritization

- FOCUS PIP >= 0.8 is the minimum for retaining a single-gene candidate from TWAS-style evidence.
- TWAS significance without coloc, cis-MR, or credible-set support is not causal evidence.
- Effector gene claims need at least three of six independent streams to align: MR, coloc, fine-mapping, TWAS/FOCUS, cis-pQTL, expression/regulatory biology.

## Drug-Target MR

- Olink and SomaScan, or comparable independent proteomics platforms, should agree in effect direction.
- PAV exclusion or variant-sensitivity analysis must not remove the core signal.
- Use cis instruments unless the question explicitly justifies trans instruments and their pleiotropy risk.

## GenomicSEM

- CFI should be greater than 0.95.
- RMSEA should be less than 0.06.
- Always report Q_SNP for variant heterogeneity around the common factor.
