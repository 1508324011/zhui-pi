# Functional, AMR, and Strain Workflows

## HUMAnN functional profiling

1. Use quality-controlled shotgun reads and an appropriate taxonomic profile.
2. Run HUMAnN with named nucleotide/protein databases.
3. Normalize gene family and pathway abundance consistently across samples.
4. Stratify and unstratify results depending on whether the user needs organism contributions.
5. Interpret pathways only with database/version caveats and taxonomic support.

## AMR profiling

Choose method by input and claim:

- AMRFinderPlus for curated gene/protein AMR calls in isolate-like or assembled contexts.
- ResFinder/CARD/RGI-style approaches when the database and identity/coverage thresholds match the study.
- Read-based AMR screens for exploratory abundance, with conservative reporting.

Record database version, identity threshold, coverage threshold, gene family, and whether calls are read-, contig-, or protein-based.

## Strain tracking

- Use MASH or sourmash for sketch-based relatedness and quick screening.
- Use fastANI for genome-level relatedness when assemblies are available.
- Use inStrain or similar tools for within-species strain variation when read depth and mapping quality support it.

## QC gates

- HUMAnN: pathway coverage, unmapped/unintegrated fractions, database versions, and stratification state are reported.
- AMR: identity and coverage thresholds are explicit; ambiguous multi-gene families are not overinterpreted.
- Strain tracking: depth, breadth, mapping quality, and contamination are sufficient before transmission/relatedness claims.

## Common traps

- Calling AMR from 16S data.
- Comparing HUMAnN pathway abundance without consistent normalization.
- Reporting strain transmission from low-depth shotgun samples.
- Treating AMR gene detection as phenotype without organism context or expression.
- Combining read-based and assembly-based AMR outputs without stating the difference.
