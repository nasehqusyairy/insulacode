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

### Context Builder

The Context Builder is the system component responsible for selecting, assembling, and providing the project context available to an Agent for a specific Task and Stage.

The Context Builder determines what repository and project information is exposed to the Agent.

An Agent must not independently access arbitrary project context outside the context explicitly provided by the Context Builder.

### State

State represents the current operational condition of a domain object.

Insula-code uses `State` as the formal domain term and does not use `Status` as a distinct domain concept.

Examples include Task state, artifact approval state, and execution internal state.

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

A Requirement Artifact containing:

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

## 17. Requirement Stage Contract

### 17.1. Purpose

Transform the user's natural-language request into a structured, explicit, and reviewable Requirement.

The stage must resolve ambiguity that materially affects the technical implementation while avoiding unnecessary assumptions about implementation details.

### 17.2. Input

The Requirement stage may receive:

* user's original request,
* Project metadata,
* repository metadata,
* relevant existing project context,
* applicable system constraints.

Repository and project context must be limited to information explicitly provided by the Context Builder.

The Requirement stage must not assume access to the entire repository, source tree, or arbitrary project files.

### 17.3. Output

The stage must produce a Requirement Artifact containing:

* objective,
* requested behavior,
* scope,
* explicit constraints,
* assumptions,
* unresolved ambiguities,
* acceptance intent.

The artifact must be structurally valid before it can enter approval.

Assumptions and unresolved ambiguities must be represented separately. An unresolved ambiguity must not be silently converted into an assumption.

### 17.4. Preconditions

The following conditions must be satisfied before the Requirement stage may execute:

* the Task exists,
* the Task belongs to a valid Project,
* the user request is available,
* the Task's current stage is `REQUIREMENT`,
* no conflicting active execution exists for the Task.

### 17.5. Allowed Operations

The Requirement stage may:

* analyze the user request,
* inspect project context provided by the Context Builder,
* identify missing information,
* request clarification when required to resolve a material ambiguity,
* resolve ambiguity using available context,
* create a new Requirement Artifact revision.

The Requirement stage must not:

* modify source code,
* execute project commands,
* modify project configuration,
* create an implementation plan,
* create an execution checklist,
* autonomously advance beyond the Requirement approval gate.

### 17.6. Approval Gate

The resulting Requirement Artifact must have an approval state of `PENDING` before it can be presented for user approval.

The Task may transition from `REQUIREMENT` to `PLANNING` only when the current Requirement Artifact has an approval state of `APPROVED`.

The user may perform one of the following actions:

```text
APPROVE
REJECT
REQUEST REVISION
```

`APPROVE` changes the artifact approval state from `PENDING` to `APPROVED`.

`REJECT` changes the artifact approval state from `PENDING` to `REJECTED`.

`REQUEST` REVISION requires a new Requirement Artifact revision with an approval state of `PENDING`.

A rejected or superseded Requirement Artifact must never satisfy the approval gate.

### 17.7. Postconditions

When the Requirement stage is successfully completed:

* a valid Requirement Artifact exists,
* the completed Requirement revision is immutable,
* approval metadata is recorded,
* the current Requirement Artifact has an approval state of `APPROVED`.

The Task is eligible for transition from `REQUIREMENT` to `PLANNING`.

### 17.8. Definition of Done

The Requirement stage is complete when all of the following are true:

* the objective is explicit,
* the scope is explicit,
* known constraints are recorded,
* material assumptions are recorded,
* material ambiguities have been resolved or explicitly surfaced to the user for resolution,
* acceptance intent is defined,
* the Requirement Artifact is structurally valid,
* the user has explicitly approved the current Requirement revision.

### 17.9. Failure Conditions

The stage must not advance when:

* a material ambiguity remains unresolved and prevents the Requirement from being approved,
* required information is missing,
* the generated Requirement is structurally invalid,
* the LLM output cannot be validated,
* the user rejects the Requirement,
* required context is unavailable and is necessary to produce a valid Requirement.

Failure or rejection must preserve the current Requirement revision and associated diagnostic information.

## 18. Planning Stage Contract

### 18.1 Purpose

Transform an approved Requirement into a structured, reviewable implementation Plan that describes how the requirement should be fulfilled without performing the implementation itself.

The stage may make technical design decisions necessary to formulate the implementation strategy, but must remain within the scope and constraints of the approved Requirement.

### 18.2 Input

The Planning stage may receive:

* the approved Requirement artifact,
* Project metadata,
* repository metadata,
* relevant project context provided by the Context Builder,
* applicable system constraints.

The Planning stage must treat the approved Requirement as the authoritative source for user intent.

The Planning stage must not assume access to repository or project information that was not explicitly provided by the Context Builder.

### 18.3. Output

The stage must produce a Plan artifact containing:

* implementation strategy,
* affected project areas,
* affected files or file groups,
* required dependencies,
* implementation sequence,
* technical decisions,
* risks and trade-offs,
* verification strategy.

Affected files or file groups should be identified where reasonably determinable from the available project context.

Required dependencies may include existing dependencies and dependencies that may need to be added during Execution. The Planning stage must not install or modify dependencies.

The Plan artifact must remain within the scope of the approved Requirement.

The artifact must be structurally valid before it can enter approval.

### 18.4. Preconditions

The following conditions must be satisfied before the Planning stage may execute:

* the Task exists,
* the Task belongs to a valid Project,
* the Task's current stage is `PLANNING`,
* the current Requirement artifact revision is approved,
* no conflicting active execution exists for the Task.

### 18.5. Allowed Operations

The Planning stage may:

* analyze the approved Requirement,
* inspect project context provided by the Context Builder,
* identify affected project areas,
* identify affected files or file groups,
* determine implementation strategy,
* identify dependencies,
* make technical design decisions within Requirement scope,
* identify risks and trade-offs,
* define a verification strategy,
* create a new Plan artifact revision.

The Planning stage must not:

* modify source code,
* modify project configuration,
* execute project or verification commands,
* modify dependencies,
* create the execution Checklist,
* execute the Task,
* autonomously advance beyond the Planning approval gate.

### 18.6 Approval Gate

The resulting Plan artifact must have an approval state of `PENDING` before it can be presented for user approval.

The Task may transition from `PLANNING` to `CONTRACT` only when the current Plan artifact has an approval state of `APPROVED`.

