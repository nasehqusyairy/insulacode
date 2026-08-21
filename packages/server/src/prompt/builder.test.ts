import { describe, expect, it } from "vitest";

import {
    buildPrompt,
} from "./builder.js";

describe("Prompt Builder", () => {

    it("builds a prompt with all context sections", () => {

        const prompt = buildPrompt({
            systemContract: "System rules",
            agentContract: "Agent rules",
            taskContext: "Task information",
            projectContext: "Project information",
            previousOutput: "Previous answer",
            userInput: "User request",
        });

        expect(prompt).toBe(
            [
                "## SYSTEM CONTRACT",
                "System rules",

                "## AGENT CONTRACT",
                "Agent rules",

                "## TASK CONTEXT",
                "Task information",

                "## PROJECT CONTEXT",
                "Project information",

                "## PREVIOUS OUTPUT",
                "Previous answer",

                "## USER INPUT",
                "User request",
            ].join("\n"),
        );

    });

    it("uses a deterministic placeholder when previous output is absent", () => {

        const prompt = buildPrompt({
            systemContract: "System",
            agentContract: "Agent",
            taskContext: "Task",
            projectContext: "Project",
            userInput: "Request",
        });

        expect(prompt).toContain(
            "## PREVIOUS OUTPUT\n(none)",
        );

    });

    it("preserves section order", () => {

        const prompt = buildPrompt({
            systemContract: "1",
            agentContract: "2",
            taskContext: "3",
            projectContext: "4",
            previousOutput: "5",
            userInput: "6",
        });

        expect(
            prompt.indexOf("## SYSTEM CONTRACT"),
        ).toBeLessThan(
            prompt.indexOf("## AGENT CONTRACT"),
        );

        expect(
            prompt.indexOf("## AGENT CONTRACT"),
        ).toBeLessThan(
            prompt.indexOf("## TASK CONTEXT"),
        );

        expect(
            prompt.indexOf("## TASK CONTEXT"),
        ).toBeLessThan(
            prompt.indexOf("## PROJECT CONTEXT"),
        );

        expect(
            prompt.indexOf("## PROJECT CONTEXT"),
        ).toBeLessThan(
            prompt.indexOf("## PREVIOUS OUTPUT"),
        );

        expect(
            prompt.indexOf("## PREVIOUS OUTPUT"),
        ).toBeLessThan(
            prompt.indexOf("## USER INPUT"),
        );

    });

});