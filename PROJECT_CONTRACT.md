# Insula-code Project Contract

## 1. Purpose

Insula-code is a local AI Agent / Co-Developer designed to assist software development through a contract-driven, stateful, and self-testing workflow.

Its primary responsibility is not merely to generate code, but to:

1. understand the developer's intent,
2. transform intent into explicit requirements,
3. produce an auditable implementation plan,
4. establish an explicit contract before autonomous execution,
5. inspect the target repository,
6. implement changes,
7. test the implementation,
8. diagnose failures,
9. perform bounded fixes,
10. terminate only when the defined completion criteria are satisfied.

The system is designed to run locally under constrained hardware and therefore prioritizes deterministic workflow, sequential execution, bounded context, minimal abstractions, and efficient LLM usage.

---

## 2. Architectural Principles

### 2.1 Contract-Driven

No autonomous implementation may begin before the required contract has been produced and explicitly approved.

The contract is the source of truth for what the implementation must achieve.

### 2.2 Sequential Execution

A Task has exactly one active macro-stage at any moment.

Stage transitions are deterministic and sequential.

Concurrent execution of the same Task is prohibited.

### 2.3 Human Approval Before Autonomy

Human approval is required before the system enters autonomous implementation:

* Requirement
* Planning
* Contract

After Contract approval, Audit, Execution, Testing, and bounded Fix operations may proceed automatically.

### 2.4 Bounded Autonomy

Autonomous execution must always be constrained by:

* the approved Contract,
* the generated Checklist,
* repository scope,
* allowed filesystem operations,
* allowed terminal commands,
* execution timeouts,
* maximum retry/fix iterations.

The LLM must never be treated as an unrestricted system authority.

### 2.5 Immutable Artifacts

Completed stage artifacts are immutable.

A modification creates a new revision rather than mutating historical output.

Example:

```text
plan.v1.md
plan.v2.md
```

or an equivalent revision mechanism.

Historical revisions must remain recoverable.

### 2.6 Repository-Local Memory

Insula-specific project state and artifacts are stored inside the target repository under:

```text
.insula/
```

This directory is a persistent context anchor and audit trail.

### 2.7 Explicit Completion

A Task may only be considered completed when its Contract, Checklist, and verification requirements have been satisfied.

A successful LLM response alone is never sufficient evidence of completion.

---

## 3. Core Domain Vocabulary

### Project

A Project represents exactly one target workspace or repository.

For the MVP:

```text
Project = one workspace / repository
```

The Project has one filesystem root.

### Task

A Task represents one developer-requested unit of work inside a Project.

A Task has:

* a unique identity,
* user intent,
* one active macro-stage,
* stage history,
* immutable artifacts,
* execution history,
* verification results.

### Stage

A Stage represents the macro-level lifecycle position of a Task.

A Task has exactly one active Stage.

### Step

A Step is a smaller unit of work performed within a Stage.

Steps do not represent the global lifecycle.

### Artifact

An Artifact is a persisted output produced by a Stage or operation.

Artifacts are immutable once finalized.

### Contract

A Contract defines the conditions that must be true for the Task to be considered correctly implemented.

A Contract contains, at minimum:

* requirements,
* constraints,
* preconditions,
* dependencies,
* expected changes,
* acceptance criteria.

### Checklist

A Checklist converts the approved Contract into concrete implementation and verification actions.

The Contract defines **what must be true**.

The Checklist defines **what must be done to make it true**.

### Execution

Execution is the autonomous implementation stage.

Execution contains internal operations such as:

* implementation,
* testing,
* diagnosis,
* fixing,
* retesting.

Testing and fixing are operations inside Execution, not macro-stages.

---

## 4. Task Lifecycle

The lifecycle consists of exactly five macro-stages:

```text
REQUIREMENT
    ↓
PLANNING
    ↓
CONTRACT
    ↓
AUDIT
    ↓
EXECUTION
    ↓
COMPLETED
```

Execution internally contains:

```text
IMPLEMENTATION
    ↓
TESTING
    ├── PASS → COMPLETED
    └── FAIL
         ↓
      DIAGNOSIS
         ↓
        FIX
         ↓
      TESTING
```

The Fix loop is bounded by a configured maximum number of iterations.

---

## 5. Stage 1 — Requirement

### Purpose

Transform the user's natural-language request into a structured and unambiguous requirement.

### Input

* user request,
* project metadata,
* relevant existing project context.

### Output

A Requirement artifact containing:

* objective,
* requested behavior,
* scope,
* explicit constraints,
* ambiguities,
* assumptions,
* acceptance intent.

### Approval

Required.

### Completion Criteria

Stage 1 is complete only when:

* the requirement is structurally valid,
* ambiguities affecting implementation have been resolved or explicitly recorded,
* the user approves the resulting requirement.

---

## 6. Stage 2 — Planning

### Purpose

Determine how the approved requirement should be implemented.

### Input

