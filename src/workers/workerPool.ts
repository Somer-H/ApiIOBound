// workerPool.ts
import { Worker } from "worker_threads";

export class WorkerPool {
  private workers: Worker[] = [];
  private taskQueue: Array<{ url: string; resolve: any; reject: any }> = [];
  private busyWorkers = new Set<Worker>();

  constructor(private poolSize: number, private workerScript: string) {
    for (let i = 0; i < poolSize; i++) {
      this.createWorker();
    }
  }

  private createWorker() {
    const worker = new Worker(this.workerScript);
    this.workers.push(worker);

    worker.on("message", (result) => {
      this.busyWorkers.delete(worker);
      this.processNextTask();
    });

    worker.on("error", (err) => {
      console.error("Worker error:", err);
      this.busyWorkers.delete(worker);
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
    this.busyWorkers.add(availableWorker);

    const messageHandler = (result: any) => {
      availableWorker.off("message", messageHandler);
      availableWorker.off("error", errorHandler);
      resolve(result);
    };

    const errorHandler = (error: Error) => {
      availableWorker.off("message", messageHandler);
      availableWorker.off("error", errorHandler);
      reject(error);
    };

    availableWorker.once("message", messageHandler);
    availableWorker.once("error", errorHandler);
    availableWorker.postMessage(url);
  }

  destroy() {
    this.workers.forEach((w) => w.terminate());
  }
}