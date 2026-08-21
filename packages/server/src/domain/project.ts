export type ProjectState = "ACTIVE" | "ARCHIVED";

export interface Project {
    id: string;
    rootPath: string;
    state: ProjectState;
}