* approved Requirement,
* repository structure,
* relevant project context.

### Output

A Plan artifact containing:

* implementation strategy,
* affected areas,
* affected files,
* dependencies,
* sequencing,
* risks,
* verification strategy.

### Approval

Required.

### Completion Criteria

Stage 2 is complete only when:

* the plan is internally consistent,
* affected project areas have been identified,
* required dependencies are understood,
* verification strategy exists,
* the user approves the plan.

---

## 7. Stage 3 — Contract

### Purpose

Convert the approved plan into an executable engineering contract.

### Input

* approved Requirement,
* approved Plan,
* repository context.

### Output

At minimum:

```text
Contract
Checklist
Dependency specification
Acceptance criteria
```

### Contract Requirements

The Contract must explicitly define:

* preconditions,
* requirements,
* constraints,
* dependencies,
* expected changes,
* acceptance criteria.

### Approval

Required.

### Completion Criteria

Stage 3 is complete only when:

* the Contract is valid,
* dependencies are explicit,
* acceptance criteria are testable,
* Checklist exists,
* the user approves the Contract.

After Contract approval, autonomous execution is permitted.

---

## 8. Stage 4 — Audit

### Purpose

Inspect the actual repository before autonomous modification.

Audit determines whether the repository provides the infrastructure required by the approved Contract and Plan.

### Input

* approved Contract,
* approved Checklist,
* repository filesystem.

### Audit Responsibilities

The Audit stage may inspect:

* project structure,
* source files,
* configuration,
* package metadata,
* dependencies,
* test infrastructure,
* build infrastructure,
* relevant existing implementations.

### Output

An Audit artifact describing:

* infrastructure that already exists,
* infrastructure that is missing,
* discrepancies between Plan and repository reality,
* required preparation changes,
* blockers.

### Approval

Not required for normal progression.

If the Audit discovers a discrepancy that invalidates the approved Contract, the Task must not proceed silently.

The system must instead return to an appropriate earlier stage through an explicit state transition.

### Completion Criteria

Stage 4 is complete only when:

* repository assumptions have been verified,
* required infrastructure is available or explicitly prepared,
* no unresolved blocker prevents execution.

---

## 9. Stage 5 — Execution

### Purpose

Apply the approved Contract to the repository and prove the resulting implementation satisfies it.

Execution is autonomous within the established boundaries.

### Internal Operations

```text
IMPLEMENTATION
TESTING
DIAGNOSIS
FIX
RETESTING
```

### Implementation

The agent may modify only files and resources allowed by the Task context, Project scope, Contract, and execution policy.

### Testing

Testing may execute approved project commands such as:

```text
pnpm test
pnpm build
pnpm lint
pnpm typecheck
```

The exact commands depend on the project and Contract.

### Failure Handling

A failed test does not immediately fail the Task.

The system may perform a bounded loop:

```text
TEST
  ↓
DIAGNOSE
  ↓
FIX
  ↓
TEST
```

The loop terminates when:

1. all required verification passes, or
2. the maximum fix iterations are exhausted, or
3. the failure is determined to be outside the agent's authorized scope.

### Completion Criteria

Execution succeeds only when:

* required implementation changes are complete,
* Checklist requirements are satisfied,
* required tests pass,
* acceptance criteria are satisfied.

---

## 10. Failure and Recovery

A failed operation must never silently change the Task's state.

Every failure must produce a recorded event and preserve enough context for diagnosis.

Failures are classified as:

```text
Recoverable
Unrecoverable
Requires Human Intervention
```

Recoverable failures may enter the bounded Fix loop.

Unrecoverable failures terminate the current autonomous attempt.

Failures requiring human intervention pause the Task and preserve its state.

---

## 11. Artifact Storage

Project-specific Insula artifacts are stored under:

```text
.insula/
```

Recommended structure:

```text
.insula/
├── requirements/
├── plans/
├── contracts/
├── audits/
├── checklists/
├── executions/
└── events/
```

Artifacts are revisioned and immutable after finalization.

Example:

```text
.insula/
└── plans/
    ├── plan.v1.md
    └── plan.v2.md
```

The exact storage schema may evolve as the domain model is implemented.

---

## 12. State Invariants

The following invariants are mandatory:

1. A Task belongs to exactly one Project.
2. A Project represents exactly one workspace/repository.
3. A Task has exactly one active macro-stage.
4. Stage transitions are explicit.
5. Completed artifacts are immutable.
6. Autonomous Execution requires an approved Contract.
7. Testing failures are recorded.
8. Fix loops are bounded.
9. Task completion requires verification evidence.
10. The LLM output itself is never treated as authoritative without validation.

### Formal Task State Machine

The Task lifecycle is represented by exactly one active macro-stage.

#### 12.1 Macro States

```text
REQUIREMENT
PLANNING
CONTRACT
AUDIT
EXECUTION
COMPLETED
```

The Task may additionally enter:

```text
PAUSED
FAILED
CANCELLED
```

