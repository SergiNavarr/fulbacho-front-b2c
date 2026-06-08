import clienteHttp from "./clienteHttp";

export interface CrearEquipoRequest {
  nombre: string;
  escudoUrl?: string;
  idNivel: number;
}

export interface EquipoResponse {
  id: number;
  nombre: string;
  nivel: string;
  escudoUrl: string;
}

export const equipoService = {
  crear: async (data: CrearEquipoRequest): Promise<boolean> => {
    try {
      await clienteHttp.post("/Equipos", data);
      return true;
    } catch (error) {
      console.error("Error en equipoService.crear:", error);
      throw error;
    }
  },

  actualizar: async (id: number, data: CrearEquipoRequest): Promise<boolean> => {
    try {
      await clienteHttp.put(`/Equipos/${id}`, data);
      return true;
    } catch (error) {
      console.error("Error en equipoService.actualizar:", error);
      throw error;
    }
  },

  obtenerMisEquipos: async (): Promise<EquipoResponse[]> => {
    try {
      const { data } = await clienteHttp.get<EquipoResponse[]>("/Equipos/mis-equipos");
      return data;
    } catch (error) {
      console.error("Error en equipoService.obtenerMisEquipos:", error);
      return [];
    }
  },
};
