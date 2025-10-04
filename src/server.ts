import { router } from "./route/router";

Bun.serve({
  port: 3000,
  fetch(req) {
    return router(req);
  },
});