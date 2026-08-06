# Small RNA-seq Branch

## SOP

1. Identify the exact 3-prime and 5-prime adapter sequences from the protocol.
2. Trim adapters and filter to the expected small RNA size range, usually 18-30 nt.
3. Inspect length distribution before alignment.
4. Quantify known miRNAs and discover candidates with miRDeep2, miRge3, or a comparable tool.
5. Run differential analysis with DESeq2-style count models when replicate design supports it.
6. Interpret targets with conservative target prediction and, where possible, expression anti-correlation or CLIP support.

## QC Gates

- Clear length peak at 21-23 nt for miRNA-focused libraries.
- Mapping rate greater than 70% for well-matched reference and clean libraries.
- miRDeep2 novel miRNA score greater than 10 for high-confidence novel candidates.
- Adapter trimming rate and post-trim length distribution must be reported.

## Traps

- Wrong or omitted adapter sequence can dominate the result.
- Composition bias can be severe. Treat normalization choices as analysis decisions, not defaults.
- Novel miRNAs need hairpin structure and external support; do not trust score alone.
- isomiR and A-to-I-edited species should be interpreted separately from canonical miRNA abundance.
