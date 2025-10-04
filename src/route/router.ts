// src/routes/router.ts
import { Controller }  from "../controller/controller";
import { Service } from "../service/serviceImpl";
export async function router(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const service = Service.getService();
  const controller = Controller.getController(service);
  if (url.pathname === "/apis" && req.method === "GET") {
    return controller.getApisController();
  }
  return new Response("🔵 Ruta no encontrada", { status: 404 });
}