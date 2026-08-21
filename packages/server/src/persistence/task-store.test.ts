import {
    mkdtemp,
    readFile,
    rm,
} from "node:fs/promises";

import {
    tmpdir,
} from "node:os";

import {
    join,
} from "node:path";

import {
    afterEach,
    describe,
    expect,
    it,
} from "vitest";

import type {
    Task,
} from "../domain/index.js";

import {
    FileTaskStore,
    TaskNotFoundError,
} from "./task-store.js";

describe("FileTaskStore", () => {

    const directories: string[] = [];

    afterEach(
        async () => {

            await Promise.all(
                directories.splice(0)
                    .map(
                        (directory) =>
                            rm(
                                directory,
                                {
                                    recursive: true,
                                    force: true,
                                },
                            ),
                    ),
            );

        },
    );

    async function createStore(): Promise<FileTaskStore> {

        const directory =
            await mkdtemp(
                join(
                    tmpdir(),
                    "insulacode-task-store-",
                ),
            );

        directories.push(
            directory,
        );

        return new FileTaskStore(
            directory,
        );

    }

    function createTask(): Task {

        return {
            id: "task-1",
            projectId: "project-1",
            userIntent:
                "Build a project dashboard",
            state: "REQUIREMENT",
            currentStage: "REQUIREMENT",
            outputs: [],
            fixIterationCount: 0,
            events: [],
        };

    }

    it("saves and loads a task", async () => {

        const store =
            await createStore();

        const task =
            createTask();

        await store.save(
            task,
        );

        const loaded =
            await store.load(
                task.id,
            );

        expect(loaded)
            .toEqual(task);

    });

    it("persists task outputs", async () => {

        const store =
            await createStore();

        const task =
            createTask();

        task.outputs.push({
            id: "artifact-1",
            taskId: "task-1",
            artifactType: "REQUIREMENT",
            revisionNumber: 1,
            isCurrent: true,
            createdAt:
                "2026-08-22T00:00:00.000Z",
            approvalState: "PENDING",
            objective:
                "Build a project dashboard",
            requestedBehavior:
                "A dashboard is available",
            scope: [
                "Dashboard page",
            ],
            constraints: [
                "Use existing project architecture",
            ],
            ambiguities: [],
            assumptions: [],
            acceptanceIntent:
                "Dashboard works as requested",
        });

        await store.save(
            task,
        );

        const loaded =
            await store.load(
                task.id,
            );

        expect(loaded.outputs)
            .toEqual(task.outputs);

    });

    it("persists task state", async () => {

        const store =
            await createStore();

        const task =
            createTask();

        task.state = "PAUSED";
        task.currentStage = "REQUIREMENT";

        await store.save(
            task,
        );

        const loaded =
            await store.load(
                task.id,
            );

        expect(loaded.state)
            .toBe("PAUSED");

        expect(loaded.currentStage)
            .toBe("REQUIREMENT");

    });

    it("persists task events", async () => {

        const store =
            await createStore();

        const task =
            createTask();

        task.events.push({
            id: "event-1",
            taskId: "task-1",
            type: "stage.started",
            timestamp:
                "2026-08-22T00:00:00.000Z",
            stage: "REQUIREMENT",
        });

        task.events.push({
            id: "event-2",
            taskId: "task-1",
            type: "stage.completed",
            timestamp:
                "2026-08-22T00:00:01.000Z",
            stage: "REQUIREMENT",
        });

        await store.save(
            task,
        );

        const loaded =
            await store.load(
                task.id,
            );

        expect(loaded.events)
            .toEqual(task.events);

    });

    it("creates the storage directory automatically", async () => {

        const parent =
            await mkdtemp(
                join(
                    tmpdir(),
                    "insulacode-task-store-parent-",
                ),
            );

        directories.push(
            parent,
        );

        const directory =
            join(
                parent,
                "tasks",
            );

        const store =
            new FileTaskStore(
                directory,
            );

        const task =
            createTask();

        await store.save(
            task,
        );

        const content =
            await readFile(
                join(
                    directory,
                    "task-1.json",
                ),
                "utf8",
            );

        expect(
            JSON.parse(content),
        ).toEqual(task);

    });

    it("throws when the task does not exist", async () => {

        const store =
            await createStore();

        await expect(
            store.load(
                "missing-task",
            ),
        ).rejects.toBeInstanceOf(
            TaskNotFoundError,
        );

    });

    it("persists task events", async () => {

        const store =
            await createStore();

        const task =
            createTask();

        task.events.push({
            id: "event-1",
            taskId: "task-1",
            type: "stage.started",
            timestamp:
                "2026-08-22T00:00:00.000Z",
            stage: "REQUIREMENT",
        });

        task.events.push({
            id: "event-2",
            taskId: "task-1",
            type: "stage.completed",
            timestamp:
                "2026-08-22T00:00:01.000Z",
            stage: "REQUIREMENT",
        });

        await store.save(
            task,
        );

        const loaded =
            await store.load(
                task.id,
            );

        expect(loaded.events)
            .toEqual(task.events);

    });

});