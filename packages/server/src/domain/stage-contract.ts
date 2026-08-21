import type {
    ArtifactType,
} from "./artifact.js";

import type {
    TaskStage,
} from "./task.js";

export type ActiveTaskStage = Exclude<
    TaskStage,
    "COMPLETED"
>;

export type StageInput =
    | "USER_REQUEST"
    | "PROJECT_METADATA"
    | "PROJECT_CONTEXT"
    | "REQUIREMENT_ARTIFACT"
    | "PLAN_ARTIFACT"
    | "CONTRACT_ARTIFACT"
    | "CHECKLIST_ARTIFACT"
    | "AUDIT_ARTIFACT"
    | "PROJECT_FILESYSTEM";

export type StagePrecondition =
    | "TASK_AT_STAGE"
    | "REQUIREMENT_APPROVED"
    | "PLAN_APPROVED"
    | "CONTRACT_APPROVED"
    | "CHECKLIST_EXISTS"
    | "REPOSITORY_CONTEXT_AVAILABLE"
    | "AUDIT_COMPLETED";

export type StagePostcondition =
    | "REQUIREMENT_VALID"
    | "REQUIREMENT_APPROVED"
    | "PLAN_VALID"
    | "PLAN_APPROVED"
    | "CONTRACT_VALID"
    | "CHECKLIST_GENERATED"
    | "CONTRACT_APPROVED"
    | "AUDIT_COMPLETED"
    | "NO_EXECUTION_BLOCKER"
    | "IMPLEMENTATION_COMPLETE"
    | "CHECKLIST_SATISFIED"
    | "VERIFICATION_PASSED"
    | "ACCEPTANCE_CRITERIA_SATISFIED";

export type StageAction =
    | "READ_PROJECT_CONTEXT"
    | "RESOLVE_REQUIREMENT_AMBIGUITIES"
    | "PRODUCE_REQUIREMENT"
    | "INSPECT_REPOSITORY"
    | "PRODUCE_PLAN"
    | "PRODUCE_CONTRACT"
    | "GENERATE_CHECKLIST"
    | "AUDIT_REPOSITORY"
    | "PREPARE_EXECUTION"
    | "IMPLEMENT"
    | "TEST"
    | "DIAGNOSE"
    | "FIX"
    | "RETEST";

export interface StageContract {

    stage: ActiveTaskStage;

    input: readonly StageInput[];

    output: readonly ArtifactType[];

    preconditions: readonly StagePrecondition[];

    postconditions: readonly StagePostcondition[];

    allowedActions: readonly StageAction[];

    definitionOfDone: readonly StagePostcondition[];

}

export const STAGE_CONTRACTS: Readonly<
    Record<ActiveTaskStage, StageContract>
> = {

    REQUIREMENT: {
        stage: "REQUIREMENT",

        input: [
            "USER_REQUEST",
            "PROJECT_METADATA",
            "PROJECT_CONTEXT",
        ],

        output: [
            "REQUIREMENT",
        ],

        preconditions: [
            "TASK_AT_STAGE",
        ],

        postconditions: [
            "REQUIREMENT_VALID",
            "REQUIREMENT_APPROVED",
        ],

        allowedActions: [
            "READ_PROJECT_CONTEXT",
            "RESOLVE_REQUIREMENT_AMBIGUITIES",
            "PRODUCE_REQUIREMENT",
        ],

        definitionOfDone: [
            "REQUIREMENT_VALID",
            "REQUIREMENT_APPROVED",
        ],
    },

    PLANNING: {
        stage: "PLANNING",

        input: [
            "REQUIREMENT_ARTIFACT",
            "PROJECT_CONTEXT",
        ],

        output: [
            "PLAN",
        ],

        preconditions: [
            "TASK_AT_STAGE",
            "REQUIREMENT_APPROVED",
            "REPOSITORY_CONTEXT_AVAILABLE",
        ],

        postconditions: [
            "PLAN_VALID",
            "PLAN_APPROVED",
        ],

        allowedActions: [
            "READ_PROJECT_CONTEXT",
            "INSPECT_REPOSITORY",
            "PRODUCE_PLAN",
        ],

        definitionOfDone: [
            "PLAN_VALID",
            "PLAN_APPROVED",
        ],
    },

    CONTRACT: {
        stage: "CONTRACT",

        input: [
            "REQUIREMENT_ARTIFACT",
            "PLAN_ARTIFACT",
            "PROJECT_CONTEXT",
        ],

        output: [
            "CONTRACT",
            "CHECKLIST",
        ],

        preconditions: [
            "TASK_AT_STAGE",
            "REQUIREMENT_APPROVED",
            "PLAN_APPROVED",
            "REPOSITORY_CONTEXT_AVAILABLE",
        ],

        postconditions: [
            "CONTRACT_VALID",
            "CHECKLIST_GENERATED",
            "CONTRACT_APPROVED",
        ],

        allowedActions: [
            "READ_PROJECT_CONTEXT",
            "PRODUCE_CONTRACT",
            "GENERATE_CHECKLIST",
        ],

        definitionOfDone: [
            "CONTRACT_VALID",
            "CHECKLIST_GENERATED",
            "CONTRACT_APPROVED",
        ],
    },

    AUDIT: {
        stage: "AUDIT",

        input: [
            "CONTRACT_ARTIFACT",
            "CHECKLIST_ARTIFACT",
            "PROJECT_FILESYSTEM",
        ],

        output: [
            "AUDIT",
        ],

        preconditions: [
            "TASK_AT_STAGE",
            "CONTRACT_APPROVED",
            "CHECKLIST_EXISTS",
            "REPOSITORY_CONTEXT_AVAILABLE",
        ],

        postconditions: [
            "AUDIT_COMPLETED",
            "NO_EXECUTION_BLOCKER",
        ],

        allowedActions: [
            "INSPECT_REPOSITORY",
            "AUDIT_REPOSITORY",
            "PREPARE_EXECUTION",
        ],

        definitionOfDone: [
            "AUDIT_COMPLETED",
            "NO_EXECUTION_BLOCKER",
        ],
    },

    EXECUTION: {
        stage: "EXECUTION",

        input: [
            "CONTRACT_ARTIFACT",
            "CHECKLIST_ARTIFACT",
            "AUDIT_ARTIFACT",
            "PROJECT_FILESYSTEM",
        ],

        output: [
            "EXECUTION",
        ],

        preconditions: [
            "TASK_AT_STAGE",
            "CONTRACT_APPROVED",
            "CHECKLIST_EXISTS",
            "AUDIT_COMPLETED",
            "REPOSITORY_CONTEXT_AVAILABLE",
        ],

        postconditions: [
            "IMPLEMENTATION_COMPLETE",
            "CHECKLIST_SATISFIED",
            "VERIFICATION_PASSED",
            "ACCEPTANCE_CRITERIA_SATISFIED",
        ],

        allowedActions: [
            "IMPLEMENT",
            "TEST",
            "DIAGNOSE",
            "FIX",
            "RETEST",
        ],

        definitionOfDone: [
            "IMPLEMENTATION_COMPLETE",
            "CHECKLIST_SATISFIED",
            "VERIFICATION_PASSED",
            "ACCEPTANCE_CRITERIA_SATISFIED",
        ],
    },

};