import { router } from "./route/router";

const PORT = parseInt(process.env.WORKER_PORT || "3000");

Bun.serve({
  port: PORT,
  idleTimeout: 30,
  fetch(req) {
    console.log(`Worker ${process.pid} manejando petición en puerto ${PORT}`);
    return router(req);
  },
});

console.log(`Worker ${process.pid} escuchando en puerto ${PORT}`);