The user may perform one of the following actions:

```text
APPROVE
REJECT
REQUEST REVISION
```

`APPROVE` changes the artifact approval state from `PENDING` to `APPROVED`.

`REJECT` changes the artifact approval state from `PENDING` to `REJECTED`.

`REQUEST REVISION` does not approve or reject the artifact. It requires the system to produce a new Plan artifact revision, which starts with an approval state of `PENDING`.

A rejected or superseded Plan artifact must never satisfy the approval gate.

### 18.7 Postconditions

When the Planning stage is successfully completed:

* a valid Plan artifact exists,
* the completed Plan revision is immutable,
* approval metadata is recorded,
* the current Plan artifact has an approval state of `APPROVED`.

The Task is eligible for transition from `PLANNING` to `CONTRACT`.

### 18.8 Definition of Done

The Planning stage is complete when all of the following are true:

* the implementation strategy is explicit,
* affected project areas are identified,
* affected files or file groups are identified where reasonably determinable,
* required dependencies are identified,
* implementation sequence is defined,
* relevant technical decisions are recorded,
* material risks and trade-offs are recorded,
* verification strategy is defined,
* the Plan artifact is structurally valid,
* the Plan remains consistent with the approved Requirement,
* the user has explicitly approved the current Plan revision.

### 18.9 Failure Conditions

The stage must not advance when:

* the approved Requirement is unavailable or invalid,
* the proposed Plan exceeds the scope of the approved Requirement,
* required project context is unavailable and necessary to produce a valid Plan,
* a material technical dependency cannot be determined from the available context,
* the generated Plan is structurally invalid,
* the LLM output cannot be validated,
* the user rejects the Plan.

Failure or rejection must preserve the current Plan revision and associated diagnostic information.

## 19. Contract Stage Contract

### 19.1 Purpose

Transform the approved Requirement and approved Plan into a structured, explicit, and enforceable Contract that defines the conditions the implementation must satisfy.

The stage must convert user intent and implementation strategy into testable requirements, constraints, dependencies, and acceptance criteria without performing the implementation itself.

### 19.2 Input

The Contract stage may receive:

* the current approved Requirement artifact revision,
* the current approved Plan artifact revision,
* Project metadata,
* repository metadata,
* relevant project context provided by the Context Builder,
* applicable system constraints.

The Contract stage must treat:

* the approved Requirement as the authoritative source for user intent,
* the approved Plan as the authoritative source for the agreed implementation strategy.

The stage must not assume access to repository or project information that was not explicitly provided by the Context Builder.

### 19.3. Output

The stage must produce:

* a Contract artifact,
* an execution Checklist artifact.

The Contract artifact must contain:

* requirements,
* constraints,
* preconditions,
* dependencies,
* expected changes,
* acceptance criteria.

The Checklist artifact must contain:

* ordered implementation actions,
* required verification actions,
* references to the Contract requirements or acceptance criteria that each action addresses.

The Checklist must be derived from the Contract and must not introduce requirements, constraints, or acceptance criteria that are not present in the Contract.

The Contract must remain consistent with the approved Requirement and approved Plan.

The artifacts must be structurally valid before they can enter approval.

### 19.4 Preconditions

The following conditions must be satisfied before the Contract stage may execute:

* the Task exists,
* the Task belongs to a valid Project,
* the Task's current stage is `CONTRACT`,
* the current Requirement artifact revision is approved,
* the current Plan artifact revision is approved,
* no conflicting active execution exists for the Task.

### 19.5 Allowed Operations

The Contract stage may:

* analyze the approved Requirement,
* analyze the approved Plan,
* inspect project context provided by the Context Builder,
* translate requirements into explicit contractual requirements,
* define enforceable constraints,
* define preconditions,
* identify and formalize dependencies,
* define expected changes,
* convert acceptance intent into acceptance criteria,
* create an execution Checklist,
* create new Contract and Checklist artifact revisions.

The Contract stage must not:

* modify source code,
* modify project configuration,
* install or modify dependencies,
* execute implementation commands,
* execute the Checklist,
* perform autonomous repository mutation,
* autonomously advance beyond the Contract approval gate.

### 19.6 Approval Gate

The resulting Contract artifact must have an approval state of `PENDING` before it can be presented for user approval.

The Checklist artifact must be associated with the Contract revision from which it was generated.

The Task may transition from `CONTRACT` to `AUDIT` only when:

* the current Contract artifact revision has an approval state of `APPROVED`,
* the current Checklist is valid,
* the Checklist corresponds to the approved Contract revision.

The user may perform one of the following actions:

```text
APPROVE

REJECT

REQUEST REVISION
```

`APPROVE` changes the Contract artifact approval state from `PENDING` to `APPROVED`.

`REJECT` changes the Contract artifact approval state from `PENDING` to `REJECTED`.

`REQUEST REVISION` does not approve or reject the artifact. It requires the system to produce a new Contract revision and a corresponding Checklist revision. The new Contract revision must have an approval state of `PENDING`.

A rejected or superseded Contract artifact must never satisfy the approval gate.

### 19.7 Postconditions

When the Contract stage is successfully completed:

* a valid Contract artifact exists,
* a valid Checklist artifact exists,
* the Checklist corresponds to the current approved Contract revision,
* the completed Contract revision is immutable,
* the completed Checklist revision is immutable,
* approval metadata for the approved Contract revision is recorded,
* the current Contract artifact has an approval state of `APPROVED`.

The Task is eligible for transition from `CONTRACT` to `AUDIT`.

### 19.8 Definition of Done

The Contract stage is complete when all of the following are true:

* the Contract expresses the approved user intent,
* the Contract is consistent with the approved Plan,
* requirements are explicit,
* constraints are explicit,
* preconditions are explicit,
* dependencies are explicit,
* expected changes are explicit,
* acceptance criteria are testable,
* the Checklist contains concrete implementation and verification actions,
* the Checklist is consistent with the Contract,
* the Contract artifact is structurally valid,
* the Checklist artifact is structurally valid,
* the user has explicitly approved the current Contract revision.

### 19.9 Failure Conditions

The stage must not advance when:

