import type {
    Task,
    TaskEvent,
    TaskStage,
} from "../domain/index.js";

import type {
    EventBus,
} from "../events/index.js";

import type {
    StageHandler,
} from "./stage-handler.js";

export interface OrchestratorContext {

    task: Task;

}

export class Orchestrator {

    constructor(
        private readonly handlers:
            ReadonlyMap<TaskStage, StageHandler>,

        private readonly eventBus:
            EventBus,
    ) { }

    async run(
        context: OrchestratorContext,
    ): Promise<void> {

        const handler =
            this.handlers.get(
                context.task.currentStage,
            );

        if (!handler) {

            throw new Error(
                `Unsupported task stage: ${context.task.currentStage}`,
            );

        }

        const startedEvent =
            this.createEvent(
                context.task,
                "stage.started",
            );

        context.task.events.push(
            startedEvent,
        );

        await this.eventBus.publish(
            startedEvent,
        );

        try {

            const result =
                await handler.run(
                    context.task,
                );

            context.task.outputs.push(
                ...result.outputs,
            );

            const completedEvent =
                this.createEvent(
                    context.task,
                    "stage.completed",
                );

            context.task.events.push(
                completedEvent,
            );

            await this.eventBus.publish(
                completedEvent,
            );

        } catch (error) {

            const failedEvent =
                this.createEvent(
                    context.task,
                    "stage.failed",
                    {
                        error:
                            error instanceof Error
                                ? error.message
                                : String(error),
                    },
                );

            context.task.events.push(
                failedEvent,
            );

            await this.eventBus.publish(
                failedEvent,
            );

            throw error;

        }

    }

    private createEvent(
        task: Task,
        type: TaskEvent["type"],
        data?: Record<string, unknown>,
    ): TaskEvent {

        return {
            id: crypto.randomUUID(),
            taskId: task.id,
            type,
            timestamp:
                new Date().toISOString(),
            stage: task.currentStage,
            data,
        };

    }

}