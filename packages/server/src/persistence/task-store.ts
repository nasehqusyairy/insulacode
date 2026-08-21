import {
    mkdir,
    readFile,
    rename,
    writeFile,
} from "node:fs/promises";

import {
    join,
} from "node:path";

import type {
    Task,
} from "../domain/index.js";

export class TaskNotFoundError
    extends Error {

    constructor(
        taskId: string,
    ) {

        super(
            `Task not found: ${taskId}`,
        );

        this.name = "TaskNotFoundError";

    }

}

export interface TaskStore {

    save(
        task: Task,
    ): Promise<void>;

    load(
        taskId: string,
    ): Promise<Task>;

}

export class FileTaskStore
    implements TaskStore {

    constructor(
        private readonly directory: string,
    ) { }

    async save(
        task: Task,
    ): Promise<void> {

        await mkdir(
            this.directory,
            {
                recursive: true,
            },
        );

        const filePath =
            this.getFilePath(
                task.id,
            );

        const temporaryPath =
            `${filePath}.tmp`;

        const content =
            JSON.stringify(
                task,
                null,
                2,
            );

        await writeFile(
            temporaryPath,
            content,
            "utf8",
        );

        await rename(
            temporaryPath,
            filePath,
        );

    }

    async load(
        taskId: string,
    ): Promise<Task> {

        const filePath =
            this.getFilePath(
                taskId,
            );

        let content: string;

        try {

            content =
                await readFile(
                    filePath,
                    "utf8",
                );

        } catch (error) {

            if (
                error &&
                typeof error === "object" &&
                "code" in error &&
                error.code === "ENOENT"
            ) {
                throw new TaskNotFoundError(
                    taskId,
                );
            }

            throw error;

        }

        return JSON.parse(
            content,
        ) as Task;

    }

    private getFilePath(
        taskId: string,
    ): string {

        return join(
            this.directory,
            `${taskId}.json`,
        );

    }

}