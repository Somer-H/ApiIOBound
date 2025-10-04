// src/routes/router.ts
import { getApisController } from "../controller/controller";
export async function router(req: Request): Promise<Response> {
  const url = new URL(req.url);

  if (url.pathname === "/apis" && req.method === "GET") {
    return getApisController();
  }
  
  return new Response("🔵 Ruta no encontrada", { status: 404 });
}