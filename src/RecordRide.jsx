import { useMemo, useState } from 'react';
import { Icon, StatusBar } from './atoms';
import { useRideRecorder } from './useRideRecorder';
import { useHeartRateSensor } from './useHeartRateSensor';
import { saveActivity } from './activityStore';
import { projectToViewBox, pointsToPath, fmtClock, fmtKm } from './geo';

/* RecordRide — pantalla de grabación EN VIVO con GPS real del navegador.
   Sin datos inventados: la distancia, el tiempo, la velocidad y la traza
   salen de navigator.geolocation.watchPosition(). */

function LiveMap({ points }) {
  const path = useMemo(() => {
    if (points.length < 2) return null;
    const coords = projectToViewBox(points, 393, 230);
    return pointsToPath(coords);
  }, [points]);

  return (
    <div style={{
      position: 'relative', height: 230, borderRadius: 20, overflow: 'hidden',
      border: '1px solid var(--line)',
      background: 'linear-gradient(150deg, #e9e3d4, #ddd6c4)',
    }}>
      <svg viewBox="0 0 393 230" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        {path ? (
          <>
            <path d={path} fill="none" stroke="rgba(0,0,0,0.18)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" transform="translate(0,2.5)" />
            <path d={path} fill="none" stroke="var(--lime)" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />
          </>
        ) : null}
      </svg>
      <span className="ph-note" style={{ background: 'rgba(255,255,255,0.65)', color: 'var(--stone)' }}>
        {points.length === 0 ? 'esperando señal GPS…' : `${points.length} puntos GPS reales`}
      </span>
    </div>
  );
}

function StatBlock({ label, value, unit }) {
  return (
    <div style={{ flex: 1, textAlign: 'center' }}>
      <div className="vu" style={{ justifyContent: 'center', gap: 4 }}>
        <span className="num" style={{ fontSize: 34, color: 'var(--bark)' }}>{value}</span>
        {unit && <span className="num" style={{ fontSize: 14, color: 'var(--stone)' }}>{unit}</span>}
      </div>
      <div className="label-cap" style={{ color: 'var(--stone)', marginTop: 4, fontSize: 9 }}>{label}</div>
    </div>
  );
}

