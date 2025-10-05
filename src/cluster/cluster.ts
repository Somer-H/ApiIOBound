// cluster.ts - SIMPLIFICADO
import cluster from "cluster";
import os from "os";

const numCPUs = os.cpus().length;
let finalKilled = false;

export function startCluster(path: string) {
  if (cluster.isPrimary) {
    console.log(`Primary ${process.pid} iniciado con ${numCPUs} núcleos`);

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
      idleTimeout: 30,
      fetch(req) {
        const targetPort = workerPorts[currentWorker];
        currentWorker = (currentWorker + 1) % workerPorts.length;

        const url = new URL(req.url);
        if (targetPort === undefined) {
          return new Response("Servicio no disponible", { status: 503 });
        }
        url.port = targetPort.toString();
        url.hostname = "127.0.0.1";

        return fetch(url.toString(), {
          method: req.method,
          headers: req.headers,
          body: req.body,
        }).catch(() => new Response("Servicio no disponible", { status: 503 }));
      },
    });

    console.log(`Load balancer en puerto 3000`);

    cluster.on("exit", (worker, code, signal) => {
      console.log(`Worker ${worker.id} murió`);
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
      console.log("\nDeteniendo cluster...");
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