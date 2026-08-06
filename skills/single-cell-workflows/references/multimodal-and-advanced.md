# Multimodal And Advanced Workflows

## CITE-seq

- Keep RNA and ADT counts separate until the chosen joint model or WNN workflow.
- QC RNA and protein modalities independently.
- Check antibody background and isotype/negative controls where available.
- Use totalVI or WNN when joint RNA/protein structure matters.

## 10X Multiome And scATAC

Process RNA and ATAC as separate assays before integration.

ATAC gates to report:

- TSS enrichment, starting threshold around 2 but dataset-dependent.
- Nucleosome signal, often below 4 for retained cells.
- Fragment counts, FRiP if peaks are available, blacklist fraction, and peak count distribution.
- LSI component depth correlation; skip depth-dominated components in WNN.

Workflow shape:

1. Load RNA, peaks, and fragments.
2. QC RNA and ATAC independently.
3. Normalize RNA and run PCA.
4. Run TF-IDF, feature selection, and SVD/LSI for ATAC.
5. Integrate with WNN, MultiVI, or project-specific method.
6. Report modality weights, joint clusters, RNA markers, ATAC markers, motifs, and gene-peak links.

## Perturb-seq

- Assign guides before differential expression.
- Track guide multiplicity, non-targeting controls, guide detection rate, and cells without guides.
- Model perturbation effects with sample and batch structure; do not treat cells as independent biological replicates when sample-level replication exists.
- Report per-guide and per-target effects separately when guide performance varies.

## Trajectory And RNA Velocity

- Use only when the biological process is directional.
- Root states need biological evidence.
- Compare trajectory results against known markers and sampling time points.
- Treat pseudotime as an ordering, not clock time, unless calibrated.

## Lineage Tracing

- Validate barcode quality, collision risk, dropout, and editing model before tree inference.
- Report clone size distribution and sensitivity to filtering thresholds.

## Cell Communication

- Requires credible cell type annotations first.
- Ligand-receptor tools infer hypotheses, not physical proof.
- Control for cell abundance and expression detection rate.
- Report database version and filtering rules.
