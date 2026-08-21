import {
    describe,
    expect,
    it,
    vi,
} from "vitest";

import type {
    RequirementService,
} from "../../application/requirement-service.js";

import {
    RequirementStageHandler,
} from "./requirement-stage.js";

describe("RequirementStageHandler", () => {

    it("creates a requirement from the task", async () => {

        const requirement = {
            id: "artifact-1",
            taskId: "task-1",
            artifactType: "REQUIREMENT" as const,
            revisionNumber: 1,
            isCurrent: true,
            createdAt: "2026-08-21T00:00:00.000Z",
            approvalState: "PENDING" as const,
            objective: "Build a project dashboard",
            requestedBehavior:
                "A dashboard is available",
            scope: [],
            constraints: [],
            ambiguities: [],
            assumptions: [],
            acceptanceIntent:
                "Dashboard works as requested",
        };

        const createRequirement =
            vi.fn()
                .mockResolvedValue(requirement);

        const requirementService =
            {
                createRequirement,
            } as unknown as RequirementService;

        const handler =
            new RequirementStageHandler(
                requirementService,
            );

        const task = {
            id: "task-1",
            projectId: "project-1",
            userIntent: "Build a project dashboard",
            currentStage: "REQUIREMENT" as const,
            fixIterationCount: 0,
            state: "REQUIREMENT" as const,
            outputs: [],
        };

        const result =
            await handler.run(task);

        expect(result.outputs)
            .toEqual([
                requirement,
            ]);

        expect(createRequirement)
            .toHaveBeenCalledOnce();

        expect(createRequirement)
            .toHaveBeenCalledWith({
                taskId: "task-1",
                prompt: "Build a project dashboard",
            });

    });

});