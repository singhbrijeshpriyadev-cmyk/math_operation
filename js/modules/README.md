# OG Mathematics Modules Architecture

This directory houses the implementation files for each of the 24 mathematics modules in the OG platform.

## Layered Pipeline Architecture

To ensure strict separation of concerns and maximum stability, modules adhere to the following unidirectional pipeline:

```
UI (View Template / Interaction Elements)
       ↓
Module Controller (Event dispatcher & validation orchestrator)
       ↓
Math Engine (Core algorithms & mathematical derivations)
       ↓
Result Formatter (Standardized envelope generation)
       ↓
UI (Rendered steps, formula cards & result output)
```

## Standard Result Contract

Every mathematical function in the OG platform returns a structured envelope:

### Success Response
```json
{
  "success": true,
  "result": 120,
  "steps": [
    "Evaluating factorial for integer n = 5",
    "Expanded sequence: 5 × 4 × 3 × 2 × 1",
    "Computed product: 120"
  ],
  "formula": "n! = n × (n - 1) × (n - 2) × ... × 1, where 0! = 1",
  "error": null
}
```

### Error Response (Never crashes UI)
```json
{
  "success": false,
  "result": null,
  "steps": [],
  "formula": null,
  "error": "Number of selected items r (8) cannot be greater than total items n (5)."
}
```

## Planned Module Structure

```
js/modules/
├── README.md
├── sets/
│   ├── index.js          # Module exports & entry
│   ├── controller.js     # Extends BaseModuleController
│   ├── theory.js         # Rigorous definitions, axioms & Venn logic
│   └── solver.js         # Interactive step-by-step set operation solver
├── permutations-combinations/
│   ├── index.js
│   └── controller.js     # Uses CoreMathEngine.permutation & combination
├── matrices/
│   ├── index.js
│   ├── operations.js     # Gaussian elimination, determinants, inverses
│   └── solver.js
...
```

## Guidelines
- Do NOT connect UI components directly to raw calculation logic.
- Always route through a `ModuleController` that queries the `MathEngine` and returns formatted results.
- Validate all user inputs via `MathValidator`.
- Never throw unhandled exceptions to the UI.
