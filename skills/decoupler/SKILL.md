---
name: decoupler
description: Pathway activity inference from transcriptomics data using statistical and machine learning methods. Use for estimating pathway activities, transcription factor enrichment, and functional signature scoring. Best for understanding which pathways are active in your samples, inferring upstream regulators, and interpreting RBP perturbation effects in pathway context.
license: GPL-3.0
compatibility: opencode
metadata:
  category: pathway-analysis
  language: python
  skill-author: K-Dense Inc.
---

# Decoupler: Pathway Activity Inference

## Overview

Decoupler is a comprehensive Python package for pathway activity inference from bulk and single-cell transcriptomics data. It implements multiple state-of-the-art methods (PROGENy, Dorothea, AUCell, GSVA, etc.) to estimate pathway activities, transcription factor (TF) enrichment, and functional signatures. Decoupler integrates seamlessly with Scanpy and AnnData, making it ideal for analyzing how RBP perturbations affect cellular pathways.

**Current Version**: Decoupler 1.6.0
**Key Methods**: PROGENy, Dorothea, AUCell, GSVA, ULM, WMEAN, WSUM
**Integration**: scanpy, squidpy, pandas, numpy

## When to Use This Skill

Use Decoupler when you need to:

- **Infer pathway activities** from transcriptomics data
- **Identify active transcription factors** in your samples
- **Score functional signatures** (MSigDB, GO, KEGG)
- **Analyze RBP perturbation effects** on pathways
- **Compare pathway activities** across conditions
- **Integrate multi-omics data** for pathway analysis
- **Perform single-cell pathway analysis**
- **Validate pathway predictions** with experimental data

## Installation and Setup

```bash
# Basic installation
pip install decoupler

# With all optional dependencies
pip install decoupler[all]

# Core dependencies
pip install decoupler scanpy pandas numpy

# For specific databases
pip install decoupler omnipath  # TF-target interactions
```

## Core Capabilities

### 1. Pathway Activity Methods

**Linear Models**:
- **ULM (Univariate Linear Model)**: Fast, good for large datasets
- **WMEAN (Weighted Mean)**: Robust to outliers
- **WSUM (Weighted Sum)**: Simple accumulation

**Rank-based Methods**:
- **AUCell**: Area Under the Curve for gene sets
- **GSVA**: Gene Set Variation Analysis
- **ORA (Over-Representation Analysis)**: Fisher's exact test

**Network-based Methods**:
- **PROGENy**: Pathway RespOnsive GENes for signaling pathways
- **Dorothea**: Transcription factor-target interactions
- **CARNIVAL**: Causal network inference

### 2. Supported Databases

- **MSigDB**: Gene Ontology, Hallmarks, KEGG, Reactome
- **PROGENy**: 14 signaling pathways (MAPK, PI3K, TGFb, etc.)
- **Dorothea**: TF-target interactions (confidence levels A-E)
- **Custom**: User-defined gene sets

### 3. Data Types

- **Bulk RNA-seq**: Pseudo-bulk or traditional bulk
- **Single-cell RNA-seq**: Cell-level pathway activities
- **Spatial transcriptomics**: Spatial pathway patterns
- **Microarray**: Legacy expression data

## Using This Skill

### Example 1: Run PROGENy on scRNA-seq Data

```python
import decoupler as dc
import scanpy as sc
import matplotlib.pyplot as plt

# Load single-cell data (with RBP perturbation)
adata = sc.read_h5ad('rbp_perturbation_data.h5ad')

# Get PROGENy model (14 signaling pathways)
progeny = dc.get_progeny(organism='human', top=500)
print("Pathways in PROGENy:")
print(progeny['source'].unique())

# Run pathway activity inference
dc.run_ulm(
    mat=adata,
    net=progeny,
    source='source',
    target='target',
    weight='weight',
    verbose=True,
    use_raw=False
)

# Results stored in adata.obsm
print("Pathway activities stored in:", adata.obsm['ulm_estimate'].shape)

# Visualize pathway activities
sc.pl.umap(adata, color=['JAK-STAT', 'TNFa', 'Trail'], cmap='RdBu_r')

# Compare conditions
sc.pl.violin(adata, keys=['PI3K', 'MAPK'], groupby='condition')
```

