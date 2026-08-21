export type QueueWorker<T> = (
    item: T,
) => Promise<void>;