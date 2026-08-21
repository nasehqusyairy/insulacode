import type {
    StagePostcondition,
    StagePrecondition,
    ActiveTaskStage,
} from "./stage-contract.js";

import {
    STAGE_CONTRACTS,
} from "./stage-contract.js";

export interface ContractValidationContext {

    currentStage: ActiveTaskStage;

    satisfiedPreconditions: readonly StagePrecondition[];

    satisfiedPostconditions?: readonly StagePostcondition[];

}

export interface ContractValidationResult<T> {

    valid: boolean;

    missing: readonly T[];

}

function getMissing<T>(
    required: readonly T[],
    satisfied: readonly T[],
): readonly T[] {

    return required.filter(
        (condition) => !satisfied.includes(condition),
    );

}

export function validateStagePreconditions(
    stage: ActiveTaskStage,
    context: ContractValidationContext,
): ContractValidationResult<StagePrecondition> {

    const contract = STAGE_CONTRACTS[stage];

    const missing: StagePrecondition[] = [];

    if (context.currentStage !== stage) {
        missing.push("TASK_AT_STAGE");
    }

    for (const precondition of contract.preconditions) {

        if (
            precondition === "TASK_AT_STAGE"
            && context.currentStage !== stage
        ) {
            continue;
        }

        if (
            !context.satisfiedPreconditions.includes(
                precondition,
            )
        ) {
            missing.push(precondition);
        }

    }

    return {
        valid: missing.length === 0,
        missing,
    };

}

export function validateStageCompletion(
    stage: ActiveTaskStage,
    context: ContractValidationContext,
): ContractValidationResult<StagePostcondition> {

    const contract = STAGE_CONTRACTS[stage];

    const satisfied = context.satisfiedPostconditions ?? [];

    const missing = getMissing(
        contract.definitionOfDone,
        satisfied,
    );

    return {
        valid: missing.length === 0,
        missing,
    };

}