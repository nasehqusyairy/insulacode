import type {
    PromptContext,
} from "../prompt/index.js";

export interface ContextBuilderInput {

    systemContract: string;

    agentContract: string;

    taskContext: string;

    projectContext: string;

    previousOutput?: string;

    userInput: string;

}

export function buildContext(
    input: ContextBuilderInput,
): PromptContext {

    return {
        systemContract: input.systemContract,
        agentContract: input.agentContract,
        taskContext: input.taskContext,
        projectContext: input.projectContext,
        previousOutput: input.previousOutput,
        userInput: input.userInput,
    };

}