# Multiomics Pathway Handoff

## Identifier Discipline

Pathway and multi-omics interpretation fails when IDs drift. Preserve:

- Protein identifiers: UniProt, gene symbol, protein group, peptide evidence, organism, database version
- Metabolite identifiers: HMDB, KEGG, PubChem CID, InChIKey, RefMet, adduct, m/z, RT, annotation level
- Statistical context: universe/background, filtering, adjusted p-values, direction, and effect size

## Pathway Routes

| Input | Route |
|---|---|
| Differential proteins | Reactome/KEGG/STRING/enrichment handoff after ID cleanup |
| Differential metabolites | KEGG/MetaboAnalyst/HMDB pathway mapping with annotation confidence |
| Protein + metabolite results | Joint table by pathway, direction, and confidence |
| Weak metabolite annotation | Keep pathway interpretation exploratory |

## Handoff To Other Skills

- Use `omics-differential-workflows` when integrating with transcriptomics DE results.
- Use `kegg-database`, `reactome-database`, and `string-database` for direct pathway/API/network retrieval.
- Use `scientific-visualization` after workflow decisions are final and figures need publication polish.

## Reporting Minimum

- Analysis branch and software versions
- Normalization/imputation/statistical method
- QC pass/fail summary and unresolved warnings
- Annotation confidence and database versions
- Differential protein/metabolite tables
- Pathway summary with background/universe and limitations

## Common Traps

- Mapping low-confidence m/z-only metabolites into definitive pathway claims
- Mixing gene symbols and UniProt IDs without versioned mapping
- Omitting the tested universe/background in enrichment
- Ignoring direction of change in pathway interpretation
- Comparing proteomics and metabolomics without harmonizing sample metadata
