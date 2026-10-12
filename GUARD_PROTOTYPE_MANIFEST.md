# GUARD Prototype Manifest - EHS

The following directories and files are part of isolated feature prototypes and must **NOT** be deleted or modified during project-wide updates.

## Isolated Routes (`app/`)
- `app/GUARD-1279/` - Multi-Location/Onboarding Widget
- `app/GUARD-1298/` - Multi-Language Document Generation
- `app/ai-first/` - AI-first Safety flows P1, P3, P5, P7, P8, P10 (see `app/ai-first/README.md`)

## External Dependencies
- `src/components/guard-1279/` (Used by GUARD-1279)
- `src/components/ai-first/`, `src/lib/ai-first/`, `src/contexts/AiFirstContext.tsx`, `public/ai-first/` (Used by AI-first)
- `src/components/Sidebar.tsx` (Shared dependency - verify changes against prototypes; links to `/ai-first`)
- `src/components/Header.tsx` (Shared dependency - verify changes against prototypes)
- `src/components/OnboardingWidget.tsx` (GUARD-1279 behavior - hides on /GUARD-1279 routes)

## Usage
To view a prototype, navigate to `/[TASK-ID]` (e.g., `/GUARD-1298`). Each folder contains its own `README.md` with specific flow details.
