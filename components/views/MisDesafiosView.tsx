"use client";

import { useState, useCallback } from "react";
import { Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { desafioService, DesafioResponse } from "@/services/desafio";
import { useSignalR } from "@/hooks/useSignalR";

interface Props {
  idEquipo: number;
  showToast: (msg: string) => void;
}

function colorEstado(estado: string): string {
  if (estado === "Aceptado") return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
  if (estado === "Rechazado") return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
  return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
}

export default function MisDesafiosView({ idEquipo, showToast }: Props) {
  const [desafios, setDesafios] = useState<DesafioResponse[]>([]);
  const [procesandoId, setProcesandoId] = useState<number | null>(null);

  const onDesafioActualizado = useCallback(async (desafioId: number, evento: string) => {
    if (evento === "Creado") {
      try {
        const desafio = await desafioService.obtenerPorId(desafioId);
        setDesafios((prev) => {
          if (prev.some((d) => d.id === desafioId)) return prev;
          return [desafio, ...prev];
        });
      } catch (err) {
        console.error("Error al obtener desafío:", err);
      }
    } else {
      setDesafios((prev) =>
        prev.map((d) => (d.id === desafioId ? { ...d, estado: evento } : d))
      );
    }
  }, []);

  const { conectado } = useSignalR({ idEquipo, onDesafioActualizado });

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
        {desafios.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <p className="text-muted-foreground text-sm">
              Aquí verás los desafíos recibidos en tiempo real.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {desafios.map((desafio) => (
              <Card key={desafio.id}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Desafío #{desafio.id}</span>
                    <Badge className={colorEstado(desafio.estado)}>{desafio.estado}</Badge>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="text-muted-foreground">Local: </span>
                      Equipo #{desafio.idEquipoLocal}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Visitante: </span>
                      Equipo #{desafio.idEquipoVisitante}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Fecha: </span>
                      {new Date(desafio.fechaHoraPropuesta).toLocaleString("es-AR")}
                    </p>
                    {desafio.zona && (
                      <p>
                        <span className="text-muted-foreground">Zona: </span>
                        {desafio.zona}
                      </p>
                    )}
                  </div>
                  {desafio.estado === "Pendiente" && (
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
