"use client";

import { useState, useEffect, useCallback } from "react";
import { Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { desafioService, DesafioListadoResponse } from "@/services/desafio";
import { useSignalR, DesafioEventoPayload } from "@/hooks/useSignalR";

interface Props {
  idEquipo: number;
  showToast: (msg: string) => void;
}

function colorEstado(estado: string): string {
  if (estado === "Aceptado") return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
  if (estado === "Rechazado") return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
  return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
}

// "HH:mm:ss" -> "HH:mm"
function formatHora(hora: string): string {
  return hora?.slice(0, 5) ?? hora;
}

export default function MisDesafiosView({ idEquipo, showToast }: Props) {
  const [desafios, setDesafios] = useState<DesafioListadoResponse[]>([]);
  const [cargando, setCargando] = useState(true);
  const [procesandoId, setProcesandoId] = useState<number | null>(null);

  // Trae el listado enriquecido del back (con rol, rival, horario, cancha).
  const cargarDesafios = useCallback(() => {
    return desafioService.obtenerPorEquipo(idEquipo);
  }, [idEquipo]);

  // Carga inicial desde el back al montar y cada vez que cambia el equipo activo.
  useEffect(() => {
    let activo = true;
    setCargando(true);
    cargarDesafios()
      .then((lista) => {
        if (activo) setDesafios(lista);
      })
      .catch((err) => {
        console.error("Error al cargar desafíos:", err);
        if (activo) setDesafios([]);
      })
      .finally(() => {
        if (activo) setCargando(false);
      });
    return () => {
      activo = false;
    };
  }, [cargarDesafios]);

  // SignalR complementa la carga inicial. El back emite SIEMPRE el método
  // "DesafioActualizado" con un único payload y discrimina por su campo de estado.
  // - "Creado": no usamos obtenerPorId (devuelve un DTO viejo, sin rol/rival y con
  //   otra forma): refrescamos el listado para mantener el shape enriquecido.
  // - "Aceptado"/"Rechazado": patch in-place del estado por id.
  const onDesafioActualizado = useCallback(
    async (payload: DesafioEventoPayload) => {
      // Log único para confirmar contra el back el casing real del payload.
      console.debug("[SignalR] DesafioActualizado payload:", payload);

      const estado = payload.Estado ?? payload.estado;
      const desafioId =
        payload.id ?? payload.Id ?? payload.desafioId ?? payload.DesafioId;

      if (estado === "Creado") {
        try {
          const lista = await cargarDesafios();
          setDesafios(lista);
        } catch (err) {
          console.error("Error al refrescar desafíos:", err);
        }
      } else if (estado && desafioId != null) {
        setDesafios((prev) =>
          prev.map((d) => (d.id === desafioId ? { ...d, estado } : d))
        );
      }
    },
    [cargarDesafios]
  );

  const { conectado } = useSignalR({ idEquipo, onDesafioActualizado });

  // La segmentación la define el back vía "rol"; el front no la recalcula.
  const recibidos = desafios.filter((d) => d.rol === "Recibido");
  const enviados = desafios.filter((d) => d.rol === "Enviado");

  const manejarAceptar = async (id: number) => {
    setProcesandoId(id);
    try {
      await desafioService.aceptar(id);
      setDesafios((prev) =>
        prev.map((d) => (d.id === id ? { ...d, estado: "Aceptado" } : d))
      );
      showToast("Desafío aceptado.");
    } catch {
      showToast("Error al aceptar el desafío.");
    } finally {
      setProcesandoId(null);
    }
  };

  const manejarRechazar = async (id: number) => {
    setProcesandoId(id);
    try {
      await desafioService.rechazar(id);
      setDesafios((prev) =>
        prev.map((d) => (d.id === id ? { ...d, estado: "Rechazado" } : d))
      );
      showToast("Desafío rechazado.");
    } catch {
      showToast("Error al rechazar el desafío.");
    } finally {
      setProcesandoId(null);
    }
  };

  const renderDesafio = (desafio: DesafioListadoResponse) => (
    <Card key={desafio.id}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={desafio.rivalEscudoUrl} alt={desafio.rivalNombre} />
            <AvatarFallback>{desafio.rivalNombre?.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground truncate">{desafio.rivalNombre}</p>
            <p className="text-xs text-muted-foreground">Nivel {desafio.rivalNivel}</p>
          </div>
          <Badge className={colorEstado(desafio.estado)}>{desafio.estado}</Badge>
        </div>

        <div className="space-y-1 text-sm">
          <p>
            <span className="text-muted-foreground">Fecha: </span>
            {new Date(desafio.fechaPropuesta).toLocaleDateString("es-AR")}
          </p>
          <p>
            <span className="text-muted-foreground">Horario: </span>
            {formatHora(desafio.horaInicio)} - {formatHora(desafio.horaFin)}
          </p>
          {desafio.zona && (
            <p>
              <span className="text-muted-foreground">Zona: </span>
              {desafio.zona}
            </p>
          )}
          {desafio.cancha && (
            <p>
              <span className="text-muted-foreground">Cancha: </span>
              {desafio.cancha}
            </p>
          )}
        </div>

        {/* Solo el visitante (rol "Recibido") responde un desafío pendiente. */}
        {desafio.estado === "Pendiente" && desafio.rol === "Recibido" && (
          <div className="flex gap-2 pt-1">
            <Button
              size="sm"
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={procesandoId === desafio.id}
              onClick={() => manejarAceptar(desafio.id)}
            >
              {procesandoId === desafio.id ? (
                <Spinner className="w-4 h-4" />
              ) : (
                <>
                  <Check className="w-4 h-4 mr-1" />
                  Aceptar
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="flex-1"
              disabled={procesandoId === desafio.id}
              onClick={() => manejarRechazar(desafio.id)}
            >
              {procesandoId === desafio.id ? (
                <Spinner className="w-4 h-4" />
              ) : (
                <>
                  <X className="w-4 h-4 mr-1" />
                  Rechazar
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="flex flex-col h-full">
      <div className="sticky top-0 z-10 bg-card border-b border-border p-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">Mis Desafíos</h2>
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${conectado ? "bg-green-500" : "bg-gray-400"}`}
          />
          <span className="text-xs text-muted-foreground">
            {conectado ? "En vivo" : "Desconectado"}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {cargando ? (
          <div className="flex items-center justify-center py-16">
            <Spinner className="w-6 h-6" />
          </div>
        ) : desafios.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <p className="text-muted-foreground text-sm">No tenés desafíos todavía.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">
                Recibidos {recibidos.length > 0 && `(${recibidos.length})`}
              </h3>
              {recibidos.length === 0 ? (
                <p className="text-muted-foreground text-sm">No recibiste desafíos.</p>
              ) : (
                recibidos.map(renderDesafio)
              )}
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">
                Enviados {enviados.length > 0 && `(${enviados.length})`}
              </h3>
              {enviados.length === 0 ? (
                <p className="text-muted-foreground text-sm">No enviaste desafíos.</p>
              ) : (
                enviados.map(renderDesafio)
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
