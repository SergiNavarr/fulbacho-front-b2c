import clienteHttp from "./clienteHttp";

// Alineado al DTO real del back (CrearDesafioDto). El idEquipoLocal ahora SÍ viaja
// en el body: se toma del equipo activo del selector. La fecha y las horas van por
// separado, y la hora se envía como TimeSpan "HH:mm:ss". La cancha sugerida ahora
// es obligatoria.
export interface CrearDesafioRequest {
  idEquipoLocal: number;
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

// DTO enriquecido que devuelve el LISTADO GET /Desafios?idEquipo=.
// A diferencia de DesafioResponse, el back ya calcula el "rol" (Enviado/Recibido)
// y adjunta los datos del rival, horario y cancha.
export interface DesafioListadoResponse {
  id: number;
  idEquipoLocal: number;
  idEquipoVisitante: number;
  rol: "Enviado" | "Recibido";
  rivalNombre: string;
  rivalEscudoUrl: string;
  rivalNivel: string;
  estado: string;
  fechaPropuesta: string; // UTC con Z
  horaInicio: string; // "HH:mm:ss"
  horaFin: string; // "HH:mm:ss"
  zona?: string;
  cancha?: string;
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

  // GET /Desafios?idEquipo= -> lista de desafíos del equipo (recibidos y enviados).
  // Devuelve el DTO enriquecido (rol, rival, horario, cancha) ya resuelto por el back.
  obtenerPorEquipo: async (idEquipo: number): Promise<DesafioListadoResponse[]> => {
    const { data } = await clienteHttp.get<DesafioListadoResponse[]>("/Desafios", {
      params: { idEquipo },
    });
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