export default function RecordRide({ onSaved }) {
  const rec = useRideRecorder();
  const hr = useHeartRateSensor();
  const [name, setName] = useState('Ruta del ' + new Date().toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' }));
  const [saved, setSaved] = useState(null);

  const kmh = rec.avgSpeed * 3.6;
  const liveKmh = rec.speed * 3.6;

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const activity = await saveActivity({
      name,
      startedAt: Date.now() - rec.elapsed,
      durationMs: rec.elapsed,
      distanceM: rec.distance,
      avgSpeedKmh: kmh,
      points: rec.points,
      source: 'gps-real',
      heartRate: hr.samples.length ? {
        samples: hr.samples,
        avgBpm: hr.avgBpm,
        maxBpm: hr.maxBpm,
        device: hr.deviceName,
      } : null,
    });
    setSaved(activity);
    setSaving(false);
    rec.reset();
    hr.reset();
    onSaved && onSaved(activity);
  };

  return (
    <div className="scr" style={{ background: 'var(--sand)', color: 'var(--bark)' }}>
      <StatusBar color="var(--bark)" />
      <div className="row between" style={{ padding: '6px 16px 10px' }}>
        <span style={{ fontSize: 15, fontWeight: 700 }}>Grabar ruta · GPS real</span>
        {rec.status !== 'idle' && (
          <span className="row gap6" style={{ fontSize: 11, fontWeight: 700, color: rec.status === 'recording' ? 'var(--lime-deep)' : 'var(--stone)' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: rec.status === 'recording' ? 'var(--lime-deep)' : 'var(--stone-2)' }} />
            {rec.status === 'recording' ? 'GRABANDO' : rec.status === 'paused' ? 'EN PAUSA' : 'DETENIDO'}
          </span>
        )}
      </div>

      <div className="scroll-area">
        <div style={{ padding: '0 16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>

          {!rec.supported && (
            <div style={{ background: '#fde6e0', border: '1px solid #f0b8a8', borderRadius: 14, padding: 14, fontSize: 13, color: '#8a3a23' }}>
              Tu navegador no soporta geolocalización — no se puede grabar una ruta real acá.
            </div>
          )}
          {rec.error && (
            <div style={{ background: '#fde6e0', border: '1px solid #f0b8a8', borderRadius: 14, padding: 14, fontSize: 13, color: '#8a3a23' }}>
              {rec.error} — revisá los permisos de ubicación del navegador para este sitio.
            </div>
          )}

          <LiveMap points={rec.points} />

          <div style={{
            background: 'var(--paper)', borderRadius: 18, padding: '18px 8px',
            border: '1px solid var(--line-2)', display: 'flex',
          }}>
            <StatBlock label="Distancia" value={fmtKm(rec.distance)} unit="km" />
            <StatBlock label="Tiempo" value={fmtClock(rec.elapsed)} />
            <StatBlock label="Vel. media" value={kmh.toFixed(1)} unit="km/h" />
          </div>

          <div className="row between" style={{
            background: 'var(--paper)', borderRadius: 14, padding: '12px 16px', border: '1px solid var(--line-2)'
          }}>
            <span className="label-cap" style={{ color: 'var(--stone)' }}>Velocidad actual (GPS)</span>
            <span className="num" style={{ fontSize: 18, color: 'var(--bark)' }}>{liveKmh.toFixed(1)} <span style={{ fontSize: 11, color: 'var(--stone)' }}>km/h</span></span>
          </div>

          {/* sensor de pulso BLE */}
          <div style={{ background: 'var(--paper)', borderRadius: 14, padding: '14px 16px', border: '1px solid var(--line-2)' }}>
            <div className="row between">
              <span className="label-cap" style={{ color: 'var(--stone)' }}>Pulsómetro Bluetooth</span>
              {hr.status === 'connected' ? (
                <span className="row gap6" style={{ fontSize: 11, fontWeight: 700, color: 'var(--clay)' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--clay)' }} /> {hr.deviceName}
                </span>
              ) : (
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--stone-2)' }}>sin conectar</span>
              )}
            </div>

            {hr.status === 'connected' ? (
              <div className="row between" style={{ marginTop: 10 }}>
                <div className="vu" style={{ gap: 6 }}>
                  <Icon name="heart" size={20} color="var(--clay)" />
                  <span className="num" style={{ fontSize: 32, color: 'var(--clay)' }}>{hr.bpm ?? '--'}</span>
                  <span className="num" style={{ fontSize: 13, color: 'var(--stone)' }}>ppm real</span>
                </div>
                <button onClick={hr.disconnect} style={{ ...btnGhost, padding: '8px 14px', fontSize: 12 }}>Desconectar</button>
              </div>
            ) : (
              <button
                onClick={hr.connect}
                disabled={hr.status === 'connecting'}
                style={{ ...btnSecondary, marginTop: 10, opacity: hr.status === 'connecting' ? 0.6 : 1 }}
              >
                <Icon name="heart" size={17} color="var(--clay)" />
                {hr.status === 'connecting' ? 'Buscando dispositivos…' : 'Conectar pulsómetro / reloj BLE'}
              </button>
            )}

            {!hr.supported && (
              <div style={{ fontSize: 11, color: 'var(--stone)', marginTop: 8 }}>
                Web Bluetooth no está disponible en este navegador (funciona en Chrome/Edge de escritorio o Android, no en iOS Safari).
              </div>
            )}
            {hr.error && <div style={{ fontSize: 11, color: '#8a3a23', marginTop: 8 }}>{hr.error}</div>}
            {hr.status === 'connected' && hr.samples.length > 0 && (
              <div style={{ fontSize: 11, color: 'var(--stone)', marginTop: 8 }}>
                Promedio real: <b style={{ color: 'var(--bark)' }}>{hr.avgBpm}</b> ppm · Máx: <b style={{ color: 'var(--bark)' }}>{hr.maxBpm}</b> ppm · {hr.samples.length} lecturas
              </div>
            )}
          </div>

          <div style={{ fontSize: 11.5, color: 'var(--stone)', lineHeight: 1.5, padding: '0 2px' }}>
            Estos números provienen del GPS real de tu dispositivo (<code>navigator.geolocation</code>):
            la distancia se calcula sumando la distancia entre cada par de coordenadas registradas
            (fórmula de Haversine) y el tiempo es el reloj real mientras grabás.
            El pulso, si conectás un sensor BLE, también es 100% real (Web Bluetooth, servicio
            "Heart Rate" estándar). Desnivel y calorías siguen sin estar disponibles — necesitan
            altímetro/barómetro y un cálculo a partir de tu perfil + FC.
          </div>

          {/* controles */}
          {rec.status === 'idle' && (
            <button onClick={rec.start} style={btnPrimary}>
              <Icon name="bolt" size={18} color="var(--bark)" /> Empezar a grabar
            </button>
          )}
          {(rec.status === 'recording' || rec.status === 'paused') && (
            <div className="row gap10">
              <button onClick={rec.status === 'recording' ? rec.pause : rec.resume} style={{ ...btnSecondary, flex: 1 }}>
                {rec.status === 'recording' ? 'Pausar' : 'Reanudar'}
              </button>
              <button onClick={rec.stop} style={{ ...btnDanger, flex: 1 }}>Terminar</button>
            </div>
          )}
          {rec.status === 'stopped' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--stone)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Nombre de la actividad
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    display: 'block', width: '100%', marginTop: 6, padding: '12px 14px', borderRadius: 12,
                    border: '1px solid var(--line)', fontFamily: 'inherit', fontSize: 14, fontWeight: 600,
                    color: 'var(--bark)', background: 'var(--paper)',
                  }}
                />
              </label>
              <button onClick={handleSave} disabled={saving} style={{ ...btnPrimary, opacity: saving ? 0.6 : 1 }}>
                {saving ? 'Guardando…' : 'Guardar actividad real'}
              </button>
              <button onClick={rec.reset} style={btnGhost}>Descartar</button>
            </div>
          )}

          {saved && (
            <div style={{ background: 'var(--lime-soft)', border: '1px solid var(--lime-deep)', borderRadius: 14, padding: 14, fontSize: 13, color: 'var(--bark)' }}>
              ✓ Guardada: <b>{saved.name}</b> · {fmtKm(saved.distanceM)} km · {fmtClock(saved.durationMs)}.
              Mirala en "Historial real".
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const btnBase = {
  border: 'none', fontFamily: 'inherit', fontWeight: 700, fontSize: 15,
  padding: '15px', borderRadius: 14, cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
};
const btnPrimary = { ...btnBase, background: 'var(--lime)', color: 'var(--bark)' };
const btnSecondary = { ...btnBase, background: 'var(--paper)', color: 'var(--bark)', border: '1.5px solid var(--line)' };
const btnDanger = { ...btnBase, background: 'var(--clay)', color: '#fff' };
const btnGhost = { ...btnBase, background: 'transparent', color: 'var(--stone)', border: '1px dashed var(--line)' };
