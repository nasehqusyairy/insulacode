import {
    describe,
    expect,
    it,
    vi,
} from "vitest";

import type {
    TaskEvent,
} from "../domain/index.js";

import {
    InMemoryEventBus,
} from "./in-memory-event-bus.js";

describe("InMemoryEventBus", () => {

    function createEvent(): TaskEvent {

        return {
            id: "event-1",
            taskId: "task-1",
            type: "stage.started",
            timestamp:
                "2026-08-22T00:00:00.000Z",
            stage: "REQUIREMENT",
        };

    }

    it("publishes events to subscribers", async () => {

        const bus =
            new InMemoryEventBus();

        const listener =
            vi.fn();

        bus.subscribe(
            listener,
        );

        const event =
            createEvent();

        await bus.publish(
            event,
        );

        expect(listener)
            .toHaveBeenCalledOnce();

        expect(listener)
            .toHaveBeenCalledWith(
                event,
            );

    });

    it("supports multiple subscribers", async () => {

        const bus =
            new InMemoryEventBus();

        const first =
            vi.fn();

        const second =
            vi.fn();

        bus.subscribe(
            first,
        );

        bus.subscribe(
            second,
        );

        const event =
            createEvent();

        await bus.publish(
            event,
        );

        expect(first)
            .toHaveBeenCalledWith(
                event,
            );

        expect(second)
            .toHaveBeenCalledWith(
                event,
            );

    });

    it("stops delivering events after unsubscribe", async () => {

        const bus =
            new InMemoryEventBus();

        const listener =
            vi.fn();

        const unsubscribe =
            bus.subscribe(
                listener,
            );

        unsubscribe();

        await bus.publish(
            createEvent(),
        );

        expect(listener)
            .not.toHaveBeenCalled();

    });

    it("waits for asynchronous listeners", async () => {

        const bus =
            new InMemoryEventBus();

        let completed = false;

        bus.subscribe(
            async () => {

                await Promise.resolve();

                completed = true;

            },
        );

        await bus.publish(
            createEvent(),
        );

        expect(completed)
            .toBe(true);

    });

});