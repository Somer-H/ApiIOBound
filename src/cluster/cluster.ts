import  cluster from "cluster";
import os from "os";

const numCPUs = os.cpus().length;
let finalKilled = false; 
export function startCluster(path: string) {
  if (cluster.isPrimary) {
    console.log(`Primary ${process.pid} iniciado con ${numCPUs} núcleos`);

    for (let i = 0; i < numCPUs; i++) {
      cluster.fork({
        env: { PORT: `${3000 + i}` },
      });
    }

    cluster.on("fork", (worker) => {
      console.log(` Worker ${worker.id} forked ${worker.process.pid}`);
    });

    cluster.on("online", (worker) => {
      console.log(`Worker ${worker.id} está online`);
    });

    cluster.on("listening", (worker, address) => {
      console.log(`Worker ${worker.id} escuchando en ${address.address}:${address.port}`);
    });

    cluster.on("disconnect", (worker) => {
      console.log(`Worker ${worker.id} desconectado`);
    });

    cluster.on("exit", (worker, code, signal) => {
      console.log(`Worker ${worker.id} murió (code: ${code}, signal: ${signal})`);
      if (!finalKilled && !worker.exitedAfterDisconnect) {
        console.log(" Reiniciando worker...");
        cluster.fork();
      }
    });

    cluster.on("message", (worker, msg) => {
      console.log(`📨 Mensaje de Worker ${worker.id}:`, msg);
    });

    //nota: estos 2 se ejecutan al cerrar la aplicación, por lo que,
    //si los clusters no se matan al ejecutarse alguno de estos 2, 
    //entonce quedan sin liberar recursos, lo que puede traer problema
    process.on("SIGINT", killCluster);
    process.on("SIGTERM", killCluster);

    function killCluster() {
        finalKilled = true;
      for (const id in cluster.workers) {
        cluster.workers[id]?.process.kill();
      }
      console.log("Cluster detenido por señal");
    }
  } else {
    import(path);
  }
}