import { useMemo, useRef, useState } from 'react';
import { Icon } from './atoms';
import { useRideRecorder } from './useRideRecorder';
import { useHeartRateSensor } from './useHeartRateSensor';
import { useVoiceCoach } from './useVoiceCoach';
import { useWakeLock } from './useWakeLock';
import { saveActivity } from './activityStore';
import { compressPhoto } from './photoUtils';
import { projectToViewBox, pointsToPath, fmtClock, fmtKm, estimateCalories } from './geo';
import { DEFAULT_PROFILE } from './profileStore';

/* RecordRide — pantalla de grabación EN VIVO con GPS real del navegador.
   Sin datos inventados: la distancia, el tiempo, la velocidad y la traza
   salen de navigator.geolocation.watchPosition(). */

function LiveMap({ points, photos, onSelectPhoto }) {
  const W = 393, H = 230;
  const path = useMemo(() => {
    if (points.length < 2) return null;
    const coords = projectToViewBox(points, W, H);
    return pointsToPath(coords);
  }, [points]);

  // Ubica cada foto sobre el trazo según el punto GPS más cercano a su lat/lng real.
  const photoDots = useMemo(() => {
    if (!photos?.length || points.length < 2) return [];
    const coords = projectToViewBox(points, W, H);
    return photos
      .filter((ph) => ph.lat != null)
      .map((ph) => {
        let best = 0, bestD = Infinity;
        points.forEach((p, i) => {
          const d = (p.lat - ph.lat) ** 2 + (p.lng - ph.lng) ** 2;
          if (d < bestD) { bestD = d; best = i; }
        });
        return { ...ph, x: coords[best].x, y: coords[best].y };
      });
  }, [photos, points]);

  return (
    <div style={{
      position: 'relative', height: 230, borderRadius: 20, overflow: 'hidden',
      border: '1px solid var(--line)',
      background: 'linear-gradient(150deg, #e9e3d4, #ddd6c4)',
    }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        {path ? (
          <>
            <path d={path} fill="none" stroke="rgba(0,0,0,0.18)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" transform="translate(0,2.5)" />
            <path d={path} fill="none" stroke="var(--lime)" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />
          </>
        ) : null}
      </svg>
      {photoDots.map((ph) => (
        <button key={ph.id} onClick={() => onSelectPhoto?.(ph)} style={{
          position: 'absolute', left: ph.x - 13, top: ph.y - 13, width: 26, height: 26, borderRadius: '50%',
          border: '2px solid #fff', boxShadow: '0 2px 6px rgba(0,0,0,0.35)', padding: 0, cursor: 'pointer',
          backgroundImage: `url(${ph.dataUrl})`, backgroundSize: 'cover', backgroundPosition: 'center',
        }} title="Ver foto" />
      ))}
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

export default function RecordRide({ profile, onSaved }) {
  const rec = useRideRecorder();
  const hr = useHeartRateSensor();
  const [name, setName] = useState('Ruta del ' + new Date().toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' }));
  const [saved, setSaved] = useState(null);

  const kmh = rec.avgSpeed * 3.6;
  const liveKmh = rec.speed * 3.6;
  const kg = profile?.kg ?? DEFAULT_PROFILE.kg;
  const estKcal = estimateCalories({ kg, durationMs: rec.elapsed, avgKmh: kmh, elevGainM: rec.elevGain });

  const [saving, setSaving] = useState(false);
  const [coachOn, setCoachOn] = useState(true);
  const coach = useVoiceCoach({
    enabled: coachOn,
    active: rec.status === 'recording',
    distanceM: rec.distance,
    elapsedMs: rec.elapsed,
    bpm: hr.status === 'connected' ? hr.bpm : null,
    kcal: estKcal,
    profile,
  });

  const wakeLock = useWakeLock(rec.status === 'recording');
  const fileInputRef = useRef(null);
  const [viewPhoto, setViewPhoto] = useState(null);
  const [photoBusy, setPhotoBusy] = useState(false);

  const handlePhotoFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setPhotoBusy(true);
    try {
      const dataUrl = await compressPhoto(file);
      rec.addPhoto(dataUrl);
    } finally {
      setPhotoBusy(false);
    }
  };

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
      elevation: rec.hasAltitude ? {
        gainM: Math.round(rec.elevGain),
        lossM: Math.round(rec.elevLoss),
      } : null,
      estCalories: estKcal,
      profileSnapshot: { kg, age: profile?.age, sex: profile?.sex },
      heartRate: hr.samples.length ? {
        samples: hr.samples,
        avgBpm: hr.avgBpm,
        maxBpm: hr.maxBpm,
        device: hr.deviceName,
      } : null,
      photos: rec.photos,
    });
    setSaved(activity);
    setSaving(false);
    rec.reset();
    hr.reset();
    onSaved && onSaved(activity);
  };

  return (
    <div className="scr" style={{ background: 'var(--sand)', color: 'var(--bark)' }}>
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

          {rec.status === 'recording' && !wakeLock.held && (
            <div style={{ background: '#fff3e0', border: '1px solid #f0d8a8', borderRadius: 14, padding: '10px 14px', fontSize: 11.5, color: '#7a5a1c', lineHeight: 1.4 }}>
              {wakeLock.supported
                ? 'Activando pantalla siempre encendida para no perder el registro…'
                : 'Tu navegador no soporta mantener la pantalla encendida automáticamente — para no perder el registro, evitá apagar la pantalla manualmente mientras grabás.'}
            </div>
          )}

          <div style={{ position: 'relative' }}>
            <LiveMap points={rec.points} photos={rec.photos} onSelectPhoto={setViewPhoto} />
            {rec.status !== 'idle' && (
              <>
                <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handlePhotoFile} style={{ display: 'none' }} />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={photoBusy}
                  title="Sacar foto y marcarla en el mapa"
                  style={{
                    position: 'absolute', bottom: 12, right: 12, width: 46, height: 46, borderRadius: '50%',
                    border: 'none', background: 'var(--bark)', color: 'var(--lime)', cursor: 'pointer',
                    display: 'grid', placeItems: 'center', boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
                    opacity: photoBusy ? 0.6 : 1,
                  }}>
                  <Icon name="camera" size={20} color="var(--lime)" />
                </button>
                {rec.photos.length > 0 && (
                  <span style={{ position: 'absolute', bottom: 14, right: 56, fontSize: 10.5, fontWeight: 700, color: 'var(--bark)', background: 'rgba(255,255,255,0.78)', padding: '4px 8px', borderRadius: 20 }}>
                    {rec.photos.length} foto{rec.photos.length === 1 ? '' : 's'}
                  </span>
                )}
              </>
            )}
          </div>

          {viewPhoto && (
            <div onClick={() => setViewPhoto(null)} style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.78)', zIndex: 50,
              display: 'grid', placeItems: 'center', padding: 24, cursor: 'pointer',
            }}>
              <img src={viewPhoto.dataUrl} alt="Foto de la ruta" style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: 14 }} />
            </div>
          )}

          <div style={{
            background: 'var(--paper)', borderRadius: 18, padding: '18px 8px',
            border: '1px solid var(--line-2)', display: 'flex',
          }}>
            <StatBlock label="Distancia" value={fmtKm(rec.distance)} unit="km" />
            <StatBlock label="Tiempo" value={fmtClock(rec.elapsed)} />
            <StatBlock label="Vel. media" value={kmh.toFixed(1)} unit="km/h" />
          </div>

          <div style={{
            background: 'var(--paper)', borderRadius: 18, padding: '18px 8px',
            border: '1px solid var(--line-2)', display: 'flex',
          }}>
            <StatBlock label="Desnivel +" value={rec.hasAltitude ? Math.round(rec.elevGain) : '—'} unit={rec.hasAltitude ? 'm' : ''} />
            <StatBlock label="Vel. actual" value={liveKmh.toFixed(1)} unit="km/h" />
            <StatBlock label="Calorías (est.)" value={estKcal || '—'} unit={estKcal ? 'kcal' : ''} />
          </div>

          {!rec.hasAltitude && rec.status !== 'idle' && (
            <div style={{ fontSize: 11, color: 'var(--stone)', padding: '0 4px', lineHeight: 1.45 }}>
              Tu dispositivo todavía no reportó altitud por GPS — el desnivel puede tardar unos minutos en
              aparecer (o no estar disponible si tu celular no tiene barómetro/GPS de altitud).
              Mientras tanto, las calorías se estiman sólo a partir de tu velocidad y peso.
            </div>
          )}

          {/* coach de voz */}
          <div style={{ background: 'var(--paper)', borderRadius: 14, padding: '14px 16px', border: '1px solid var(--line-2)' }}>
            <div className="row between" style={{ alignItems: 'center' }}>
              <span className="row gap8" style={{ color: 'var(--bark)', fontWeight: 700, fontSize: 13.5 }}>
                <Icon name="bolt" size={16} color="var(--lime-deep)" /> Coach de voz
              </span>
              <button
                onClick={() => setCoachOn((v) => !v)}
                aria-pressed={coachOn}
                style={{
                  border: 'none', cursor: 'pointer', width: 46, height: 27, borderRadius: 14, padding: 3,
                  background: coachOn ? 'var(--lime)' : 'var(--sand-2)', display: 'flex',
                  justifyContent: coachOn ? 'flex-end' : 'flex-start', transition: 'background .2s',
                }}>
                <span style={{ width: 21, height: 21, borderRadius: '50%', background: coachOn ? 'var(--bark)' : '#fff', boxShadow: '0 1px 2px rgba(0,0,0,0.25)' }} />
              </button>
            </div>
            {!coach.supported ? (
              <div style={{ fontSize: 11, color: 'var(--stone)', marginTop: 8 }}>
                Tu navegador no soporta locución por voz (Web Speech API) — probá con Chrome.
              </div>
            ) : (
              <div style={{ fontSize: 11, color: 'var(--stone)', marginTop: 8, lineHeight: 1.45 }}>
                {coachOn
                  ? 'Te va a avisar por voz cada kilómetro (distancia, pulso real y calorías), te va a recordar hidratarte y te va a sugerir comer algo cuando convenga, según tu IMC.'
                  : 'Activalo para escuchar avisos por voz mientras pedaleás: kilómetros, pulso, calorías, hidratación y alimentación.'}
              </div>
            )}
            {coachOn && coach.lastMessage && rec.status === 'recording' && (
              <div style={{ marginTop: 10, fontSize: 12, color: 'var(--bark)', fontWeight: 600, fontStyle: 'italic', borderLeft: '3px solid var(--lime)', paddingLeft: 10 }}>
                "{coach.lastMessage}"
              </div>
            )}
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
            La distancia, el tiempo, la velocidad y la traza salen 100% del GPS real de tu dispositivo
            (<code>navigator.geolocation</code> + fórmula de Haversine). El <b>desnivel</b> usa la altitud
            que reporta tu GPS (cuando tu celular la provee con suficiente precisión). Las <b>calorías</b> son
            una <b>estimación</b> — se calculan con el método MET estándar (velocidad media × tu peso × tiempo),
            sumando el esfuerzo extra de subir desnivel; no es una medición exacta como la de un medidor de
            potencia, pero es el mismo método que usan la mayoría de relojes deportivos sin sensores avanzados.
            El pulso, si conectás un sensor BLE, también es 100% real (Web Bluetooth, servicio "Heart Rate" estándar).
            El <b>coach de voz</b> usa la síntesis de voz nativa del navegador (sin conexión a internet) y lee en
            voz alta estos mismos datos en vivo — los avisos de hidratación y alimentación están pensados según
            tu IMC real (calculado en tu Perfil), no son datos médicos.
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
