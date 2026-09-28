import os
import json
import logging
from pathlib import Path
from typing import List, Dict, Any, Optional
from datetime import datetime
from dotenv import load_dotenv

# Ensure .env is explicitly loaded from backend directory
env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)

logger = logging.getLogger("memoryops.hindsight")

class HindsightService:
    """
    Service wrapper for Hindsight Memory System.
    Handles incident retention, recall, formatting, and graceful offline/fallback operation.
    """

    def __init__(
        self,
        api_url: Optional[str] = None,
        api_key: Optional[str] = None,
        bank_id: Optional[str] = None
    ):
        self.api_url = api_url or os.getenv("HINDSIGHT_API_URL", "https://api.hindsight.vectorize.io")
        self.api_key = api_key or os.getenv("HINDSIGHT_API_KEY", "")
        self.bank_id = bank_id or os.getenv("HINDSIGHT_BANK_ID", "memoryops-incidents")
        
        self.client = None
        self.is_connected = False
        
        # Local fallback memory bank for offline mode / tests / demo
        self._local_memory_bank: List[Dict[str, Any]] = []

        self._initialize_client()

    def _initialize_client(self):
        """Attempts to initialize the official hindsight-client Python SDK."""
        try:
            from hindsight_client import Hindsight
            
            # Pass base_url and optional api_key directly into Hindsight constructor
            self.client = Hindsight(
                base_url=self.api_url,
                api_key=self.api_key if self.api_key else None
            )
            
            # Connected is True only if API key is present for Cloud, or targeting local server
            if self.api_key or "localhost" in self.api_url or "127.0.0.1" in self.api_url:
                self.is_connected = True
            else:
                self.is_connected = False
                logger.warning("HINDSIGHT_API_KEY is not set in backend/.env. Hindsight Cloud calls will require API key.")
                
            logger.info(f"Hindsight client initialized (URL: {self.api_url}, Bank: {self.bank_id}, Key configured: {bool(self.api_key)})")
        except Exception as e:
            logger.warning(f"Could not initialize Hindsight client: {e}. Falling back to in-memory store.")
            self.is_connected = False
            self.client = None

    def retain_incident(self, incident: Dict[str, Any]) -> Dict[str, Any]:
        """
        Retains an incident record into Hindsight Memory.
        """
        incident_id = incident.get("incident_id") or f"INC-{int(datetime.now().timestamp())}"
        service = incident.get("service", "Unknown Service")
        environment = incident.get("environment", "production")
        symptoms = incident.get("symptoms") or incident.get("description", "No symptoms specified")
        root_cause = incident.get("root_cause", "Under investigation")
        resolution = incident.get("resolution", "No resolution provided")
        impact = incident.get("impact", "Unknown")
        lessons = incident.get("lessons_learned", "N/A")
        timestamp = incident.get("timestamp") or datetime.now().isoformat()

        formatted_content = (
            f"[INCIDENT MEMORY RECORD]\n"
            f"Incident ID: {incident_id}\n"
            f"Service: {service}\n"
            f"Environment: {environment}\n"
            f"Symptoms/Description: {symptoms}\n"
            f"Root Cause: {root_cause}\n"
            f"Resolution: {resolution}\n"
            f"Impact: {impact}\n"
            f"Lessons Learned: {lessons}\n"
            f"Timestamp: {timestamp}"
        )

        memory_record = {
            "memory_id": incident_id,
            "incident_id": incident_id,
            "service": service,
            "environment": environment,
            "symptoms": symptoms,
            "root_cause": root_cause,
            "resolution": resolution,
            "impact": impact,
            "lessons_learned": lessons,
            "timestamp": timestamp,
            "raw_text": formatted_content,
            "created_at": datetime.now().isoformat()
        }

        # Always store in local memory bank for immediate local recall guarantees
        self._local_memory_bank.append(memory_record)

        sdk_success = False
        sdk_error = None

        if self.client and self.api_key:
            try:
                # Call official Hindsight retain SDK method
                self.client.retain(
                    bank_id=self.bank_id,
                    content=formatted_content,
                    document_id=incident_id
                )
                sdk_success = True
                logger.info(f"Successfully retained incident {incident_id} in Hindsight Cloud bank '{self.bank_id}'")
            except Exception as e:
                sdk_error = str(e)
                logger.error(f"Hindsight SDK retain failed: {e}. Stored in local fallback.")
        elif self.client:
            sdk_error = "HINDSIGHT_API_KEY is not set in backend/.env. Hindsight Cloud returned 401 Unauthorized."

        return {
            "status": "success",
            "incident_id": incident_id,
            "stored_in_hindsight_cloud": sdk_success,
            "stored_in_local_bank": True,
            "error": sdk_error,
            "memory": memory_record
        }

    def recall_incidents(self, query: str, limit: int = 5) -> List[Dict[str, Any]]:
        """
        Recalls relevant incident memories from Hindsight based on search query.
        Returns ranked list of incident objects.
        """
        recalled_memories: List[Dict[str, Any]] = []

        # 1. Attempt official SDK recall if API key is configured or client is connected
        if self.client and self.api_key:
            try:
                raw_results = self.client.recall(
                    bank_id=self.bank_id,
                    query=query
                )
                
                # Parse SDK results safely
                items = []
                if hasattr(raw_results, "results"):
                    items = raw_results.results
                elif isinstance(raw_results, list):
                    items = raw_results
                elif isinstance(raw_results, dict) and "results" in raw_results:
                    items = raw_results["results"]

                for idx, item in enumerate(items[:limit]):
                    text = getattr(item, "text", "") or (item.get("text") if isinstance(item, dict) else str(item))
                    mem_id = getattr(item, "id", f"MEM-{idx+1}") or (item.get("id") if isinstance(item, dict) else f"MEM-{idx+1}")
                    score = getattr(item, "score", 0.95 - (idx * 0.05)) or (item.get("score") if isinstance(item, dict) else 0.9)

                    # Extract details from raw text if present
                    service, root_cause, resolution = self._parse_incident_text(text)
                    
                    recalled_memories.append({
                        "memory_id": mem_id,
                        "incident_id": mem_id,
                        "service": service,
                        "relevance_score": round(float(score), 2),
                        "root_cause": root_cause,
                        "resolution": resolution,
                        "raw_text": text
                    })
            except Exception as e:
                logger.error(f"Hindsight SDK recall failed: {e}. Falling back to local recall.")

        # 2. Local memory search fallback (keyword/semantic matching across local bank)
        if not recalled_memories and self._local_memory_bank:
            recalled_memories = self._search_local_bank(query, limit)

        return recalled_memories

    def _search_local_bank(self, query: str, limit: int = 5) -> List[Dict[str, Any]]:
        """Searches local in-memory bank using term matching for offline mode/fallback."""
        query_words = set(query.lower().split())
        scored_matches = []

        for record in self._local_memory_bank:
            searchable = f"{record['service']} {record['symptoms']} {record['root_cause']} {record['resolution']}".lower()
            matches = sum(1 for word in query_words if word in searchable and len(word) > 2)
            
            if matches > 0:
                score = round(min(0.99, 0.65 + (matches * 0.1)), 2)
                scored_matches.append((score, {
                    "memory_id": record["incident_id"],
                    "incident_id": record["incident_id"],
                    "service": record["service"],
                    "symptoms": record["symptoms"],
                    "relevance_score": score,
                    "root_cause": record["root_cause"],
                    "resolution": record["resolution"],
                    "raw_text": record["raw_text"]
                }))

        # Sort by relevance score descending
        scored_matches.sort(key=lambda x: x[0], reverse=True)
        return [match[1] for match in scored_matches[:limit]]

    def _parse_incident_text(self, text: str) -> tuple[str, str, str]:
        """Utility helper to parse incident details out of formatted memory string."""
        service = "Unknown Service"
        root_cause = "N/A"
        resolution = "N/A"

        lines = text.split("\n")
        for line in lines:
            if line.startswith("Service:"):
                service = line.replace("Service:", "").strip()
            elif line.startswith("Root Cause:"):
                root_cause = line.replace("Root Cause:", "").strip()
            elif line.startswith("Resolution:"):
                resolution = line.replace("Resolution:", "").strip()

        if root_cause == "N/A" and text:
            root_cause = text[:150] + "..." if len(text) > 150 else text

        return service, root_cause, resolution

    def format_memories_for_llm(self, memories: List[Dict[str, Any]]) -> str:
        """
        Formats recalled memories into a clear text prompt block for the LLM.
        """
        if not memories:
            return "No relevant historical memory was found."

        formatted_blocks = []
        for idx, mem in enumerate(memories, 1):
            block = (
                f"### HISTORICAL MEMORY #{idx} (Relevance Score: {mem.get('relevance_score', 'N/A')})\n"
                f"- **Memory/Incident ID**: {mem.get('incident_id', 'N/A')}\n"
                f"- **Affected Service**: {mem.get('service', 'N/A')}\n"
                f"- **Previous Root Cause**: {mem.get('root_cause', 'N/A')}\n"
                f"- **Previous Resolution**: {mem.get('resolution', 'N/A')}\n"
                f"- **Raw Record**: {mem.get('raw_text', 'N/A')}"
            )
            formatted_blocks.append(block)

        return "\n\n".join(formatted_blocks)

    def check_health(self) -> Dict[str, Any]:
        """Returns health status of Hindsight service integration."""
        return {
            "status": "healthy" if self.is_connected else "unauthenticated",
            "hindsight_cloud_connected": self.is_connected,
            "bank_id": self.bank_id,
            "api_key_configured": bool(self.api_key),
            "local_memory_count": len(self._local_memory_bank)
        }
