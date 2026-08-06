# Handoff To Variant Calling

Use this reference when a read-processing request ends at an analysis-ready BAM/CRAM or when the user asks for FASTQ-to-variant planning. Primary variant detection belongs in the `variant-calling` skill.

## Required Before Calling Variants

- FASTQ QC and trimming decisions recorded.
- Alignment tool, version, reference build, and read groups recorded.
- Coordinate-sorted, indexed BAM/CRAM.
- Duplicate policy executed or explicitly justified as not applicable.
- `samtools quickcheck`, `flagstat`, and `stats` available.
- Reference FASTA indexed with `.fai`; sequence dictionary available for GATK-style pipelines.
- Contig names match downstream resources such as dbSNP, Mills, gnomAD, ClinVar, or panel BED files.

## Minimal FASTQ-To-BAM-To-VCF Skeleton

For quick non-clinical small-variant calling, hand off to `variant-calling` after this point:

```bash
bcftools mpileup \
  -f reference.fa \
  -Ou \
  sample.markdup.bam \
| bcftools call -mv -Oz -o sample.raw.vcf.gz

bcftools index sample.raw.vcf.gz
bcftools stats sample.raw.vcf.gz > qc/sample.vcf.stats.txt
```

For human production germline calling, prefer a full `variant-calling` path using GATK HaplotypeCaller or DeepVariant with known-sites resources and explicit filtering/QC.

## Handoff Report

Include the BAM path, BAI/CSI path, reference build, read groups, mapping rate, duplicate rate, mean coverage if available, validation status, and known concerns. This lets the variant-calling step fail for real variant reasons instead of hidden read-processing mistakes.
