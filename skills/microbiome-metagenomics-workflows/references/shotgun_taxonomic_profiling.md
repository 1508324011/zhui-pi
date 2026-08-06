# Shotgun Taxonomic Profiling

## Kraken2 and Bracken route

1. QC and trim reads if needed; host-deplete when the study design requires it.
2. Classify reads with Kraken2 using a named database version.
3. Estimate abundance with Bracken at the requested rank. Kraken2 read counts are classifications; Bracken estimates abundance.
4. Filter low-support taxa using rank-aware abundance/read thresholds and negative controls.
5. Summarize species/genus/family abundance with database and confidence settings recorded.

## MetaPhlAn route

1. QC/trim and host-deplete as needed.
2. Run MetaPhlAn with the marker database version recorded.
3. Use marker-based species profiling for cross-sample comparisons.
4. Feed MetaPhlAn profiles into HUMAnN when doing functional profiling.

## Choosing between routes

- Use Kraken2/Bracken when the user wants broad k-mer classification, custom databases, or abundance estimates from classifications.
- Use MetaPhlAn when marker-based species profiles and HUMAnN compatibility are central.
- Use both only when the user wants method comparison or the result is high-stakes; otherwise avoid doubling complexity.

## QC gates

- Read QC is summarized; Q30 over 80% is a useful starting gate for many short-read shotgun studies.
- Host reads are removed or explicitly reported before microbial interpretation.
- Host reads and unclassified reads are reported.
- Classification rate is plausible for the environment and database; over 60% is a useful starting gate for many host-associated studies, but environmental samples may differ.
- Database name, build date, taxonomy source, and confidence threshold are recorded.
- Low biomass and reagent contaminants are checked against controls.
- Rank-specific abundance thresholds are explicit.
- For HUMAnN handoff, unmapped or unintegrated fractions over 50% should be treated as a warning, not ignored.

## Common traps

- Treating Kraken2 classification counts as abundance without Bracken or another abundance model.
- Comparing samples classified with different database builds.
- Assuming species-level labels are equally reliable across all clades.
- Dropping unclassified reads silently; high unclassified fraction is a result.
- Ignoring host depletion differences between groups.
