# Epitranscriptomics Branch

## SOP

1. Pair IP and Input samples explicitly in the sample sheet.
2. Run preprocessing and alignment with consistent strandedness and annotation.
3. Call peaks with exomePeak2 for MeRIP-style data, or MACS3 only when its assumptions fit the design.
4. Run differential modification analysis with paired IP/Input design and batch terms.
5. Validate global patterns with DRACH motif enrichment and metagene enrichment near stop codons for m6A.
6. For direct RNA modification calling, keep m6Anet or other signal-level workflows separate from MeRIP peak logic.

## QC Gates

- IP/Input alignment rate should be above 80% in clean datasets.
- Peak count commonly falls between 10,000 and 50,000 for broad m6A studies.
- Replicate enrichment and IP/Input contrast must be visible.
- DRACH motif enrichment and stop-codon metagene enrichment should support m6A interpretation.
- Differential analysis must include batch terms when present.

## Traps

- IP/Input pairing errors create convincing false differential peaks.
- P-value-only peak lists without motif or metagene support are weak evidence.
- m6Anet direct RNA calls and MeRIP-seq enrichment peaks are different measurement regimes. Do not merge their thresholds.
