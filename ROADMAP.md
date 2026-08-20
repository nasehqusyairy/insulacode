# Roadmap Insula-code

## Phase 0 — Foundation

**Tujuan:** memastikan monorepo dan runtime minimal benar sebelum AI architecture dibangun.

### Step 0.1 — Repository Baseline

* Verifikasi struktur pnpm workspace
* Verifikasi Turborepo
* Verifikasi `packages/server`
* Verifikasi `packages/client`
* Verifikasi scripts `dev`, `build`, `start`
* Pastikan TypeScript configuration konsisten

### Step 0.2 — Server Bootstrap

* Hono application
* HTTP server Node/Bun
* Health endpoint
* Error handling dasar
* Environment configuration

### Step 0.3 — Client Bootstrap

* React + Vite
* Tailwind
* shadcn/ui
* Basic application shell

### Step 0.4 — Production Integration

* Build client
* Hono serve static client
* `pnpm build`
* `pnpm start`

### CHECKPOINT

```text
PHASE-0 FOUNDATION
```

Setelah ini kita punya **web application kosong tetapi production-ready**.

---

# Phase 1 — Domain & Contract

**Tujuan:** mendefinisikan "otak" Insula sebelum membuat agent.

Ini fase yang sangat penting.

### Step 1.1 — Project Contract

Membuat:

```text
PROJECT_CONTRACT.md
```

Berisi:

* mission Insula
* architectural principles
* lifecycle
* constraints
* agent rules
* execution rules
* Definition of Done

### Step 1.2 — Domain Model

Definisikan konsep:

```text
Project
Task
Requirement
Plan
Contract
Checklist
Execution
TestResult
```

Turunkan menjadi TypeScript types.

Contoh:

```ts
type TaskStage =
  | "requirement"
  | "planning"
  | "contract"
  | "audit"
  | "execution"
  | "testing";
```

### Step 1.3 — State Machine

Definisikan state transition secara eksplisit.

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
TESTING
     ↓
 DONE
```

Termasuk failure/retry path.

### Step 1.4 — Stage Contracts

Setiap stage mempunyai:

```text
Input
Output
Precondition
Postcondition
Allowed Actions
Definition of Done
```

### Step 1.5 — Contract Validation

Buat validator agar state invalid tidak dapat diteruskan.

### CHECKPOINT

```text
PHASE-1 CONTRACT
```

Pada titik ini Insula **belum pintar**, tetapi kita sudah mengetahui dengan tepat apa yang harus dilakukan agent.

---

# Phase 2 — Agent & Context Engine

**Tujuan:** membuat mekanisme komunikasi dengan LLM.

### Step 2.1 — LLM Provider

Abstraksi minimal:

```ts
interface LLMProvider {
  generate(request: LLMRequest): Promise<LLMResponse>;
}
```

Implementasi pertama:

```text
OllamaProvider
```

Jangan membuat abstraction berlebihan untuk provider yang belum kita perlukan.

### Step 2.2 — Prompt Architecture

Pisahkan:

```text
System Contract
Agent Contract
Task Context
Project Context
Previous Output
User Input
```

### Step 2.3 — Context Builder

Ini komponen penting:

```text
ContextBuilder
       ↓
relevant contracts
       +
task state
       +
relevant files
       +
previous outputs
       ↓
LLM Context
```

Tujuannya menghindari mengirim seluruh repository ke Gemma.

### Step 2.4 — Agent Runtime

Definisikan:

```ts
interface Agent {
  run(context: AgentContext): Promise<AgentResult>;
}
```

Kemudian buat agent pertama:

```text
RequirementAgent
```

### Step 2.5 — Structured Output

LLM tidak boleh menghasilkan output bebas yang langsung dianggap valid.

Misalnya:

```text
LLM
 ↓
JSON
 ↓
Schema Validation
 ↓
Requirement
```

### CHECKPOINT

```text
PHASE-2 AGENT
```

Sekarang kita sudah memiliki **LLM yang dapat bekerja dalam kontrak**.

---

# Phase 3 — Orchestrator & Queue

**Tujuan:** membuat Insula mampu menjalankan lifecycle.

### Step 3.1 — Task Queue

Sequential queue:

```text
Task
 ↓
Queue
 ↓
Worker
 ↓
Agent
```

Tidak ada concurrent agent execution dulu.

### Step 3.2 — Orchestrator

```text
Orchestrator
     │
     ├── RequirementAgent
     ├── PlanningAgent
     ├── ContractAgent
     ├── AuditAgent
     └── ExecutionAgent
```

### Step 3.3 — State Persistence

Task harus dapat dihentikan dan dilanjutkan.

Minimal:

```text
Task
 ├── state
 ├── currentStage
 ├── outputs
 └── events
```

Storage pertama bisa filesystem/JSON. Jangan buru-buru database.

### Step 3.4 — Event System

Semua aktivitas penting menghasilkan event:

```ts
type AgentEvent =
  | "task.created"
  | "stage.started"
  | "stage.completed"
  | "stage.failed"
  | "agent.started"
  | "agent.completed"
  | "test.started"
  | "test.completed";
