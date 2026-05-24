# LingNote - Stage 1 Global Skill
# Component System & Frontend Hardening Stage

Version: 1.0
Stage: Product Hardening
Priority: HIGH

---

# 1. Stage Mission

This stage is NOT about adding more features.

This stage exists to:
- stabilize the frontend architecture
- unify the visual language
- eliminate UI inconsistency
- establish reusable component systems
- reduce future maintenance cost
- prepare the project for editor and AI integration

The project must evolve from:
“working MVP”
into:
“maintainable product foundation”.

This stage focuses on:
- order
- consistency
- scalability
- componentization
- design engineering

NOT feature expansion.

---

# 2. Project Context

LingNote is:
- an AI-native personal knowledge product
- content-first
- modern
- calm
- lightweight
- focused on writing and thinking

It is NOT:
- an enterprise dashboard
- a traditional admin panel
- a bloated productivity suite

Current backend already supports:
- CRUD
- pagination
- keyword search
- REST API
- PostgreSQL
- MyBatis Plus

Current frontend already supports:
- Vue3
- routing
- basic pages
- API connection
- basic UI layout

The current mission is:
“frontend product hardening”.

---

# 3. Current Stage Rules

## 3.1 Allowed

This stage SHOULD focus on:
- reusable UI components
- design token system
- layout consistency
- API layer organization
- page structure cleanup
- visual consistency
- frontend architecture optimization
- loading/empty/error states
- interaction consistency

---

## 3.2 Forbidden

DO NOT implement:
- AI chat
- RAG
- vector database
- multi-user collaboration
- authentication
- workflow engine
- cloud sync
- websocket
- complex animation systems
- analytics dashboard
- plugin marketplace
- permissions
- notification systems

Do NOT increase product complexity.

---

# 4. Frontend Architecture Principles

## 4.1 Component First

All UI must become reusable components.

Avoid:
- duplicated page UI
- inline page styling
- giant page files
- copy-paste structures

Every visual pattern used more than once:
MUST become a component.

---

## 4.2 Design System First

The UI must be driven by:
- tokens
- spacing system
- typography system
- motion system
- shadow system
- radius system

Avoid:
- hardcoded colors
- random spacing
- random radius
- inconsistent shadows

---

## 4.3 Content First

UI must always prioritize:
- readability
- whitespace
- focus
- hierarchy

Avoid:
- dense layouts
- enterprise-style complexity
- decorative overload

---

## 4.4 Low Coupling

Pages:
- compose components

Components:
- encapsulate UI behavior

API:
- isolated

Styles:
- centralized

Avoid:
- deeply coupled structures
- giant state dependencies
- cross-layer pollution

---

# 5. Directory Structure Requirements

Frontend structure MUST evolve into:

```text
src/
├── api/
│   ├── modules/
│   └── request.js
│
├── assets/
│
├── components/
│   ├── common/
│   ├── layout/
│   ├── note/
│   └── feedback/
│
├── layouts/
│
├── pages/
│
├── router/
│
├── styles/
│   ├── tokens/
│   ├── base/
│   └── globals.css
│
├── utils/
│
├── composables/
│
├── App.vue
└── main.js