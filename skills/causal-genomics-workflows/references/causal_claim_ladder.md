# Causal Claim Ladder

Use this ladder to keep language proportional to evidence.

## Level 0: Association Only

Use when the workflow has GWAS, QTL, or TWAS association without valid causal triangulation.

Language:

- "associated with"
- "prioritized for follow-up"
- "not sufficient for causal inference"

Avoid:

- "causal"
- "mediates"
- "drug target"

## Level 1: MR-Suggestive

Use when instruments pass basic gates and primary MR supports the effect, but sensitivity or coloc evidence is incomplete.

Required evidence:

- Valid harmonized instruments.
- F-statistics pass threshold.
- At least one primary estimator supports the direction.
- No obvious fatal sensitivity failure.

Language:

- "MR-supported"
- "consistent with a causal effect"
- "requires coloc or fine-mapping confirmation"

## Level 2: Triangulated Locus

Use when MR and shared-signal evidence agree.

Required evidence:

- MR estimator direction agreement.
- Pleiotropy and directionality checks do not contradict the claim.
- Coloc PP.H4 passes the chosen threshold and p12 sensitivity.
- Fine-mapping credible sets are clean enough to trust the locus.

Language:

- "triangulated causal evidence at the locus"
- "shared causal signal is supported"
- "causal interpretation is supported under tested assumptions"

## Level 3: Effector Gene Candidate

Use when a specific gene is supported by multiple independent streams.

Required evidence:

- At least three of six streams agree: MR, coloc, fine-mapping, TWAS/FOCUS, cis-pQTL MR, tissue/regulatory biology.
- No stronger competing gene in the credible set.
- Tissue and direction of effect are biologically coherent.

Language:

- "effector gene candidate"
- "high-priority causal gene candidate"
- "gene-level evidence converges on"

## Level 4: Drug-Target Grade

Use when perturbing the target is supported by protein-level causal evidence and platform sensitivity checks.

Required evidence:

- cis-pQTL drug-target MR.
- Cross-platform direction consistency, ideally Olink and SomaScan.
- PAV exclusion sensitivity passes.
- Coloc or fine-mapping supports target-specific signal.
- Biology and safety context are stated.

Language:

- "drug-target-grade genetic support"
- "genetically supported target hypothesis"
- "directionally supported therapeutic perturbation hypothesis"
