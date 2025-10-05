// cluster.ts
import cluster from "cluster";
import os from "os";

const numCPUs = os.cpus().length;
let finalKilled = false;

export function startCluster(path: string) {
  if (cluster.isPrimary) {
    console.log(`🚀 Primary ${process.pid} iniciado con ${numCPUs} núcleos`);

    const workerPorts: number[] = [];
    let currentWorker = 0;

  
    for (let i = 0; i < numCPUs; i++) {
      const port = 3001 + i;
      workerPorts.push(port);
      const worker = cluster.fork({ WORKER_PORT: port.toString() });
      console.log(`Worker ${worker.id} asignado al puerto ${port}`);
    }

    Bun.serve({
      port: 3000,
      development: false,
      async fetch(req) {
        const targetPort = workerPorts[currentWorker];
        currentWorker = (currentWorker + 1) % workerPorts.length;

        try {
          const url = new URL(req.url);
          if (!targetPort) throw new Error("No hay más workers disponibles");
          url.port = targetPort.toString();
          url.hostname = "127.0.0.1"; 
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 15000); 

          const response = await fetch(url.toString(), {
            method: req.method,
            headers: req.headers,
            body: req.body,
            signal: controller.signal,
          });

          clearTimeout(timeoutId);
          return response;

        } catch (error) {
          const nextPort = workerPorts[(currentWorker + 1) % workerPorts.length];
          try {
            const url = new URL(req.url);
            if (!nextPort) throw new Error("No hay más workers disponibles");
            url.port = nextPort.toString();
            url.hostname = "127.0.0.1";
            
            return await fetch(url.toString(), {
              method: req.method,
              headers: req.headers,
              body: req.body,
            });
          } catch {
            return new Response("Service Unavailable", { status: 503 });
          }
        }
      },
    });

    console.log(`🔀 Load balancer en puerto 3000`);

    cluster.on("exit", (worker, code, signal) => {
      console.log(`💀 Worker ${worker.id} murió`);
      if (!finalKilled && !worker.exitedAfterDisconnect) {
        const workerIndex = (worker.id || 1) - 1;
        const port = 3001 + workerIndex;
        setTimeout(() => {
          cluster.fork({ WORKER_PORT: port.toString() });
        }, 1000); 
      }
    });

    process.on("SIGINT", killCluster);
    process.on("SIGTERM", killCluster);

    function killCluster() {
      console.log("\n Deteniendo cluster...");
      finalKilled = true;
      for (const id in cluster.workers) {
        cluster.workers[id]?.kill();
      }
      setTimeout(() => process.exit(0), 1000);
    }

  } else {
    import(path);
  }
}