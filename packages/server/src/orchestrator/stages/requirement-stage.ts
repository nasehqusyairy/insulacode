import type {
    Task,
} from "../../domain/index.js";

import type {
    RequirementService,
} from "../../application/requirement-service.js";

import type {
    StageHandler,
} from "../stage-handler.js";

export class RequirementStageHandler
    implements StageHandler {

    constructor(
        private readonly requirementService:
            RequirementService,
    ) { }

    async run(
        task: Task,
    ): Promise<void> {

        await this.requirementService
            .createRequirement({
                taskId: task.id,
                prompt: task.userIntent,
            });

    }

}