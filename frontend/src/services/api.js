const API_BASE_URL = '/api';

/**
 * Fetch health status of backend, Hindsight connection, and LLM model.
 */
export async function getHealthStatus() {
  const response = await fetch(`${API_BASE_URL}/health`);
  if (!response.ok) {
    throw new Error(`Health check failed with status ${response.status}`);
  }
  return response.json();
}

/**
 * Submit an incident for recall and AI analysis.
 */
export async function analyzeIncident(incidentPayload) {
  const response = await fetch(`${API_BASE_URL}/incidents/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(incidentPayload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Analysis request failed (${response.status})`);
  }
  return response.json();
}

/**
 * Retain resolved incident experience into Hindsight Memory.
 */
export async function retainIncident(resolutionPayload) {
  const response = await fetch(`${API_BASE_URL}/incidents/retain`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(resolutionPayload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Retain request failed (${response.status})`);
  }
  return response.json();
}

/**
 * Get stored memories from Hindsight bank.
 */
export async function getMemories() {
  const response = await fetch(`${API_BASE_URL}/incidents/memories`);
  if (!response.ok) {
    throw new Error(`Failed to fetch memories (${response.status})`);
  }
  return response.json();
}

/**
 * Seed standard demo memory records.
 */
export async function seedDemoData() {
  const response = await fetch(`${API_BASE_URL}/demo/seed`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error(`Failed to seed demo data (${response.status})`);
  }
  return response.json();
}
