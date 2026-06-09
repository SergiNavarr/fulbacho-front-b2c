import clienteHttp from "./clienteHttp";

// Alineado con CrearReservaDto del back. fechaHoraInicio/Fin son ISO strings.
export interface CrearReservaRequest {
  idCancha: number;
  fechaHoraInicio: string;
  fechaHoraFin: string;
  notas?: string;
}

export interface ReservaResponse {
  id: number;
}

export const reservaService = {
  crear: async (datos: CrearReservaRequest): Promise<{ id: number }> => {
    const { data } = await clienteHttp.post<{ id: number }>("/Reservas", datos);
    return data;
  },
};
