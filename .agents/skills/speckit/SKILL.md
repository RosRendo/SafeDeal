---
name: speckit
description: Full GitHub Spec Kit (Spec-Driven Development) toolkit. Orchestrates the end-to-end SDD lifecycle from specification (/speckit-specify), architecture planning (/speckit-plan), task breakdown (/speckit-tasks), through to implementation and verification.
---

# GitHub Spec Kit Master Toolkit (/speckit)

Use this skill to guide and execute the complete Spec-Driven Development (SDD) cycle for any feature in Safedeal / EscrowSocial.

## The 4 SDD Milestones

```mermaid
graph TD
    A["1. Specify (/speckit-specify)"] --> B["2. Plan (/speckit-plan)"]
    B --> C["3. Tasks (/speckit-tasks)"]
    C --> D["4. Implement (/speckit-implement)"]
    D --> E["5. Verify & Close"]
```

### 1. Specification (`specs/<id>/spec.md`)
- Defines **WHAT** and **WHY** without jumping straight to code.
- Captures acceptance criteria, personas, and testable requirements.

### 2. Technical Plan (`specs/<id>/plan.md`)
- Defines **HOW** the architecture satisfies the spec.
- Selects framework primitives, data schemas, API contracts, and component trees.

### 3. Task Breakdown (`specs/<id>/tasks.md`)
- Granular, ordered execution checklist.
- Each task is atomic, testable, and references specific files.

### 4. Implementation & Verification
- Executes tasks sequentially using test-driven verification.
- Validates the resulting user experience against the acceptance criteria.
