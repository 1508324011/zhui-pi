# Causal Workflow Scope

## Inputs

Require a declared analysis unit and enough metadata to make the design reproducible:

- Exposure GWAS or QTL summary statistics.
- Outcome GWAS summary statistics.
- Required columns: SNP, beta, standard error, effect allele, other allele, p-value, and sample size.
- Strongly preferred columns: allele frequency, chromosome, position, imputation quality, cohort or consortium source, ancestry, genome build, and trait units.
- LD reference that matches ancestry and genome build.
- Optional QTL layers: eQTL, sQTL, pQTL, mQTL, chromatin QTL, or single-cell QTL.

## Core Workflow

1. **Architecture diagnostics**
   - Estimate SNP heritability for exposure and outcome when possible.
   - Estimate genetic correlation with LDSC, HDL, or LAVA.
   - Use tissue and cell-type relevance to prioritize QTL context before gene claims.

2. **Instrument construction**
   - Select genome-wide significant or justified cis instruments.
   - Clump with ancestry-matched LD.
   - Harmonize alleles and drop ambiguous palindromic SNPs near MAF 0.5.
   - Compute F-statistics and variance explained.

3. **Primary MR panel**
   - Run IVW, MR-Egger, weighted median, and weighted mode.
   - Report effect units and direction consistently.
   - Treat estimator agreement as a design check, not decoration.

4. **Sensitivity and pleiotropy checks**
   - Heterogeneity: Cochran Q or comparable metric.
   - Horizontal pleiotropy: MR-Egger intercept and MR-PRESSO where assumptions fit.
   - Direction: Steiger filtering.
   - Influence: leave-one-out and single-SNP checks.

5. **Correlated horizontal pleiotropy branch**
   - If genetic correlation is high or biology suggests shared upstream causes, add CAUSE or LHC-MR.
   - Interpret MR-PRESSO carefully; it is not a CHP detector.

6. **Colocalization**
   - Use coloc ABF for simple loci and coloc.susie for multi-signal loci.
   - Sweep p12 priors and report sensitivity.
   - Do not claim causality from MR if exposure and outcome do not share a credible signal.

7. **Fine-mapping**
   - Use SuSiE or equivalent summary-statistic fine-mapping with matched LD.
   - Check LD mismatch and credible set purity.
   - Feed credible sets into coloc and gene prioritization.

8. **Mediation and MVMR**
   - Use two-step MR or MVMR when the question is pathway structure rather than a single exposure-outcome effect.
   - Validate instruments for each exposure separately.

9. **TWAS and FOCUS**
   - Use FUSION, MetaXcan, or comparable TWAS methods for transcriptome association.
   - Use FOCUS or posterior inclusion logic before naming one gene.
   - Pair TWAS with coloc or cis-MR before making causal gene claims.

10. **Drug-target cis-pQTL MR**
    - Use cis-pQTL instruments for target proteins.
    - Replicate across proteomics platforms such as Olink and SomaScan where possible.
    - Run PAV exclusion or equivalent variant-sensitivity checks.

11. **Effector gene integration**
    - Combine MR, coloc, fine-mapping, TWAS/FOCUS, cis-pQTL, expression specificity, regulatory annotation, and pathway biology.
    - Require convergence across independent evidence streams for strong prioritization.

12. **Optional GenomicSEM**
    - Use common-factor GWAS when multiple correlated traits define the phenotype better than any one trait.
    - Report model fit and heterogeneity statistics.
