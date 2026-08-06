---
name: spatial-transcriptomics
description: End-to-end spatial transcriptomics workflow skill for Visium, Xenium, MERFISH, Slide-seq, Stereo-seq, Visium HD, spatial proteomics, tissue-image integration, FOV-aware processing, spatial neighbors, spatial statistics, domains, deconvolution, communication, and visualization. Use for Squidpy, SpatialData, Scanpy, scimap, cell2location, image alignment, spatial graphs, Moran autocorrelation, co-occurrence, domain detection, and FOV output validation. For low-level WSI tiling use histolab; for advanced pathology image modeling use pathml.
---

# Spatial Transcriptomics

## Purpose

Use this skill as the top-level planner for spatial transcriptomics and spatial omics workflows. It coordinates data loading, platform-specific QC, image and coordinate validation, expression preprocessing, spatial graph construction, spatial statistics, domain detection, deconvolution, spatial communication, and figure output.

This local installation has a hard production constraint: existing FOV output behavior is sacrosanct. Do not rename, reshape, silently drop, or re-key field-of-view outputs unless the user explicitly requests a migration. If image or FOV processing fails, crash loudly with the failing file, FOV, transform, and expected output. Do not mask failures with fallbacks.

## When To Use

Use this skill for requests like:

- Analyze Visium, Xenium, MERFISH, Slide-seq, Stereo-seq, Visium HD, or spatial proteomics data end-to-end.
- Load spatial data and verify coordinates, images, tissue masks, scale factors, segmentation, or FOV outputs.
- Build spatial neighbor graphs and compute neighborhood enrichment, co-occurrence, Moran autocorrelation, spatially variable genes, or spatial domains.
- Overlay clusters, genes, cell types, domains, or deconvolution results on tissue images.
- Deconvolve spots or map single-cell references to spatial locations.
- Analyze CODEX, IMC, MIBI, or multiplex imaging when the biological question is spatial-omics integration.

Do not use it for a single `scanpy` API question, basic `.h5ad` storage work, generic WSI tile extraction, or figure styling after the spatial analysis is already complete. Route those to `scanpy`, `anndata`, `histolab`, `pathml`, or `scientific-visualization` as appropriate.

## Operating Loop

1. Classify platform and unit of observation: spot, cell, bin, molecule, segmented object, tile, FOV, or tissue region.
2. Lock coordinate systems and image metadata before analysis: reference frame, scale factors, pixel size, FOV IDs, segmentation labels, and transform chain.
3. Validate image and coordinate alignment before computing biology.
4. Run platform-aware QC on counts, genes, spots/cells, mitochondrial fraction, tissue coverage, segmentation quality, and image artifacts.
5. Preserve raw counts and raw spatial metadata before normalization or filtering.
6. Build spatial graphs with explicit assumptions: grid, generic coordinates, radius, k-nearest neighbors, or Delaunay-like connectivity.
7. Separate transcriptomic clustering from spatial domain detection; compare both instead of conflating them.
8. Write FOV-stable outputs and validation reports after every image/FOV-transforming step.

## Decision Points

| Situation | Default Route | Notes |
| --- | --- | --- |
| Visium or Visium HD | Load Space Ranger output, verify image alignment, then Scanpy plus Squidpy | Keep scale factors and image keys intact. |
| Xenium or MERFISH | Validate cells, transcripts, segmentation, and FOV IDs first | FOV behavior must remain compatible with existing outputs. |
| Slide-seq or Stereo-seq | Treat coordinates as high-density bins or beads | Choose graph radius from physical scale, not arbitrary pixels. |
| Spatial domains | Compare expression-only clusters and spatially constrained domains | Domains should map to tissue structure. |
| Deconvolution | Use credible single-cell reference and platform-aware model | Report reference version and cell type hierarchy. |
| Spatial proteomics | Use pathml or scimap details under this top-level workflow | Keep marker panels and segmentation QC visible. |
| Publication figures | Run analysis here, then use scientific-visualization for final figure polish | Do not hide failed image overlays. |

## QC Gates

| Stage | Gate |
| --- | --- |
| Loading | Expected spots/cells/FOVs detected; image, coordinates, and metadata are present. |
| Alignment | Coordinate overlays match tissue morphology and scale factors. |
| FOV | FOV IDs, output filenames, coordinate frames, and segmentation keys are stable. |
| Expression QC | Low-quality spots/cells filtered with recorded thresholds. |
| Image QC | Empty tissue, blur, saturation, segmentation failure, and mask mismatch are visible. |
| Graphs | Neighbor model, radius or k, and coordinate system are reported. |
| Domains | Domains correspond to tissue regions or are flagged as weak. |
| Handoff | Final object, plots, FOV outputs, QC tables, and parameter log are written. |

## Failure Policy

Spatial workflows fail in ways that look plausible when silently ignored. Do not continue if:

- A FOV is missing or duplicated unexpectedly.
- Image scale factors or coordinate transforms are absent or inconsistent.
- A segmentation output no longer matches the transcript or image coordinate frame.
- A plotting overlay is empty because keys changed.
- A fallback would change existing FOV output names or layout.

Surface the exact failing artifact and stop.

## Reference Files

- `references/data-qc-and-fov.md` for platform loading, QC, image alignment, coordinate validation, and FOV stability.
- `references/spatial-graphs-and-domains.md` for spatial neighbors, statistics, spatially variable genes, enrichment, co-occurrence, and domain detection.
- `references/deconvolution-proteomics-visualization.md` for single-cell reference mapping, deconvolution, spatial proteomics, communication, and visualization handoff.
