/* profileStore.js — guarda los datos personales del usuario en este
   dispositivo (localStorage), para que el perfil, el IMC, el plan y el
   tablero de inicio usen siempre los mismos datos reales y editables,
   en lugar de valores de ejemplo fijos. */

const KEY = 'ciclismo.perfil.v1';

export const DEFAULT_PROFILE = {
  name: 'Tu nombre',
  email: '',
  sex: 'H',
  age: 34,
  cm: 178,
  kg: 80,
  goal: 'mantener',     // grasa | mantener | resistencia
  activity: 'moderado', // sedentario | moderado | activo
};

export function loadProfile() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_PROFILE };
    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_PROFILE };
  }
}

export function saveProfile(profile) {
  try { localStorage.setItem(KEY, JSON.stringify(profile)); } catch { /* noop */ }
}

export function initials(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
}
