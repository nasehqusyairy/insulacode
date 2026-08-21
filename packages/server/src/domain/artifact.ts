export type ArtifactType =
    | "REQUIREMENT"
    | "PLAN"
    | "CONTRACT"
    | "CHECKLIST"
    | "AUDIT"
    | "EXECUTION";

export type ExecutionOperationType = "IMPLEMENT" | "TEST" | "DIAGNOSE" | "FIX" | "RETEST"

export interface AcceptanceCriterion {

    id: string;

    description: string;

    satisfied: boolean;

}

export interface BaseArtifactRevision {

    id: string;

    taskId: string;

    artifactType: ArtifactType;

    revisionNumber: number;

    parentRevisionId?: string;

    isCurrent: boolean;

    createdAt: string;

}

export interface ApprovalGatedArtifactRevision
    extends BaseArtifactRevision {

    approvalState:
    | "PENDING"
    | "APPROVED"
    | "REJECTED";

}

export interface RequirementArtifactRevision
    extends ApprovalGatedArtifactRevision {

    artifactType: "REQUIREMENT";

    objective: string;

    requestedBehavior: string;

    scope: string[];

    constraints: string[];

    ambiguities: string[];

    assumptions: string[];

    acceptanceIntent: string;

}

export interface PlanArtifactRevision
    extends ApprovalGatedArtifactRevision {

    artifactType: "PLAN";

    parentRequirementRevisionId: string;

    implementationStrategy: string;

    affectedAreas: string[];

    affectedFiles: string[];

    dependencies: string[];

    sequencing: string[];

    risks: string[];

    verificationStrategy: string;

}

export interface ContractArtifactRevision
    extends ApprovalGatedArtifactRevision {

    artifactType: "CONTRACT";

    parentRequirementRevisionId: string;

    parentPlanRevisionId: string;

    preconditions: string[];

    requirements: string[];

    constraints: string[];

    dependencies: string[];

    expectedChanges: string[];

    acceptanceCriteria: AcceptanceCriterion[];

}

export interface ChecklistArtifactRevision
    extends BaseArtifactRevision {

    artifactType: "CHECKLIST";

    contractRevisionId: string;

    items: Array<{
        id: string;
        action: string;
        targetCriterionId: string;
    }>;

}

export interface AuditArtifactRevision
    extends BaseArtifactRevision {

    artifactType: "AUDIT";

    contractRevisionId: string;

    checklistRevisionId: string;

    executionReadiness:
    | "READY"
    | "BLOCKED";

    observedState: string;

    unsatisfiedConditions: string[];

    blockers: string[];

}

export interface ExecutionArtifactRevision
    extends BaseArtifactRevision {

    artifactType: "EXECUTION";

    contractRevisionId: string;

    checklistRevisionId: string;

    auditRevisionId: string;

    executionOutcome:
    | "SUCCESS"
    | "FAILED"
    | "BLOCKED";

    fixIterations: number;

}

export type ArtifactRevision =
    | RequirementArtifactRevision
    | PlanArtifactRevision
    | ContractArtifactRevision
    | ChecklistArtifactRevision
    | AuditArtifactRevision
    | ExecutionArtifactRevision;