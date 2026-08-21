import type {
    ArtifactRevision,
} from "./artifact.js";

export type TaskStage =
    | "REQUIREMENT"
    | "PLANNING"
    | "CONTRACT"
    | "AUDIT"
    | "EXECUTION"
    | "COMPLETED";

export type TaskSuspendedState =
    | "PAUSED"
    | "FAILED"
    | "CANCELLED";

export type TaskState =
    | TaskStage
    | TaskSuspendedState;

export type ApprovalState =
    | "PENDING"
    | "APPROVED"
    | "REJECTED";

export type ApprovalAction =
    | "APPROVE"
    | "REJECT"
    | "REQUEST_REVISION";

export type ExecutionReadiness =
    | "READY"
    | "BLOCKED";

export type ExecutionOutcome =
    | "SUCCESS"
    | "FAILED"
    | "BLOCKED";

export type FailureCategory =
    | "VALIDATION_ERROR"
    | "CONTEXT_ERROR"
    | "EXECUTION_ERROR"
    | "VERIFICATION_FAILURE"
    | "BLOCKED"
    | "DOMAIN_ERROR"
    | "SYSTEM_ERROR";

export interface Task {

    id: string;

    projectId: string;

    userIntent: string;

    /**
     * Actual state of the task.
     *
     * Can be a macro stage or a suspended state.
     */
    state: TaskState;

    /**
     * Original/current macro-stage.
     *
     * This is retained when the task enters PAUSED,
     * FAILED, or CANCELLED.
     */
    currentStage: TaskStage;

    outputs: ArtifactRevision[];

    fixIterationCount: number;

}