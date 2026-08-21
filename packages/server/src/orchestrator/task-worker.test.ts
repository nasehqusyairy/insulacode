import {
    describe,
    expect,
    it,
    vi,
} from "vitest";

import {
    TaskQueue,
} from "../queue/index.js";

import type {
    Task,
} from "../domain/index.js";

import type {
    Orchestrator,
} from "./orchestrator.js";

import {
    TaskWorker,
} from "./task-worker.js";

describe("TaskWorker", () => {

    it("processes queued tasks through the orchestrator", async () => {

        const queue =
            new TaskQueue<Task>();

        const run =
            vi.fn()
                .mockResolvedValue(undefined);

        const orchestrator =
            {
                run,
            } as unknown as Orchestrator;

        const worker =
            new TaskWorker(
                queue,
                orchestrator,
            );

        worker.start();

        const task: Task = {
            id: "task-1",
            projectId: "project-1",
            userIntent: "Build a dashboard",
            currentStage: "REQUIREMENT",
            fixIterationCount: 0,
            state: "REQUIREMENT",
            outputs: [],
        };

        worker.enqueue(task);

        await new Promise((resolve) =>
            setTimeout(resolve, 10),
        );

        expect(run)
            .toHaveBeenCalledOnce();

        expect(run)
            .toHaveBeenCalledWith({
                task,
            });

        worker.stop();

    });

});
