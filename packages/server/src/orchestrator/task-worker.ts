import type {
    Task,
} from "../domain/index.js";

import type {
    TaskStore,
} from "../persistence/index.js";

import {
    TaskQueue,
} from "../queue/index.js";

import {
    Orchestrator,
} from "./orchestrator.js";

export class TaskWorker {

    constructor(
        private readonly queue:
            TaskQueue<Task>,

        private readonly orchestrator:
            Orchestrator,

        private readonly taskStore:
            TaskStore,
    ) { }

    start(): void {

        this.queue.start(
            async (task) => {

                try {

                    await this.orchestrator.run({
                        task,
                    });

                } catch (error) {

                    console.error(
                        "Task execution failed:",
                        error,
                    );

                } finally {

                    await this.taskStore.save(
                        task,
                    );

                }

            },
        );

    }

    enqueue(
        task: Task,
    ): void {

        this.queue.enqueue(
            task,
        );

    }

    stop(): void {

        this.queue.stop();

    }

}