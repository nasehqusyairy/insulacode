import type {
    ApprovalState,
    ExecutionOutcome,
    ExecutionReadiness,
    TaskStage,
    TaskState,
} from "./task.js";

export interface TransitionContext {

    approvalState?: ApprovalState;

    checklistValid?: boolean;

    executionReadiness?: ExecutionReadiness;

    executionOutcome?: ExecutionOutcome;

    /**
     * Original macro-stage before the task entered PAUSED.
     *
     * Required when resuming from PAUSED.
     */
    resumeStage?: Exclude<TaskStage, "COMPLETED">;

}

export class StateTransitionError extends Error {

    readonly fromState: TaskState;

    readonly toState: TaskState;

    constructor(
        fromState: TaskState,
        toState: TaskState,
    ) {

        super(
            `Invalid task state transition: ${fromState} -> ${toState}`,
        );

        this.name = "StateTransitionError";

        this.fromState = fromState;

        this.toState = toState;

    }

}

const MACRO_STAGES: readonly Exclude<TaskStage, "COMPLETED">[] = [
    "REQUIREMENT",
    "PLANNING",
    "CONTRACT",
    "AUDIT",
    "EXECUTION",
];

const NORMAL_TRANSITIONS: Readonly<
    Record<Exclude<TaskStage, "COMPLETED">, TaskStage>
> = {
    REQUIREMENT: "PLANNING",
    PLANNING: "CONTRACT",
    CONTRACT: "AUDIT",
    AUDIT: "EXECUTION",
    EXECUTION: "COMPLETED",
};

function isMacroStage(
    state: TaskState,
): state is Exclude<TaskStage, "COMPLETED"> {

    return MACRO_STAGES.includes(
        state as Exclude<TaskStage, "COMPLETED">,
    );

}

function isNormalTransition(
    fromState: TaskState,
    toState: TaskState,
): boolean {

    if (!isMacroStage(fromState)) {
        return false;
    }

    return NORMAL_TRANSITIONS[fromState] === toState;

}

function hasNormalTransitionPreconditions(
    fromState: Exclude<TaskStage, "COMPLETED">,
    context: TransitionContext | undefined,
): boolean {

    if (!context) {
        return false;
    }

    switch (fromState) {

        case "REQUIREMENT":
        case "PLANNING":
        case "CONTRACT":
            return (
                context.approvalState === "APPROVED"
                &&
                (
                    fromState !== "CONTRACT"
                    ||
                    context.checklistValid === true
                )
            );

        case "AUDIT":
            return context.executionReadiness === "READY";

        case "EXECUTION":
            return context.executionOutcome === "SUCCESS";

    }

}

function canTransitionToPaused(
    fromState: TaskState,
): boolean {

    return isMacroStage(fromState);

}

function canTransitionToFailed(
    fromState: TaskState,
): boolean {

    return isMacroStage(fromState);

}

function canTransitionToCancelled(
    fromState: TaskState,
): boolean {

    return fromState !== "COMPLETED";

}

function canResumeFromPaused(
    toState: TaskState,
    context: TransitionContext | undefined,
): boolean {

    if (!context?.resumeStage) {
        return false;
    }

    return toState === context.resumeStage;

}

/**
 * Determines whether a task state transition is valid.
 *
 * This function is pure:
 * - no I/O
 * - no persistence
 * - no Task mutation
 * - no LLM calls
 */
export function canTransition(
    fromState: TaskState,
    toState: TaskState,
    context?: TransitionContext,
): boolean {

    if (fromState === "COMPLETED") {
        return false;
    }

    if (fromState === "CANCELLED") {
        return false;
    }

    if (toState === "CANCELLED") {
        return canTransitionToCancelled(fromState);
    }

    if (toState === "PAUSED") {
        return canTransitionToPaused(fromState);
    }

    if (toState === "FAILED") {
        return canTransitionToFailed(fromState);
    }

    if (fromState === "PAUSED") {
        return canResumeFromPaused(toState, context);
    }

    if (fromState === "FAILED") {
        return toState === "REQUIREMENT";
    }

    if (isNormalTransition(fromState, toState)) {
        return hasNormalTransitionPreconditions(
            fromState,
            context,
        );
    }

    return false;

}

/**
 * Returns every transition that is currently valid.
 *
 * Normal stage transitions are only returned when their
 * required preconditions are present in the context.
 */
export function getAllowedTransitions(
    currentState: TaskState,
    context?: TransitionContext,
): TaskState[] {

    const states: TaskState[] = [
        "REQUIREMENT",
        "PLANNING",
        "CONTRACT",
        "AUDIT",
        "EXECUTION",
        "COMPLETED",
        "PAUSED",
        "FAILED",
        "CANCELLED",
    ];

    return states.filter(
        (targetState) =>
            canTransition(
                currentState,
                targetState,
                context,
            ),
    );

}

/**
 * Validates a transition and returns the target state.
 *
 * Throws StateTransitionError when the transition is invalid.
 */
export function assertTransition(
    fromState: TaskState,
    toState: TaskState,
    context?: TransitionContext,
): TaskState {

    if (!canTransition(fromState, toState, context)) {
        throw new StateTransitionError(
            fromState,
            toState,
        );
    }

    return toState;

}