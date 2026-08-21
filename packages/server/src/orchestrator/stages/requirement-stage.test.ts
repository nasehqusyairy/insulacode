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

        const createRequirement =
            vi.fn()
                .mockResolvedValue({});

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
        };

        await handler.run(task);

        expect(createRequirement)
            .toHaveBeenCalledOnce();

        expect(createRequirement)
            .toHaveBeenCalledWith({
                taskId: "task-1",
                prompt: "Build a project dashboard",
            });

    });

});