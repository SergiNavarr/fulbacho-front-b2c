import clienteHttp from "./clienteHttp";

// Alineado al DTO real del back (CrearDesafioDto). El idEquipoLocal NO viaja en el
// body: el back lo deriva del token. La fecha y las horas van por separado, y la
// hora se envía como TimeSpan "HH:mm:ss". La cancha sugerida ahora es obligatoria.
export interface CrearDesafioRequest {
  idEquipoVisitante: number;
  fechaPropuesta: string; // fecha "YYYY-MM-DD"
  horaInicio: string; // TimeSpan "HH:mm:ss"
  horaFin: string; // TimeSpan "HH:mm:ss"
  idZona: number;
  idCanchaSugerida: number;
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
