# Somatic And Structural Variant Calling

Somatic and structural variant workflows have different error models from germline small-variant calling. Keep those boundaries explicit.

## Mutect2 Tumor-Normal Skeleton

```bash
gatk Mutect2 \
  -R reference.fa \
  -I tumor.bam -tumor TUMOR \
  -I normal.bam -normal NORMAL \
  --germline-resource af-only-gnomad.vcf.gz \
  --panel-of-normals pon.vcf.gz \
  --f1r2-tar-gz sample.f1r2.tar.gz \
  -O sample.unfiltered.vcf.gz

gatk LearnReadOrientationModel \
  -I sample.f1r2.tar.gz \
  -O sample.orientation-model.tar.gz

gatk GetPileupSummaries \
  -I tumor.bam \
  -V common-sites.vcf.gz \
  -L common-sites.vcf.gz \
  -O tumor.pileups.table

gatk CalculateContamination \
  -I tumor.pileups.table \
  -tumor-segmentation tumor.segments.table \
  -O tumor.contamination.table

gatk FilterMutectCalls \
  -R reference.fa \
  -V sample.unfiltered.vcf.gz \
  --contamination-table tumor.contamination.table \
  --ob-priors sample.orientation-model.tar.gz \
  -O sample.filtered.vcf.gz
```

Matched normal is preferred. Panel of normals is strongly recommended. Tumor-only calling must be reported as lower-confidence and more dependent on population/germline filtering.

## Strelka2

Use Strelka2 as an alternative somatic SNV/indel caller. It is common to compare Mutect2 and Strelka2 or intersect high-confidence calls for conservative reporting.

## Short-Read SV

Choose Manta, Delly, GRIDSS, or a project-standard caller. Merging with SURVIVOR can help compare callers, but merged SV sets need manual QC of breakpoints, size distributions, read support, and caller support.

## Long-Read SV

For ONT/PacBio, align with minimap2 and call with Sniffles2 or cuteSV. Report read N50, platform, basecaller, mean read quality, coverage, and minimum support thresholds. Initial filters often include SV length at least 50 bp and QUAL around 20, but these are starting points.

## Somatic Traps

- Do not apply germline hard filters to somatic calls.
- Low VAF calls need local evidence review and contamination awareness.
- FFPE and oxidative artifacts need orientation/artifact modeling.
- A PASS somatic VCF is not a clinical report; it is an input to annotation and interpretation.
