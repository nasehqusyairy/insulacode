import { describe, expect, it } from "vitest";

import {
    buildContext,
} from "./builder.js";

describe("Context Builder", () => {

    it("builds prompt context from all context sources", () => {

        const context = buildContext({
            systemContract: "System rules",
            agentContract: "Agent rules",
            taskContext: "Task information",
            projectContext: "Project information",
            previousOutput: "Previous answer",
            userInput: "User request",
        });

        expect(context).toEqual({
            systemContract: "System rules",
            agentContract: "Agent rules",
            taskContext: "Task information",
            projectContext: "Project information",
            previousOutput: "Previous answer",
            userInput: "User request",
        });

    });

    it("preserves absent previous output", () => {

        const context = buildContext({
            systemContract: "System",
            agentContract: "Agent",
            taskContext: "Task",
            projectContext: "Project",
            userInput: "Request",
        });

        expect(context.previousOutput).toBeUndefined();

    });

    it("does not format the prompt", () => {

        const context = buildContext({
            systemContract: "System",
            agentContract: "Agent",
            taskContext: "Task",
            projectContext: "Project",
            userInput: "Request",
        });

        expect(context.systemContract).toBe("System");
        expect(context.agentContract).toBe("Agent");
        expect(context.taskContext).toBe("Task");
        expect(context.projectContext).toBe("Project");
        expect(context.userInput).toBe("Request");

        expect(
            JSON.stringify(context),
        ).not.toContain("## SYSTEM CONTRACT");

    });

});