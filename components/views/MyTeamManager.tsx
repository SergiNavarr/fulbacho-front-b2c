import { useState, useEffect } from "react";
import { Shield, Check, Plus, Users, ArrowLeft, Pencil } from "lucide-react";
import { equipoService } from "@/services/equipo";

// 1. Interfaces
interface Equipo {
  id: number;
  nombre: string;
  nivel: string;
  escudoUrl: string;
}

interface FormularioProps {
  equipoInicial: Equipo | null; 
  onBack: () => void;
  showToast: (msg: string) => void;
  onEquipoGuardado: (equipo: Equipo, esEdicion: boolean) => void;
}

// 2. Componente Principal
export default function MyTeamManager({ showToast }: { showToast: (msg: string) => void }) {
  const [currentView, setCurrentView] = useState<"loading" | "list" | "form">("loading");
  const [misEquipos, setMisEquipos] = useState<Equipo[]>([]);
  
  const [equipoEditando, setEquipoEditando] = useState<Equipo | null>(null);

  useEffect(() => {
    const cargarEquipos = async () => {
      try {
        setCurrentView("loading");
        const datosReales = await equipoService.obtenerMisEquipos();
        setMisEquipos(datosReales);
      } catch (error) {
        showToast("Hubo un error al cargar tus equipos.");
      } finally {
        setCurrentView("list");
      }
    };
    
    cargarEquipos();
  }, []);

  // Función para abrir el formulario limpio
  const handleCrearNuevo = () => {
    setEquipoEditando(null);
    setCurrentView("form");
  };

  // Función para abrir el formulario con datos
  const handleEditar = (equipo: Equipo) => {
    setEquipoEditando(equipo);
    setCurrentView("form");
  };

  if (currentView === "loading") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 h-full">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
        <p className="text-muted-foreground">Cargando tus equipos...</p>
      </div>
    );
  }

  if (currentView === "form") {
    return (
      <FormularioCrearEquipo 
        equipoInicial={equipoEditando}
        onBack={() => setCurrentView("list")} 
        showToast={showToast}
        onEquipoGuardado={(equipoGuardado, esEdicion) => {
          if (esEdicion) {
            setMisEquipos(misEquipos.map(e => e.id === equipoGuardado.id ? equipoGuardado : e));
          } else {
            // Agregamos el nuevo a la lista
            setMisEquipos([...misEquipos, equipoGuardado]);
          }
          setCurrentView("list");
        }}
      />
    );
  }

  return (
    <div className="p-5 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-foreground">Mis Equipos</h2>
          <p className="text-sm text-muted-foreground">Gestiona tus plantillas</p>
        </div>
        {misEquipos.length > 0 && (
          <button 
            onClick={handleCrearNuevo}
            className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center hover:bg-primary/20 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        )}
      </div>

      {misEquipos.length === 0 ? (
        <div className="bg-secondary/50 rounded-3xl p-8 flex flex-col items-center text-center border border-border border-dashed mt-8">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">Aún no tienes equipos</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Crea tu primer equipo para empezar a buscar rivales y gestionar partidos.
          </p>
          <button 
            onClick={handleCrearNuevo}
            className="h-12 px-6 bg-primary text-primary-foreground rounded-xl font-medium flex items-center gap-2 hover:bg-primary/90 transition-all"
          >
            <Plus className="w-5 h-5" /> Crear mi primer equipo
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {misEquipos.map(equipo => (
            <div 
              key={equipo.id} 
              onClick={() => handleEditar(equipo)}
              className="flex items-center gap-4 p-4 bg-card border border-border rounded-2xl shadow-sm hover:border-primary/50 transition-all cursor-pointer group"
            >
              <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center overflow-hidden flex-shrink-0">
                {equipo.escudoUrl ? (
                  <img src={equipo.escudoUrl} alt={equipo.nombre} className="w-full h-full object-cover" />
                ) : (
                  <Shield className="w-6 h-6 text-muted-foreground/50" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">{equipo.nombre}</p>
                <p className="text-sm text-muted-foreground">{equipo.nivel}</p>
              </div>
              <Pencil className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


const ESCUDOS_PREDEFINIDOS = [
  { id: '1', url: 'https://placehold.co/100x100/1e3a5f/white?text=A' },
  { id: '2', url: 'https://placehold.co/100x100/b91c1c/white?text=B' },
  { id: '3', url: 'https://placehold.co/100x100/15803d/white?text=C' },
  { id: '4', url: 'https://placehold.co/100x100/ca8a04/white?text=D' },
  { id: '5', url: 'https://placehold.co/100x100/4338ca/white?text=E' },
  { id: '6', url: 'https://placehold.co/100x100/be185d/white?text=F' },
  { id: '7', url: 'https://placehold.co/100x100/0f766e/white?text=G' },
  { id: '8', url: 'https://placehold.co/100x100/4c1d95/white?text=H' },
];

// 3. Sub-componente: El Formulario Inteligente (Crear y Editar)
function FormularioCrearEquipo({ equipoInicial, onBack, showToast, onEquipoGuardado }: FormularioProps) {
  const isEditMode = !!equipoInicial; // Si existe equipoInicial, estamos en modo edición
  const [isSaving, setIsSaving] = useState(false);
  
  // Inicializamos el formulario con los datos del equipo si estamos editando
  const [teamData, setTeamData] = useState({ 
    name: equipoInicial?.nombre || "", 
    shieldUrl: equipoInicial?.escudoUrl || "", 
    level: equipoInicial?.nivel.toLowerCase() || "amateur" 
  });

  // Estado para manejar los mensajes de error visuales
  const [errores, setErrores] = useState({
    name: "",
    shieldUrl: ""
  });

  // Función de validación local (Frontend)
  const validarFormulario = () => {
    let nuevosErrores = { name: "", shieldUrl: "" };
    let isValid = true;

    // Validación del nombre
    if (!teamData.name.trim()) {
      nuevosErrores.name = "El nombre del equipo es obligatorio.";
      isValid = false;
    } else if (teamData.name.length > 100) {
      nuevosErrores.name = "El nombre no puede superar los 100 caracteres.";
      isValid = false;
    }

    // Validación del escudo
    if (!teamData.shieldUrl) {
      nuevosErrores.shieldUrl = "Debes seleccionar un escudo para tu equipo.";
      isValid = false;
    }

    setErrores(nuevosErrores);
    return isValid;
  };

  const handleSave = async () => {
    // Cortamos la ejecución inmediatamente si la validación falla
    if (!validarFormulario()) {
      showToast("Por favor, corrige los errores del formulario.");
      return; 
    }

    setIsSaving(true);
    try {
      let idNivelBackend = 1;
      if (teamData.level === "intermedio") idNivelBackend = 2;
      if (teamData.level === "competitivo") idNivelBackend = 3;

      const payload = {
        nombre: teamData.name.trim(), // Limpiamos espacios extra
        escudoUrl: teamData.shieldUrl,
        idNivel: idNivelBackend,
      };

      if (isEditMode) {
        await equipoService.actualizar(equipoInicial.id, payload);
        showToast("¡Equipo actualizado con éxito!");
        
        onEquipoGuardado({
          id: equipoInicial.id,
          nombre: payload.nombre,
          nivel: teamData.level.charAt(0).toUpperCase() + teamData.level.slice(1),
          escudoUrl: payload.escudoUrl
        }, true);

      } else {
        await equipoService.crear(payload);
        showToast("¡Equipo creado con éxito!");

        onEquipoGuardado({
          id: Math.floor(Math.random() * 1000), // ID temporal
          nombre: payload.nombre,
          nivel: teamData.level.charAt(0).toUpperCase() + teamData.level.slice(1),
          escudoUrl: payload.escudoUrl
        }, false);
      }
      
    } catch (error) {
      showToast("No se pudo conectar con el servidor o el nombre ya está en uso.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-5 space-y-6">
      <button onClick={onBack} className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-2">
        <ArrowLeft className="w-4 h-4" /> Volver a mis equipos
      </button>

      <div className="space-y-1">
        <h2 className="text-lg font-bold text-foreground">
          {isEditMode ? "Editar Equipo" : "Nuevo Equipo"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {isEditMode ? "Modificá la información de tu plantilla" : "Ingresá los datos para registrar un equipo"}
        </p>
      </div>

      {/* Vista Previa del Escudo */}
      <div className="flex items-center gap-4 p-4 bg-secondary/50 rounded-2xl">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 border-2 border-dashed border-primary/30 flex items-center justify-center overflow-hidden">
          {teamData.shieldUrl ? (
            <img
              src={teamData.shieldUrl}
              alt="Escudo del equipo"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <Shield className="w-8 h-8 text-primary/40" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground truncate">
            {teamData.name || "Nombre del equipo"}
          </p>
          <p className="text-sm text-muted-foreground capitalize">
            {teamData.level}
          </p>
        </div>
      </div>

      {/* Campos del Formulario */}
      <div className="space-y-4">
        
        {/* Campo: Nombre del Equipo */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Nombre del Equipo</label>
          <input
            type="text"
            value={teamData.name}
            onChange={(e) => {
              setTeamData((prev) => ({ ...prev, name: e.target.value }));
              // Limpia el error visual apenas el usuario empieza a escribir
              if (errores.name) setErrores((prev) => ({ ...prev, name: "" }));
            }}
            placeholder="Ej: Los Cracks FC"
            className={`w-full h-12 px-4 rounded-xl bg-input border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all ${
              errores.name 
                ? "border-red-500 focus:ring-red-500/50" 
                : "border-border focus:ring-ring"
            }`}
          />
          {errores.name && <p className="text-sm text-red-500 mt-1">{errores.name}</p>}
        </div>

        {/* Campo: Selector de Escudos */}
        <div className="space-y-3 pt-2">
          <label className="text-sm font-medium text-foreground">Selecciona un Escudo</label>
          <div className="grid grid-cols-4 gap-3">
            {ESCUDOS_PREDEFINIDOS.map((escudo) => (
              <button
                key={escudo.id}
                type="button"
                onClick={() => {
                  setTeamData({ ...teamData, shieldUrl: escudo.url });
                  // Limpia el error si el usuario selecciona una imagen
                  if (errores.shieldUrl) setErrores((prev) => ({ ...prev, shieldUrl: "" }));
                }}
                className={`aspect-square rounded-xl border-2 transition-all overflow-hidden p-1 ${
                  teamData.shieldUrl === escudo.url 
                    ? "border-primary bg-primary/10" 
                    : errores.shieldUrl 
                      ? "border-red-300 bg-red-50 hover:border-red-400"
                      : "border-border bg-secondary/30 hover:border-primary/50"
                }`}
              >
                <img src={escudo.url} alt={`Opción de escudo ${escudo.id}`} className="w-full h-full object-cover rounded-lg" />
              </button>
            ))}
          </div>
          {errores.shieldUrl && <p className="text-sm text-red-500 mt-1">{errores.shieldUrl}</p>}
        </div>

        {/* Campo: Nivel Competitivo */}
        <div className="space-y-2 pt-2">
          <label className="text-sm font-medium text-foreground">Nivel Competitivo</label>
          <select
            value={teamData.level}
            onChange={(e) => setTeamData((prev) => ({ ...prev, level: e.target.value }))}
            className="w-full h-12 px-4 rounded-xl bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all appearance-none cursor-pointer"
          >
            <option value="amateur">Amateur</option>
            <option value="intermedio">Intermedio</option>
            <option value="competitivo">Competitivo</option>
          </select>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={isSaving}
        className="w-full h-14 rounded-xl bg-primary text-primary-foreground font-semibold text-base transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
      >
        {isSaving ? (
          <>
            <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            <span>Guardando...</span>
          </>
        ) : (
          <>
            <Check className="w-5 h-5" />
            <span>{isEditMode ? "Actualizar Equipo" : "Guardar Equipo"}</span>
          </>
        )}
      </button>
    </div>
  );
}