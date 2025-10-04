import { parentPort } from "worker_threads";

parentPort?.on("message", async (url: string) => {
  try {
    const res = await fetch(url);
    const data = await res.json();
    parentPort?.postMessage({ url, data, pid: process.pid });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Error desconocido";
    parentPort?.postMessage({ url, error: errorMessage, pid: process.pid });
  }
});
