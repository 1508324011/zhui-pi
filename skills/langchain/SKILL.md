---
name: langchain
description: Framework for developing applications powered by language models. Use for building research knowledge graphs, document retrieval systems, AI agents for scientific workflows, and chaining multiple LLM operations. Best for creating personalized literature databases, automated research assistants, and complex multi-step scientific reasoning pipelines.
license: MIT
compatibility: opencode
metadata:
  category: ai-framework
  language: python
  skill-author: K-Dense Inc.
---

# LangChain: Framework for LLM Applications

## Overview

LangChain is a comprehensive framework for developing applications powered by large language models (LLMs). It provides tools for chaining together multiple LLM operations, managing memory, integrating with external data sources, and building autonomous agents. In scientific research, LangChain enables the creation of intelligent assistants for literature analysis, knowledge graph construction, and automated research workflows.

**Current Version**: LangChain 0.3.x
**Key Features**: Chains, Agents, Memory, Document Loaders, Vector Stores, Retrievers

## When to Use This Skill

Use LangChain when you need to:

- **Build research knowledge bases** from scientific literature
- **Create intelligent literature search assistants**
- **Automate multi-step scientific workflows**
- **Integrate LLMs with external databases** (PubMed, ChEMBL, etc.)
- **Process and analyze large document collections**
- **Build conversational agents for research Q&A**
- **Chain multiple LLM operations** for complex reasoning
- **Implement RAG (Retrieval-Augmented Generation)** systems

## Installation and Setup

```bash
# Core installation
pip install langchain

# With common integrations
pip install langchain langchain-openai langchain-community

# For scientific applications
pip install langchain langchain-experimental

# Vector stores for document retrieval
pip install chromadb faiss-cpu  # or faiss-gpu

# Document loaders
pip install pypdf beautifulsoup4 unstructured

# Complete scientific stack
pip install langchain langchain-openai chromadb pypdf pandas numpy
```

## Core Capabilities

### 1. Chains

Sequential or parallel execution of LLM operations:
- **LLMChain**: Basic prompt → model → output
- **SequentialChain**: Multiple steps in sequence
- **RouterChain**: Dynamic routing based on input
- **Map-Reduce**: Process large documents in chunks

### 2. Agents

Autonomous systems that use tools to accomplish tasks:
- **Zero-shot ReAct**: Reasoning and acting
- **Plan-and-Execute**: Break tasks into subtasks
- **Self-Ask**: Ask follow-up questions for better answers
- **Conversational**: Maintain context across interactions

### 3. Document Processing

**Loaders** for various formats:
- PDF, Markdown, HTML, TXT
- PubMed XML, CSV, JSON
- APIs (PubMed, arXiv, etc.)

**Text Splitters**:
- Character-based
- Recursive character
- Token-based
- Semantic chunking

### 4. Vector Stores and Retrieval

Store document embeddings for semantic search:
- **ChromaDB**: Lightweight, local
- **FAISS**: Facebook AI Similarity Search
- **Pinecone**: Managed cloud service
- **Weaviate**: Vector search engine

## Using This Skill

### Example 1: Literature Knowledge Base

```python
from langchain.document_loaders import PyPDFLoader, DirectoryLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import Chroma
from langchain.chains import RetrievalQA
from langchain_openai import ChatOpenAI
import os

# Set API key
os.environ['OPENAI_API_KEY'] = 'your-api-key'

# Load scientific papers
loader = DirectoryLoader(
    './papers/',
    glob='**/*.pdf',
    loader_cls=PyPDFLoader
)

documents = loader.load()
print(f"Loaded {len(documents)} document chunks")

# Split into chunks
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200,
    separators=["\n\n", "\n", " ", ""]
)

texts = text_splitter.split_documents(documents)
print(f"Split into {len(texts)} chunks")

# Create embeddings and store
embeddings = OpenAIEmbeddings()
vectordb = Chroma.from_documents(
    documents=texts,
    embedding=embeddings,
    persist_directory='./chroma_db'
)

print("Knowledge base created!")
```

