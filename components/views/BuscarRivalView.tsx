"use client";

import { useState, useEffect } from "react";
import { Shield, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { desafioService, RivalResponse } from "@/services/desafio";

interface Props {
  idEquipoLocal: number;
  showToast: (msg: string) => void;
}

export default function BuscarRivalView({ idEquipoLocal, showToast }: Props) {
  const [rivales, setRivales] = useState<RivalResponse[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    desafioService
      .buscarRivales(idEquipoLocal)
      .then(setRivales)
      .catch(() => showToast("Error al cargar rivales."))
      .finally(() => setCargando(false));
  }, [idEquipoLocal]);

  // El desafío ahora requiere una cancha concreta (idCanchaSugerida), así que se
  // inicia desde el detalle de un predio. Acá solo exploramos rivales y derivamos.
  const guiarADesafio = () => {
    showToast("Para desafiar, elegí una cancha desde la pestaña Predios.");
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
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={guiarADesafio}
                    className="flex-shrink-0"
                  >
                    <MapPin className="w-4 h-4 mr-1.5" /> Desafiar
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