### Example 2: Transcription Factor Activity with Dorothea

```python
# Get Dorothea TF regulons
dorothea = dc.get_dorothea(organism='human', levels=['A', 'B', 'C'])
print(f"Number of TF regulons: {len(dorothea['source'].unique())}")

# Run TF activity inference
dc.run_ulm(
    mat=adata,
    net=dorothea,
    source='source',
    target='target',
    weight='weight',
    verbose=True
)

# Extract TF activities
tf_acts = dc.get_acts(adata, obsm_key='ulm_estimate')

# Top active TFs per cluster
dc.pl.barplot(tf_acts, groupby='cluster', top=10)

# Compare RBP KO vs Control
sc.tl.rank_genes_groups(adata, groupby='condition', reference='control')
dc.pl.barplot(tf_acts, groupby='condition', top=15)
```

### Example 3: Custom Gene Set Analysis (RBP Targets)

```python
# Define RBP target gene sets
rbp_targets = {
    'FUS_targets': ['gene1', 'gene2', 'gene3', ...],
    'TARDBP_targets': ['gene4', 'gene5', 'gene6', ...],
    'HNRNPA1_targets': ['gene7', 'gene8', 'gene9', ...]
}

# Convert to decoupler format
import pandas as pd
net = pd.DataFrame([
    {'source': rbp, 'target': gene, 'weight': 1.0}
    for rbp, targets in rbp_targets.items()
    for gene in targets
])

# Run enrichment
dc.run_ulm(
    mat=adata,
    net=net,
    source='source',
    target='target',
    weight='weight',
    min_n=5  # Minimum targets required
)

# Visualize
sc.pl.matrixplot(adata, var_names=list(rbp_targets.keys()), groupby='cluster')
```

### Example 4: MSigDB Pathway Enrichment

```python
# Get MSigDB gene sets
msigdb = dc.get_resource('MSigDB')
msigdb = msigdb[(msigdb['collection'] == 'go_biological_process')]

# Filter by size
msigdb = msigdb.groupby('geneset').filter(lambda x: len(x) >= 15 and len(x) <= 500)

# Run ORA
dc.run_ora(
    mat=adata,
    net=msigdb,
    source='geneset',
    target='genesymbol',
    n_up=300,  # Top upregulated genes
    n_bottom=300  # Top downregulated genes
)

# View results
ora_results = adata.uns['ora_estimate']
print(ora_results.head())

# Plot top pathways
dc.pl.barplot(adata, groupby='cluster', top=10)
```

### Example 5: Multi-Method Consensus

```python
# Run multiple methods
methods = {
    'ULM': dc.run_ulm,
    'WMEAN': dc.run_wmean,
    'AUCell': dc.run_aucell
}

for name, method in methods.items():
    method(
        mat=adata,
        net=progeny,
        source='source',
        target='target',
        weight='weight'
    )
    # Rename results
    adata.obsm[f'{name}_estimate'] = adata.obsm['ulm_estimate'].copy()

# Compare methods
import seaborn as sns

fig, axes = plt.subplots(1, 3, figsize=(15, 4))
for i, method in enumerate(['ULM', 'WMEAN', 'AUCell']):
    corr = adata.obsm[f'{method}_estimate'].corr()
    sns.heatmap(corr, ax=axes[i], cmap='RdBu_r', center=0, vmin=-1, vmax=1)
    axes[i].set_title(f'{method} Correlation')

plt.tight_layout()
plt.savefig('method_comparison.png', dpi=300)
```

### Example 6: Spatial Pathway Analysis

```python
import squidpy as sq

# Load spatial data
adata = sq.datasets.visium_fluo_adata()

# Run pathway inference on spatial data
dc.run_ulm(
    mat=adata,
    net=progeny,
    source='source',
    target='target',
    weight='weight'
)

# Visualize on tissue
sq.pl.spatial_scatter(
    adata,
    color=['Hypoxia', 'JAK-STAT', 'TNFa'],
    cmap='RdBu_r',
    img=sq.datasets.visium_fluo_image()
)

# Spatial correlation with RBP expression
sq.gr.spatial_neighbors(adata)
sq.gr.spatial_autocorr(adata, mode='moran')

# Pathway co-occurrence
sq.gr.co_occurrence(adata, cluster_key='Hypoxia_bin')
```