### Example 2: Research Q&A System

```python
# Initialize LLM
llm = ChatOpenAI(model_name='gpt-4', temperature=0.1)

# Create retrieval chain
qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    chain_type='stuff',
    retriever=vectordb.as_retriever(search_kwargs={'k': 5}),
    return_source_documents=True
)

# Query the knowledge base
query = "What are the latest findings about FUS protein aggregation in ALS?"
result = qa_chain.invoke({'query': query})

print(f"Answer: {result['result']}\n")
print("Sources:")
for doc in result['source_documents']:
    print(f"  - {doc.metadata.get('source', 'Unknown')}")
```

### Example 3: Multi-Document Synthesis

```python
from langchain.chains.summarize import load_summarize_chain
from langchain.prompts import PromptTemplate

# Custom prompt for scientific synthesis
synthesis_prompt = """
You are a scientific research assistant. Synthesize the following research papers about {topic}.

Focus on:
1. Key findings and conclusions
2. Methodological approaches
3. Areas of agreement and controversy
4. Research gaps and future directions

Papers:
{text}

Provide a comprehensive synthesis in academic style:
"""

PROMPT = PromptTemplate(
    template=synthesis_prompt,
    input_variables=['text', 'topic']
)

# Load summarize chain
chain = load_summarize_chain(
    llm,
    chain_type='map_reduce',
    map_prompt=PROMPT,
    combine_prompt=PROMPT
)

# Run synthesis
topic = "RBP-RNA interactions in neurodegeneration"
result = chain.run({'input_documents': texts, 'topic': topic})
print(result)
```

### Example 4: Research Agent with Tools

```python
from langchain.agents import Tool, AgentExecutor, create_react_agent
from langchain.prompts import PromptTemplate
from langchain.tools import BaseTool
from langchain_community.tools.pubmed.tool import PubmedQueryRun

# Define custom tools
class ProteinInteractionTool(BaseTool):
    name = "protein_interaction"
    description = "Query protein-protein interactions from STRING database"
    
    def _run(self, query: str):
        # Implementation using string-database skill
        return f"Protein interaction data for: {query}"
    
    async def _arun(self, query: str):
        raise NotImplementedError()

# Initialize tools
tools = [
    PubmedQueryRun(),
    Tool(
        name="literature_kb",
        func=vectordb.as_retriever().get_relevant_documents,
        description="Search the local literature knowledge base"
    ),
    ProteinInteractionTool()
]

# Create agent
agent_prompt = PromptTemplate.from_template("""
You are a helpful scientific research assistant. Use the available tools to answer questions.

Available tools:
{tools}

Use the following format:
Question: the input question you must answer
Thought: think about what to do
Action: the action to take (one of [{tool_names}])
Action Input: the input to the action
Observation: the result of the action
... (repeat Thought/Action/Action Input/Observation as needed)
Thought: I now know the final answer
Final Answer: the final answer to the original question

Begin!

Question: {input}
Thought: {agent_scratchpad}
""")

agent = create_react_agent(llm, tools, agent_prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

# Run agent
response = agent_executor.invoke({
    "input": "Find recent papers about RBP aggregation in ALS and identify key interacting proteins"
})
```

### Example 5: Conversational Research Assistant

```python
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationalRetrievalChain

# Initialize memory
memory = ConversationBufferMemory(
    memory_key='chat_history',
    return_messages=True
)

# Create conversational chain
qa = ConversationalRetrievalChain.from_llm(
    llm=llm,
    retriever=vectordb.as_retriever(),
    memory=memory,
    verbose=True
)

# Interactive conversation
questions = [
    "What is the role of FUS in RNA splicing?",
    "How does it relate to TDP-43?",
    "What therapeutic approaches target these proteins?"
]

for question in questions:
    result = qa.invoke({'question': question})
    print(f"Q: {question}")
    print(f"A: {result['answer']}\n")
```

### Example 6: Automated Literature Monitoring

