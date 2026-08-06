---
name: omics-differential-workflows
description: End-to-end bulk omics differential analysis workflow skill for RNA-seq and expression matrices, from quantification/count import through sample QC, normalization, differential testing, visualization, time-course modeling, and GO/KEGG/Reactome/GSEA pathway interpretation. Use for Salmon/kallisto/featureCounts/tximport, DESeq2/PyDESeq2/edgeR/limma, batch-aware experimental designs, volcano/MA/PCA/heatmap outputs, ranked gene lists, ORA/GSEA, and temporal expression modules. For Python DESeq2 implementation details use pydeseq2; for general statistical model APIs use statsmodels; for direct pathway database queries use kegg-database, reactome-database, or string-database.
---

# Omics Differential Workflows

## Purpose

Use this skill when the user is asking for a complete bulk expression or omics differential-analysis workflow, not just one package call. It owns the path from quantified RNA/expression data to defensible differential results and biological interpretation.

Keep tool-level details in the existing skills. Use `pydeseq2` for Python DESeq2 APIs, `statsmodels` for explicit model classes, `statistical-analysis` for generic test-selection/reporting, and database skills for direct KEGG/Reactome/STRING lookups.

## When To Use

Use this skill for requests that involve:

- RNA-seq FASTQ or quantification outputs moving toward differential expression results.
- featureCounts, Salmon, kallisto, tximport, DESeq2, edgeR, limma, PyDESeq2, or count-matrix QC as a connected workflow.
- Experimental design, contrasts, covariates, batch effects, interaction terms, time-course designs, or replicate adequacy for bulk omics.
- Volcano, MA, PCA, sample-distance heatmap, top-gene heatmap, dispersion diagnostics, p-value histograms, or exportable DE result tables.
- GO, KEGG, Reactome, WikiPathways, ORA, GSEA, ranked gene lists, gene ID conversion, background-universe selection, and enrichment visualization from DE results.
- Time-course expression modules, temporal DE, Mfuzz-style soft clustering, rhythm detection, GAM/spline modeling, or per-cluster pathway enrichment.

Do not use this skill for:

- Single-cell marker/cluster workflows; use `single-cell-workflows`.
- Low-level Python DESeq2 object manipulation only; use `pydeseq2`.
- One direct KEGG/Reactome/STRING API lookup; use the matching database skill.
- Generic regression unrelated to omics design; use `statsmodels` or `statistical-analysis`.

## Operating Loop

1. Classify the input state: raw FASTQ, transcript quantifications, gene counts, normalized matrix, or DE results.
2. Lock the sample metadata before analysis: sample IDs, conditions, batches, donors, time points, pairing, and covariates.
3. Confirm counts are appropriate for the chosen method. Do not feed TPM/FPKM into DESeq2 or edgeR differential testing.
4. Run sample-level QC before testing: library sizes, mapping/assignment rate, PCA, distance heatmap, outliers, and batch structure.
5. Build the design formula from the biology, not from convenience. Put nuisance covariates before the primary contrast.
6. Separate differential testing from visualization transformations. Use raw counts for DE models and VST/rlog/logCPM only for plots or clustering.
7. For pathway analysis, define the tested universe and gene ID mapping before running ORA or GSEA.
8. Report thresholds, diagnostics, and caveats with the result tables; do not return only a significant-gene list.

## Decision Points

| Situation | Default Route | Notes |
| --- | --- | --- |
| FASTQ to DE results | Read QC, Salmon or STAR/featureCounts, tximport/count import, DESeq2/edgeR | Use `ngs-read-processing` for FASTQ/alignment details when needed. |
| Salmon or kallisto quantifications | tximport/tximeta into DESeq2 or edgeR | Preserve transcript-to-gene mapping and length-offset correction. |
| featureCounts or STAR GeneCounts | Count-matrix QC, filter low expression, DESeq2/edgeR | Check strandedness and annotation version. |
| Small replicate count | edgeR quasi-likelihood or DESeq2 with conservative reporting | Avoid overclaiming; report low power. |
| Batch or donor design | Model covariates explicitly | Do not remove biological signal with blind batch correction. |
| Time-course | DESeq2 LRT, limma splines, maSigPro/Mfuzz/GAM depending on design | Treat time as ordered biology, not a pile of pairwise tests. |
| DE results to pathways | GSEA for full ranked lists; ORA for clear gene lists | Always define background universe and ID conversion rate. |

## QC Gates

| Stage | Gate |
| --- | --- |
| FASTQ or quantification | Q30 and adapters acceptable; Salmon/kallisto mapping commonly >70%; feature assignment adequate for organism/library. |
| Count matrix | Sample IDs match metadata exactly; raw integer counts for DESeq2/edgeR; low-expression filtering documented. |
| Sample QC | PCA and distance heatmap show no unexplained swaps/outliers; batch effects are visible and modeled if present. |
| DE model | Dispersion trend reasonable; contrasts match the biological question; independent filtering and shrinkage choices recorded. |
| Result table | Contains gene IDs, log2 fold change, standard error/statistic, p-value, adjusted p-value, base expression, and annotations if used. |
| Enrichment | Background is all tested genes, not the whole genome; ID conversion losses reported; term count is plausible, not all terms significant. |
| Time-course | Temporal model residuals acceptable; clusters non-empty; soft membership or silhouette/gap statistic checked. |

## Failure Policy

Let invalid inputs fail loudly. Do not silently coerce normalized expression into count-based DE, drop unmatched samples, reuse the wrong genome annotation, compare enrichment p-values across separate universes, or hide failed ID conversion. If metadata and count columns disagree, stop and fix the sample map.

## Reference Files

- `references/quantification-and-count-qc.md` - FASTQ/quantification/count import, count-matrix QC, metadata joins, normalization boundaries.
- `references/differential-and-timecourse.md` - DESeq2/edgeR/limma/PyDESeq2 design choices, diagnostics, time-course modeling.
- `references/pathway-interpretation.md` - ORA/GSEA decisions, GO/KEGG/Reactome/WikiPathways, ID conversion, visualization, reporting.
