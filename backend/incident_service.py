import logging
from typing import Dict, Any, List
from hindsight_service import HindsightService
from llm_service import LLMService

logger = logging.getLogger("memoryops.incident_service")

class IncidentService:
    """
    Core incident response orchestrator connecting Hindsight Memory and Groq LLM.
    """

    def __init__(
        self,
        hindsight_service: HindsightService = None,
        llm_service: LLMService = None
    ):
        self.hindsight = hindsight_service or HindsightService()
        self.llm = llm_service or LLMService()

    def analyze_incident(self, incident_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Full Incident Analysis Workflow:
        1. Receive live incident report
        2. Query Hindsight for relevant historical memories
        3. Format retrieved memories into LLM prompt context
        4. Generate AI analysis (root cause, actions, evidence, confidence)
        5. Return unified incident response payload
        """
        service = incident_data.get("service", "Unknown Service")
        description = incident_data.get("description") or incident_data.get("symptoms", "")
        
        query = f"{service} {description}"

        # 1. Hindsight Recall
        historical_memories = self.hindsight.recall_incidents(query=query, limit=5)
        
        # 2. Format memories for LLM prompt
        formatted_memories_text = self.hindsight.format_memories_for_llm(historical_memories)

        # 3. LLM Analysis
        analysis = self.llm.analyze_incident(
            incident=incident_data,
            historical_memories_text=formatted_memories_text,
            memories_list=historical_memories
        )

        # 4. Construct unified result
        response_payload = {
            "incident": incident_data,
            "historical_memories": historical_memories,
            "summary": analysis.get("summary", f"Analysis for {service}"),
            "root_cause": analysis.get("root_cause", "Under investigation"),
            "severity": analysis.get("severity", incident_data.get("severity", "HIGH")).upper(),
            "recommended_investigation": analysis.get("recommended_investigation", []),
            "recommended_actions": analysis.get("recommended_actions", []),
            "historical_evidence": analysis.get("historical_evidence", "No relevant historical memory was found."),
            "confidence": analysis.get("confidence", "MEDIUM"),
            "explanation": analysis.get("explanation", ""),
            "memory_used": len(historical_memories) > 0,
            "additional_info_needed": analysis.get("additional_info_needed", [])
        }

        return response_payload

    def retain_resolution(self, resolution_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Stores resolved incident with root cause & solution into Hindsight Memory.
        """
        result = self.hindsight.retain_incident(resolution_data)
        return {
            "status": "success" if result.get("stored_in_hindsight_cloud") or result.get("stored_in_local_bank") else "error",
            "incident_id": result.get("incident_id"),
            "details": result,
            "message": f"Incident {result.get('incident_id')} successfully retained in Hindsight Memory System"
        }

    def get_stored_memories(self) -> List[Dict[str, Any]]:
        """Returns preview list of stored memories in the Hindsight bank."""
        return self.hindsight._local_memory_bank
