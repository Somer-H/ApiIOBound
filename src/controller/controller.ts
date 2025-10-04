import { Service } from "../service/service";

export async function getApisController(): Promise<Response> {
  try {
    const results = await Service.getService().getApis();
    const resolved = await Promise.all(results);
    return Response.json({ success: true, data: resolved });
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Error desconocido";
    return Response.json({ success: false, error: errorMessage }, { status: 500 });
  }
}