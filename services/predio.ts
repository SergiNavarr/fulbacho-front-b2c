import clienteHttp from "./clienteHttp";

export interface CanchaResponse {
  id: number;
  nombre: string;
  precioPorHora: number;
  tipoCancha: string;
}

export interface PredioResponse {
  id: number;
  nombre: string;
  direccion: string;
  zona: string;
  idZona: number;
  imagenUrl?: string;
  canchas?: CanchaResponse[];
}

export interface FiltrosPredio {
  nombre?: string;
  zona?: string;
}

export const predioService = {
  obtenerTodos: async (): Promise<PredioResponse[]> => {
    const { data } = await clienteHttp.get<PredioResponse[]>("/Predios");
    return data;
  },
  filtrar: async (filtros: FiltrosPredio): Promise<PredioResponse[]> => {
    const { data } = await clienteHttp.get<PredioResponse[]>("/Predios", { params: filtros });
    return data;
  },
  obtenerPorId: async (id: number): Promise<PredioResponse> => {
    const { data } = await clienteHttp.get<PredioResponse>(`/Predios/${id}`);
    return data;
  },
};
