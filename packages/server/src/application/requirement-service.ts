import type {
    RequirementArtifactRevision,
} from "../domain/index.js";

import type {
    Agent,
} from "../agent/index.js";
import type { RequirementOutput } from "../agent/requirement-output.js";

export interface CreateRequirementInput {
    taskId: string;
    prompt: string;
}

export class RequirementService {

    constructor(
        private readonly agent: Agent<RequirementOutput>,
    ) { }

    async createRequirement(
        input: CreateRequirementInput,
    ): Promise<RequirementArtifactRevision> {

        const result =
            await this.agent.run({
                prompt: input.prompt,
            });

        const now =
            new Date().toISOString();

        return {
            id: crypto.randomUUID(),
            taskId: input.taskId,
            artifactType: "REQUIREMENT",
            revisionNumber: 1,
            isCurrent: true,
            createdAt: now,

            approvalState: "PENDING",

            objective: result.value.objective,
            requestedBehavior:
                result.value.requestedBehavior,
            scope: result.value.scope,
            constraints: result.value.constraints,
            ambiguities: result.value.ambiguities,
            assumptions: result.value.assumptions,
            acceptanceIntent:
                result.value.acceptanceIntent,
        };

    }

}