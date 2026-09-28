import sys
import os
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from hindsight_service import HindsightService

def test_hindsight_retain_and_recall():
    """Test retain and recall workflow in Hindsight service."""
    service = HindsightService()
    
    incident = {
        "incident_id": "TEST-PAY-001",
        "service": "Payment API",
        "environment": "staging",
        "symptoms": "HTTP 504 gateway timeout",
        "root_cause": "Connection pool timeout",
        "resolution": "Increased pool size to 50"
    }

    # 1. Retain
    retain_result = service.retain_incident(incident)
    assert retain_result["status"] == "success"
    assert retain_result["incident_id"] == "TEST-PAY-001"

    # 2. Recall matching incident
    recalled = service.recall_incidents("Payment API 504 timeout", limit=5)
    assert len(recalled) > 0
    assert any(m["incident_id"] == "TEST-PAY-001" for m in recalled)

def test_hindsight_recall_unknown_incident():
    """Test recall query for unknown/unrelated incident."""
    service = HindsightService()
    recalled = service.recall_incidents("Quantum Computing Teleportation Failure", limit=5)
    # Should either return empty list or low relevance items
    if recalled:
        assert all(m["relevance_score"] < 0.99 for m in recalled)

def test_hindsight_format_memories_for_llm():
    """Test formatting recalled memories for LLM prompt context."""
    service = HindsightService()
    
    # Test empty list
    formatted_empty = service.format_memories_for_llm([])
    assert formatted_empty == "No relevant historical memory was found."

    # Test populated list
    memories = [{
        "incident_id": "PAY-001",
        "service": "Payment API",
        "root_cause": "Pool exhaustion",
        "resolution": "Increased pool size",
        "raw_text": "Sample raw text",
        "relevance_score": 0.95
    }]
    formatted_populated = service.format_memories_for_llm(memories)
    assert "HISTORICAL MEMORY #1" in formatted_populated
    assert "PAY-001" in formatted_populated