```

### Step 3.5 — SSE

Server mengirim event ke client:

```text
Agent
  ↓
Event
  ↓
Event Bus
  ↓
SSE
  ↓
Dashboard
```

### CHECKPOINT

```text
PHASE-3 ORCHESTRATOR
```

Insula sekarang sudah menjadi **agent system**, bukan sekadar LLM wrapper.

---

# Phase 4 — Project Intelligence

**Tujuan:** membuat Insula mampu memahami repository yang sedang dikerjakannya.

### Step 4.1 — Filesystem Service

Operasi terkontrol:

```text
read
write
list
exists
```

### Step 4.2 — Repository Scanner

Mendeteksi:

```text
package.json
tsconfig.json
vite.config.ts
src/
tests/
...
```

### Step 4.3 — Project Context

Membangun representasi:

```text
Repository
├── structure
├── package metadata
├── dependencies
├── configuration
└── source files
```

### Step 4.4 — Relevance Filtering

Jangan kirim seluruh repository.

```text
Task
 ↓
Relevant Files
 ↓
Context Builder
 ↓
LLM
```

### Step 4.5 — Checklist Generator

Step 3 yang sebelumnya kita definisikan mulai benar-benar digunakan:

```text
contract
   ↓
checklist.md
```

### CHECKPOINT

```text
PHASE-4 PROJECT INTELLIGENCE
```

---

# Phase 5 — Execution & Self-Testing

**Tujuan:** membuat Insula benar-benar bisa melakukan pekerjaan coding.

### Step 5.1 — Terminal Runner

Controlled execution:

```text
pnpm test
pnpm build
pnpm lint
```

Dengan timeout dan capture:

```text
stdout
stderr
exitCode
duration
```

### Step 5.2 — Code Modification

Agent mendapatkan kemampuan:

```text
read → reason → modify
```

Bukan:

```text
LLM → arbitrary shell
```

### Step 5.3 — Test Runner

```text
Implementation
      ↓
Test
      ↓
Result
```

### Step 5.4 — Failure Diagnosis

```text
Test Failure
      ↓
Diagnostic Agent
      ↓
Root Cause
      ↓
Fix Proposal
```

### Step 5.5 — Auto-Fix Loop

```text
          ┌──────────────┐
          │              ↓
Implement → Test → Diagnose
              ↑      ↓
              └── Fix
```

Dengan maximum iteration.

Misalnya:

```ts
MAX_FIX_ITERATIONS = 3;
```

### Step 5.6 — Completion Contract

Insula hanya boleh mengatakan:

```text
DONE
```

jika:

```text
Contract satisfied
AND
Checklist completed
AND
Tests passed
```

### CHECKPOINT

```text
PHASE-5 SELF-TESTING
```

Ini adalah **MVP inti Insula-code**.

---

# Phase 6 — Dashboard

Saya sengaja menaruh UI lengkap **setelah engine bekerja**.

### Step 6.1 — Task UI

### Step 6.2 — Stage Visualization

```text
Requirement ✓
Planning    ✓
Contract    ✓
Audit       ●
Execution   ○
Testing     ○
```

### Step 6.3 — Real-time Logs

SSE → log viewer.

### Step 6.4 — Agent Personas

Baru kita tampilkan visualisasi persona/role agent.

### Step 6.5 — Human Approval

User dapat:

```text
Approve
Reject
Modify
Retry
```

### CHECKPOINT

```text
PHASE-6 DASHBOARD
```

---

# Phase 7 — Hardening

Tahap terakhir bukan fitur baru, tetapi membuat sistem layak digunakan serius.

### Step 7.1

Security boundary.

### Step 7.2

Command allowlist.

### Step 7.3

Filesystem sandbox.

### Step 7.4

Timeout & cancellation.

### Step 7.5

Crash recovery.

### Step 7.6

Structured logging.

### Step 7.7

Resource monitoring.

### Step 7.8

Prompt/token optimization untuk Gemma E4B.

### CHECKPOINT

```text
PHASE-7 HARDENED MVP
```

---

## Gambaran keseluruhan

```text
PHASE 0
Foundation
   │
   ▼
PHASE 1
Domain & Contract
   │
   ▼
PHASE 2
Agent & Context
   │
   ▼
PHASE 3
Orchestrator & Queue
   │
   ▼
PHASE 4
Project Intelligence
   │
   ▼
PHASE 5
Execution & Self-Testing
   │
   ▼
PHASE 6
Dashboard
   │
   ▼
PHASE 7
Hardening
```

### Aturan kerja kita

Mulai sekarang saya akan menjaga pola:

**Satu phase → beberapa step → verifikasi → checkpoint → commit.**

Dan sebelum meminta Anda mengubah kode, saya akan menyebutkan secara eksplisit:

```text
FILE YANG DIBUKA
FILE YANG DIBUAT
FILE YANG DIUBAH
PERUBAHAN
COMMAND UNTUK VERIFIKASI
EXPECTED RESULT
CHECKPOINT / COMMIT
```

Dengan demikian kita tidak akan membangun terlalu banyak hal sekaligus dan setiap commit mempunyai makna arsitektural yang jelas.

