import clienteHttp from "./clienteHttp";

export interface PredioResponse {
  id: number;
  nombre: string;
  direccion: string;
  zona: string;
  imagenUrl?: string;
  canchas?: Array<{ id: number; nombre: string; precioPorHora: number; tipoCancha: string }>;
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
};