* the current Requirement artifact revision is unavailable or invalid,
* the current Plan artifact revision is unavailable or invalid,
* the proposed Contract exceeds or contradicts the approved Requirement,
* the proposed Contract contradicts the approved Plan,
* required project context is unavailable and necessary to produce a valid Contract,
* a material dependency cannot be determined from the available context,
* the generated Contract is structurally invalid,
* the generated Checklist is structurally invalid,
* the Checklist does not correspond to the current Contract revision,
* the LLM output cannot be validated,
* the user rejects the Contract.

Failure or rejection must preserve the current Contract and Checklist revisions and associated diagnostic information.

## 20. Audit Stage Contract

### 20.1 Purpose

Transform the approved Contract and available repository state into a structured Audit result that determines the current compliance state of the repository against the Contract and identifies the implementation gaps that must be addressed during Execution.

The Audit stage must compare the approved Contract against observable project and repository state without modifying the repository.

### 20.2 Input

The Audit stage may receive:

* the current approved Requirement artifact revision,
* the current approved Plan artifact revision,
* the current approved Contract artifact revision,
* the current Checklist artifact revision,
* Project metadata,
* repository metadata,
* relevant project context provided by the Context Builder,
* applicable system constraints.

The Audit stage must treat the approved Contract as the authoritative source for determining required implementation conditions.

The stage must not assume access to repository or project information that was not explicitly provided by the Context Builder or obtained through an authorized repository inspection operation.

### 20.3 Output

The stage must produce an Audit artifact containing:

* relevant repository state observed during the audit,
* evaluated Contract conditions,
* satisfied conditions,
* unsatisfied conditions,
* missing or inconsistent dependencies,
* detected implementation gaps,
* detected infrastructure gaps,
* relevant risks or blockers,
* audit evidence,
* execution readiness determination.

The Audit artifact must distinguish between:

* conditions already satisfied,
* conditions requiring implementation,
* conditions requiring clarification,
* conditions that cannot be evaluated from the available context.

The artifact must be structurally valid before the Task may proceed to Execution.

### 20.4 Preconditions

The following conditions must be satisfied before the Audit stage may execute:

* the Task exists,
* the Task belongs to a valid Project,
* the Task's current stage is `AUDIT`,
* the current Requirement artifact revision is approved,
* the current Plan artifact revision is approved,
* the current Contract artifact revision is approved,
* the current Checklist artifact revision corresponds to the current approved Contract artifact revision,
* no conflicting active execution exists for the Task.

### 20.5 Allowed Operations

The Audit stage may:

* inspect repository files,
* inspect project configuration,
* inspect dependency metadata,
* inspect relevant project structure,
* execute authorized read-only inspection commands,
* evaluate the repository against the approved Contract,
* evaluate Checklist prerequisites,
* collect audit evidence,
* identify implementation gaps,
* identify infrastructure gaps,
* identify blockers,
* create a new Audit artifact revision.

The Audit stage must not:

* modify source code,
* modify project configuration,
* install or modify dependencies,
* execute implementation commands,
* execute tests or verification operations intended to validate implementation behavior,
* execute destructive commands,
* execute the Checklist,
* autonomously modify the repository,
* autonomously advance beyond the Audit stage.

### 20.6 Execution Readiness

The Audit stage must determine whether the Task is ready for Execution.

The execution readiness determination must be one of:

```text
READY
BLOCKED
```

`READY` means that the Audit found no blocking condition that prevents the Execution stage from proceeding against the approved Contract.

`BLOCKED` means that one or more blocking conditions prevent safe Execution.

A `BLOCKED` result must identify the conditions responsible for the block.

The Audit stage must not resolve blocking conditions by modifying the repository.

### 20.7 Postconditions

When the Audit stage is successfully completed:

* a valid Audit artifact exists,
* the Audit artifact identifies the approved Contract artifact revision that was audited,
* the Audit artifact records the relevant repository state observed during the audit,
* all applicable Contract conditions have been evaluated,
* audit evidence is recorded,
* execution readiness is explicitly determined,
* the Audit revision is immutable.

The Task is eligible for transition from `AUDIT` to `EXECUTION` only when execution readiness is `READY`.

### 20.8 Definition of Done

The Audit stage is complete when all of the following are true:

* the approved Contract has been evaluated against the available repository state,
* applicable Checklist prerequisites have been evaluated,
* relevant repository evidence has been collected,
* satisfied conditions are identified,
* unsatisfied conditions are identified,
* implementation gaps are identified,
* infrastructure gaps are identified,
* blockers are explicitly identified,
* conditions that could not be evaluated are explicitly identified,
* execution readiness is explicitly determined,
* the Audit artifact is structurally valid.

### 20.9 Failure Conditions

The stage must not advance when:

* the current Contract artifact revision is unavailable or invalid,
* the current Checklist artifact revision is unavailable or does not correspond to the current approved Contract artifact revision,
* required repository context is unavailable and necessary for the audit,
* required inspection operations cannot be completed,
* audit evidence is insufficient to evaluate a material Contract condition,
* the generated Audit artifact is structurally invalid,
* the LLM output cannot be validated.

A `BLOCKED` execution readiness result is not itself an internal stage failure. It is a valid Audit outcome that prevents transition to `EXECUTION`.

Failure must preserve any existing Audit revision and associated diagnostic information.

---

## 21. Execution Stage

### 21.1. Purpose

Execute the approved Contract and Checklist against the audited repository state by performing the required implementation, verification, and controlled fixing operations.

The Execution stage is the only lifecycle stage authorized to mutate the repository as part of fulfilling the approved Contract.

The stage must ensure that repository mutations remain within the scope of the approved Contract and that implementation results are verified against the Contract's acceptance criteria.

The Execution stage must operate through authorized server capabilities and must not grant the LLM unrestricted access to the host environment.

---

### 21.2. Input

The Execution stage may receive:

* the current approved Requirement artifact revision,
* the current approved Plan artifact revision,
* the current approved Contract artifact revision,
* the current Checklist artifact revision,
* the current Audit artifact revision with an execution readiness of `READY`,
* Project metadata,
* repository metadata,
* relevant project context provided by the Context Builder,
* applicable system constraints.

The Execution stage must treat:

* the approved Contract as the authoritative source of implementation requirements,
* the approved Checklist as the authoritative source of implementation and verification actions,
* the Audit artifact as the authoritative record of the repository state observed before Execution.

