import type {
    Task,
} from "../../domain/index.js";

import type {
    RequirementService,
} from "../../application/requirement-service.js";

import type {
    StageHandler,
    StageResult,
} from "../stage-handler.js";

export class RequirementStageHandler
    implements StageHandler {

    constructor(
        private readonly requirementService:
            RequirementService,
    ) { }

    async run(
        task: Task,
    ): Promise<StageResult> {

        const requirement =
            await this.requirementService
                .createRequirement({
                    taskId: task.id,
                    prompt: task.userIntent,
                });

        return {
            outputs: [
                requirement,
            ],
        };

    }

}