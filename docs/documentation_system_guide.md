# A Reusable Documentation System (Generalized)

> Goal: capture a **project-agnostic documentation method** that can be reused across different products and teams.

## 1. The Separation-of-Concerns Model
Do not force one document to do everything. Instead, split by responsibility:

- **PRD (Product Requirements)**: what to build and why.
- **RFC (Technical Design)**: how to build and why this design.
- **API / Facts Reference**: external realities, verified interfaces, and constraints.
- **WORKING / Execution Log**: what is happening, what changed, and why.
- **Lessons / Playbook**: reusable rules extracted from experience.
- **Special Topic Docs**: when a sub-area grows complex, give it a dedicated doc.

**Principle**: each document answers one class of questions, reducing confusion and churn.

## 2. The Documentation Feedback Loop
A good doc system is a loop, not a static snapshot:

1. **PRD** defines goals, users, and behavior.
2. **RFC** translates goals into design and constraints.
3. **API/Facts** validates external dependencies.
4. **WORKING** records execution, decisions, and unexpected changes.
5. **Lessons** converts experience into future rules.

Result: docs guide implementation *and* improve themselves through real-world feedback.

## 3. PRD Writing Pattern (General)
Purpose: make the product intent unambiguous.

Recommended structure:
- **Positioning + Non-goals** (what it is / what it is not).
- **Users + Scenarios** (2–4 concrete use cases).
- **Goals + Success Criteria** (measurable outcomes).
- **Scope** (must-have vs optional).
- **Behavioral Rules** (key interactions, default behaviors, edge cases).
- **Risks + Constraints**.

Writing rule: be behavior-specific, not abstract. Defaults and boundaries should be explicit.

## 4. RFC Writing Pattern (General)
Purpose: align on design and implementation approach.

Recommended structure:
- **Metadata** (ID, status, date, PRD link).
- **Summary / Background / Goals / Constraints**.
- **Architecture Diagram + Data Flow**.
- **Tech Choices + Rationale** (tradeoffs included).
- **Data Models + State Design**.
- **Failure Handling** (retry, fallback, degradation).

Writing rule: every “how” should be backed by a “why”.

## 5. API / Facts Doc Pattern
Purpose: ground the team in verified external reality.

Recommended structure:
- **Source provenance** (official docs / experiments / repo audit).
- **How to run or access** the dependency.
- **Grouped endpoint tables** (method / path / purpose / response).

Writing rule: prefer tables and verified facts over assumptions.

## 6. WORKING (Execution Log) Pattern
Purpose: track real progress and changes for accountability.

Recommended structure:
- **Current status** (date, phase, build/test).
- **In Progress / Done / Todo** (checklists).
- **Issue log** (root cause + fix).
- **Decision log** (what was chosen, why).

Writing rule: record real changes, not idealized plans.

## 7. Lessons / Playbook Pattern
Purpose: turn experience into reusable rules.

Recommended structure:
- **Context** → **Bad approach** → **Correct approach** → **Lesson**.

Writing rule: keep lessons specific and actionable.

## 8. Cross-Doc Writing Style
- Short headers and scannable sections.
- Bold emphasis on critical rules.
- Tables for comparisons and parameters.
- ASCII diagrams for structure and layout.
- Explicit defaults and boundary conditions.

## 9. How Docs Grow Over Time
Documentation evolves stepwise:

1. Minimal PRD (align the direction).
2. Minimal RFC (lock the technical path).
3. Facts/API validation (verify assumptions).
4. Execution log (capture real progress).
5. Topic docs (when one area gets complex).
6. Lessons (distill practice into rules).

Core principle: don’t aim for perfection; aim for *usable and improvable*.

## 10. How to Apply This in Any Project
- Start with **PRD / RFC / API / WORKING / Lessons**.
- Force explicit “this is / this is not” statements.
- Anchor critical claims to verified facts or tests.
- Write down decisions and tradeoffs to prevent churn.
- Update WORKING daily with high-signal changes.
- Add at least 1–2 lessons per milestone.

