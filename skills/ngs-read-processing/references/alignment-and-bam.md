# Alignment And BAM/CRAM Processing

This reference covers read alignment and post-alignment file preparation. The output should be an analysis-ready BAM/CRAM with visible QC evidence.

## Aligner Selection

| Assay | Default aligner | Notes |
| --- | --- | --- |
| Human WGS/WES/panel short reads | BWA-MEM2 | Include read groups at alignment time when possible. |
| Small genome, local reference, or targeted non-spliced alignment | Bowtie2 | Tune sensitivity based on target complexity. |
| Bulk RNA-seq, high-throughput splice-aware alignment | STAR | Needs large genome index; fast and common for production. |
| Bulk RNA-seq with smaller memory budget | HISAT2 | Splice-aware with lower memory use. |

## DNA Alignment Skeleton

```bash
bwa-mem2 mem \
  -t 16 \
  -R '@RG\tID:sample.L001\tSM:sample\tLB:lib1\tPL:ILLUMINA\tPU:unit1' \
  reference.fa \
  sample.trimmed_R1.fastq.gz sample.trimmed_R2.fastq.gz \
| samtools view -@ 8 -b -o sample.unsorted.bam -

samtools sort -@ 8 -o sample.sorted.bam sample.unsorted.bam
samtools index -@ 8 sample.sorted.bam
samtools flagstat -@ 8 sample.sorted.bam > qc/sample.flagstat.txt
samtools stats -@ 8 sample.sorted.bam > qc/sample.stats.txt
```

For duplicate marking with samtools, use the required name-sort/fixmate path for paired reads:

```bash
samtools sort -n -@ 8 -o sample.name.bam sample.unsorted.bam
samtools fixmate -m sample.name.bam sample.fixmate.bam
samtools sort -@ 8 -o sample.coord.bam sample.fixmate.bam
samtools markdup -@ 8 sample.coord.bam sample.markdup.bam
samtools index -@ 8 sample.markdup.bam
```

## Validation

Run cheap validation before expensive downstream analysis:

```bash
samtools quickcheck -v sample.markdup.bam
samtools idxstats sample.markdup.bam > qc/sample.idxstats.txt
samtools flagstat sample.markdup.bam > qc/sample.flagstat.txt
```

For clinical or production pipelines, also validate reference sequence dictionaries, contig naming, and MD5/M5 tags with Picard/GATK where applicable.

## Traps

- Do not mix coordinate-sorted and name-sorted files. The file name should say which it is.
- Do not apply a universal `MAPQ >= 30` rule. MAPQ scales differ by aligner and assay.
- CRAM needs the exact reference or a correctly configured `REF_PATH`.
- BAI has size limits; use CSI for very large contigs or unusual references.
- Marking duplicates is not universally correct for amplicon or UMI data.
- A BAM can be indexed and still be biologically wrong if aligned to the wrong build.
