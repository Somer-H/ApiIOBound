import { IService } from "../service/iservice";
export class Controller {
    private static controller: Controller;
    public static getController(service: IService): Controller {
        if (!Controller.controller) {
            Controller.controller = new Controller(service);
        }
        return Controller.controller;
    }

    constructor(private service: IService) {}
    public async getApisController(): Promise<Response> {
    try {
        const results = await this.service.getApis();
        const resolved = await Promise.all(results);
        return Response.json({ success: true, data: resolved });
    } catch (err) {
        const errorMessage =
            err instanceof Error ? err.message : "Error desconocido";
        console.error("Error en getApisController:", errorMessage);
        return Response.json({ success: false, error: errorMessage }, { status: 500 });
    }
}
}