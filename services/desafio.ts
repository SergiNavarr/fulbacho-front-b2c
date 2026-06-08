import clienteHttp from "./clienteHttp";

export interface CrearDesafioRequest {
  idEquipoLocal: number;
  idEquipoVisitante: number;
  idZona: number;
  fechaHoraPropuesta: string;
}

export interface RivalResponse {
  id: number;
  nombre: string;
  escudoUrl: string;
  nivel: string;
}

export interface DesafioResponse {
  id: number;
  idEquipoLocal: number;
  idEquipoVisitante: number;
  estado: string;
  fechaHoraPropuesta: string;
  zona?: string;
}

export const desafioService = {
  crear: async (datos: CrearDesafioRequest): Promise<{ id: number }> => {
    const { data } = await clienteHttp.post<{ id: number }>("/Desafios", datos);
    return data;
  },

  obtenerPorId: async (id: number): Promise<DesafioResponse> => {
    const { data } = await clienteHttp.get<DesafioResponse>(`/Desafios/${id}`);
    return data;
  },

  aceptar: async (id: number): Promise<void> => {
    await clienteHttp.put(`/Desafios/${id}/aceptar`);
  },

  rechazar: async (id: number): Promise<void> => {
    await clienteHttp.put(`/Desafios/${id}/rechazar`);
  },

  buscarRivales: async (idEquipo: number): Promise<RivalResponse[]> => {
    const { data } = await clienteHttp.get<RivalResponse[]>("/Desafios/rivales", {
      params: { idEquipo },
    });
    return data;
  },
};
