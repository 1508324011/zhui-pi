# BCR Immcantation Workflows

Use this branch for B-cell receptor somatic hypermutation, clonal families, lineage trees, germline inference, and selection analysis.

## Standard route

1. Start from AIRR/Change-O-compatible tables with required fields: `sequence_id`, `sequence`, `v_call`, `d_call`, `j_call`, `junction`, `junction_aa`.
2. Infer or verify genotype/germline where needed with TIgGER: `findNovelAlleles`, `inferGenotype`, `reassignAlleles`.
3. Define clonal families with scoper, commonly `hierarchicalClones` and a nucleotide distance threshold around 0.15-0.2, adjusted to data and receptor.
4. Quantify SHM with SHazaM `observedMutations`, replacement/silent mutation frequencies, and region-aware summaries.
5. Estimate selection with BASELINe `estimateBaseline` and report sigma/credible intervals.
6. Build lineage trees with dowser for clones with enough sequences, commonly at least 3 sequences per clone; record PHYLIP/dnapars dependency if used.

## QC gates

- Required AIRR columns are present and non-empty.
- Productive/nonproductive filtering is explicit.
- Clonal threshold is justified and sensitivity-tested when conclusions depend on it.
- Lineage trees are only built for clones with enough sequences.
- Germline/allele calls are consistent with organism and database.

## Common traps

- Treating inferred lineages as exact evolutionary history.
- Using a universal clonal threshold without checking distance distribution.
- Ignoring novel alleles or genotype mismatch in SHM estimates.
- Reporting selection without uncertainty.
- Mixing heavy and light chain logic without clear paired-chain data.