```python
from langchain.document_loaders import ArxivLoader
from langchain.chains import LLMChain
import schedule
import time

def monitor_new_papers():
    """Monitor arXiv for new papers on RBPs"""
    
    # Load recent papers
    loader = ArxivLoader(
        query="RNA-binding proteins AND (aggregation OR phase separation)",
        load_max_docs=10,
        load_all_available_meta=True
    )
    
    papers = loader.load()
    
    # Analyze with LLM
    analysis_prompt = """
    Analyze these recent papers and extract:
    1. Key findings
    2. Novel methodologies
    3. Potential impact on the field
    
    Papers: {papers}
    """
    
    chain = LLMChain(llm=llm, prompt=PromptTemplate.from_template(analysis_prompt))
    analysis = chain.run(papers="\n\n".join([p.page_content[:1000] for p in papers]))
    
    print(f"New papers found: {len(papers)}")
    print(analysis)
    
    # Save to database
    vectordb.add_documents(papers)

# Schedule daily monitoring
schedule.every().day.at("09:00").do(monitor_new_papers)

# Run
while True:
    schedule.run_pending()
    time.sleep(3600)
```

## Integration with Other Skills

- **openalex-database**: Fetch paper metadata
- **pubmed-database**: Query biomedical literature
- **biorxiv-database**: Access preprints
- **literature-review**: Synthesize findings
- **research-lookup**: Real-time research queries
- **scientific-writing**: Generate manuscripts

## Best Practices

### Document Processing
1. **Chunk sizing**: 500-1000 tokens with 10-20% overlap
2. **Metadata preservation**: Keep source, author, year info
3. **Quality filtering**: Remove corrupted or low-quality PDFs
4. **Deduplication**: Check for duplicate papers

### Prompt Engineering
1. **Be specific**: Clear instructions yield better results
2. **Use examples**: Few-shot prompting for complex tasks
3. **Structure output**: Request specific formats (JSON, markdown)
4. **Iterate**: Refine prompts based on results

### Cost Optimization
1. **Embedding model**: Use local models (Sentence-Transformers) for cost savings
2. **Chunk strategically**: Larger chunks = fewer embeddings
3. **Caching**: Cache LLM responses for repeated queries
4. **Batching**: Process multiple documents together

## Advanced Topics

### Custom Retrievers

```python
from langchain.retrievers import EnsembleRetriever

# Combine multiple retrieval strategies
bm25_retriever = BM25Retriever.from_documents(texts)
vectordb_retriever = vectordb.as_retriever()

ensemble = EnsembleRetriever(
    retrievers=[bm25_retriever, vectordb_retriever],
    weights=[0.5, 0.5]
)
```

### Structured Output

```python
from langchain.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field

class ResearchFinding(BaseModel):
    title: str = Field(description="Finding title")
    description: str = Field(description="Detailed description")
    evidence: str = Field(description="Supporting evidence")
    confidence: float = Field(description="Confidence score 0-1")

parser = PydanticOutputParser(pydantic_object=ResearchFinding)

prompt = PromptTemplate(
    template="Extract findings from:\n{text}\n{format_instructions}",
    input_variables=["text"],
    partial_variables={"format_instructions": parser.get_format_instructions()}
)
```

## Troubleshooting

**Issue**: Token limit exceeded
- **Solution**: Use text splitters; implement map-reduce chains

**Issue**: Poor retrieval quality
- **Solution**: Adjust chunk size; use hybrid search; add metadata

**Issue**: API rate limits
- **Solution**: Implement rate limiting; use local LLMs (Ollama)

## Resources

- **Documentation**: https://python.langchain.com/
- **GitHub**: https://github.com/langchain-ai/langchain
- **Cookbook**: https://python.langchain.com/docs/cookbook/
- **Community**: https://discord.gg/langchain

## Summary

LangChain provides a powerful framework for building AI-powered research tools. Its modular architecture allows researchers to create sophisticated applications for literature analysis, knowledge management, and automated scientific workflows, significantly accelerating the research process.
