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

        const output = {
            id: "artifact-1",
            taskId: "task-1",
            artifactType: "REQUIREMENT",
            revisionNumber: 1,
            isCurrent: true,
            createdAt: "2026-08-21T00:00:00.000Z",
            approvalState: "PENDING",
            objective: "Build a project dashboard",
            requestedBehavior: "A dashboard is available",
            scope: [],
            constraints: [],
            ambiguities: [],
            assumptions: [],
            acceptanceIntent: "Dashboard works as requested",
        };

        const run =
            vi.fn()
                .mockResolvedValue({
                    outputs: [output],
                });

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
            state: "REQUIREMENT" as const,
            outputs: [],
        };

        await orchestrator.run({
            task,
        });

        expect(run)
            .toHaveBeenCalledOnce();

        expect(run)
            .toHaveBeenCalledWith(task);

        expect(task.outputs).toEqual([
            output,
        ]);

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
                    state: "PLANNING",
                    outputs: [],
                },
            }),
        ).rejects.toThrow(
            "Unsupported task stage: PLANNING",
        );

    });

});