### Example 7: Pseudobulk Analysis

```python
# Create pseudobulk for bulk-like analysis
import numpy as np

# Aggregate by sample
pdata = dc.get_pseudobulk(
    adata,
    sample_col='sample_id',
    groups_col='condition',
    layer='counts',
    mode='sum',
    min_cells=10,
    min_counts=1000
)

# Normalize
sc.pp.normalize_total(pdata, target_sum=1e6)
sc.pp.log1p(pdata)

# Run pathway analysis on pseudobulk
dc.run_ulm(
    mat=pdata,
    net=progeny,
    source='source',
    target='target',
    weight='weight'
)

# Differential pathway analysis
import pydeseq2
# ... run DESeq2 on pathways
```

## Integration with Other Skills

- **scanpy**: Single-cell analysis backbone
- **squidpy**: Spatial pathway analysis
- **pydeseq2**: Differential pathway expression
- **matplotlib/seaborn**: Visualization
- **pandas**: Data manipulation
- **gget**: Fetch pathway gene sets

## Best Practices

### Method Selection

| Data Type | Recommended Methods |
|-----------|---------------------|
| scRNA-seq | ULM, WMEAN, AUCell |
| Bulk RNA-seq | GSVA, ULM, WMEAN |
| Spatial | ULM (fast), WMEAN (robust) |
| Small samples | WMEAN, WSUM |
| Large datasets | ULM (fastest) |

### Parameter Tuning

1. **min_n**: Minimum number of targets (default: 5)
   - Increase for more reliable estimates (10-15)
   - Decrease for rare pathways (3-5)

2. **Weight handling**:
   - Use `weight` column if available
   - Set uniform weights if unknown

3. **Normalization**:
   - Input data should be log-normalized
   - Scale features if using linear models

### Statistical Considerations

1. **Multiple testing**: Adjust p-values for multiple pathways
2. **Batch effects**: Correct before pathway analysis
3. **Confounders**: Include in design matrix
4. **Validation**: Cross-check with known biology

## Advanced Topics

### Custom Network Creation

```python
# Create TF-target network from literature
custom_net = pd.DataFrame({
    'source': ['TF1', 'TF1', 'TF2', 'TF2'],
    'target': ['geneA', 'geneB', 'geneC', 'geneD'],
    'weight': [1.0, -1.0, 1.0, 1.0],  # Activation/Repression
    'evidence': ['ChIP-seq', 'ChIP-seq', 'luciferase', 'RNA-seq']
})

# Filter by evidence
custom_net = custom_net[custom_net['evidence'].isin(['ChIP-seq', 'KO'])]
```

### Consensus Scoring

```python
# Run multiple methods and average
dc.consensus(
    mat=adata,
    net=progeny,
    methods=[dc.run_ulm, dc.run_wmean, dc.run_wsum],
    source='source',
    target='target',
    weight='weight'
)
```

## Troubleshooting

**Issue**: All pathway scores are zero
- **Solution**: Check gene ID format (symbol vs. Ensembl); increase min_n

**Issue**: Memory error with large datasets
- **Solution**: Use batch processing; subset to variable genes

**Issue**: Pathway activities don't match expected biology
- **Solution**: Check input normalization; try different methods

## Resources

- **Documentation**: https://decoupler-py.readthedocs.io/
- **GitHub**: https://github.com/saezlab/decoupler-py
- **Paper**: Badia-i-Mompel et al. (2022) Nature Protocols
- **Omnipath**: https://omnipathdb.org/ (underlying database)

## Summary

Decoupler provides a unified framework for pathway activity inference across diverse transcriptomics data types. Its multiple statistical methods and extensive database integrations make it an essential tool for understanding the functional consequences of RBP perturbations and other experimental manipulations.
