# Ribo-seq Branch

## SOP

1. Trim adapters and filter ribosome-protected fragment lengths, commonly 28-32 nt unless protocol says otherwise.
2. Remove rRNA and other abundant contaminants.
3. Align reads with parameters appropriate for short protected fragments.
4. Calibrate read-length-specific P-site offsets.
5. Check triplet periodicity and coding-region enrichment.
6. Pair with matched RNA-seq for translation efficiency analysis.
7. Call ORFs, upstream ORFs, translated small ORFs, or stalling events only after periodicity gates pass.

## QC Gates

- rRNA depletion must be effective and reported.
- Triplet periodicity should be clear in coding regions.
- P-site offset must be calibrated separately by read length.
- Translation efficiency requires paired RNA-seq from the same biological condition.

## Traps

- Wrong P-site offsets corrupt ORF boundaries, pause sites, and stalling interpretation.
- Weak periodicity means downstream ORF and TE calls are not reliable.
- Footprint length windows are protocol-specific. A hard 28-32 nt window can discard true signal in nonstandard protocols.
