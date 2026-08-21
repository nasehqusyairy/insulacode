import type {
    Task,
} from "../domain/index.js";

export interface StageHandler {

    run(
        task: Task,
    ): Promise<void>;

}
