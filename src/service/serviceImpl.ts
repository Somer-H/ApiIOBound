// Service.ts
import { WorkerPool } from "../workers/workerPool";
import { IService } from "./iservice";

export class Service implements IService {
    private static service: Service;
    private workerPool: WorkerPool;

    private constructor() {
        this.workerPool = new WorkerPool(10, "./src/workers/worker.ts");
    }

    public static getService(): Service {
        if (!Service.service) {
            Service.service = new Service();
        }
        return Service.service;
    }

    public async getApis() {
        let simpsonsApi = "https://thesimpsonsapi.com/api/characters";
        let ghibliApi = "https://ghibliapi.vercel.app/films";
        let catApi = "https://catfact.ninja/facts";
        let jsonApi = "https://jsonplaceholder.typicode.com/todos";
        let swApi = "https://www.swapi.tech/api/films";
        let fictionApi = "https://openlibrary.org/subjects/fiction.json"
        let dogsApi = "https://dog.ceo/api/breeds/list/all"
        let meteoApi = "https://api.open-meteo.com/v1/forecast?latitude=19.43&longitude=-99.13&hourly=temperature_2m"
        let openApi = "https://opentdb.com/api.php?amount=200"
        
        const simpsonsResponse = this.workerPool.execute(simpsonsApi);
        const ghibliResponse = this.workerPool.execute(ghibliApi);
        const catResponse = this.workerPool.execute(catApi);
        const jsonResponse = this.workerPool.execute(jsonApi);
        const swResponse = this.workerPool.execute(swApi);
        const fictionResponse = this.workerPool.execute(fictionApi);
        const dogsResponse = this.workerPool.execute(dogsApi);
        const meteoResponse = this.workerPool.execute(meteoApi);
        const openResponse = this.workerPool.execute(openApi);
        
        return [simpsonsResponse, ghibliResponse, catResponse, jsonResponse, swResponse, fictionResponse, dogsResponse, meteoResponse, openResponse];
    }
}
