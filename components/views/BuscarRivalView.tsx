"use client";

import { useState, useEffect } from "react";
import { Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { desafioService, RivalResponse } from "@/services/desafio";

interface Props {
  idEquipoLocal: number;
  showToast: (msg: string) => void;
}

export default function BuscarRivalView({ idEquipoLocal, showToast }: Props) {
  const [rivales, setRivales] = useState<RivalResponse[]>([]);
  const [cargando, setCargando] = useState(true);
  const [rivalSeleccionado, setRivalSeleccionado] = useState<RivalResponse | null>(null);
  const [dialogAbierto, setDialogAbierto] = useState(false);
  const [fechaHora, setFechaHora] = useState("");
  const [idZona, setIdZona] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    desafioService
      .buscarRivales(idEquipoLocal)
      .then(setRivales)
      .catch(() => showToast("Error al cargar rivales."))
      .finally(() => setCargando(false));
  }, [idEquipoLocal]);

  const abrirDialog = (rival: RivalResponse) => {
    setRivalSeleccionado(rival);
    setFechaHora("");
    setIdZona("");
    setDialogAbierto(true);
  };

  const enviarDesafio = async () => {
    if (!rivalSeleccionado || !fechaHora || !idZona) return;
    setEnviando(true);
    try {
      await desafioService.crear({
        idEquipoLocal,
        idEquipoVisitante: rivalSeleccionado.id,
        idZona: parseInt(idZona, 10),
        fechaHoraPropuesta: new Date(fechaHora).toISOString(),
      });
      setDialogAbierto(false);
      showToast("¡Desafío enviado con éxito!");
    } catch {
      showToast("Error al enviar el desafío. Intentá de nuevo.");
    } finally {
      setEnviando(false);
    }
  };

  if (cargando) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Spinner className="w-8 h-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="sticky top-0 z-10 bg-card border-b border-border p-4">
        <h2 className="text-lg font-bold text-foreground">Buscar Rival</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {rivales.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
            <Shield className="w-16 h-16 text-muted-foreground/30" />
            <p className="text-muted-foreground text-sm">
              No hay equipos disponibles con tu nivel competitivo en este momento.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {rivales.map((rival) => (
              <Card key={rival.id} className="overflow-hidden">
                <CardContent className="p-4 flex items-center gap-4">
                  {rival.escudoUrl ? (
                    <img
                      src={rival.escudoUrl}
                      alt={`Escudo de ${rival.nombre}`}
                      className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                      <Shield className="w-7 h-7 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{rival.nombre}</p>
                    <Badge variant="secondary" className="mt-1 text-xs">
                      {rival.nivel}
                    </Badge>
                  </div>
                  <Button size="sm" onClick={() => abrirDialog(rival)} className="flex-shrink-0">
                    Desafiar
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogAbierto} onOpenChange={setDialogAbierto}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Desafiar a {rivalSeleccionado?.nombre}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Fecha y hora propuesta</label>
              <Input
                type="datetime-local"
                value={fechaHora}
                onChange={(e) => setFechaHora(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">ID de zona</label>
              <Input
                type="number"
                placeholder="Ej: 1"
                value={idZona}
                onChange={(e) => setIdZona(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              className="w-full"
              disabled={enviando || !fechaHora || !idZona}
              onClick={enviarDesafio}
            >
              {enviando && <Spinner className="w-4 h-4 mr-2" />}
              Enviar Desafío
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
