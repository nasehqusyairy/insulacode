export interface RequirementOutput {
    objective: string;

    requestedBehavior: string;

    scope: string[];

    constraints: string[];

    ambiguities: string[];

    assumptions: string[];

    acceptanceIntent: string;
}

function isStringArray(
    value: unknown,
): value is string[] {

    return (
        Array.isArray(value)
        && value.every(
            (item) => typeof item === "string",
        )
    );

}

function isRequirementOutput(
    value: unknown,
): value is RequirementOutput {

    if (
        typeof value !== "object"
        || value === null
    ) {
        return false;
    }

    const object =
        value as Record<string, unknown>;

    return (
        typeof object.objective === "string"
        && typeof object.requestedBehavior === "string"
        && isStringArray(object.scope)
        && isStringArray(object.constraints)
        && isStringArray(object.ambiguities)
        && isStringArray(object.assumptions)
        && typeof object.acceptanceIntent === "string"
    );

}

export function parseRequirementOutput(
    content: string,
): RequirementOutput {

    let value: unknown;

    try {

        value = JSON.parse(content);

    } catch {

        throw new Error(
            "Invalid requirement output: expected valid JSON",
        );

    }

    if (!isRequirementOutput(value)) {

        throw new Error(
            "Invalid requirement output: invalid structure",
        );

    }

    return value;

}