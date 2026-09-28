# MemoryOps Architecture & Technical Deep Dive

MemoryOps is designed as an agentic incident response platform for Site Reliability Engineering (SRE) teams.

---

## Architecture Components

### 1. Hindsight Memory System Layer (`hindsight_service.py`)
- Interfaces with the official `hindsight-client` Python SDK.
- Connects to Hindsight Cloud (`https://api.hindsight.vectorize.io`) or self-hosted Hindsight API server.
- Uses namespace bank ID: `memoryops-incidents`.
- Manages dual memory strategy:
  - Multi-strategy retrieval via `client.recall(bank_id=..., query=...)`
  - Structured document persistence via `client.retain(bank_id=..., content=..., document_id=...)`
  - Automatic fallback in-memory store for network resilience during server outages.

### 2. Groq LLM Intelligence Layer (`llm_service.py`)
- Model: `llama-3.3-70b-versatile` via official Groq SDK.
- Enforces strict system prompt contracts to eliminate hallucinated past incidents:
  - `CURRENT EVIDENCE`: Extracted strictly from live input payload.
  - `HISTORICAL MEMORY`: Extracted strictly from Hindsight recalled memories.
  - `INFERENCE`: Synthesized SRE root-cause hypothesis.
- Enforces JSON output schema structure.

### 3. Incident Orchestrator (`incident_service.py`)
- Bridges Hindsight recall results and Groq LLM prompts.
- Formats recalled memory objects into Markdown context blocks.
- Manages memory retaining lifecycle when DevOps engineers save resolutions.

### 4. FastAPI REST API (`main.py`)
- `GET /api/health`: Health status & memory bank statistics.
- `POST /api/incidents/analyze`: Incident recall & LLM analysis pipeline.
- `POST /api/incidents/retain`: Memory commit endpoint.
- `GET /api/incidents/memories`: Bank memory listing.
- `POST /api/demo/seed`: Seed pre-built realistic incident records.

### 5. React DevOps Dashboard (`frontend/`)
- Single Page Application built with React 18, Vite, and Tailwind CSS.
- Real-time connection status header.
- Interactive BEFORE vs AFTER memory demonstration mode.
- Resolution commit panel for continuous learning.
