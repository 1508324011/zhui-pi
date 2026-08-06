---
name: causal-genomics-workflows
description: "End-to-end population-level causal genomics workflows from GWAS summary statistics, QTLs, and omics association evidence. Use this skill whenever the user mentions Mendelian randomization, instruments, IVW, Egger, weighted median or mode, MR-PRESSO, CAUSE, LHC-MR, colocalization, coloc, coloc.susie, susieR fine-mapping, p12 sensitivity, TWAS, FUSION, MetaXcan, FOCUS, cis-pQTL drug-target MR, Olink, SomaScan, LDSC, HDL, LAVA, GenomicSEM, common-factor GWAS, mediation, MVMR, or causal gene prioritization. Do not use for single GWAS Catalog lookups, clinical variant interpretation, primary variant calling, or generic regression."
---

# Causal Genomics Workflows

Use this skill to plan, audit, or execute causal inference workflows that start from population-level association evidence and end in defensible causal claims or prioritized effector genes. The job is not to run one method and report a p-value. The job is to make the claim survive instrument quality, pleiotropy, LD, colocalization, sample overlap, and triangulation checks.

## Scope Boundary

Use this skill for:

- Two-sample or one-sample Mendelian randomization from GWAS, eQTL, pQTL, mQTL, or other QTL summary statistics.
- Colocalization, fine-mapping, TWAS, mediation, MVMR, cis-pQTL drug-target MR, and causal gene prioritization.
- Genetic correlation diagnostics with LDSC, HDL, LAVA, or GenomicSEM when they determine causal workflow design.
- Pleiotropy and correlated-horizontal-pleiotropy-aware analyses with CAUSE or LHC-MR.

Do not use this skill for:

- Simple GWAS Catalog retrieval or SNP-trait lookup; use `gwas-database`.
- Clinical interpretation of patient variants; use `clinical-genomics-interpretation` or `clinvar-database`.
- Read alignment, variant calling, or VCF production; use `ngs-read-processing` and `variant-calling`.
- Generic linear/logistic regression APIs; use `statsmodels` or `statistical-analysis`.

## Operating Loop

1. **Normalize inputs first.** Require SNP, beta, standard error, effect allele, other allele, allele frequency when available, p-value, and sample size. Record genome build, ancestry, trait units, sample overlap, and consortium source before selecting methods.
2. **Diagnose architecture.** Estimate heritability and genetic correlation before MR. If trait heritability or polygenicity is weak, say so before running fragile downstream tools.
3. **Build instruments.** Clump against ancestry-matched LD, compute F-statistics, harmonize alleles, remove ambiguous palindromic SNPs near MAF 0.5, and keep an audit trail of excluded variants.
4. **Run primary MR as a panel.** Use IVW, MR-Egger, weighted median, and weighted mode. Directional consistency matters more than one attractive p-value.
5. **Stress-test pleiotropy.** Run heterogeneity, MR-Egger intercept, MR-PRESSO where appropriate, Steiger directionality, and leave-one-out checks. If genetic correlation is high, add CAUSE or LHC-MR.
6. **Prove shared signal.** For locus-level claims, pair MR with colocalization and fine-mapping. Use multi-signal methods when the locus is not single-signal.
7. **Triangulate gene identity.** Combine coloc, fine-mapped credible sets, TWAS/FOCUS, cis-pQTL MR, regulatory annotation, expression specificity, and druggability. Do not call a gene causal from TWAS alone.
8. **Grade the claim.** Report evidence tier, passing gates, failed gates, and the exact reason a claim is causal, suggestive, or unsupported.

## Evidence Ladder

- **Unsupported association**: GWAS or QTL association only; no valid causal workflow or shared-signal evidence.
- **Suggestive causal evidence**: Valid instruments and at least one MR estimator support the effect, but sensitivity, colocalization, or fine-mapping is incomplete.
- **Triangulated causal evidence**: MR estimators agree in direction, pleiotropy checks do not contradict the claim, and coloc/fine-mapping supports a shared variant or credible set.
- **Effector gene candidate**: Triangulated locus evidence plus at least three independent gene-level evidence streams converge on the same gene.
- **Drug-target grade**: cis-pQTL MR is directionally consistent across Olink and SomaScan or comparable platforms, PAV exclusion sensitivity passes, and biology/druggability support the target.

## Failure Policy

Crash loudly on missing required columns, incompatible genome builds, impossible allele harmonization, ancestry-mismatched LD for fine-mapping, or undocumented sample overlap. Do not hide failed gates behind softer language. A negative or fragile result is still useful if it prevents a false causal story.

## Reference Routing

Read only what the branch needs:

- `references/causal_workflow_scope.md` for the end-to-end workflow map.
- `references/causal_qc_gates.md` for numeric gates and claim thresholds.
- `references/causal_failure_traps.md` for common false-positive patterns.
- `references/causal_claim_ladder.md` for reporting language and evidence tiers.
- `references/causal_method_map.md` for method selection by question type.
