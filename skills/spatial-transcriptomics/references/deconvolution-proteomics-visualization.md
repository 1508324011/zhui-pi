# Deconvolution Proteomics Visualization

## Deconvolution And Mapping

Before deconvolution, confirm the reference is biologically and technically compatible:

- Tissue, species, disease state, and platform.
- Cell type hierarchy and marker quality.
- Batch and chemistry differences.
- Whether spots are multi-cell or near single-cell resolution.

Common routes include cell2location, Tangram, Stereoscope, DestVI, RCTD-like workflows, and project-specific reference transfer. Report reference version, label hierarchy, model assumptions, and uncertainty.

## Spatial Communication

Communication analysis requires credible cell types and coordinates first.

- Use ligand-receptor results as hypotheses.
- Control for cell abundance and expression detection.
- Keep database version and filtering rules.
- Check whether inferred interactions are spatially plausible on the image.

## Spatial Proteomics

For CODEX, IMC, MIBI, and multiplex IF:

- Validate channel names, marker panel, spillover/normalization, segmentation, and cell table.
- Use `pathml` for detailed multiplex image processing and graph construction.
- Use this skill as the top-level workflow when spatial transcriptomics or spatial omics interpretation controls the analysis.

## Visualization Handoff

Use analysis plots to validate data, then polish final figures with `scientific-visualization` if needed.

Minimum plots:

- QC metrics on tissue or FOV.
- Clusters and domains overlaid on image.
- Key genes, markers, or deconvolution cell types in space.
- Spatial graph or neighborhood summary.
- FOV-level validation panel for image-heavy workflows.

Never accept an empty or misaligned overlay as a finished figure.
