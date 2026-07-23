# GUARD-1298: Multi-Language Document Generation via AI

This folder contains the isolated prototype for the `GUARD-1298` Jira ticket. It demonstrates how UpKeep Safety handles multi-language document generation and viewing.

## Routes & User Flow

All relevant screens have been simplified into a numbered sequence:

1. **`/GUARD-1298/1` (Organization Settings)**
   - **Context:** Global configuration for the tenant.
   - **Feature:** Added "Primary Language", "Secondary Languages" (e.g., Spanish, Portuguese), and an "Enable automatic document generation in these languages" toggle.

2. **`/GUARD-1298/2` (Create JHA Wizard)**
   - **Context:** AI generation of a new Job Hazard Analysis.
   - **Feature:** An "Output Languages" section appears at the bottom. It reads the Organization Settings to pre-select the desired secondary languages.

3. **`/GUARD-1298/3/123` (JHA Details View)**
   - **Context:** The standard view for a document.
   - **Feature:** A "Language Switcher" in the header allows users to view the translated content. The UI chrome (buttons, layout) remains in the session language, but the document content is translated. Translated variants are read-only.

4. **`/GUARD-1298/4/123` (Public QR Access View)**
   - **Context:** A shop floor technician scans a QR code to view a document.
   - **Feature:** An embedded language switcher allows the worker to view the document in their preferred language without needing an account or changing device settings.

## Important Note for AI Agents
If you are asked to iterate on this prototype or check the multi-language flow, **DO NOT** edit the root `/app/jha` or `/app/settings` files. All changes specific to `GUARD-1298` must be contained within this `app/GUARD-1298` directory.
