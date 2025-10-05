// workerPool.ts
import { Worker } from "worker_threads";

export class WorkerPool {
  private workers: Worker[] = [];
  private taskQueue: Array<{ url: string; resolve: any; reject: any }> = [];
  private busyWorkers = new Map<Worker, { resolve: any; reject: any }>();

  constructor(private poolSize: number, private workerScript: string) {
    for (let i = 0; i < poolSize; i++) {
      this.createWorker();
    }
  }

  private createWorker() {
    const worker = new Worker(this.workerScript);
    this.workers.push(worker);

    worker.on("message", (result) => {
      const handlers = this.busyWorkers.get(worker);
      if (handlers) {
        this.busyWorkers.delete(worker);
        handlers.resolve(result);
        this.processNextTask();
      }
    });

    worker.on("error", (err) => {
      console.error("Worker error:", err);
      const handlers = this.busyWorkers.get(worker);
      if (handlers) {
        this.busyWorkers.delete(worker);
        handlers.reject(err);
        this.processNextTask();
      }
    });
  }

  execute(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.taskQueue.push({ url, resolve, reject });
      this.processNextTask();
    });
  }

  private processNextTask() {
    if (this.taskQueue.length === 0) return;

    const availableWorker = this.workers.find((w) => !this.busyWorkers.has(w));
    if (!availableWorker) return;

    const { url, resolve, reject } = this.taskQueue.shift()!;
    this.busyWorkers.set(availableWorker, { resolve, reject });
    availableWorker.postMessage(url);
  }

  destroy() {
    this.workers.forEach((w) => w.terminate());
    this.workers = [];
    this.busyWorkers.clear();
  }
}