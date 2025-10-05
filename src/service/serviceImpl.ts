import { Worker } from "worker_threads";
import { IService } from "./iservice";
export class Service implements IService {
    private static service: Service;

    public static getService(): Service {
        if (!Service.service) {
            Service.service = new Service();
        }
        return Service.service;
    }

    public async getApis() {
        let simpsonsApi = "https://thesimpsonsapi.com/api/characters";
        let rickAndMortyApi = "https://rickandmortyapi.com/api/chaacter";
        let ghibliApi = "https://ghibliapi.vercel.app/films";
        let catApi = "https://catfact.ninja/facts";
        let jsonApi = "https://jsonplaceholder.typicode.com/todos";
        let swApi = "https://www.swapi.tech/api/films";
        let fictionApi = "https://openlibrary.org/subjects/fiction.json"
        let dogsApi = "https://dog.ceo/api/breeds/list/all"
        let meteoApi = "https://api.open-meteo.com/v1/forecast?latitude=19.43&longitude=-99.13&hourly=temperature_2m"
        let openApi = "https://opentdb.com/api.php?amount=200"
        const simpsonsResponse = this.buildWorker(simpsonsApi);
        const rickAndMortyResponse = this.buildWorker(rickAndMortyApi);
        const ghibliResponse = this.buildWorker(ghibliApi);
        const catResponse = this.buildWorker(catApi);
        const jsonResponse = this.buildWorker(jsonApi);
        const swResponse = this.buildWorker(swApi);
        const fictionResponse = this.buildWorker(fictionApi);
        const dogsResponse = this.buildWorker(dogsApi);
        const meteoResponse = this.buildWorker(meteoApi);
        const openResponse = this.buildWorker(openApi);
        return [simpsonsResponse, rickAndMortyResponse, ghibliResponse, catResponse, jsonResponse, swResponse, fictionResponse, dogsResponse, meteoResponse, openResponse];
    }

    private buildWorker(url: string): Promise<any> {
        return new Promise((resolve, reject) => {
            const worker = new Worker("./src/workers/worker.ts");
            worker.postMessage(url);
            worker.on("message", (message) => {
                resolve(message);
            });
            worker.on("error", (error) => {
                reject(error);
            });
            worker.on("exit", (code) => {
                if (code !== 0) {
                    reject(new Error(`Worker stopped with exit code ${code}`));
                }
            });
        });
    }
}

