"use client";

import { useState } from "react";
import { Search, Calendar, Shield, User, Check, Inbox, Send, X } from "lucide-react";
import MyTeamManager from "@/components/views/MyTeamManager"; // Importamos tu nuevo componente

type Tab = "team" | "search" | "challenges";
type ChallengeSubTab = "received" | "sent";

interface Toast {
  message: string;
  visible: boolean;
}

export default function FulbachoApp() {
  // Estados de navegación general
  const [activeTab, setActiveTab] = useState<Tab>("team");
  const [challengeSubTab, setChallengeSubTab] = useState<ChallengeSubTab>("received");
  const [toast, setToast] = useState<Toast>({ message: "", visible: false });

  // Search filters state
  const [searchFilters, setSearchFilters] = useState({
    zone: "corrientes",
    startTime: "18:00",
    endTime: "22:00",
  });

  // Función global para mostrar notificaciones (se la pasamos a los sub-componentes)
  const showToast = (message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => {
      setToast({ message: "", visible: false });
    }, 3000);
  };

  const mockRivals = [
    {
      id: 1,
      name: "Los Guerreros FC",
      level: "Intermedio",
      shield: "https://placehold.co/64x64/166534/white?text=LG",
    },
    {
      id: 2,
      name: "Deportivo Barrio Norte",
      level: "Amateur",
      shield: "https://placehold.co/64x64/0f766e/white?text=DB",
    },
    {
      id: 3,
      name: "Real Corrientes",
      level: "Competitivo",
      shield: "https://placehold.co/64x64/1e3a5f/white?text=RC",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Mobile Container */}
      <div className="w-full max-w-md h-[calc(100vh-2rem)] max-h-[850px] bg-card shadow-2xl rounded-3xl relative overflow-hidden flex flex-col border border-border">
        
        {/* Header */}
        <header className="flex-shrink-0 flex items-center justify-between px-5 py-4 bg-primary text-primary-foreground">
          <h1 className="text-xl font-bold tracking-tight">⚽ Fulbacho</h1>
          <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
        </header>

        {/* Content Area - Ahora usando el Enrutador/Gestor condicional */}
        <main className="flex-1 overflow-y-auto">
          {activeTab === "team" && (
            <MyTeamManager showToast={showToast} /> 
          )}
          
          {activeTab === "search" && (
            <SearchRivalView
              filters={searchFilters}
              setFilters={setSearchFilters}
              rivals={mockRivals}
            />
          )}
          
          {activeTab === "challenges" && (
            <MyChallengesView
              subTab={challengeSubTab}
              setSubTab={setChallengeSubTab}
            />
          )}
        </main>

        {/* Bottom Tab Navigation */}
        <nav className="flex-shrink-0 border-t border-border bg-card">
          <div className="flex items-center justify-around py-2">
            <TabButton
              icon={<Search className="w-5 h-5" />}
              label="Buscar Rival"
              isActive={activeTab === "search"}
              onClick={() => setActiveTab("search")}
            />
            <TabButton
              icon={<Calendar className="w-5 h-5" />}
              label="Mis Desafíos"
              isActive={activeTab === "challenges"}
              onClick={() => setActiveTab("challenges")}
            />
            <TabButton
              icon={<Shield className="w-5 h-5" />}
              label="Mis Equipos"
              isActive={activeTab === "team"}
              onClick={() => setActiveTab("team")}
            />
          </div>
        </nav>

        {/* Toast Notification */}
        {toast.visible && (
          <div className="absolute bottom-20 left-4 right-4 bg-primary text-primary-foreground px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-in slide-in-from-bottom-4 duration-300">
            <div className="w-6 h-6 rounded-full bg-primary-foreground/20 flex items-center justify-center flex-shrink-0">
              <Check className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium">{toast.message}</span>
            <button
              onClick={() => setToast({ message: "", visible: false })}
              className="ml-auto"
            >
              <X className="w-4 h-4 opacity-70" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// COMPONENTES RESTANTES 
// ==========================================

// Tab Button Component
function TabButton({
  icon,
  label,
  isActive,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 px-4 py-2 min-h-[56px] rounded-xl transition-all duration-200 ${
        isActive
          ? "text-primary bg-primary/10"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}

// VIEW 2: Search Rival
function SearchRivalView({
  filters,
  setFilters,
  rivals,
}: {
  filters: { zone: string; startTime: string; endTime: string };
  setFilters: React.Dispatch<
    React.SetStateAction<{ zone: string; startTime: string; endTime: string }>
  >;
  rivals: Array<{ id: number; name: string; level: string; shield: string }>;
}) {
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

// VIEW 3: My Challenges
function MyChallengesView({
  subTab,
  setSubTab,
}: {
  subTab: ChallengeSubTab;
  setSubTab: React.Dispatch<React.SetStateAction<ChallengeSubTab>>;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Sub-navigation */}
      <div className="sticky top-0 z-10 bg-card border-b border-border p-4">
        <h2 className="text-lg font-bold text-foreground mb-4">Mis Desafíos</h2>
        <div className="flex gap-2 p-1 bg-secondary rounded-xl">
          <button
            onClick={() => setSubTab("received")}
            className={`flex-1 h-11 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
              subTab === "received"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Inbox className="w-4 h-4" />
            Recibidos
          </button>
          <button
            onClick={() => setSubTab("sent")}
            className={`flex-1 h-11 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
              subTab === "sent"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Send className="w-4 h-4" />
            Enviados
          </button>
        </div>
      </div>

      {/* Empty State */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-24 h-24 rounded-3xl bg-secondary flex items-center justify-center mb-6">
          {subTab === "received" ? (
            <Inbox className="w-12 h-12 text-muted-foreground/40" />
          ) : (
            <Send className="w-12 h-12 text-muted-foreground/40" />
          )}
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {subTab === "received"
            ? "No tenés desafíos recibidos"
            : "No enviaste desafíos todavía"}
        </h3>
        <p className="text-sm text-muted-foreground max-w-[240px]">
          {subTab === "received"
            ? "Cuando otros equipos te desafíen, los verás acá"
            : "Buscá un rival y enviá tu primer desafío"}
        </p>
      </div>
    </div>
  );
}