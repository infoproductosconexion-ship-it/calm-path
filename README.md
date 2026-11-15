# Calm Path

## Descripción

Crea una aplicación móvil de bienestar mental y sueño llamada CALM PATH. Está dirigida a adultos con rutinas exigentes que sienten ansiedad, estrés, sobrepensamiento o dificultad para dormir, pero no saben qué práctica elegir ni tienen tiempo para buscar entre cientos de contenidos. La app debe ayudarles a responder una pregunta concreta: “¿Qué puedo hacer ahora para sentirme más tranquilo?”.

## Stack

React 19 · TypeScript · Vite · Tailwind CSS · PWA

## Estructura

- `/src/App.tsx` — punto de entrada
- `/src/components/AppShell.tsx` — Provides the mobile-first CALM PATH shell, calm header, progress context, and clear navigation between public wellness screens.
- `/src/components/HomeScreen.tsx` — Introduces CALM PATH and gives users a direct starting point for answering what they can do now to feel calmer.
- `/src/components/CheckInScreen.tsx` — Collects a brief non-clinical check-in about the user's current emotional state, energy, and sleep-related need.
- `/src/components/RecommendationScreen.tsx` — Shows one personalized short practice with its category, duration, reason for the recommendation, and a prominent start button.
- `/src/components/GuidedSessionScreen.tsx` — Runs the selected breathing, meditation, or relaxation practice with a clear timer, gentle visual pacing, pause and finish controls; the Steady Breath 3-minute pilot adds a guided video background (visual + narration).
- `/src/components/WellnessDisclaimer.tsx` — Displays the visible safety notice that CALM PATH provides general wellness practices and does not replace medical care or psychotherapy.
- `/src/components/PwaInstallPrompt.tsx` — Offers an unobtrusive install prompt and offline-friendly notice for using CALM PATH like a mobile app.
- `/src/lib/supabase.ts` — Cliente público de Supabase usando las variables inyectadas por Cosmos.
- `/src/lib/auth.tsx` — Contexto de sesión de Supabase Auth.
- `/src/components/AuthScreen.tsx` — Registro e inicio de sesión.
- `/src/components/ProfileScreen.tsx` — Perfil privado, progreso, favoritos e historial.
- `/src/components/SubscriptionScreen.tsx` — Comparación de planes premium, confirmación previa, restauración y portal de gestión de suscripción.

## Sesión piloto multimedia (Steady Breath · 3 min)

La sesión piloto de **Steady Breath** de 3 minutos espera un único archivo de video en `/public/video/steady-breath-3min.mp4`, que contiene la imagen ambiental (con un zoom lento) y la narración ya mezclada en su propia pista de audio. La pantalla de práctica usa ese video como fondo, sin iniciarlo automáticamente: se reproduce al pulsar «Start session» y se pausa o reanuda con el control de la sesión.

Si el archivo no está disponible, la pantalla muestra la imagen de respaldo estática y un aviso de que el video guiado no se pudo cargar; la práctica continúa solo con las instrucciones en pantalla y sin audio.

## Instalación

```bash
npm install
npm run dev    # desarrollo (Vite)
npm run build  # build de producción → dist/
```

## Supabase

La app usa el proyecto de Supabase seleccionado en «Conectores». Cosmos inyecta automáticamente `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`; no es necesario crear archivos `.env` ni copiar claves manualmente. Las pantallas personales dependen de las migraciones ya creadas y de sus políticas RLS.

## Suscripciones premium

La pantalla `/subscription` está preparada para un proveedor de pagos externo mediante las funciones Edge `create-checkout-session`, `restore-subscription` y `create-customer-portal-session`. No simula pagos ni contiene precios o credenciales inventadas. El proveedor debe devolver una URL de checkout segura y sincronizar el estado de `subscriptions` mediante webhook verificado.

Antes de habilitar cobros reales, configura el proveedor elegido y sus precios mensuales/anuales, crea las funciones Edge con secretos del lado servidor, aplica la tabla `subscriptions` con RLS y configura un webhook que actualice únicamente la suscripción del usuario correspondiente. La pantalla muestra precios configurados en checkout hasta que el proveedor esté conectado.

## Deploy en Vercel

1. Importa el repositorio en [vercel.com](https://vercel.com) (framework: Vite).
2. Build command `npm run build`, output `dist/`.
3. Carga las variables `VITE_*` de `.env.example` en Settings → Environment Variables.
4. En Supabase → Auth → URL Configuration agrega el dominio de Vercel a los redirects si tu app usa login.

## Integración continua

El workflow `.github/workflows/cosmos-build.yml` valida el build en cada push y, si falta `package-lock.json`, lo genera y propone un PR con el lockfile.

## Navegación

SPA con React Router y fallback de navegación para publicación.

---

_Generado con Cosmos Code_