The stage must not assume access to repository or project information that was not explicitly provided by the Context Builder or obtained through an authorized execution or repository inspection operation.

The Execution stage must not execute against a Contract or Checklist revision other than the revisions identified by the current Execution context.

---

### 21.3 Output

The Execution stage must produce an Execution artifact containing:

* the Contract artifact revision executed against,
* the Checklist artifact revision executed against,
* the Audit artifact revision used as the pre-execution repository baseline,
* implementation operations performed,
* relevant repository changes produced,
* verification operations performed,
* verification results,
* detected failures,
* fixing operations performed,
* fixing iterations,
* final acceptance criteria results,
* execution outcome,
* relevant execution evidence.

The Execution artifact must distinguish between:

* implementation operations,
* verification operations,
* fixing operations,
* verification failures,
* successful verification results.

The artifact must be structurally valid before the Execution stage may be considered successfully completed.

---

### 21.4 Preconditions

The following conditions must be satisfied before the Execution stage may execute:

* the Task exists,
* the Task belongs to a valid Project,
* the Task's current stage is `EXECUTION`,
* the current Requirement artifact revision is approved,
* the current Plan artifact revision is approved,
* the current Contract artifact revision is approved,
* the current Checklist artifact revision corresponds to the current approved Contract artifact revision,
* the current Audit artifact revision exists,
* the current Audit artifact revision has an execution readiness of `READY`,
* no conflicting active execution exists for the Task.

---

### 21.5 Allowed Operations

The Execution stage may:

* inspect repository files,
* inspect project configuration,
* create or modify source code,
* create or modify project configuration when required by the approved Contract,
* create or modify test files when required by the approved Contract,
* install or modify dependencies when explicitly required by the approved Contract and permitted by the execution policy,
* execute authorized implementation commands,
* execute authorized verification commands,
* perform the implementation and verification actions defined by the approved Checklist,
* collect implementation evidence,
* collect verification evidence,
* analyze verification failures,
* perform controlled fixing operations,
* repeat verification after a fixing operation,
* create a new Execution artifact revision.

The Execution stage must not:

* modify files outside the authorized Project scope,
* modify repository state unrelated to the approved Contract,
* execute unauthorized commands,
* execute destructive operations unless explicitly authorized by the approved Contract and permitted by the execution policy,
* modify the Requirement, Plan, Contract, or Checklist artifacts as part of implementation,
* silently expand the scope of the approved Contract,
* treat verification failure as permission to redefine acceptance criteria,
* autonomously transition to another lifecycle stage before the Execution outcome has been determined.

---

### 21.6 Execution Loop

The Execution stage must execute implementation and verification through a controlled sequential loop.

The execution loop consists of:

```text
IMPLEMENT
    ↓
VERIFY
    ↓
EVALUATE ACCEPTANCE CRITERIA
    ↓
SATISFIED ─────→ DETERMINE OUTCOME ─────→ COMPLETE
    │
    ↓
UNSATISFIED
    ↓
ANALYZE
    ↓
FIX
    ↓
VERIFY
````

A fixing operation may be initiated only from a verification or acceptance failure that is attributable to the implementation.

A fixing operation may proceed when:

* the failure is attributable to the implementation,
* the required fix remains within the approved Contract scope,
* the system has sufficient context to perform the fix safely,
* the configured fixing limit has not been exceeded.

Infrastructure, execution-environment, or tool failures must not automatically trigger implementation fixing.

A fixing operation must not modify the approved Contract or acceptance criteria.

Each fixing iteration must be recorded as part of the Execution artifact.

The Execution stage must terminate the fixing loop when:

* verification succeeds and all applicable acceptance criteria are satisfied,
* the fixing limit is reached,
* the failure cannot be safely resolved within Contract scope,
* required context is unavailable,
* the failure indicates a Contract inconsistency,
* an execution operation fails in a manner that prevents continued execution.

---

### 21.7 Execution Outcome

The Execution stage must determine one of the following outcomes:

```text
SUCCESS

FAILED

