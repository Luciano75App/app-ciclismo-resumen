/* server/index.js — backend real para App Ciclismo
   Express + SQLite (better-sqlite3). Persiste actividades grabadas con GPS
   (y opcionalmente pulso BLE) en un archivo de base de datos en disco,
   compartido entre dispositivos que apunten a este servidor.

   Ejecutar:  node server/index.js   (o "npm run server")
   Por defecto escucha en http://localhost:8787
*/
import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 8787;

const db = new Database(path.join(__dirname, 'ciclismo.sqlite'));
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS activities (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    started_at  INTEGER NOT NULL,
    duration_ms INTEGER NOT NULL,
    distance_m  REAL NOT NULL,
    avg_speed_kmh REAL,
    source      TEXT,
    points_json TEXT,
    heart_rate_json TEXT,
    created_at  INTEGER NOT NULL
  );
`);

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' })); // las rutas con muchos puntos GPS pueden pesar

const toRow = (a) => ({
  id: a.id || `act_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  name: a.name || 'Actividad sin nombre',
  started_at: a.startedAt ?? Date.now(),
  duration_ms: a.durationMs ?? 0,
  distance_m: a.distanceM ?? 0,
  avg_speed_kmh: a.avgSpeedKmh ?? null,
  source: a.source || 'gps-real',
  points_json: JSON.stringify(a.points || []),
  heart_rate_json: a.heartRate ? JSON.stringify(a.heartRate) : null,
  created_at: Date.now(),
});

const fromRow = (r) => ({
  id: r.id,
  name: r.name,
  startedAt: r.started_at,
  durationMs: r.duration_ms,
  distanceM: r.distance_m,
  avgSpeedKmh: r.avg_speed_kmh,
  source: r.source,
  points: JSON.parse(r.points_json || '[]'),
  heartRate: r.heart_rate_json ? JSON.parse(r.heart_rate_json) : null,
  createdAt: r.created_at,
});

// ── Rutas de la API ──────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'app-ciclismo-backend' }));

app.get('/api/activities', (_req, res) => {
  const rows = db.prepare('SELECT * FROM activities ORDER BY started_at DESC').all();
  res.json(rows.map(fromRow));
});

app.get('/api/activities/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM activities WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'No encontrada' });
  res.json(fromRow(row));
});

app.post('/api/activities', (req, res) => {
  const row = toRow(req.body || {});
  db.prepare(`
    INSERT INTO activities (id, name, started_at, duration_ms, distance_m, avg_speed_kmh, source, points_json, heart_rate_json, created_at)
    VALUES (@id, @name, @started_at, @duration_ms, @distance_m, @avg_speed_kmh, @source, @points_json, @heart_rate_json, @created_at)
  `).run(row);
  res.status(201).json(fromRow(row));
});

app.delete('/api/activities/:id', (req, res) => {
  const info = db.prepare('DELETE FROM activities WHERE id = ?').run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'No encontrada' });
  res.status(204).end();
});

app.listen(PORT, () => {
  console.log(`[app-ciclismo backend] escuchando en http://localhost:${PORT}`);
  console.log(`  base de datos: ${path.join(__dirname, 'ciclismo.sqlite')}`);
});
