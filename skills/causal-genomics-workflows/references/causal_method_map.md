# Causal Method Map

## Question to Method

- "Does exposure X causally affect outcome Y?" Use MR panel plus sensitivity checks.
- "Could shared genetic architecture explain MR?" Add LDSC/HDL/LAVA and CHP-aware CAUSE or LHC-MR.
- "Is the same variant driving exposure and outcome at this locus?" Use coloc, coloc.susie for multi-signal loci, and p12 sensitivity.
- "Which variant set is plausible?" Use SuSiE fine-mapping with matched LD and credible set purity checks.
- "Does molecular mediator M explain X to Y?" Use two-step MR or MVMR.
- "Which gene is causal?" Combine coloc, fine-mapping, TWAS/FOCUS, cis-QTL MR, and tissue/regulatory evidence.
- "Is this a drug target?" Use cis-pQTL MR, cross-platform proteomics replication, PAV sensitivity, and target biology.
- "Are multiple traits manifestations of one factor?" Use GenomicSEM common-factor GWAS and report fit plus Q_SNP.

## Tool Families

- MR: TwoSampleMR, MendelianRandomization, MVMR, MR-PRESSO, CAUSE, LHC-MR.
- Genetic correlation: LDSC, HDL, LAVA.
- Colocalization: coloc ABF, coloc.susie, eCAVIAR-style alternatives where appropriate.
- Fine-mapping: susieR, FINEMAP, coloc.susie integrations.
- TWAS: FUSION, S-PrediXcan, S-MultiXcan, MetaXcan, FOCUS.
- Drug-target MR: cis-pQTL instrument pipelines with Olink, SomaScan, or comparable platforms.
- Common factors: GenomicSEM.

## Default Reporting Checklist

- Input datasets, ancestry, genome build, sample sizes, units, and sample overlap.
- Instrument selection parameters and retained instrument count.
- MR estimates for IVW, Egger, weighted median, and weighted mode.
- Sensitivity results and failed gates.
- Coloc PP.H4 with p12 sensitivity.
- Fine-mapping LD diagnostics and credible set purity.
- Gene-level evidence streams and claim tier.
- Explicit limitations for MHC/HLA, LD mismatch, weak instruments, or sample overlap.
