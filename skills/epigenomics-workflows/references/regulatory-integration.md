# Regulatory Integration

## Coordinate Discipline

Before integration, confirm all assays use the same genome build, chromosome naming, coordinate convention, blacklist, and annotation release. LiftOver is a transformation, not a clerical step; report it and validate losses.

## Consensus Regions

- Build one fixed universe for differential accessibility or binding.
- Use reproducible methods such as IDR, iterative overlap, summits expanded to fixed widths, or condition-aware unions.
- Do not compare differential results from changing peak universes.

## Interpretation Routes

| Question | Route |
| --- | --- |
| Which TFs may drive accessibility changes? | Motif enrichment, chromVAR, footprinting, and expression concordance. |
| Which genes may be affected by peaks? | Peak-to-gene annotation, enhancer-gene linking, Hi-C/HiChIP/Micro-C contacts, ABC/rE2G when inputs exist. |
| Are regulatory changes tied to expression? | Integrate differential accessibility/binding/methylation with expression DE using matched conditions. |
| Are variants regulatory? | Add allele-specific accessibility, caQTL, WASP correction, or chromBPNet/EnFormer-style variant effect only when data supports it. |

## Cross-Assay Warnings

- Nearest-gene annotation is not causal evidence.
- Hi-C loops, co-accessibility, motifs, and expression concordance are supporting evidence with different failure modes.
- Methylation direction is context-dependent; promoter hypermethylation and gene-body methylation do not imply the same biology.
- Motif enrichment does not prove TF activity without expression, footprint, or perturbation evidence.

## Reporting Minimum

- Genome build and annotation versions.
- Region universe definition.
- Assay-specific QC summary.
- Differential models and covariates.
- Integration evidence type for each claimed regulatory link.
- Limitations and validation status.
