# App Ciclismo · Resumen de actividad

Webapp (PWA) para ciclistas: graba rutas con GPS real, mide tu pulso conectando
tu reloj/pulsómetro por Bluetooth, calculá tu IMC y seguí tu plan de
entrenamiento personal — todo guardado en tu dispositivo o en un backend propio
(Express + SQLite).

## Funciones principales

- **Grabar ruta (GPS real)**: usa `navigator.geolocation` para registrar tu
  recorrido, distancia (fórmula de Haversine), velocidad y tiempo reales.
- **Pulso en vivo**: conectá tu reloj/pulsómetro BLE (servicio estándar
  "Heart Rate" 0x180D vía Web Bluetooth) y mirá tu zona de entrenamiento en
  vivo, con gráfico y promedios reales.
- **Perfil · IMC · plan**: tus datos personales (nombre, sexo, edad, altura,
  peso) son editables y persistentes; el IMC, el metabolismo basal
  (Mifflin-St Jeor) y la FC máxima (220 − edad) se calculan en tiempo real.
- **Historial**: guarda y revisá tus actividades — con backend propio
  (Express + SQLite) o como respaldo en `localStorage`.
- **Instalable como PWA**: funciona offline (caché del shell de la app) y se
  puede instalar en el celular como una app nativa.

## Desarrollo

```bash
npm install
npm run dev       # frontend (Vite)
npm run server    # backend opcional (Express + SQLite)
```

> Nota: Web Bluetooth (conexión con el reloj) y otras APIs modernas requieren
> un contexto seguro — HTTPS o `localhost`. Para usarlas desde el celular,
> publicá la app (por ejemplo en Vercel) o usá un túnel HTTPS en desarrollo.

## Stack

Vite + React 19 · Express + SQLite · Web Bluetooth · Geolocation API ·
vite-plugin-pwa