BLOCKED
```

`SUCCESS` means that the implementation satisfies the applicable Contract acceptance criteria and required verification has completed successfully.

`FAILED` means that Execution was performed but the implementation could not satisfy the Contract within the allowed fixing operations.

`BLOCKED` means that Execution cannot safely continue because a required condition, capability, dependency, or authorization is unavailable.

A `FAILED` or `BLOCKED` outcome must identify the conditions responsible for the outcome.

Neither `FAILED` nor `BLOCKED` may be treated as `COMPLETED`.

---

### 21.8 Postconditions

When the Execution stage is successfully completed:

* a valid Execution artifact exists,
* the Execution artifact identifies the Contract revision executed against,
* the Execution artifact identifies the Checklist revision executed against,
* implementation operations are recorded,
* verification operations and results are recorded,
* fixing iterations are recorded when applicable,
* required acceptance criteria have been verified successfully,
* relevant execution evidence is recorded,
* the final Execution artifact revision is immutable,
* the Execution outcome is `SUCCESS`.

The Task is eligible for transition from `EXECUTION` to `COMPLETED` only when the Execution outcome is `SUCCESS`.

---

### 21.9 Definition of Done

The Execution stage is complete when all of the following are true:

* the approved Contract has been executed within its defined scope,
* the implementation and verification actions defined by the Checklist have been performed as applicable,
* required implementation operations have been completed,
* required verification operations have been completed,
* verification results have been recorded,
* all applicable acceptance criteria have been verified,
* fixing iterations have been recorded when applicable,
* no unresolved blocking verification failure remains,
* the Execution artifact is structurally valid,
* the final Execution outcome is `SUCCESS`.

### 21.10 Failure Conditions

The stage must not produce a `SUCCESS` outcome when:

* the current Contract artifact revision is unavailable or invalid,
* the current Checklist artifact revision is unavailable or does not correspond to the approved Contract revision,
* the Audit artifact is unavailable or does not have an execution readiness of `READY`,
* an implementation operation fails and cannot be safely retried,
* a required verification operation cannot be completed,
* a verification failure cannot be resolved within the approved Contract scope,
* the fixing limit is exceeded,
* required execution capability is unavailable,
* required context is unavailable,
* the implementation violates the approved Contract,
* the generated Execution artifact is structurally invalid,
* the LLM output cannot be validated.

A `FAILED` or `BLOCKED` outcome must preserve the current Execution artifact and associated diagnostic information.

The Execution stage must not silently modify the approved Contract, acceptance criteria, or Checklist to obtain a `SUCCESS` outcome.

---

### 21.11 Execution Failure Handling

The Execution stage must preserve the Execution artifact and associated diagnostic information when the Execution outcome is `FAILED` or `BLOCKED`.

When the Execution outcome is `FAILED`:

-  the final Execution artifact revision must record the verification failures that could not be resolved, 
-  the fixing iterations performed must be recorded when applicable, 
-  the unresolved conditions preventing Contract satisfaction must be identified, 
-  the Task must not transition to `COMPLETED`. 

When the Execution outcome is `BLOCKED`:

-  the final Execution artifact revision must record the condition preventing safe continuation, 
-  the unavailable capability, dependency, authorization, context, or other blocking condition must be identified, 
-  the Task must not transition to `COMPLETED`. 

A `FAILED` or `BLOCKED` Execution outcome must not invalidate or mutate the approved Requirement, Plan, Contract, or Checklist artifacts.

The system must preserve sufficient execution evidence to allow the failure or blocking condition to be diagnosed and addressed by a subsequent authorized operation.

A `FAILED` or `BLOCKED` outcome does not automatically create a new lifecycle Stage.

---

## 22. Artifact & Revision Rules

### 22.1 Purpose

Define the rules governing artifact creation, revisioning, immutability, identity, lineage, and historical preservation across the Insula-code lifecycle.

Artifact revisions must provide a reliable historical record of the decisions, specifications, and execution results associated with a Task.

The system must never mutate an existing artifact revision in place.

### 22.2 Artifact Identity

Every artifact revision must have a unique identity within its Project and Task scope.

An artifact identity must distinguish:

* the artifact type,
* the Task to which it belongs,
* the revision,
* the immutable revision identifier.

The following artifact types are defined by the lifecycle:

```text
REQUIREMENT
PLAN
CONTRACT
CHECKLIST
AUDIT
EXECUTION
```

An artifact revision represents one immutable version of an artifact type.

### 22.3 Revision Rules

Creating a new revision must never modify the previous revision.

A new revision must:

* receive a new revision identity,
* preserve its relationship to the same Task,
* preserve its artifact type,
* reference the revision or revisions from which it was derived when applicable,
* begin with the approval state required by its lifecycle stage.

A superseded revision must remain accessible as historical data.

A revision number or equivalent immutable identifier must never be reused.

### 22.4 Immutability

Once an artifact revision has been persisted, its substantive content must not be modified.

This includes:

* Requirement content,
* Plan content,
* Contract content,
* Checklist content,
* Audit findings,
* Execution results,
* revision lineage.

Approval decisions must be recorded as immutable approval events and must not be deleted or rewritten.

### 22.5 Revision Lineage

Artifact revisions must preserve sufficient lineage to determine:

* which revision superseded the previous revision,
* which approved Requirement revision was used by a Plan,
* which approved Requirement and Plan revisions were used by a Contract,
* which Contract revision produced a Checklist,
* which approved Contract revision was evaluated by an Audit,
* which Contract, Checklist, and Audit revisions were used by an Execution.

An artifact must never silently reference a different revision than the one recorded in its execution context.

### 22.6 Current Revision

For each artifact type that exists for a Task, the system must identify one revision as the current revision.

The current revision must be explicitly identifiable.

A superseded revision must not become current implicitly.

Changing the current revision must be performed through a validated domain operation.

### 22.7 Historical Preservation

The system must preserve superseded, rejected, failed, and completed artifact revisions.

Historical revisions must remain available for:

* auditability,
* debugging,
* recovery,
* execution analysis,
* human review.

Historical preservation must not allow a superseded or rejected revision to satisfy an approval or execution precondition that requires the current approved revision.

---

## 23. Task / Project State Rules

### 23.1 Purpose

Define the valid lifecycle states of a Task and the relationship between Task state, Project state, and lifecycle Stage.

Task state must represent the current lifecycle condition of a Task and must not be used interchangeably with artifact approval state or Execution outcome.

The state model must provide deterministic and auditable transitions throughout the Task lifecycle.

### 23.2 Project State

A Project represents the repository and execution workspace in which Tasks operate.

For Phase 1, a Project must have one of the following states:

```text
ACTIVE

ARCHIVED
```

`ACTIVE` means that the Project may accept and execute Tasks.

`ARCHIVED` means that the Project is preserved for historical purposes and must not accept new Task execution.

An archived Project must not be used as the execution target of a new Task.

### 23.3 Task State

A Task must have one of the following lifecycle states:

```text
REQUIREMENT

PLANNING

CONTRACT

AUDIT

EXECUTION

COMPLETED
```

The Task state represents exactly one active lifecycle Stage.

A Task must never have more than one active lifecycle Stage at the same time.

Artifact approval state and Execution outcome must not replace or duplicate the Task lifecycle state.

### 23.4 Initial Task State

A newly created Task must enter the lifecycle at:

```text
REQUIREMENT
```

The Task must not begin at a later lifecycle Stage.

A Task must have an associated Project before entering `REQUIREMENT`.

### 23.5 Valid Task Transitions

The following lifecycle transitions are valid:

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

A Task may transition only through the defined lifecycle order.

A Task must not skip a lifecycle Stage.

A Task must not transition directly from one Stage to a non-adjacent Stage.

### 23.6 Transition Preconditions

A Task transition must be performed through a validated domain operation.

Before a transition is committed, the system must verify all preconditions defined by the target Stage.

The transition must fail atomically when any required precondition is not satisfied.

A failed transition must not partially update the Task state or invalidate the current artifact revisions.

### 23.7 Approval and State Transition

Approval state belongs to the artifact produced by the corresponding Stage.

A Task must not transition beyond an approval-gated Stage unless the required artifact revision has been explicitly approved.

The following lifecycle transitions require explicit user approval:

```text
REQUIREMENT → PLANNING

PLANNING → CONTRACT

CONTRACT → AUDIT
```

The following transitions do not require a separate user approval action:

```text
AUDIT → EXECUTION

