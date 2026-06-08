# CONTEXTO DEL PROYECTO: FULBACHO (FRONTEND B2C)

## 1. Visión General
- **Nombre:** Fulbacho.
- **Propósito:** Plataforma integral de matchmaking y gestión de reservas para fútbol amateur.
- **Módulo Actual:** Cliente B2C (Orientado a Jugadores y Capitanes).

## 2. Reglas Académicas y de Estilo (¡CRÍTICO!)
- **Nomenclatura en Español:** Todo el código de negocio, funciones utilitarias, llamadas a la API y nombres de variables deben estar en español (ej. `iniciarSesion`, `obtenerEquipos`, `usuarioActual`). 
- **Enfoque Mobile-First:** Esta es una Single Page Application (SPA) pensada principalmente para teléfonos celulares. Todos los estilos de Tailwind CSS deben empezar con el diseño móvil y luego escalar con breakpoints (`md:`, `lg:`) solo si es estrictamente necesario.
- **Uso de Shadcn UI:** El proyecto ya cuenta con una biblioteca de componentes base en `/components/ui`. Reutiliza estos componentes (Button, Input, Form, Card, Dialog, etc.) en lugar de crear elementos HTML nativos desde cero.

## 3. Stack Tecnológico
- **Framework:** Next.js (utilizando **App Router**).
- **React:** Componentes funcionales y Hooks.
- **Estilos:** Tailwind CSS + Shadcn UI.
- **Peticiones HTTP:** Módulo de servicios propio (Axios/Fetch) centralizado.

## 4. Estructura Real del Repositorio
- `/app`: Configuración del App Router de Next.js (`layout.tsx`, `page.tsx`, etc.).
- `/components/ui`: Componentes puros de diseño y UI generados por Shadcn (NO modificar su lógica interna a menos que sea indispensable).
- `/components/views`: Componentes contenedores o vistas principales del negocio (ej. `MyChallengesView`, `MyTeamManager`, `SearchRivalView`).
- `/hooks`: Custom hooks de React (ej. `use-mobile`, `use-toast`).
- `/lib`: Funciones utilitarias (ej. `utils.ts` para la fusión de clases de Tailwind).
- `/services`: Encapsulación de las llamadas a la API del backend .NET (ej. `api.ts`, `equipo.ts`).

## 5. INSTRUCCIONES PARA CLAUDE:
1. **App Router:** Recuerda que los componentes en `/app` son Server Components por defecto. Si necesitas usar `useState`, `useEffect`, o hooks personalizados de Shadcn (como `useToast`), DEBES agregar la directiva `"use client"` en la primera línea del archivo.
2. **Creación de UI:** Antes de maquetar algo desde cero, revisa la carpeta `/components/ui` para ver si la pieza (Alert, Dialog, Select, etc.) ya existe.
3. **Servicios:** Cualquier interacción con el backend debe hacerse a través de funciones exportadas en la carpeta `/services/`, respetando los nombres en español.