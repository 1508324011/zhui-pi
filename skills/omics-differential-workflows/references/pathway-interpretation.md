# Pathway Interpretation

## Choose ORA Or GSEA

| Input | Use | Reason |
| --- | --- | --- |
| Full ranked DE result with statistic for all tested genes | GSEA | Avoids arbitrary cutoffs and uses directionality. |
| Clear significant gene list from DE, co-expression, screens, or GWAS | ORA | Works when no full ranking exists. |
| RNA-seq with strong gene-length bias concern | GOseq or length-aware method | Standard ORA can overcall long genes. |
| Multiple contrasts | compareCluster, mitch, or unified multi-contrast framework | Do not compare p-values from incompatible backgrounds. |

When in doubt, run both ORA and GSEA and emphasize concordant biology.

## Non-Negotiable Inputs

- Tested background universe, usually all genes tested in the DE model with non-missing p-values.
- Gene ID type and organism.
- ID conversion success rate and duplicate handling policy.
- Directional ranked list for GSEA, preferably Wald statistic, moderated t-statistic, or signed statistic.
- Database versions for GO, KEGG, Reactome, WikiPathways, MSigDB, or custom GMT.

## Common Pitfalls

- Using the full genome as background after filtering the expression matrix.
- Running ORA on only upregulated and downregulated genes together when direction matters.
- Treating redundant GO terms as independent discoveries.
- Comparing enrichment p-values across contrasts with different universes.
- Losing half the genes during symbol-to-Entrez conversion and still interpreting the result as complete.
- Using direct KEGG/Reactome API lookups as a substitute for a statistically defined enrichment test.

## Reporting Minimum

- Method: ORA, GSEA, GOseq, compareCluster, or other.
- Gene universe size, input gene count, converted gene count, and dropped IDs.
- P-value adjustment method and threshold.
- Top terms with gene ratio, background ratio, adjusted p-value, and leading-edge/core genes when applicable.
- Dot plot or enrichment map with redundant terms simplified when appropriate.
