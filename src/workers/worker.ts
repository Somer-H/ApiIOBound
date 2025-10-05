import { parentPort } from "worker_threads";

parentPort?.on("message", async (url: string) => {
  const pid = process.pid;
  
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    parentPort?.postMessage({ url, data, pid, success: true });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Error desconocido";
    parentPort?.postMessage({ url, error: errorMessage, pid, success: false, data: null });
  }
});