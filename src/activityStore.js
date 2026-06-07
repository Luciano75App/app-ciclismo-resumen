/* activityStore.js — capa de persistencia de actividades.
   Habla con el backend real (server/index.js, Express + SQLite) en
   http://localhost:8787/api/activities. Si el servidor no responde
   (por ejemplo, no lo iniciaste con "npm run server"), usa localStorage
   como respaldo automático para que la app siga funcionando.

   Todas las funciones son async y devuelven la misma forma de datos
   sin importar cuál de los dos backends respondió. */

const API_BASE = 'http://localhost:8787/api';
const LOCAL_KEY = 'ciclismo.actividades.v1';

let backendOk = null; // null = no probado todavía, true/false = resultado del último intento

async function tryFetch(path, options) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok && res.status !== 404) throw new Error(`Backend respondió ${res.status}`);
  return res;
}

// ── Respaldo local (localStorage) ───────────────────────────
function readLocal() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}
function writeLocal(list) {
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify(list)); } catch { /* noop */ }
}

// ── API pública (async) ──────────────────────────────────────
export async function backendStatus() {
  try {
    await tryFetch('/health');
    backendOk = true;
  } catch {
    backendOk = false;
  }
  return backendOk;
}

export async function listActivities() {
  try {
    const res = await tryFetch('/activities');
    backendOk = true;
    return await res.json();
  } catch {
    backendOk = false;
    return readLocal().sort((a, b) => b.startedAt - a.startedAt);
  }
}

export async function saveActivity(activity) {
  try {
    const res = await tryFetch('/activities', { method: 'POST', body: JSON.stringify(activity) });
    backendOk = true;
    return await res.json();
  } catch {
    backendOk = false;
    const list = readLocal();
    const withId = { id: activity.id || `act_${Date.now()}`, createdAt: Date.now(), ...activity };
    list.push(withId);
    writeLocal(list);
    return withId;
  }
}

export async function deleteActivity(id) {
  try {
    await tryFetch(`/activities/${id}`, { method: 'DELETE' });
    backendOk = true;
  } catch {
    backendOk = false;
    writeLocal(readLocal().filter((a) => a.id !== id));
  }
}

export function isBackendKnownUp() {
  return backendOk;
}
