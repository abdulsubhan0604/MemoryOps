import sys
import os
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from main import app

client = TestClient(app)

def test_seed_demo_incidents():
    """Test seeding demo records into memory bank."""
    response = client.post("/api/demo/seed")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert len(data["seeded"]) >= 5

def test_get_memories_endpoint():
    """Test retrieving stored memories."""
    # Ensure bank has seeded data
    client.post("/api/demo/seed")
    
    response = client.get("/api/incidents/memories")
    assert response.status_code == 200
    data = response.json()
    assert data["total_memories"] >= 5

def test_analyze_incident_similar_to_historical():
    """Test analyzing incident similar to historical PAY-001 incident."""
    client.post("/api/demo/seed")

    payload = {
        "service": "Payment API",
        "environment": "production",
        "description": "Payment API is returning HTTP 504 Gateway Timeout errors again under load",
        "severity": "High"
    }
    
    response = client.post("/api/incidents/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    
    assert data["memory_used"] is True
    assert len(data["historical_memories"]) > 0
    assert "PAY-001" in str(data["historical_memories"]) or "PAY-001" in str(data["historical_evidence"])
    assert "root_cause" in data
    assert len(data["recommended_actions"]) > 0

def test_analyze_unknown_incident():
    """Test analyzing completely unknown incident with no prior memories."""
    payload = {
        "service": "Unusual Quantum Subsystem",
        "environment": "production",
        "description": "Superposition state collapse in qubit array 77",
        "severity": "Low"
    }
    
    response = client.post("/api/incidents/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    
    # Should complete cleanly even when memory is false
    assert "root_cause" in data
    assert "recommended_actions" in data

def test_retain_incident_endpoint():
    """Test retaining a new incident resolution."""
    payload = {
        "incident_id": "NEW-099",
        "service": "Order Processing",
        "environment": "production",
        "symptoms": "Queue backup in RabbitMQ",
        "root_cause": "Deadletter exchange saturation",
        "resolution": "Purged deadletter queue and scaled consumer pool size",
        "impact": "Medium",
        "lessons_learned": "Alert when deadletter queue depth > 100"
    }

    response = client.post("/api/incidents/retain", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["incident_id"] == "NEW-099"

def test_empty_or_invalid_incident_payload():
    """Test validation errors for empty/missing required fields."""
    response = client.post("/api/incidents/analyze", json={})
    assert response.status_code == 422  # Pydantic validation error
