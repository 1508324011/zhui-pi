# Germline Small Variant Calling

This reference covers SNP/indel calling for germline samples. Start from a sorted, indexed, reference-compatible BAM/CRAM.

## bcftools Path

Use for quick analysis, non-model organisms, small projects, or when transparent htslib behavior is preferred.

```bash
bcftools mpileup \
  -f reference.fa \
  -Ou \
  sample.markdup.bam \
| bcftools call -mv -Oz -o sample.raw.vcf.gz

bcftools index sample.raw.vcf.gz
bcftools stats sample.raw.vcf.gz > qc/sample.raw.stats.txt
```

Then normalize and filter explicitly. State depth caps, BAQ behavior, ploidy assumptions, target intervals, and filter expressions.

## GATK HaplotypeCaller Path

Use for human production germline calling or when GVCF joint genotyping is required.

```bash
gatk HaplotypeCaller \
  -R reference.fa \
  -I sample.markdup.bam \
  -O sample.g.vcf.gz \
  -ERC GVCF
```

For cohorts, combine/import GVCFs and jointly genotype:

```bash
gatk GenomicsDBImport \
  --sample-name-map samples.map \
  --genomicsdb-workspace-path cohort_db \
  -L targets.interval_list

gatk GenotypeGVCFs \
  -R reference.fa \
  -V gendb://cohort_db \
  -O cohort.raw.vcf.gz
```

Use VQSR only when the cohort and variant counts are large enough and truth/training resources match the reference build. Small cohorts, exomes with low variant counts, non-model organisms, or targeted panels often need hard filters.

## DeepVariant Path

Use when the caller/model combination is appropriate for the platform and assay. Match `--model_type` to WGS, WES, PacBio, or ONT data.

Record the container version, model type, reference build, regions, and intermediate output directory. DeepVariant output still needs normalization, stats, and downstream annotation.

## Minimum Report

- Caller and version.
- Reference build and resource versions.
- Sample count, target intervals, mean coverage if available.
- Raw variant counts, filtered/PASS counts, SNP/indel counts, Ti/Tv, known-site overlap.
- Filter strategy and rationale.
