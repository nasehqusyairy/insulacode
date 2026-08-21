import {
    describe,
    expect,
    it,
    vi,
} from "vitest";

import type {
    EventBus,
} from "../events/index.js";

import {
    Orchestrator,
} from "./orchestrator.js";

import type {
    StageHandler,
} from "./stage-handler.js";

import type {
    Task,
} from "../domain/index.js";

describe("Orchestrator", () => {

    function createEventBus(): EventBus {

        return {
            publish:
                vi.fn()
                    .mockResolvedValue(
                        undefined,
                    ),

            subscribe:
                vi.fn(),
        };

    }

    it("delegates a task to its stage handler", async () => {

        const output = {
            id: "artifact-1",
            taskId: "task-1",
            artifactType: "REQUIREMENT",
            revisionNumber: 1,
            isCurrent: true,
            createdAt:
                "2026-08-21T00:00:00.000Z",
            approvalState: "PENDING",
            objective:
                "Build a project dashboard",
            requestedBehavior:
                "A dashboard is available",
            scope: [],
            constraints: [],
            ambiguities: [],
            assumptions: [],
            acceptanceIntent:
                "Dashboard works as requested",
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

        const eventBus =
            createEventBus();

        const orchestrator =
            new Orchestrator(
                new Map([
                    [
                        "REQUIREMENT",
                        requirementHandler,
                    ],
                ]),
                eventBus,
            );

        const task: Task = {
            id: "task-1",
            projectId: "project-1",
            userIntent:
                "Build a project dashboard",
            currentStage:
                "REQUIREMENT" as const,
            fixIterationCount: 0,
            state:
                "REQUIREMENT" as const,
            outputs: [],
            events: [],
        };

        await orchestrator.run({
            task,
        });

        expect(run)
            .toHaveBeenCalledOnce();

        expect(run)
            .toHaveBeenCalledWith(task);

        expect(task.outputs)
            .toEqual([
                output,
            ]);

        expect(task.events)
            .toHaveLength(2);

        expect(task.events[0].type)
            .toBe("stage.started");

        expect(task.events[1].type)
            .toBe("stage.completed");

        expect(eventBus.publish)
            .toHaveBeenCalledTimes(2);

    });

    it("publishes stage.failed when the handler fails", async () => {

        const error =
            new Error(
                "Requirement generation failed",
            );

        const run =
            vi.fn()
                .mockRejectedValue(
                    error,
                );

        const requirementHandler:
            StageHandler = {
            run,
        };

        const eventBus =
            createEventBus();

        const orchestrator =
            new Orchestrator(
                new Map([
                    [
                        "REQUIREMENT",
                        requirementHandler,
                    ],
                ]),
                eventBus,
            );

        const task: Task = {
            id: "task-1",
            projectId: "project-1",
            userIntent:
                "Build a project dashboard",
            currentStage:
                "REQUIREMENT" as const,
            fixIterationCount: 0,
            state:
                "REQUIREMENT" as const,
            outputs: [],
            events: [],
        };

        await expect(
            orchestrator.run({
                task,
            }),
        ).rejects.toThrow(
            "Requirement generation failed",
        );

        expect(task.events)
            .toHaveLength(2);

        expect(task.events[0].type)
            .toBe("stage.started");

        expect(task.events[1].type)
            .toBe("stage.failed");

        expect(task.events[1].data)
            .toEqual({
                error:
                    "Requirement generation failed",
            });

    });

    it("rejects stages without a handler", async () => {

        const eventBus =
            createEventBus();

        const orchestrator =
            new Orchestrator(
                new Map(),
                eventBus,
            );

        await expect(
            orchestrator.run({
                task: {
                    id: "task-1",
                    projectId: "project-1",
                    userIntent:
                        "Build a project dashboard",
                    currentStage:
                        "PLANNING",
                    fixIterationCount: 0,
                    state:
                        "PLANNING",
                    outputs: [],
                    events: [],
                },
            }),
        ).rejects.toThrow(
            "Unsupported task stage: PLANNING",
        );

        expect(eventBus.publish)
            .not.toHaveBeenCalled();

    });

});