EXECUTION → COMPLETED
```

`AUDIT → EXECUTION` requires `execution readiness = READY`.

`EXECUTION → COMPLETED` requires `Execution outcome = SUCCESS`.

### 23.8 Rejection and Revision

Rejecting an artifact must not automatically change the Task to another lifecycle Stage.

Requesting a revision must not automatically advance the Task.

A revised artifact must satisfy the approval requirements of its current Stage before the Task may transition.

The system must preserve rejected and superseded revisions according to the Artifact & Revision Rules.

### 23.9 Task State Invariants

At all times:

* a Task has exactly one current lifecycle Stage,
* a Task belongs to exactly one Project,
* a Task cannot execute against an archived Project,
* a Task cannot skip a lifecycle Stage,
* a Task cannot transition without satisfying the target Stage preconditions,
* artifact approval state must remain distinct from Task state,
* Execution outcome must remain distinct from Task state,
* historical artifact revisions must not satisfy current transition preconditions unless explicitly identified as the current approved revision.

### 23.10 Project and Task Lifecycle Constraints

An `ACTIVE` Project may contain Tasks in any valid lifecycle Stage.

An `ARCHIVED` Project must not accept new Tasks.

Archiving a Project must not silently mutate the lifecycle state of its existing Tasks.

A Project may be archived only when no active execution is running against it.

A Project containing incomplete Tasks may remain `ACTIVE` until those Tasks are completed or otherwise handled by an explicitly defined recovery operation.

---

## 24. Context Builder Contract

### 24.1 Purpose

Define the responsibilities, boundaries, inputs, outputs, and access rules of the Context Builder.

The Context Builder is responsible for constructing the relevant project and repository context required by a lifecycle Stage without implicitly granting the LLM unrestricted access to the repository or host environment.

The Context Builder must provide only the context required for the current operation and must preserve the boundaries defined by the current Task, Project, Stage, and artifact revisions.

### 24.2 Context Scope

Context provided to a Stage must be scoped to:

* the current Project,
* the current Task,
* the current lifecycle Stage,
* the artifact revisions required by that Stage,
* the repository information necessary for the operation,
* applicable system constraints.

The Context Builder must not expose unrelated Projects or Tasks.

The Context Builder must not assume that the entire repository is required for every operation.

### 24.3 Context Sources

The Context Builder may obtain context from:

* Project metadata,
* Task metadata,
* artifact revisions,
* repository structure,
* repository files,
* project configuration,
* dependency metadata,
* version-control metadata,
* authorized repository inspection operations,
* previously recorded execution evidence.

The Context Builder must respect the access restrictions of the requesting Stage.

### 24.4 Stage-Aware Context

The Context Builder must construct context according to the requirements of the current lifecycle Stage.

For example:

* Requirement may require project metadata and relevant existing context.
* Planning may require repository structure and relevant implementation context.
* Contract may require context necessary to formulate enforceable conditions.
* Audit may require observable repository state and inspection evidence.
* Execution may require the repository state, approved artifacts, Checklist, and Audit baseline necessary for controlled implementation.

The Context Builder must not provide mutation capabilities merely because repository context is available.

### 24.5 Context Completeness

A Stage must not assume that unavailable context is irrelevant.

When required context is missing, the Context Builder must identify the missing information.

The requesting Stage must either:

* obtain the required context through an authorized operation,
* explicitly identify the missing information,
* or fail according to the Stage's failure conditions.

The LLM must not silently invent missing repository or project context.

### 24.6 Context Provenance

Context provided to a Stage must preserve sufficient provenance to determine:

* where the information originated,
* when it was observed or retrieved,
* which Project it belongs to,
* which Task it belongs to when applicable,
* which repository state it represents when applicable,
* which operation produced it when applicable.

Repository observations used by Audit or Execution must be distinguishable from information generated by the LLM.

### 24.7 Context Consistency

Context used during a Stage must correspond to the artifact revisions and Task state identified by the current Stage execution context.

The system must detect material context changes when they can affect the validity of the current operation.

A Stage must not silently continue using stale context when a material repository or artifact revision change invalidates that context.

### 24.8 Context and LLM Boundary

The LLM must receive repository and project information through the Context Builder or another explicitly authorized capability.

The LLM must not directly access:

* the host filesystem,
* arbitrary network resources,
* operating-system processes,
* unrestricted environment variables,
* credentials or secrets,
* unrelated Projects.

The Context Builder does not grant the LLM authority to mutate the repository.

Mutation authority remains exclusively with authorized server-side execution capabilities.

### 24.9 Context Isolation

Context belonging to one Project or Task must not leak into another Project or Task.

The system must validate Project and Task identity before context is provided to the LLM.

Cached context must preserve its Project, Task, Stage, and relevant revision associations.

Invalid, expired, or incompatible context must not be reused as current context.

### 24.10 Context Failure

The Context Builder must report a failure when:

* required context cannot be obtained,
* the requested context exceeds the authorized scope,
* the repository state cannot be reliably observed,
* context provenance cannot be established,
* context is materially stale,
* the requested operation is not authorized.

A Context Builder failure must not be represented as successful Stage execution.

The failure must preserve sufficient diagnostic information for the responsible Stage to determine whether execution can be retried, blocked, or requires human intervention.

---

## 25. Approval & Human Interaction Contract

### 25.1 Purpose

Define how human approval and interaction control lifecycle progression and artifact acceptance.

Human interaction must provide explicit control at approval-gated lifecycle stages without allowing approval actions to mutate historical artifacts or bypass lifecycle invariants.

### 25.2 Approval Authority

The user is the authoritative approval actor for approval-gated lifecycle stages.

The system, LLM, Context Builder, and execution capabilities must not approve an artifact on behalf of the user.

An approval decision must be explicitly attributable to the user who performed the action.

### 25.3 Approval-Gated Stages

The following stages require explicit user approval before the Task may advance:

```text id="1s8f4k"
REQUIREMENT

PLANNING

CONTRACT
```

Approval applies to the current artifact revision produced by that Stage.

Approval of one artifact type must not implicitly approve another artifact type.

### 25.4 Approval State

Each approval-gated artifact revision must have an approval state:

```text id="n2v4zl"
PENDING

APPROVED

REJECTED
```

A newly created revision must begin with:

```text id="x9zq3d"
PENDING
```

Only an explicit user action may transition a revision from `PENDING` to `APPROVED` or `REJECTED`.

### 25.5 Approval Actions

The user may perform:

```text id="4m2q7v"
APPROVE