These are terminal or suspended Task states and are not macro-stages.

#### 12.2 Transition Rules

Valid forward transitions:

```text
REQUIREMENT → PLANNING
PLANNING    → CONTRACT
CONTRACT    → AUDIT
AUDIT       → EXECUTION
EXECUTION   → COMPLETED
```

Approval-gated transitions:

```text
REQUIREMENT → PLANNING
```

requires approved Requirement.

```text
PLANNING → CONTRACT
```

requires approved Plan.

```text
CONTRACT → AUDIT
```

requires approved Contract and generated Checklist.

Automatic transitions:

```text
AUDIT → EXECUTION
```

may occur after Audit completion.

```text
EXECUTION → COMPLETED
```

may occur only after all completion criteria have been verified.

#### 12.3 Invalid Transitions

The following are always invalid:

```text
REQUIREMENT → CONTRACT
REQUIREMENT → AUDIT
REQUIREMENT → EXECUTION

PLANNING → AUDIT
PLANNING → EXECUTION

CONTRACT → EXECUTION

AUDIT → CONTRACT
EXECUTION → AUDIT

COMPLETED → any active stage
```

The orchestrator must reject invalid transitions rather than attempting to infer a valid route.

#### 12.4 Approval State

Approval is associated with the artifact produced by the stage rather than the Task itself.

Therefore:

```text
Requirement
  └── approval: PENDING | APPROVED | REJECTED

Plan
  └── approval: PENDING | APPROVED | REJECTED

Contract
  └── approval: PENDING | APPROVED | REJECTED
```

An artifact may only satisfy its corresponding approval gate when its state is `APPROVED`.

#### 12.5 Execution Internal State

`EXECUTION` contains internal operations and does not create additional macro-stages.

```text
IMPLEMENT
    ↓
TEST
    ├── PASS → COMPLETED
    │
    └── FAIL
         ↓
      DIAGNOSE
         ↓
        FIX
         ↓
       RETEST
```

The internal execution state may be represented separately from the Task macro-stage.

#### 12.6 Fix Loop Constraint

A Task may perform a finite number of automatic fix iterations.

```text
fixIteration = 0..MAX_FIX_ITERATIONS
```

When:

```text
fixIteration >= MAX_FIX_ITERATIONS
```

the autonomous loop must stop.

The Task must then enter a recoverable failure or human-intervention state according to execution policy.

#### 12.7 Pause

A Task may enter `PAUSED` when execution cannot safely continue without external input.

Examples:

* human approval required,
* missing dependency,
* ambiguous requirement discovered,
* execution policy violation,
* required resource unavailable.

A paused Task preserves its current stage and execution state.

#### 12.8 Failure

`FAILED` indicates that the current autonomous attempt cannot continue.

A failure must preserve:

* current stage,
* failed operation,
* error information,
* relevant artifact revision,
* test output where applicable,
* execution history.

A failed Task must never silently advance to another stage.

#### 12.9 Cancellation

A Task may be cancelled explicitly by the user or system policy.

Cancellation must terminate active execution and preserve the current Task state and historical events.

#### 12.10 Transition Authority

Only the server-side orchestrator may perform Task state transitions.

The LLM may propose a transition, but the transition is valid only when:

1. the current state allows it,
2. required artifacts exist,
3. required approvals exist,
4. required preconditions are satisfied.

The orchestrator must reject any transition that violates the state machine.


---

## 13. Authorization Boundary

The LLM is a reasoning component, not the final authority over the host system.

The server remains responsible for:

* validating structured LLM output,
* enforcing state transitions,
* enforcing filesystem boundaries,
* enforcing command execution policy,
* enforcing timeouts,
* enforcing retry limits,
* recording events,
* determining final completion state.

The LLM may propose actions.

The orchestrator decides whether those actions are valid and executable.

---

## 14. Resource Constraints

Insula-code is optimized for local execution on constrained hardware.

The architecture therefore prioritizes:

* small prompts,
* relevant context only,
* sequential LLM execution,
* minimal context duplication,
* bounded retries,
* deterministic state transitions,
* local execution,
* minimal external dependencies.

No architectural component may assume high-concurrency or cloud-scale LLM capacity.

---

## 15. Definition of Done

A Task is considered `COMPLETED` only when all applicable conditions are true:

```text
Requirement approved
AND
Plan approved
AND
Contract approved
AND
Audit completed
AND
Implementation completed
AND
Checklist satisfied
AND
Required tests passed
AND
Acceptance criteria satisfied
```

Without sufficient verification evidence, a Task must not be marked `COMPLETED`.

---

## 16. Contract Governance

This document is the architectural baseline for the Insula-code MVP.

Changes to core lifecycle rules, state invariants, approval boundaries, or execution authority must be treated as architectural changes and reviewed before implementation.

Implementation details may evolve without changing the meaning of this Contract.

The software implementation must conform to this Contract rather than silently redefining it.
