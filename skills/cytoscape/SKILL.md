---
name: cytoscape
description: Network visualization and analysis platform for biological networks. Use for visualizing protein-protein interactions, RBP-RNA networks, pathway analysis, and complex network structures. Best for interactive network exploration, community detection, and publication-ready network figures. Integrates with networkx for programmatic control.
license: LGPL
compatibility: opencode
metadata:
  category: network-analysis
  language: python
  skill-author: K-Dense Inc.
---

# Cytoscape: Network Visualization and Analysis Platform

## Overview

Cytoscape is an open-source platform for visualizing and analyzing complex networks (graphs). It is widely used in bioinformatics and systems biology for exploring molecular interaction networks, gene regulatory networks, social networks, and more. Cytoscape provides an intuitive graphical interface along with powerful analysis capabilities through apps (plugins).

**Current Version**: Cytoscape 3.10.0
**Key Features**: Interactive visualization, layout algorithms, network statistics, app ecosystem

## When to Use This Skill

Use Cytoscape when you need to:

- **Visualize RBP-RNA interaction networks** with hundreds to thousands of nodes
- **Analyze protein-protein interaction (PPI) networks** from STRING or other databases
- **Explore gene regulatory networks** and pathway relationships
- **Identify network communities** and hub nodes
- **Create publication-quality network figures**
- **Integrate node/edge attributes** (expression data, fold changes, p-values)
- **Perform network topology analysis** (degree, betweenness, clustering coefficient)

## Installation and Setup

### Method 1: Standalone Application (Recommended)

Download Cytoscape Desktop:
```bash
# macOS
brew install --cask cytoscape

# Or download from https://cytoscape.org/download.html
```

### Method 2: Python Integration (py2cytoscape)

```bash
pip install py2cytoscape
```

### Method 3: RCy3 (R Integration)

```R
install.packages("RCy3")
```

## Core Capabilities

### 1. Network Import and Export

**Supported Formats**:
- SIF (Simple Interaction Format)
- GraphML
- XGMML
- BioPAX
- PSI-MI
- GML
- Cytoscape JSON (.cyjs)

### 2. Layout Algorithms

- **Force-directed**: Force Atlas 2, Prefuse, yFiles Organic
- **Hierarchical**: yFiles Hierarchical, Tree
- **Circular**: Circular Layout
- **Grid**: Grid Layout
- **Attribute-based**: Group by attribute values

### 3. Network Analysis

**Topology Measures**:
- Degree distribution
- Betweenness centrality
- Closeness centrality
- Eigenvector centrality
- Clustering coefficient
- Network diameter
- Shortest path analysis

### 4. Essential Apps (Plugins)

Install these apps through Apps → App Manager:

- **cytoHubba**: Hub identification and ranking
- **MCODE**: Molecular Complex Detection
- **ClueGO**: Gene Ontology and pathway analysis
- **stringApp**: STRING database integration
- **yFiles Layout Algorithms**: Advanced layouts
- **CyTargetLinker**: Target interaction analysis

## Using This Skill

### Example 1: Visualize RBP-RNA Network

```python
import networkx as nx
import pandas as pd

# Create RBP-RNA interaction network
G = nx.Graph()

# Add RBP nodes
rbps = ['FUS', 'TDP43', 'hnRNPA1', 'PABP', 'HuR']
for rbp in rbps:
    G.add_node(rbp, node_type='RBP', category='splicing')

# Add RNA nodes
rnas = ['mRNA_1', 'mRNA_2', 'lncRNA_1', 'circRNA_1']
for rna in rnas:
    G.add_node(rna, node_type='RNA', fold_change=2.5)

# Add interactions
interactions = [
    ('FUS', 'mRNA_1', {'binding_score': 0.95}),
    ('TDP43', 'mRNA_2', {'binding_score': 0.88}),
    ('hnRNPA1', 'lncRNA_1', {'binding_score': 0.72}),
    ('HuR', 'circRNA_1', {'binding_score': 0.91})
]

for u, v, attr in interactions:
    G.add_edge(u, v, **attr)

# Export to Cytoscape format
nx.write_graphml(G, 'rbp_rna_network.graphml')
print("Network saved. Open in Cytoscape Desktop.")
```

### Example 2: Import STRING Data

```python
# Using stringApp in Cytoscape
# 1. Open Cytoscape Desktop
# 2. Apps → stringApp → Query STRING
# 3. Enter protein list or search term

# Programmatic approach with py2cytoscape
from py2cytoscape.data.cynetwork import CyNetwork
from py2cytoscape.data.cyrest_client import CyRestClient

# Connect to Cytoscape (must be running)
cyrest = CyRestClient()

# Import network
network = cyrest.network.create_from_networkx(G, collection='RBP_Networks')

# Apply layout
cyrest.layout.apply(name='force-directed', network=network)
```

### Example 3: Network Analysis with cytoHubba

```python
# In Cytoscape Desktop:
# 1. Apps → cytoHubba
# 2. Select network
# 3. Choose hub detection method (MCC, DMNC, etc.)
# 4. Top 10% nodes will be highlighted
```

### Example 4: Create Publication Figure

```python
# Style settings for publication:
# - RBP nodes: Circle, 50px, blue (#3498db)
# - RNA nodes: Diamond, 40px, orange (#e67e22)
# - Edges: Gray (#95a5a6), width based on binding_score
# - Labels: Arial 12pt, black
# - Background: White
# - Export: PNG 300 DPI or PDF
```

## Integration with Other Skills

- **networkx**: Create and manipulate networks programmatically
- **string-database**: Query STRING PPI data
- **pandas**: Process node/edge attributes
- **matplotlib**: Alternative static network plots
- **scientific-visualization**: Publication figure guidelines

## Best Practices

### Network Design
1. **Node sizing**: Proportional to importance (degree, centrality)
2. **Edge width**: Reflect interaction strength
3. **Color coding**: Distinguish node/edge types
4. **Layout selection**: Force-directed for most biological networks

### Large Networks (>1000 nodes)
1. Use ** filtering** to show only high-confidence interactions
2. Apply **community detection** before visualization
3. Consider **clustering** similar nodes
4. Export subsets for detailed views

## Troubleshooting

**Issue**: Cytoscape won't start
- **Solution**: Check Java installation (Java 17+ required)

**Issue**: RCy3 connection fails
- **Solution**: Enable Cytoscape REST API (Edit → Preferences → REST API)

**Issue**: Layout is too crowded
- **Solution**: Adjust repulsion strength in Force Atlas 2 settings

## Resources

- **Official Website**: https://cytoscape.org/
- **App Store**: https://apps.cytoscape.org/
- **Tutorials**: https://cytoscape.org/cytoscape-tutorials/
- **Citation**: Shannon et al. (2003) Genome Research

## Summary

Cytoscape provides an intuitive yet powerful platform for network visualization and analysis. Its extensive app ecosystem and integration capabilities make it an essential tool for exploring complex biological networks, from RBP-RNA interactions to pathway analysis.
