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
