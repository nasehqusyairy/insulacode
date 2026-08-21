import type {
    TaskEvent,
} from "../domain/index.js";

import type {
    EventBus,
    EventListener,
} from "./event-bus.js";

export class InMemoryEventBus
    implements EventBus {

    private readonly listeners =
        new Set<EventListener>();

    async publish(
        event: TaskEvent,
    ): Promise<void> {

        await Promise.all(
            Array.from(
                this.listeners,
            ).map(
                (listener) =>
                    listener(event),
            ),
        );

    }

    subscribe(
        listener: EventListener,
    ): () => void {

        this.listeners.add(
            listener,
        );

        return () => {

            this.listeners.delete(
                listener,
            );

        };

    }

}