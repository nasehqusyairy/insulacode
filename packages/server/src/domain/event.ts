export type AgentEventType =
    | "task.created"
    | "stage.started"
    | "stage.completed"
    | "stage.failed"
    | "agent.started"
    | "agent.completed"
    | "test.started"
    | "test.completed";

export interface TaskEvent {

    id: string;

    taskId: string;

    type: AgentEventType;

    timestamp: string;

    stage?: string;

    agent?: string;

    data?: Record<string, unknown>;

}