import type {
    TaskEvent,
} from "../domain/index.js";

export type EventListener =
    (event: TaskEvent) => void | Promise<void>;

export interface EventBus {

    publish(
        event: TaskEvent,
    ): Promise<void>;

    subscribe(
        listener: EventListener,
    ): () => void;

}