REJECT

REQUEST REVISION
```

`APPROVE` changes the current artifact revision to `APPROVED`.

`REJECT` changes the current artifact revision to `REJECTED`.

`REQUEST REVISION` requires the system to create a new artifact revision with an approval state of `PENDING`.

`REQUEST REVISION` must not mutate the existing artifact revision.

### 25.6 Approval Immutability

Approval decisions must be preserved as immutable historical events.

The system must not rewrite or delete a previous approval decision.

If a new revision is created, the previous revision and its approval history remain preserved.

A new revision must not inherit an `APPROVED` or `REJECTED` state from its predecessor.

### 25.7 Approval Preconditions

An artifact may be approved only when:

* the artifact is structurally valid,
* the artifact belongs to the current Task,
* the artifact is the current revision for its artifact type,
* the artifact is in `PENDING` approval state,
* the Task is at the lifecycle Stage associated with that artifact.

The system must reject approval attempts that do not satisfy these conditions.

### 25.8 Approval and Lifecycle Transition

A lifecycle transition requiring approval must verify the approval state of the exact artifact revision associated with the transition.

For example:

```text id="8m4w0s"
REQUIREMENT → PLANNING
    requires approved Requirement revision

PLANNING → CONTRACT
    requires approved Plan revision

CONTRACT → AUDIT
    requires approved Contract revision
    requires corresponding valid Checklist
```

Approval of a superseded revision must never satisfy a transition precondition.

### 25.9 Rejection Handling

A rejected artifact revision must remain preserved as historical data.

Rejection must not:

* mutate the artifact content,
* automatically advance the Task,
* invalidate unrelated artifact revisions,
* modify the approved Requirement, Plan, Contract, or Checklist of another revision chain.

A rejected artifact may be replaced by a new revision through an authorized revision operation.

### 25.10 Human Interaction During Execution

The Execution stage is automatic after the required approval gates have been satisfied.

The system must not require routine user approval for individual implementation, verification, or fixing operations that are already authorized by the approved Contract and Checklist.

However, Execution must stop and produce an appropriate `FAILED` or `BLOCKED` outcome when continued operation would require authority outside the approved Contract or available execution capabilities.

### 25.11 Human Intervention

When human intervention is required, the system must preserve the current Task state, artifact revisions, execution evidence, and diagnostic information.

Human intervention must not silently alter historical execution records.

Any change to the approved user intent, implementation strategy, or contractual requirements must occur through the appropriate artifact revision and approval process.

### 25.12 Approval Failure Conditions

The system must reject an approval operation when:

* the artifact is invalid,
* the artifact is not the current revision,
* the artifact is not in `PENDING` state,
* the Task is not at the associated lifecycle Stage,
* the artifact does not belong to the Task,
* the approval actor cannot be identified,
* the approval operation would violate a lifecycle invariant.

A failed approval operation must not modify the artifact or Task state.

---

## 26. Error / Failure / Recovery Contract

### 26.1 Purpose

Define how Insula-code represents, preserves, and handles errors, failures, blocked operations, and recoverable conditions across the Task lifecycle.

Failure handling must preserve auditability, prevent invalid lifecycle transitions, and avoid silently changing approved artifacts or user intent.

### 26.2 Failure Categories

The system must distinguish between:

```text id="h8f2nz"
VALIDATION_ERROR

CONTEXT_ERROR

EXECUTION_ERROR

VERIFICATION_FAILURE

BLOCKED

DOMAIN_ERROR

