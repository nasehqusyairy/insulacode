import type {
    Task,
} from "../domain/index.js";

import {
    TaskQueue,
} from "../queue/index.js";

import {
    Orchestrator,
} from "./orchestrator.js";

export class TaskWorker {

    constructor(
        private readonly queue: TaskQueue<Task>,
        private readonly orchestrator: Orchestrator,
    ) { }

    start(): void {

        this.queue.start(
            async (task) => {
                await this.orchestrator.run({
                    task,
                });
            },
        );

    }

    enqueue(
        task: Task,
    ): void {

        this.queue.enqueue(task);

    }

    stop(): void {

        this.queue.stop();

    }

}