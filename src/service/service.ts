export class Service {
    private static instance: Service;

    public static getInstance(): Service {
        if (!Service.instance) {
            Service.instance = new Service();
        }
        return Service.instance;
    }

    async getApis(): Promise<any> {
        let simpsonsApi = "https://thesimpsonsapi.com/api/characters";
        let rickAndMortyApi = "https://rickandmortyapi.com/api/chaacter";
        let ghibliApi = "https://ghibliapi.vercel.app/films";
        let simpsonsResponse;
        let rickAndMortyResponse;
        let ghibliResponse; 
        fetch(simpsonsApi)
            .then(res => res.json())
            .then(data => {
                simpsonsResponse = data;
            })
            .catch(err => console.error('Error al obtener tareas:', err));
        fetch(rickAndMortyApi)
            .then(res => res.json())
            .then(data => {
                rickAndMortyResponse = data;
            })
            .catch(err => console.error('Error al obtener tareas:', err));
        fetch(ghibliApi)
            .then(res => res.json())
            .then(data => {
                ghibliResponse = data;
            })
            .catch(err => console.error('Error al obtener tareas:', err));
        return [simpsonsResponse, rickAndMortyResponse, ghibliResponse];
    }
}