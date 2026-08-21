import type {
    PromptContext,
} from "./types.js";

export function buildPrompt(
    context: PromptContext,
): string {

    const sections = [
        [
            "SYSTEM CONTRACT",
            context.systemContract,
        ],

        [
            "AGENT CONTRACT",
            context.agentContract,
        ],

        [
            "TASK CONTEXT",
            context.taskContext,
        ],

        [
            "PROJECT CONTEXT",
            context.projectContext,
        ],

        [
            "PREVIOUS OUTPUT",
            context.previousOutput ?? "(none)",
        ],

        [
            "USER INPUT",
            context.userInput,
        ],
    ];

    return sections
        .map(
            ([title, content]) =>
                `## ${title}\n${content}`,
        )
        .join("\n");
}