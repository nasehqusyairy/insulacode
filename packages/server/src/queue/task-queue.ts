import type {
    QueueWorker,
} from "./types.js";

export class TaskQueue<T> {

    private readonly items: T[] = [];

    private worker: QueueWorker<T> | null = null;

    private running = false;

    private processing = false;

    enqueue(
        item: T,
    ): void {

        this.items.push(item);

        void this.process();

    }

    start(
        worker: QueueWorker<T>,
    ): void {

        this.worker = worker;
        this.running = true;

        void this.process();

    }

    stop(): void {

        this.running = false;

    }

    get size(): number {

        return this.items.length;

    }

    private async process(): Promise<void> {

        if (this.processing) {
            return;
        }

        if (!this.running) {
            return;
        }

        if (!this.worker) {
            return;
        }

        this.processing = true;

        try {

            while (
                this.running &&
                this.items.length > 0
            ) {

                const item = this.items.shift();

                if (item === undefined) {
                    break;
                }

                await this.worker(item);

            }

        } finally {

            this.processing = false;

        }

    }

}