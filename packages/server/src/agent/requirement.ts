import type {
    LLMProvider,
} from "../llm/index.js";

import type {
    Agent,
    AgentContext,
    AgentResult,
} from "./index.js";

import type {
    RequirementOutput,
} from "./requirement-output.js";

import {
    parseRequirementOutput,
} from "./requirement-output.js";

export class RequirementAgent
    implements Agent<RequirementOutput> {

    constructor(
        private readonly provider: LLMProvider,
    ) { }

    async run(
        context: AgentContext,
    ): Promise<AgentResult<RequirementOutput>> {

        const response =
            await this.provider.generate({
                prompt: context.prompt,
            });

        return {
            value: parseRequirementOutput(
                response.content,
            ),
        };

    }

}