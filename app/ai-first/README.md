# AI-first Safety prototypes

Six navigable flows for the AI-first Safety proposal, each with three variants (A, B, C) in a picker at the top of the flow, the same pattern as the Audit execution layouts. Start at `/ai-first`.

| Code | Route | Flow | Device | Variants |
| --- | --- | --- | --- | --- |
| P1 | `/ai-first/report` | Photo report with up to 3 questions | Mobile | Photo first · Conversation · Today's form + fill from photo |
| P10 | `/ai-first/whatsapp` | Report by message from the QR | Mobile | WhatsApp · SMS · Web chat |
| P8 | `/ai-first/inbox` | Supervisor queue, exceptions only | Desktop | Exceptions first · One at a time · Today's inbox + AI column |
| P3 | `/ai-first/action-plan?report=R-1042` | Event to action plan + follow-up agent | Desktop | Plan on one screen · Side panel · Step by step |
| P7 | `/ai-first/inspection` | Photo inspection, failure to WO/CAPA | Mobile | Photos first · Item by item · Video walkthrough |
| P5 | `/ai-first/document-program` | Document in, program out | Desktop | Plan by section · Document beside the plan · Library |

## How it works

- **No real AI.** Every result is scripted in `src/lib/ai-first/sample-data.ts`, with two illustrated sample photos in `public/ai-first/`. Uploading your own photo works, but the result is still the sample one.
- **Shared state.** `src/contexts/AiFirstContext.tsx` keeps reports, inbox items, CAPAs and work orders in localStorage, so a report sent in P1 or P10 appears in P8, and P8 opens P3. Use "Reset data" (any flow) or "Reset prototype data" (hub) to go back to the seed.
- **Tap counter.** Counts clicks inside the flow and shows an estimate of today's flow next to it. The estimates are rough references, not measurements.
- **Trust controls** (`src/components/ai-first/AiPrimitives.tsx`): confidence per field, source line, edit / clear / revert to the AI version, pins on photos, staged progress, draft disclaimer.

## Product rules the prototypes follow

- The AI drafts; a person decides severity, OSHA recordability, CAPA creation and closing. These never go into a batch accept.
- No "accept all" for AI drafts. Inspections need each item confirmed.
- Nothing is saved until the person confirms.
