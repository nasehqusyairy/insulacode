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
    TaskStore,
} from "../persistence/index.js";

import type {
    Orchestrator,
} from "./orchestrator.js";

import {
    TaskWorker,
} from "./task-worker.js";

describe("TaskWorker", () => {

    function createTask(): Task {

        return {
            id: "task-1",
            projectId: "project-1",
            userIntent:
                "Build a dashboard",
            currentStage:
                "REQUIREMENT",
            fixIterationCount: 0,
            state:
                "REQUIREMENT",
            outputs: [],
            events: [],
        };

    }

    it("processes queued tasks through the orchestrator", async () => {

        const queue =
            new TaskQueue<Task>();

        const run =
            vi.fn()
                .mockResolvedValue(
                    undefined,
                );

        const orchestrator =
            {
                run,
            } as unknown as Orchestrator;

        const save =
            vi.fn()
                .mockResolvedValue(
                    undefined,
                );

        const taskStore =
            {
                save,
            } as unknown as TaskStore;

        const worker =
            new TaskWorker(
                queue,
                orchestrator,
                taskStore,
            );

        worker.start();

        const task =
            createTask();

        worker.enqueue(
            task,
        );

        await new Promise(
            (resolve) =>
                setTimeout(
                    resolve,
                    10,
                ),
        );

        expect(run)
            .toHaveBeenCalledOnce();

        expect(run)
            .toHaveBeenCalledWith({
                task,
            });

        expect(save)
            .toHaveBeenCalledOnce();

        expect(save)
            .toHaveBeenCalledWith(
                task,
            );

        worker.stop();

    });

    it("persists the task when the orchestrator fails", async () => {

        const queue =
            new TaskQueue<Task>();

        const error =
            new Error(
                "Stage execution failed",
            );

        const run =
            vi.fn()
                .mockRejectedValue(
                    error,
                );

        const orchestrator =
            {
                run,
            } as unknown as Orchestrator;

        const save =
            vi.fn()
                .mockResolvedValue(
                    undefined,
                );

        const taskStore =
            {
                save,
            } as unknown as TaskStore;

        const consoleError =
            vi.spyOn(
                console,
                "error",
            ).mockImplementation(
                () => undefined,
            );

        const worker =
            new TaskWorker(
                queue,
                orchestrator,
                taskStore,
            );

        worker.start();

        const task =
            createTask();

        worker.enqueue(
            task,
        );

        await new Promise(
            (resolve) =>
                setTimeout(
                    resolve,
                    10,
                ),
        );

        expect(run)
            .toHaveBeenCalledOnce();

        expect(save)
            .toHaveBeenCalledOnce();

        expect(save)
            .toHaveBeenCalledWith(
                task,
            );

        expect(consoleError)
            .toHaveBeenCalledWith(
                "Task execution failed:",
                error,
            );

        consoleError.mockRestore();

        worker.stop();

    });
});