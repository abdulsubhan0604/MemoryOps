import os
import logging
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv

from hindsight_service import HindsightService
from llm_service import LLMService
from incident_service import IncidentService

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("memoryops.main")

app = FastAPI(
    title="MemoryOps AI Incident Response API",
    description="Production-ready DevOps Incident Response Agent powered by Hindsight Memory System and Groq LLM",
    version="1.0.0"
)

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize core services
hindsight_svc = HindsightService()
llm_svc = LLMService()
incident_svc = IncidentService(hindsight_service=hindsight_svc, llm_service=llm_svc)


# Pydantic Schemas with modern V2 annotations
class IncidentAnalyzeRequest(BaseModel):
    service: str = Field(..., json_schema_extra={"example": "Payment API"}, description="Name of affected microservice or component")
    environment: str = Field("production", json_schema_extra={"example": "production"}, description="Environment stage")
    description: str = Field(..., json_schema_extra={"example": "Payment API is returning HTTP 504 errors"}, description="Observed symptoms or failure description")
    severity: Optional[str] = Field("High", json_schema_extra={"example": "High"}, description="Severity hint")

class IncidentRetainRequest(BaseModel):
    incident_id: Optional[str] = Field(None, json_schema_extra={"example": "PAY-001"}, description="Unique incident identifier")
    service: str = Field(..., json_schema_extra={"example": "Payment API"}, description="Affected service name")
    environment: str = Field("production", json_schema_extra={"example": "production"}, description="Target environment")
    symptoms: str = Field(..., json_schema_extra={"example": "HTTP 504 Gateway Timeout errors"}, description="Observed symptoms")
    root_cause: str = Field(..., json_schema_extra={"example": "Database connection pool exhaustion"}, description="Root cause identified after investigation")
    resolution: str = Field(..., json_schema_extra={"example": "Increased database connection pool size from 20 to 100"}, description="Resolution steps applied")
    impact: Optional[str] = Field("High - 15% request drop", description="Business or operational impact")
    lessons_learned: Optional[str] = Field("Monitor connection pool limits continuously", description="Retrospective takeaway")


@app.get("/api/health", summary="Health Check")
def health_check():
    """Returns application health status and sub-service connectivity."""
    hindsight_status = hindsight_svc.check_health()
    groq_configured = bool(os.getenv("GROQ_API_KEY"))

    return {
        "status": "healthy",
        "service": "MemoryOps Backend API",
        "hindsight": hindsight_status,
        "groq_configured": groq_configured,
        "llm_model": os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
    }


@app.post("/api/incidents/analyze", summary="Analyze Live Incident")
def analyze_incident(payload: IncidentAnalyzeRequest):
    """
    Submits an incident for recall and analysis.
    1. Recalls relevant historical memories from Hindsight.
    2. Sends current incident + memories context to Groq LLM.
    3. Returns root cause analysis, recommendations, and memory evidence.
    """
    if not payload.service or not payload.description:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Both 'service' and 'description' fields are required."
        )

    try:
        data = payload.model_dump() if hasattr(payload, "model_dump") else payload.dict()
        result = incident_svc.analyze_incident(data)
        return result
    except Exception as e:
        logger.error(f"Error analyzing incident: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while processing the incident analysis."
        )


@app.post("/api/incidents/retain", summary="Retain Incident Resolution")
def retain_incident(payload: IncidentRetainRequest):
    """
    Stores a resolved incident with root cause and resolution into Hindsight Memory.
    Subsequent similar incidents will retrieve this experience.
    """
    if not payload.service or not payload.symptoms or not payload.root_cause or not payload.resolution:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Fields 'service', 'symptoms', 'root_cause', and 'resolution' are required."
        )

    try:
        data = payload.model_dump() if hasattr(payload, "model_dump") else payload.dict()
        result = incident_svc.retain_resolution(data)
        return result
    except Exception as e:
        logger.error(f"Error retaining incident: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retain incident resolution into Hindsight."
        )


@app.get("/api/incidents/memories", summary="Get Memory Bank Contents")
def get_memories():
    """Lists current stored memory records in Hindsight."""
    try:
        memories = incident_svc.get_stored_memories()
        return {
            "bank_id": hindsight_svc.bank_id,
            "total_memories": len(memories),
            "memories": memories
        }
    except Exception as e:
        logger.error(f"Error retrieving memories: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve stored memories."
        )


@app.post("/api/demo/seed", summary="Seed Demo Memory Records")
def seed_demo_data():
    """Pre-populates realistic demo incidents into Hindsight Memory bank for testing."""
    demo_incidents = [
        {
            "incident_id": "PAY-001",
            "service": "Payment API",
            "environment": "production",
            "symptoms": "Payment API is returning HTTP 504 Gateway Timeout errors during high traffic",
            "root_cause": "Database connection pool exhaustion due to leaked connection handles in checkout workflow",
            "resolution": "Increased max connection pool size from 20 to 100 and applied connection leak fix in checkout handler",
            "impact": "High - 15% payment transactions failed for 20 minutes",
            "lessons_learned": "Enforce strict pool timeout bounds and alert when active connection count exceeds 80%"
        },
        {
            "incident_id": "DB-002",
            "service": "PostgreSQL Primary",
            "environment": "production",
            "symptoms": "PostgreSQL max connection limits exceeded, rejecting write transactions",
            "root_cause": "Unindexed analytics query holding long transaction locks",
            "resolution": "Terminated long running query processes and created index on timestamp column",
            "impact": "Critical - Write unavailability for 10 minutes",
            "lessons_learned": "Require DB migration index review for all analytics queries"
        },
        {
            "incident_id": "AUTH-003",
            "service": "Authentication Service",
            "environment": "production",
            "symptoms": "HTTP 401 Unauthorized errors across all downstream APIs",
            "root_cause": "JWT signing key rotation mismatch between Auth service and API Gateway",
            "resolution": "Synchronized JWT public key cache across API Gateway clusters",
            "impact": "High - User login failures",
            "lessons_learned": "Automate dual key grace periods during JWT key rotation"
        },
        {
            "incident_id": "CACHE-004",
            "service": "Redis Cluster",
            "environment": "production",
            "symptoms": "Redis OOM memory error, key evictions failing",
            "root_cause": "Session cache keys set without TTL expiration policy",
            "resolution": "Set all volatile key namespaces to volatile-lru eviction policy and set 24h default TTL",
            "impact": "Medium - Increased latency due to DB fallback",
            "lessons_learned": "Enforce TTL on all cache store operations"
        },
        {
            "incident_id": "API-005",
            "service": "API Gateway",
            "environment": "production",
            "symptoms": "Latency spike to 5000ms on /v1/orders endpoints",
            "root_cause": "Upstream service timeout default set to 60 seconds allowing thread starvation",
            "resolution": "Reduced gateway timeout threshold to 3000ms and enabled circuit breaker pattern",
            "impact": "High - Cascading slow responses",
            "lessons_learned": "Always configure circuit breaker threshold limits on edge gateways"
        }
    ]

    seeded_records = []
    for inc in demo_incidents:
        res = incident_svc.retain_resolution(inc)
        seeded_records.append(res)

    return {
        "status": "success",
        "message": f"Successfully seeded {len(seeded_records)} demo incident memories into Hindsight",
        "seeded": seeded_records
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
