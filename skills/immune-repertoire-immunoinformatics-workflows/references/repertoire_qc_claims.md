# Repertoire QC and Claim Ladder

## QC summary checklist

- Input protocol, receptor chain, organism, and reference library are named.
- UMI status and preset/tool parameters are recorded.
- Alignment rate, CDR3 recovery, clonotype count, and clone fraction distribution are reported for repertoire data.
- Barcode matching, chain pairing, multichain/orphan rates, and clonotype definition are reported for single-cell VDJ.
- HLA alleles, VCF annotation state, prediction algorithms, epitope lengths, and binding thresholds are reported for neoantigens.

## Claim ladder

| Claim | Minimum evidence |
| --- | --- |
| Repertoire diversity differs | depth-aware diversity metrics, metadata, and uncertainty/statistical test |
| Clonotype expanded | explicit clonotype definition, sample/timepoint context, clone fraction or cell count |
| Shared/public clonotype | consistent receptor definition across samples/subjects and overlap metric |
| BCR affinity maturation | SHM and lineage/selection evidence with germline assumptions stated |
| Candidate peptide binder | HLA typing, peptide sequence, predictor/version, IC50 or percentile rank |
| Neoantigen candidate | somatic VEP-annotated variant, mutant peptide, HLA binding, expression/VAF support when available |
| Vaccine candidate shortlist | neoantigen evidence plus prioritization criteria and caveats; not clinical efficacy |

## Wording discipline

- Say “predicted binder” rather than “presented antigen” unless presentation evidence exists.
- Say “expanded clonotype” rather than “tumor-reactive clone” unless antigen specificity evidence exists.
- Say “candidate neoantigen” rather than “vaccine target” unless the user asks for prioritization and evidence supports it.
- Keep clinical treatment decisions out of this skill.

## Red flags

- Missing HLA for MHC prediction.
- Unannotated VCF for pVACseq.
- No sample metadata for diversity/overlap comparisons.
- Unknown UMI status for repertoire assembly.
- Single-chain data used as if paired-chain specificity were known.
