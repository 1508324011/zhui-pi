# Variant Evidence And Prioritization

## Inputs To Confirm

- Variant file/table, genome build, transcript set, caller, filter status, sample ID, and disease/phenotype context
- Source versions for ClinVar, gnomAD, dbSNP, GWAS Catalog, COSMIC, or local annotations
- Inheritance model, tumor/normal relationship, population ancestry, and intended use
- Whether variants are germline, somatic, pharmacogenomic, structural, or liquid-biopsy signals

## Evidence Tiers

| Evidence | Use |
|---|---|
| ClinVar classification | Clinical assertion and review status; preserve conflicts. |
| gnomAD frequency | Frequency filter; default rare AF < 0.01 unless phenotype requires stricter thresholds. |
| GWAS/PRS | Trait association evidence; not direct diagnosis. |
| Computational predictors | Supporting evidence only; never outweigh high-quality clinical assertions alone. |
| COSMIC/cancer genes | Somatic/cancer context; not germline pathogenicity by itself. |
| Literature/curated guidelines | Use for final synthesis when source and date are recorded. |

## Prioritization Rules

1. Keep non-PASS or low-confidence calls visible but separated.
2. Use genome-build-matched resources only.
3. Filter by allele frequency before claiming rare-disease relevance.
4. Separate ClinVar Pathogenic/Likely pathogenic, VUS, Benign/Likely benign, and conflicts.
5. Preserve inheritance model assumptions instead of baking them into a hidden score.
6. Report computational scores as supporting evidence, not decisive evidence.

## Output Contract

Every prioritized table should include:

- Variant ID, coordinates, build, alleles, gene, transcript, consequence
- Caller/filter status, depth, VAF or genotype context where available
- ClinVar significance, review status, conflict flag, and accession/source date
- Population frequency source and ancestry-specific value where available
- Disease/phenotype association source
- Interpretation tier, rationale, limitations, and downstream report target

## Common Failures

- Treating VUS as actionable
- Combining GRCh37 and GRCh38 coordinates without liftover provenance
- Reporting a pathogenic classification without review status or source date
- Using GWAS p-values as individual diagnosis
- Hiding conflicting submissions in a single merged label
