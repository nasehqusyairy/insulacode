import type {
    Task,
    TaskStage,
} from "../domain/index.js";

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

        await handler.run(
            context.task,
        );

    }

}