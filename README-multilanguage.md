# Multi-Language Document Generation Prototypes

This document outlines how to test the multi-language features implemented in both the Safety (EHS) and Learn (LMS) prototypes.

## Safety (EHS) Prototype

The EHS prototype simulates the capability to configure, generate, and view documents (like a Job Hazard Analysis) in multiple languages.

**How to test:**

1. **Configure Organization Settings (As Admin)**
   * Go to `http://localhost:3000/settings/organization`
   * Under the "Location & Industry" section, you can set the **Primary Language**.
   * Under the "Secondary Languages" section, you can add up to 2 secondary languages (e.g., Spanish, French).
   * Toggle **Enable Automatic** so the AI automatically generates these languages during document creation.

2. **Create a Multi-Language JHA (As Admin)**
   * Go to `http://localhost:3000/jha/new`
   * Under the "Describe your JHA" section, note the "Output Languages" block. 
   * If "Enable Automatic" was turned on in settings, your secondary languages will be pre-selected.
   * Add a description and click "Generate Multi-Language JHA".

3. **View JHA Details and Switch Languages (As Admin)**
   * Go to `http://localhost:3000/jha/123` (or click "Save & View Details" after creation).
   * You will see the new JHA Details layout (Task Steps & Risk Assessment, Risk Summary, etc.).
   * In the top right corner of the header area, there is a **Language Switcher** dropdown (e.g., "English").
   * Click it to select a secondary language (like Spanish or French). The document's title, steps, hazards, and controls will instantly update to the translated version.

4. **Public Access Point Viewer (As Technician/Frontline Worker)**
   * Go to `http://localhost:3000/public/qr/123` (simulates scanning a QR code on the factory floor).
   * You will see a mobile-friendly view with "Capture Event" and "View Documents" tabs.
   * Click the "View Documents" tab and click on one of the documents in the list.
   * The document viewer will open. In the top right corner, there is a **Language Switcher**.
   * Change the language to see the document translated.

---

## Learn (LMS) Prototype

The LMS prototype simulates the capability to generate courses in multiple languages and view them as a learner.

**How to test:**

1. **Course Generation Wizard (As Admin)**
   * Go to `http://localhost:3001/admin/courses/generate`
   * Look at the "Target Languages" section under Step 1.
   * By default, "English" and "Spanish" are selected to simulate the auto-generation flow.
   * Fill out the topic and select Library Sources, then click "Start Building". The loading sequence will show the translation steps.

2. **Read-Only Translation View in Course Editor (As Admin)**
   * After generating, you will be taken to the Course Editor (e.g., `http://localhost:3001/admin/courses/123/edit`).
   * In the top information bar, look for the **Language** dropdown (e.g., "Language: English").
   * Switch the language to "Spanish (AI)".
   * Notice that a purple banner appears stating "**Translation View:** You are viewing the AI-translated Spanish version...".
   * The entire editor interface (inputs, buttons, rich text editor) becomes `disabled` (read-only) to prevent the admin from accidentally editing the translated output directly.

3. **Learner Course Overview (As Learner)**
   * Go to `http://localhost:3001/learner/courses/123`
   * At the top right of the screen, there is a **Language** switcher dropdown.
   * Switching the language will update the course title, description, learning goals, and lesson titles to the translated version.
