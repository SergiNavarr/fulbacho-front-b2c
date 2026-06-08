"use client";

import { useState, useEffect } from "react";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { predioService, PredioResponse } from "@/services/predio";

interface Props {
  showToast: (msg: string) => void;
}

const TODAS_LAS_ZONAS = "_all";

export default function ExploracionPrediosView({ showToast }: Props) {
  const [predios, setPredios] = useState<PredioResponse[]>([]);
  const [cargando, setCargando] = useState(true);
  const [nombre, setNombre] = useState("");
  const [zona, setZona] = useState(TODAS_LAS_ZONAS);
  const [zonasDisponibles, setZonasDisponibles] = useState<string[]>([]);

  useEffect(() => {
    predioService
      .obtenerTodos()
      .then((data) => {
        setPredios(data);
        const zonas = [...new Set(data.map((p) => p.zona))];
        setZonasDisponibles(zonas);
      })
      .catch(() => showToast("Error al cargar predios."))
      .finally(() => setCargando(false));
  }, []);

  const buscar = () => {
    setCargando(true);
    predioService
      .filtrar({
        nombre: nombre.trim() || undefined,
        zona: zona === TODAS_LAS_ZONAS ? undefined : zona,
      })
      .then(setPredios)
      .catch(() => showToast("Error al filtrar predios."))
      .finally(() => setCargando(false));
  };

  return (
    <div className="flex flex-col h-full">
      <div className="sticky top-0 z-10 bg-card border-b border-border p-4 space-y-3">
        <h2 className="text-lg font-bold text-foreground">Explorar Predios</h2>
        <Input
          placeholder="Buscar por nombre..."
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <div className="flex gap-2">
          <Select value={zona} onValueChange={setZona}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Todas las zonas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TODAS_LAS_ZONAS}>Todas las zonas</SelectItem>
              {zonasDisponibles.map((z) => (
                <SelectItem key={z} value={z}>
                  {z}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={buscar} disabled={cargando}>
            Buscar
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {cargando ? (
          <div className="flex items-center justify-center py-16">
            <Spinner className="w-8 h-8 text-primary" />
          </div>
        ) : predios.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <MapPin className="w-16 h-16 text-muted-foreground/30" />
            <p className="text-muted-foreground text-sm">
              No se encontraron predios con esos filtros.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {predios.map((predio) => (
              <Card key={predio.id} className="overflow-hidden">
                {predio.imagenUrl ? (
                  <img
                    src={predio.imagenUrl}
                    alt={predio.nombre}
                    className="w-full h-36 object-cover"
                  />
                ) : (
                  <div className="w-full h-36 bg-green-50 dark:bg-green-950 flex items-center justify-center">
                    <MapPin className="w-12 h-12 text-green-500" />
                  </div>
                )}
                <CardContent className="p-4">
                  <h3 className="font-semibold text-foreground">{predio.nombre}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{predio.zona}</p>
                  <p className="text-sm text-muted-foreground">{predio.direccion}</p>
                  {predio.canchas && predio.canchas.length > 0 && (
                    <p className="text-sm font-medium text-primary mt-2">
                      {predio.canchas.length}{" "}
                      {predio.canchas.length === 1 ? "cancha" : "canchas"}
                    </p>
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
