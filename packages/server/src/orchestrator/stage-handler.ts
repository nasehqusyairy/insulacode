import type {
    ArtifactRevision,
    Task,
} from "../domain/index.js";

export interface StageResult {

    outputs: ArtifactRevision[];

}

export interface StageHandler {

    run(
        task: Task,
    ): Promise<StageResult>;

}