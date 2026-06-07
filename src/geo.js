/* geo.js — utilidades de geolocalización: distancia, proyección de ruta a SVG */

// Distancia entre dos puntos GPS (fórmula de Haversine), en metros.
export function haversine(a, b) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// Suma la distancia total (en metros) de una secuencia de puntos {lat,lng}.
export function totalDistance(points) {
  let d = 0;
  for (let i = 1; i < points.length; i++) d += haversine(points[i - 1], points[i]);
  return d;
}

// Proyecta una lista de puntos GPS {lat,lng} a un viewBox SVG (equirrectangular,
// suficiente para tramos cortos de ruta — no es cartografía real).
export function projectToViewBox(points, w = 393, h = 230, pad = 24) {
  if (!points.length) return '';
  const lats = points.map((p) => p.lat);
  const lngs = points.map((p) => p.lng);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
  const spanLat = Math.max(maxLat - minLat, 1e-6);
  const spanLng = Math.max(maxLng - minLng, 1e-6);
  // Corrige el aspecto por latitud (cos) para que la traza no se deforme.
  const cosLat = Math.cos((((minLat + maxLat) / 2) * Math.PI) / 180);
  const scaleX = (w - pad * 2) / (spanLng * cosLat || spanLng);
  const scaleY = (h - pad * 2) / spanLat;
  const scale = Math.min(scaleX, scaleY);
  const cx = w / 2, cy = h / 2;
  const midLat = (minLat + maxLat) / 2, midLng = (minLng + maxLng) / 2;
  return points.map((p) => {
    const x = cx + (p.lng - midLng) * cosLat * scale;
    const y = cy - (p.lat - midLat) * scale;
    return [x, y];
  });
}

export function pointsToPath(coords) {
  if (!coords.length) return '';
  return coords.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
}

export function fmtClock(ms) {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

export function fmtKm(meters) {
  return (meters / 1000).toFixed(2);
}

/* estimateCalories — cálculo aproximado del gasto energético de una salida
   en bici, a partir de datos reales (duración, velocidad media, desnivel
   positivo) y tu peso corporal.

   Es una ESTIMACIÓN (no una medición): usa el método de equivalentes
   metabólicos (MET) de la "Compendium of Physical Activities" — el estándar
   que también usan relojes y apps de fitness cuando no tienen sensores de
   potencia. A mayor velocidad media, mayor intensidad (MET) asignado.
   Sumamos además el trabajo extra de subir desnivel (energía potencial,
   con un factor de eficiencia muscular ~24%, típico en ciclismo). */
function metForSpeed(kmh) {
  if (kmh < 16) return 4.0;   // paseo suave
  if (kmh < 19) return 6.0;   // ritmo moderado
  if (kmh < 22) return 8.0;   // vigoroso
  if (kmh < 25) return 10.0;  // rápido
  if (kmh < 30) return 12.0;  // carrera / muy rápido
  return 15.8;                // competitivo
}

export function estimateCalories({ kg = 75, durationMs = 0, avgKmh = 0, elevGainM = 0 }) {
  const hours = durationMs / 3600000;
  if (hours <= 0) return 0;
  const met = metForSpeed(avgKmh);
  const base = met * kg * hours; // kcal por la fórmula MET estándar (MET × kg × h)
  // energía potencial para subir elevGainM metros con tu peso (E = m·g·h),
  // convertida a kcal y ajustada por ~24% de eficiencia muscular humana.
  const climbKcal = (kg * 9.81 * Math.max(0, elevGainM)) / 4184 / 0.24;
  return Math.round(base + climbKcal);
}
