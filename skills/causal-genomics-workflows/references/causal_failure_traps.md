# Causal Failure Traps

## MR Traps

- MR-PRESSO is not sensitive to correlated horizontal pleiotropy. A negative MR-PRESSO result does not mean pleiotropy is absent.
- Sample overlap treated as clean two-sample MR can bias estimates, especially UKB-on-UKB designs.
- Weak instruments create attractive but unstable estimates. Do not rescue them with more sensitivity plots.
- Directional consistency across MR estimators is required for strong language. A single significant IVW result is not enough.
- MR-Egger is fragile under NOME violation. If I2GX is low, do not center the conclusion on Egger.

## Genetic Correlation Traps

- HDL can be biased by sample overlap. Check overlap before interpreting high rg as biology.
- A nonzero LDSC intercept is not evidence that genetic correlation is biased. The intercept and rg answer different questions.
- High rg does not itself prove causality; it tells you to model shared architecture and correlated pleiotropy.

## Colocalization and Fine-Mapping Traps

- Single-signal coloc can mislead in multi-signal loci. Use coloc.susie or condition on signals.
- LD reference mismatch can invert confidence. If SuSiE lambda is above 0.05, fine-map and coloc conclusions are suspect.
- MHC/HLA and other extreme LD regions need special handling, explicit caveats, or exclusion.
- p12 priors can dominate conclusions. Always sweep plausible values.

## TWAS and Gene Claims

- TWAS significance alone is not causality. It can reflect LD tagging, co-expression, or model artifacts.
- A single top TWAS gene is not an effector gene unless FOCUS, coloc, cis-MR, or credible-set evidence converges.
- Tissue mismatch can create plausible but irrelevant gene stories. Pick tissue before interpreting the hit.

## Drug-Target MR Traps

- cis-pQTL instruments can tag protein-altering variants that affect assay binding rather than protein abundance. Use PAV exclusion sensitivity.
- Platform-specific protein effects should not be sold as target biology unless replicated across platforms.
- Trans-pQTL instruments often encode pathway effects rather than target perturbation.
