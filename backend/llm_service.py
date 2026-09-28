import os
import json
import logging
from typing import Dict, Any, List, Optional
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("memoryops.llm")

class LLMService:
    """
    Service for Groq LLM integration.
    Analyzes current incidents with historical Hindsight context.
    """

    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        self.api_key = api_key or os.getenv("GROQ_API_KEY", "")
        self.model = model or os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
        
        self.client = None
        self._initialize_client()

    def _initialize_client(self):
        """Initializes Groq client if API key is present."""
        if not self.api_key:
            logger.warning("GROQ_API_KEY is not set. Running LLM service in fallback/rule-based mode.")
            return
        try:
            from groq import Groq
            self.client = Groq(api_key=self.api_key)
            logger.info(f"Groq LLM client initialized using model '{self.model}'")
        except Exception as e:
            logger.error(f"Failed to initialize Groq client: {e}. Falling back to heuristic engine.")
            self.client = None

    def analyze_incident(
        self,
        incident: Dict[str, Any],
        historical_memories_text: str,
        memories_list: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Sends current incident + recalled Hindsight memories to Groq LLM for analysis.
        Returns structured analysis object.
        """
        service = incident.get("service", "Unknown Service")
        environment = incident.get("environment", "production")
        description = incident.get("description") or incident.get("symptoms", "No description provided")
        severity_hint = incident.get("severity", "High")

        system_prompt = (
            "You are MemoryOps AI, an expert DevOps Incident Response & Site Reliability Engineering (SRE) agent.\n"
            "Your job is to perform root-cause analysis on production incidents leveraging historical context from Hindsight Memory.\n\n"
            "STRICT RULES:\n"
            "1. You MUST clearly distinguish between:\n"
            "   - CURRENT EVIDENCE (symptoms, logs, service details of the current incident)\n"
            "   - HISTORICAL MEMORY (past experiences retrieved from Hindsight Memory)\n"
            "   - INFERENCE (your technical assessment based on SRE practices)\n"
            "2. DO NOT invent past incidents or claim a historical event happened unless it is in the HISTORICAL MEMORIES text.\n"
            "3. If no relevant memories exist (or memory text states 'No relevant historical memory was found.'), explicitly state in historical_evidence: 'No relevant historical memory was found.'\n"
            "4. Return ONLY valid, parseable JSON with the exact following schema:\n"
            "{\n"
            '  "summary": "Brief summary of current incident",\n'
            '  "root_cause": "Likely root cause based on current evidence & historical patterns",\n'
            '  "severity": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",\n'
            '  "recommended_investigation": ["step 1", "step 2"],\n'
            '  "recommended_actions": ["action 1", "action 2"],\n'
            '  "historical_evidence": "Description of historical memories used or \\"No relevant historical memory was found.\\"",\n'
            '  "confidence": "HIGH" | "MEDIUM" | "LOW",\n'
            '  "explanation": "Detailed explanation of analysis and reasoning",\n'
            '  "additional_info_needed": ["info 1", "info 2"]\n'
            "}"
        )

        user_prompt = (
            f"--- CURRENT INCIDENT ---\n"
            f"Service: {service}\n"
            f"Environment: {environment}\n"
            f"Severity Hint: {severity_hint}\n"
            f"Description/Symptoms: {description}\n\n"
            f"--- HISTORICAL HINDSIGHT MEMORIES ---\n"
            f"{historical_memories_text}\n"
        )

        if self.client:
            try:
                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    temperature=0.2,
                    response_format={"type": "json_object"}
                )

                raw_content = response.choices[0].message.content
                analysis_data = json.loads(raw_content)
                analysis_data["memory_used"] = len(memories_list) > 0
                return analysis_data

            except Exception as e:
                logger.error(f"Groq LLM call failed: {e}. Falling back to rule-based analysis.")

        # Fallback heuristic analysis generator (used offline or when Groq API key is missing)
        return self._generate_fallback_analysis(incident, memories_list)

    def _generate_fallback_analysis(
        self,
        incident: Dict[str, Any],
        memories_list: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Generates realistic rule-based incident analysis when LLM API is unavailable."""
        service = incident.get("service", "Service")
        description = incident.get("description", "").lower()

        has_memories = len(memories_list) > 0
        memory_used_str = memories_list[0].get("incident_id") if has_memories else None

        if has_memories:
            past_mem = memories_list[0]
            root_cause = f"Correlated with historical incident {past_mem.get('incident_id')}: {past_mem.get('root_cause')}"
            historical_evidence = f"Retrieved historical memory {past_mem.get('incident_id')} for service '{past_mem.get('service')}' with resolution: {past_mem.get('resolution')}"
            actions = [
                f"Apply proven resolution from {past_mem.get('incident_id')}: {past_mem.get('resolution')}",
                f"Verify {service} connectivity and telemetry metrics.",
                "Escalate to on-call engineer if metrics do not stabilize within 5 minutes."
            ]
            confidence = "HIGH"
            explanation = f"Analysis leverage previous resolution pattern from Hindsight memory record {past_mem.get('incident_id')}."
        else:
            historical_evidence = "No relevant historical memory was found."
            confidence = "MEDIUM"
            if "504" in description or "timeout" in description or "pool" in description:
                root_cause = f"Potential connection exhaustion or downstream service timeout in {service}"
                actions = [
                    "Inspect database connection pool metrics and active socket counts.",
                    "Check network latency between Gateway and application backends.",
                    "Scale pool limits or restart service instances if worker threads are saturated."
                ]
            elif "auth" in description or "401" in description or "403" in description:
                root_cause = f"Authentication token verification failure or secret mismatch in {service}"
                actions = [
                    "Verify secret manager sync and API key rotation status.",
                    "Check IAM permissions and token expiration timestamps."
                ]
            elif "redis" in description or "cache" in description:
                root_cause = f"Redis cache memory saturation or cluster node unreachability"
                actions = [
                    "Inspect Redis maxmemory eviction policies.",
                    "Verify cluster topology and failover state."
                ]
            else:
                root_cause = f"Unclassified anomaly detected in {service}. Resource exhaustion or unhandled exception suspected."
                actions = [
                    f"Check error rates and stack traces in {service} logs.",
                    "Inspect CPU, memory, and disk I/O utilization.",
                    "Roll back recent code deployment if error correlated with release window."
                ]
            explanation = f"Generic heuristic incident assessment. No prior historical resolutions recorded in Hindsight for this issue pattern."

        return {
            "summary": f"Incident analysis for {service} - {incident.get('description', 'Issue reported')[:80]}",
            "root_cause": root_cause,
            "severity": incident.get("severity", "HIGH").upper(),
            "recommended_investigation": [
                f"Check APM metrics for {service} latency spikes",
                "Query centralized log aggregator for ERROR level log statements"
            ],
            "recommended_actions": actions,
            "historical_evidence": historical_evidence,
            "confidence": confidence,
            "explanation": explanation,
            "memory_used": has_memories,
            "matched_memory_id": memory_used_str,
            "additional_info_needed": [
                "Full application stack trace logs",
                "Database CPU and connection metrics during incident window"
            ]
        }
