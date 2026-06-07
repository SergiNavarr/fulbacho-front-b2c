import React from "react";

// 1. Interfaces para mantener el tipado fuerte y ordenado
export interface SearchFilters {
  zone: string;
  startTime: string;
  endTime: string;
}

export interface Rival {
  id: number;
  name: string;
  level: string;
  shield: string;
}

interface SearchRivalViewProps {
  filters: SearchFilters;
  setFilters: React.Dispatch<React.SetStateAction<SearchFilters>>;
  rivals: Rival[];
}

export default function SearchRivalView({
  filters,
  setFilters,
  rivals,
}: SearchRivalViewProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Sticky Filters */}
      <div className="sticky top-0 z-10 bg-card border-b border-border p-4 space-y-4">
        <h2 className="text-lg font-bold text-foreground">Buscar Rival</h2>

        {/* Zone Filter - Prominent */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary" />
            Zona *
          </label>
          <select
            value={filters.zone}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, zone: e.target.value }))
            }
            className="w-full h-12 px-4 rounded-xl bg-primary/5 border-2 border-primary/30 text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-ring transition-all appearance-none cursor-pointer"
          >
            <option value="corrientes">Corrientes Capital</option>
            <option value="resistencia">Resistencia</option>
            <option value="barranqueras">Barranqueras</option>
          </select>
        </div>

        {/* Time Filters */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Hora Inicio
            </label>
            <input
              type="time"
              value={filters.startTime}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, startTime: e.target.value }))
              }
              className="w-full h-11 px-3 rounded-xl bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Hora Fin
            </label>
            <input
              type="time"
              value={filters.endTime}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, endTime: e.target.value }))
              }
              className="w-full h-11 px-3 rounded-xl bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
            />
          </div>
        </div>
      </div>

      {/* Rival Cards */}
      <div className="flex-1 p-4 space-y-3">
        <p className="text-sm text-muted-foreground">
          {rivals.length} equipos encontrados
        </p>

        {rivals.map((rival) => (
          <div
            key={rival.id}
            className="flex items-center gap-4 p-4 bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow"
          >
            <img
              src={rival.shield}
              alt={`Escudo de ${rival.name}`}
              className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground truncate">
                {rival.name}
              </p>
              <p className="text-sm text-muted-foreground">{rival.level}</p>
            </div>
            <button className="h-11 px-5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm transition-all hover:bg-primary/90 active:scale-[0.97] flex-shrink-0">
              Desafiar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}