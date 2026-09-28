# MemoryOps 3-Minute Demo Script

This script provides a step-by-step walkthrough for presenting MemoryOps to stakeholders, judges, or engineering teams.

---

## 🕒 Minute 0:00 - 0:45: The Problem & Introduction
- **Speaker**: "When production incidents occur at 2 AM, SREs waste critical minutes searching Slack or post-mortems for past solutions. Standard AI assistants give generic advice because they lack memory of how YOUR team fixed similar bugs before."
- **Action**: Open MemoryOps Dashboard (`http://localhost:3000`). Show the header badge displaying `Hindsight Connected: Bank memoryops-incidents`.

---

## 🕒 Minute 0:45 - 1:30: Step 1 - Generic AI (Before Memory)
- **Speaker**: "Watch what happens when we report a new incident: 'Payment Gateway Microservice returning HTTP 504 Gateway Timeout'."
- **Action**: Click on the **Before vs. After Memory Demo** tab. Click **Run 1: Analyze Without Memory**.
- **Point out**:
  - Hindsight status: `"No relevant historical memory was found."`
  - The AI offers generic troubleshooting steps because it has no historical experience.

---

## 🕒 Minute 1:30 - 2:15: Step 2 - Hindsight Retain
- **Speaker**: "Now, our senior engineer fixes the issue: it was database connection pool exhaustion. We commit this resolution into Hindsight Memory using `client.retain()`."
- **Action**: Click **Run 2: Store PAY-001 in Hindsight**.
- **Point out**:
  - Show the success badge: `PAY-001 retained into Hindsight bank 'memoryops-incidents'`.

---

## 🕒 Minute 2:15 - 3:00: Step 3 - Instant Contextual Recall (After Memory)
- **Speaker**: "Two weeks later, another engineer gets a similar alert: 'Payment Gateway latency spike with HTTP 504'."
- **Action**: Click **Run 3: Recall Memory & Re-Analyze**.
- **Point out**:
  - Hindsight Memory Panel immediately recalls `PAY-001` (95% relevance).
  - The AIRoot Cause Panel immediately highlights: *"Correlated with historical incident PAY-001: Database connection pool exhaustion."*
  - The AI recommends the exact proven fix: *"Increase max connection pool size from 20 to 100."*

---

## 🎯 Conclusion
- **Speaker**: "This is the power of MemoryOps powered by Hindsight: persistent, growing SRE memory that makes every incident response faster than the last."
