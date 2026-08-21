import {
    describe,
    expect,
    it,
} from "vitest";

import {
    TaskQueue,
} from "./task-queue.js";

describe("TaskQueue", () => {

    it("processes queued items sequentially", async () => {

        const queue =
            new TaskQueue<number>();

        const processed: number[] = [];

        let activeWorkers = 0;
        let maximumConcurrentWorkers = 0;

        queue.start(async (item) => {

            activeWorkers++;

            maximumConcurrentWorkers =
                Math.max(
                    maximumConcurrentWorkers,
                    activeWorkers,
                );

            await new Promise((resolve) =>
                setTimeout(resolve, 5),
            );

            processed.push(item);

            activeWorkers--;

        });

        queue.enqueue(1);
        queue.enqueue(2);
        queue.enqueue(3);

        await new Promise((resolve) =>
            setTimeout(resolve, 30),
        );

        expect(processed).toEqual([
            1,
            2,
            3,
        ]);

        expect(maximumConcurrentWorkers)
            .toBe(1);

    });

    it("reports queued item count", () => {

        const queue =
            new TaskQueue<number>();

        queue.enqueue(1);
        queue.enqueue(2);

        expect(queue.size).toBe(2);

    });

    it("does not process items before start", async () => {

        const queue =
            new TaskQueue<number>();

        const processed: number[] = [];

        queue.enqueue(1);

        await new Promise((resolve) =>
            setTimeout(resolve, 5),
        );

        expect(processed).toEqual([]);
        expect(queue.size).toBe(1);

    });

});