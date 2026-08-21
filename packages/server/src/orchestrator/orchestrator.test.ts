import {
    describe,
    expect,
    it,
    vi,
} from "vitest";

import {
    Orchestrator,
} from "./orchestrator.js";

import type {
    StageHandler,
} from "./stage-handler.js";

describe("Orchestrator", () => {

    it("delegates a task to its stage handler", async () => {

        const run =
            vi.fn()
                .mockResolvedValue(undefined);

        const requirementHandler:
            StageHandler = {
            run,
        };

        const orchestrator =
            new Orchestrator(
                new Map([
                    [
                        "REQUIREMENT",
                        requirementHandler,
                    ],
                ]),
            );

        const task = {
            id: "task-1",
            projectId: "project-1",
            userIntent: "Build a project dashboard",
            currentStage: "REQUIREMENT" as const,
            fixIterationCount: 0,
        };

        await orchestrator.run({
            task,
        });

        expect(run)
            .toHaveBeenCalledOnce();

        expect(run)
            .toHaveBeenCalledWith(task);

    });

    it("rejects stages without a handler", async () => {

        const orchestrator =
            new Orchestrator(
                new Map(),
            );

        await expect(
            orchestrator.run({
                task: {
                    id: "task-1",
                    projectId: "project-1",
                    userIntent: "Build a project dashboard",
                    currentStage: "PLANNING",
                    fixIterationCount: 0,
                },
            }),
        ).rejects.toThrow(
            "Unsupported task stage: PLANNING",
        );

    });

});