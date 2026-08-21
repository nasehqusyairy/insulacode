import type {
    AgentContext,
    AgentResult,
} from "./types.js";

export interface Agent<T> {

    run(
        context: AgentContext,
    ): Promise<AgentResult<T>>;

}