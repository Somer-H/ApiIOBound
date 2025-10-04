import { Worker } from "worker_threads";
export class Service {
    private static service: Service;

    public static getService(): Service {
        if (!Service.service) {
            Service.service = new Service();
        }
        return Service.service;
    }

    async getApis() {
        let simpsonsApi = "https://thesimpsonsapi.com/api/characters";
        let rickAndMortyApi = "https://rickandmortyapi.com/api/chaacter";
        let ghibliApi = "https://ghibliapi.vercel.app/films";

        const simpsonsResponse = this.buildWorker(simpsonsApi);
        const rickAndMortyResponse = this.buildWorker(rickAndMortyApi);
        const ghibliResponse = this.buildWorker(ghibliApi);

        return [simpsonsResponse, rickAndMortyResponse, ghibliResponse];
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

