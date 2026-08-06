# Immune Router

## Use this workflow skill

- TCR/BCR clonotype assembly, CDR3 analysis, V(D)J gene usage, repertoire diversity, overlap, clonal tracking, or public clone analysis.
- MiXCR, VDJtools, Immcantation, AIRR/Change-O, scirpy, BCR SHM, lineage trees, BASELINe selection, or single-cell VDJ integration.
- HLA typing plus peptide/MHC binding prediction, pVACtools, pVACseq, MHCflurry, NetMHCpan, IEDB, BepiPred, neoantigen ranking, or vaccine candidate prioritization.
- TCR-epitope binding or antigen specificity prediction.

## Route elsewhere

- Generic scRNA-seq QC/clustering/annotation with no VDJ question: use `single-cell-workflows`.
- Calling variants from BAM/CRAM/FASTQ or generating the somatic VCF: use `variant-calling`.
- Low-level AnnData reading/writing: use `anndata`.
- Clinical treatment plan or bedside recommendation: use a clinical skill and keep this workflow as evidence generation only.

## Required intake questions

Ask only for missing facts that change the route:

- Data type: bulk TCR/BCR FASTQ, MiXCR/VDJtools table, AIRR/Change-O table, 10x VDJ, scRNA object, peptide list, VEP-annotated VCF.
- Receptor: TCR alpha/beta, gamma/delta, BCR heavy/light, paired or unpaired chains.
- Protocol: UMI/non-UMI, amplicon/RNA-seq/10x VDJ, organism, library kit.
- Metadata: sample/timepoint/condition, subject IDs, treatment, tissue, cell states.
- For neoantigens: HLA alleles, VEP annotation status, tumor/normal VAF, expression evidence, epitope lengths, MHC-I/MHC-II scope.

## Evidence separation

| Evidence | Supports | Does not prove |
| --- | --- | --- |
| Expanded clonotype | immune expansion or selection candidate | antigen specificity by itself |
| Shared/public clone | convergence or exposure hypothesis | functional response without validation |
| High SHM | affinity maturation history | binding to a named antigen |
| Strong MHC binding | presentation candidate | immunogenicity or clinical efficacy |
| pVACtools rank | prioritized neoantigen candidate | vaccine success |
