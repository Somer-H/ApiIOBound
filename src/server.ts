const port = Number(process.env.PORT) || 3000;

Bun.serve({
  port,
  fetch(req) {
    return new Response(`Hola desde el worker en puerto ${port}`);
  },
});