SYSTEM_ERROR
```

`VALIDATION_ERROR` means that an input, artifact, or generated output does not satisfy its structural or semantic validation rules.

`CONTEXT_ERROR` means that required project or repository context cannot be obtained, validated, or safely used.

`EXECUTION_ERROR` means that an authorized execution operation failed.

`VERIFICATION_FAILURE` means that an implementation did not satisfy a required verification condition.

`BLOCKED` means that the lifecycle operation cannot safely continue because a required condition, capability, dependency, or authorization is unavailable.

`DOMAIN_ERROR` means that an operation violates a domain invariant or lifecycle rule.

`SYSTEM_ERROR` means that an unexpected infrastructure or application failure prevents the operation from completing reliably.

### 26.3 Failure vs Outcome

A failure condition and a Stage outcome are distinct concepts.

A failure may occur during Stage execution without immediately determining the final Stage outcome.

Where defined by the Stage contract:

* `AUDIT` may produce `BLOCKED` as an execution readiness result,
* `EXECUTION` may produce `FAILED`,
* `EXECUTION` may produce `BLOCKED`.

A Stage must not treat an internal error as successful completion.

### 26.4 Error Preservation

When an error or failure occurs, the system must preserve sufficient diagnostic information to determine:

* the Task,
* the Project,
* the current Stage,
* the operation being performed,
* the relevant artifact revisions,
* the error category,
* the failure reason,
* relevant command or tool information,
* relevant execution evidence,
* the time of occurrence.

Diagnostic information must not overwrite historical artifact revisions.

### 26.5 Artifact Preservation

A failure must not mutate an existing immutable artifact revision.

When a failure occurs while producing a new artifact revision:

* an incomplete artifact must not be treated as valid,
* a structurally invalid artifact must not become the current valid revision,
* the previous valid revision must remain preserved,
* diagnostic information must be associated with the failed operation.

### 26.6 Task State Preservation

A failed operation must not silently advance the Task lifecycle.

If a Stage cannot satisfy its completion conditions, the Task must remain at its current lifecycle Stage unless an explicitly defined recovery transition applies.

The system must not use an error condition as an implicit lifecycle transition.

### 26.7 Retry Rules

An operation may be retried when:

* the operation is classified as retryable,
* retrying does not violate the current Stage contract,
* the relevant context remains valid,
* the retry limit has not been exceeded.

Retries must be recorded.

A retry must not create a new lifecycle Stage.

A retry must not mutate approved artifacts.

### 26.8 Execution Failure Recovery

Execution failures must follow the Execution stage's controlled fixing loop when the failure is attributable to the implementation and remains within Contract scope.

The system may perform another verification cycle after a successful fix.

The system must stop the fixing loop when the conditions defined by the Execution stage are met, including:

* verification succeeds,
* the fixing limit is exceeded,
* the failure cannot be safely resolved,
* required context is unavailable,
* the failure indicates Contract inconsistency,
* continued execution is unsafe.

### 26.9 Blocked State Recovery

A `BLOCKED` result must identify the condition preventing continuation.

The system must not bypass the block by:

* weakening acceptance criteria,
* modifying an approved Contract,
* modifying an approved Checklist,
* skipping required lifecycle stages,
* granting unauthorized execution capabilities.

Resolution of a block must occur through an explicitly authorized operation.

After the blocking condition is resolved, the relevant Stage may be retried or re-entered according to its defined recovery rules.

### 26.10 Recovery and Artifact Revision

If recovery requires changing an approved Requirement, Plan, Contract, or Checklist, the change must occur through a new artifact revision.

The existing approved revision must remain immutable.

A newly created revision must satisfy the approval requirements applicable to its artifact type before it may control subsequent execution.

### 26.11 Recovery Context

A recovery operation must use the latest valid state of:

* the Task,
* the Project,
* the applicable artifact revisions,
* the repository,
* the relevant diagnostic information.

Stale recovery context must not silently override newer state.

### 26.12 Non-Recoverable Failure

A failure is non-recoverable when continued operation cannot safely satisfy the current Stage contract or when required system capabilities are unavailable without an authorized external intervention.

A non-recoverable failure must:

* preserve the relevant artifacts,
* preserve diagnostic information,
* prevent invalid lifecycle advancement,
* identify the required intervention where determinable.

The system must not claim successful Task completion after a non-recoverable failure.

### 26.13 Recovery Auditability

Every recovery operation must be auditable.

The system must preserve:

* the original failure,
* the recovery action,
* the artifact revisions involved,
* the resulting state,
* the resulting outcome.

Recovery history must remain available for debugging and historical analysis.

---

Terakhir untuk fondasi domain Phase 1 adalah **Section 27 — Phase 1 Domain Invariants**.

## 27. Phase 1 Domain Invariants

### 27.1 Purpose

Define the non-negotiable invariants that must remain true throughout the Insula-code lifecycle.

These invariants represent domain-level guarantees and must be enforced independently of individual Stage implementations, LLM behavior, or client presentation.

### 27.2 Task Lifecycle Invariants

The following must always be true:

* every Task belongs to exactly one Project,
* every Task has exactly one active lifecycle Stage,
* a Task cannot skip a lifecycle Stage,
* a Task cannot transition backward through the normal lifecycle,
* a Task cannot transition without satisfying the target Stage preconditions,
* `COMPLETED` may only be reached from `EXECUTION`,
* `EXECUTION → COMPLETED` requires an Execution outcome of `SUCCESS`.

### 27.3 Artifact Invariants

* every artifact revision belongs to exactly one Task,
* every artifact revision has exactly one artifact type,
* artifact revisions are immutable after persistence,
* revision identities are never reused,
* superseded revisions remain historically accessible,
* artifact lineage must be explicitly recorded,
* a superseded or rejected revision must never satisfy a current approval or execution precondition,
* artifact content must not be silently replaced by a newer revision.

### 27.4 Approval Invariants

* approval belongs to an artifact revision, not directly to the Task,
* approval-gated artifact revisions begin in `PENDING`,
* only an authorized human actor may approve or reject an artifact,
* approval decisions are historically preserved,
* an `APPROVED` revision must never become `REJECTED` through mutation,
* a newly created revision does not inherit approval from its predecessor,
* lifecycle transitions must validate approval against the exact required revision.

### 27.5 Stage Invariants

* exactly one lifecycle Stage is active for a Task,
* each Stage may perform only operations permitted by its Stage contract,
* only `EXECUTION` may perform repository mutation for Task implementation,
* Requirement, Planning, Contract, and Audit must not autonomously mutate the target repository,
* a Stage must not autonomously bypass its approval gate,
* a Stage must not silently expand its authorized scope.

### 27.6 Context Invariants

* the LLM must not receive unrestricted host access,
* repository context must be provided through authorized capabilities,
* context must be scoped to the current Project and Task,
* context provenance must be preserved where required,
* stale or incompatible context must not silently be treated as current,
* missing context must not be replaced with fabricated information.

### 27.7 Execution Invariants

* Execution must operate against explicitly identified artifact revisions,
* Execution must operate only when Audit readiness is `READY`,
* repository mutations must remain within approved Contract scope,
* verification failure must not authorize Contract modification,
* fixing operations must remain within Contract scope,
* fixing iterations must be bounded,
* Execution must not claim `SUCCESS` unless applicable acceptance criteria have been verified,
* `FAILED` and `BLOCKED` outcomes must not transition the Task to `COMPLETED`.

### 27.8 Failure Invariants

* failures must not silently advance the Task,
* failures must preserve relevant diagnostic information,
* failures must not mutate immutable artifacts,
* recovery must not bypass approval or lifecycle rules,
* retry operations must be auditable,
* non-recoverable failures must not be represented as successful completion.

### 27.9 Project Invariants

* every Task belongs to a valid Project,
* an archived Project must not accept new Tasks,
* an archived Project must not be used as the target of new Execution,
* archiving a Project must not silently mutate the lifecycle state of its existing Tasks,
* a Project may contain multiple Tasks,
* Task lifecycle state must remain independent from Project state.

### 27.10 Invariant Enforcement

Domain invariants must be enforced by the server-side domain layer.

The client must not be considered an authoritative enforcement boundary.

The LLM must not be considered an authoritative enforcement boundary.

Validation performed by the client or LLM may improve user experience or generation quality but must not replace server-side invariant enforcement.

Any operation that would violate a domain invariant must fail atomically and must not partially mutate domain state.

### 27.11 Phase 1 Completion Criteria

Phase 1 domain modeling is considered complete when:

* all lifecycle Stages are explicitly defined,
* Stage inputs and outputs are defined,
* Stage preconditions and postconditions are defined,
* allowed Stage operations are defined,
* approval gates are defined,
* artifact identity and revision rules are defined,
* Task and Project state rules are defined,
* Context Builder boundaries are defined,
* human approval rules are defined,
* failure and recovery rules are defined,
* domain invariants are explicitly recorded,
* the resulting model contains no unresolved contradiction between these rules.
