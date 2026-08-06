# Differential And Time-Course Analysis

## Design First

Write the biological contrast in plain language before writing a formula. Then map it to design terms.

Common patterns:

- Simple treatment: `~ condition`
- Batch-adjusted treatment: `~ batch + condition`
- Paired or donor-aware: `~ donor + condition`
- Interaction: `~ genotype + treatment + genotype:treatment`
- Time-course LRT: full model with time or splines, reduced model without temporal term.

Do not include covariates that are perfectly confounded with the condition. If the design matrix is rank deficient, stop and report that the requested contrast is not estimable.

## Method Selection

| Situation | Method |
| --- | --- |
| Standard bulk RNA-seq counts | DESeq2 or edgeR quasi-likelihood. |
| Python-native workflow | PyDESeq2 when DESeq2 semantics are needed. |
| Many covariates or linear-model-style transformed expression | limma-voom when appropriate. |
| Few replicates | Conservative DESeq2/edgeR, emphasize power limits. |
| Time-course | DESeq2 LRT, limma splines, maSigPro, ImpulseDE2, GAMs, or Mfuzz modules depending on sampling design. |

## Diagnostics

- Dispersion trend for count models.
- PCA and sample distances before and after modeling decisions.
- MA plot and volcano plot with thresholds stated.
- P-value histogram for obvious pathologies.
- Cook's distance/outlier handling if relevant.
- Shrinkage method for log fold changes, such as apeglm when available.

## Time-Course Rules

- Avoid replacing a temporal design with every pairwise time comparison unless the user explicitly asks for that.
- Use ordered time and splines/GAMs when the trajectory is continuous.
- For clustering, z-score per gene across time, choose a plausible cluster count, and check empty clusters and membership quality.
- For rhythmic studies, confirm period, sampling interval, replicates, and phase interpretation before running rhythm detection.

## Output Contract

Return a reproducible package of:

- Count-filtering rule and design formula.
- Contrast definitions.
- Full result table plus significant subset.
- Diagnostic figures.
- Version/resource notes.
- Caveats on outliers, power, confounding, or low annotation quality.
