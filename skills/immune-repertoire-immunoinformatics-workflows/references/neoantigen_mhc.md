# Neoantigen and MHC Workflows

## Peptide/MHC binding route

1. Confirm HLA alleles, species, MHC class, peptide lengths, and prediction tool.
2. For MHC-I, scan 8-11mers, commonly 9mers, with tools such as MHCflurry, NetMHCpan, or IEDB.
3. For MHC-II, use longer peptides, commonly 13-25aa or tool-specific windows.
4. Prefer percentile ranks for cross-allele comparison when available.
5. Report binding categories and the tool/database version.

## Binding thresholds

- IC50 under 50 nM: strong binder.
- IC50 50-500 nM: moderate binder.
- IC50 500-5000 nM: weak binder.
- IC50 over 5000 nM: nonbinder.
- Percentile under 0.5%: strong; 0.5-2%: moderate; over 2%: weak/nonbinder.

## pVACtools neoantigen route

1. Start from a VEP-annotated somatic VCF and patient HLA alleles.
2. Ensure VEP annotations include protein consequences and pVACtools-required fields; Downstream/Wildtype plugin output may be required.
3. Run pVACseq with selected algorithms such as MHCflurry, MHCnuggets, NetMHCpan, or IEDB where installed.
4. Use MHC-I epitope lengths 8-11 and MHC-II around 15 or tool-specific defaults unless the user specifies otherwise.
5. Prioritize candidates using mutant binding, wildtype binding, agretopicity, tumor DNA/RNA VAF, expression, clonality, and self-similarity/tolerogenic red flags.
6. Produce a candidate table, not a treatment recommendation.

## QC gates

- HLA typing is present and formatted for the chosen tool.
- VCF is somatic and VEP-annotated; primary variant calling is complete before this branch starts.
- Binding threshold is stated, commonly 500 nM default and stronger priority under 50 nM.
- Expression and tumor VAF/clonality are used when available.
- Candidate counts are plausible; typical filtered vaccine candidate sets often land around 10-50 but depend on tumor type and filters.

## Common traps

- Treating binding prediction as immunogenicity proof.
- Running pVACtools on an unannotated or germline-only VCF.
- Ignoring wildtype binding and self-similarity.
- Ranking candidates without expression support when RNA evidence exists.
- Mixing MHC-I and MHC-II thresholds without stating class-specific assumptions.
