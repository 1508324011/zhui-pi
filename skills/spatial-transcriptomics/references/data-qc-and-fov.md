# Data QC And FOV Stability

## Inputs To Confirm

- Platform: Visium, Visium HD, Xenium, MERFISH, Slide-seq, Stereo-seq, CODEX, IMC, MIBI, or custom.
- Unit: spot, cell, bin, bead, molecule, segmented object, tile, or FOV.
- Data files: count matrix, molecule table, cell metadata, coordinate table, image files, segmentation masks, scale factors, and platform output folder.
- Coordinate systems: pixel, micron, array, tissue, global mosaic, local FOV, or transformed coordinates.
- Expected output compatibility: existing FOV filenames, keys, coordinate columns, and directory layout.

## Loading Checks

Visium-like data:

- Confirm Space Ranger output structure and `spatial/` image files.
- Verify scale factors and tissue positions.
- Overlay spot coordinates on the tissue image before filtering.

Xenium or MERFISH-like data:

- Confirm cell table, transcript table, morphology image, segmentation labels, and FOV IDs.
- Count cells and transcripts by FOV before any transform.
- Validate that segmentation labels and transcript coordinates use the same coordinate frame.

Spatial proteomics:

- Confirm marker names, channel order, segmentation masks, panel metadata, and image scale.
- Record whether data are already single-cell quantified or still image-level.

## FOV Contract

Existing FOV behavior is a compatibility contract. Preserve:

- FOV identifiers and sort order.
- Output filenames and directory shape.
- Coordinate column names and units.
- Segmentation label linkage.
- Empty-FOV handling already used by production outputs.

If a new method would alter any of these, stop and ask for an explicit migration decision.

## QC Metrics

Report platform-appropriate metrics:

- Spots or cells before and after filtering.
- Total counts, detected genes, mitochondrial fraction, and low-quality features.
- Tissue coverage and blank/empty regions.
- FOV-level cell counts, transcript counts, and missing images.
- Segmentation quality, mask mismatch, and obvious image artifacts.
- Coordinate/image alignment snapshots or saved overlays.

## Failure Traps

- Image and coordinate origins may differ.
- Pixel and micron units are often mixed.
- Cropping can invalidate global coordinates.
- FOV-local coordinates are not interchangeable with global coordinates.
- Plotting can silently render empty overlays if keys change.
- A successful `.h5ad` write does not prove image alignment is correct.
