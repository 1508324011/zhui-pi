---
name: immune-repertoire-immunoinformatics-workflows
description: End-to-end immune receptor repertoire and immunoinformatics workflow skill for TCR/BCR V(D)J, MiXCR, VDJtools, Immcantation, scirpy, clonotype assembly, repertoire diversity, overlap, clonal tracking, BCR somatic hypermutation and lineage analysis, single-cell VDJ plus scRNA integration, MHC binding, pVACtools neoantigen prediction, MHCflurry, NetMHCpan, IEDB, BepiPred, TCR-epitope binding, and vaccine candidate prioritization. Use whenever VDJ, clonotypes, CDR3, TCR/BCR repertoire, scirpy, AIRR, Change-O, pVACseq, HLA typing, MHC-I/MHC-II binding, or neoantigen ranking is central. For generic scRNA clustering without VDJ use single-cell-workflows; for primary variant calling or VCF generation use variant-calling; for low-level AnnData operations use anndata.
---

# Immune Repertoire and Immunoinformatics Workflows

Use this skill when the user’s central biological question is immune receptor specificity, clonality, repertoire dynamics, B-cell evolution, antigen binding, or neoantigen prioritization. The workflow spans bulk and single-cell TCR/BCR analysis plus peptide/HLA immunoinformatics. Keep primary variant calling, generic single-cell clustering, and low-level object manipulation in their narrower skills.

## Operating Loop

1. Classify the branch: bulk TCR/BCR repertoire, single-cell VDJ plus expression, BCR SHM/lineage, peptide-MHC binding, neoantigen prioritization, or TCR-epitope matching.
2. Lock inputs and metadata: organism, receptor chain, library protocol, UMI status, sample/timepoint, treatment, HLA alleles, VCF annotation state, expression support, and clinical/research context.
3. Choose the tool family by data structure: MiXCR for raw V(D)J reads, VDJtools for repertoire tables, Immcantation for BCR lineage/SHM, scirpy for single-cell AIRR/10x VDJ integration, pVACtools/MHCflurry/NetMHCpan/IEDB for peptide/HLA workflows.
4. QC before claims: alignment/CDR3 recovery, clonotype definitions, chain pairing, diversity depth, replicate/timepoint metadata, HLA typing, VCF annotation, binding thresholds, and expression/VAF support.
5. Separate evidence types. Clonal expansion, repertoire diversity, somatic hypermutation, predicted binding, and vaccine candidacy are not interchangeable.
6. Report claim limits and handoffs. Primary VCF generation belongs to `variant-calling`; generic cell-state analysis belongs to `single-cell-workflows` unless VDJ integration drives the question.

## Branch Router

| User request | Default route | Read next |
| --- | --- | --- |
| Raw TCR/BCR FASTQ to clonotypes | MiXCR alignment/refinement/assembly/export | `references/tcr_bcr_repertoire.md` |
| Repertoire diversity, overlap, public clones, clonal tracking | VDJtools or AIRR-table analysis | `references/tcr_bcr_repertoire.md` |
| 10x VDJ plus scRNA, clonotypes by cell state | scirpy plus Scanpy/AnnData integration | `references/single_cell_vdj.md` |
| BCR somatic hypermutation, clonal lineages, selection | Immcantation, Change-O, scoper, SHazaM, BASELINe, dowser | `references/bcr_immcantation.md` |
| Peptide/HLA binding or epitope prediction | MHCflurry, NetMHCpan, IEDB, BepiPred | `references/neoantigen_mhc.md` |
| Somatic VCF plus HLA to vaccine candidates | pVACtools/pVACseq neoantigen workflow | `references/neoantigen_mhc.md` |
| Claim strength and QC thresholds | Evidence/claim ladder | `references/repertoire_qc_claims.md` |

## Default Output Contract

For a workflow answer, return:

- chosen branch and excluded adjacent branches;
- required input files and metadata;
- tool route with commands or code skeletons only when inputs are specified;
- QC gates and failure modes;
- clonotype/binding/candidate definitions;
- expected output tables/plots;
- interpretation limits and handoff points.

## Boundary Rules

- Use `single-cell-workflows` for generic scRNA-seq QC, clustering, annotation, integration, or cell communication when VDJ is not central.
- Use this skill for scirpy, clonotype expansion, TCR/BCR chain pairing, VDJ gene usage, or receptor-state association.
- Use `variant-calling` to call somatic/germline variants. Use this skill after a VEP-annotated somatic VCF and HLA typing exist for neoantigen prioritization.
- Use `anndata` only for object structure and low-level `.h5ad` operations.
- Do not produce clinical treatment advice. Report research or candidate-prioritization evidence unless the user explicitly asks for a clinical document and the appropriate clinical skill is loaded.

## Failure Policy

Fail loudly on unknown receptor chain/protocol, missing HLA alleles for binding prediction, unannotated VCF for pVACseq, mismatched sample IDs between VDJ and expression, absent UMI/preset information where it changes MiXCR behavior, or clonotype definitions that are not stated. Do not silently switch from paired-chain to single-chain analysis, from binding prediction to immunogenicity claims, or from variant calling to vaccine ranking.

## Reference Files

- `references/immune_router.md` - branch selection and near-miss routing.
- `references/tcr_bcr_repertoire.md` - MiXCR and VDJtools repertoire workflows.
- `references/single_cell_vdj.md` - scirpy and single-cell VDJ plus expression integration.
- `references/bcr_immcantation.md` - Immcantation BCR SHM, clonal lineages, and selection.
- `references/neoantigen_mhc.md` - MHC binding, pVACtools, neoantigen workflows.
- `references/repertoire_qc_claims.md` - QC thresholds, evidence levels, and claim wording.

Read only the branch reference that matches the user request. Keep receptor repertoire, neoantigen, and generic single-cell/variant-calling boundaries explicit.
