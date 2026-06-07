import { useEffect, useRef, useState } from 'react';
import { Icon, StatusBar } from './atoms';
import { useHeartRateSensor } from './useHeartRateSensor';

/* LiveHR — "Pulso en vivo": la pantalla entera cambia de color según
   la zona de pulsaciones.

   Si conectás tu reloj o pulsómetro por Bluetooth (Web Bluetooth, servicio
   estándar "Heart Rate" 0x180D), el BPM que ves es 100% real, leído del
   dispositivo. Si no tenés uno a mano, podés seguir explorando la pantalla
   con el simulador (automático o deslizador manual). */

export const ZONES = [
  { key: 'Z1', name: 'Recuperación', lo: 0, hi: 111, accent: '#5fe6bf', deep: '#143029', glow: 'rgba(95,230,191,0.34)' },
  { key: 'Z2', name: 'Aeróbico', lo: 111, hi: 130, accent: '#8fe04a', deep: '#1b3a1a', glow: 'rgba(143,224,74,0.32)' },
  { key: 'Z3', name: 'Tempo', lo: 130, hi: 149, accent: '#c8f230', deep: '#2c3a0c', glow: 'rgba(200,242,48,0.34)' },
  { key: 'Z4', name: 'Umbral', lo: 149, hi: 168, accent: '#ff9d3a', deep: '#43230e', glow: 'rgba(255,157,58,0.32)' },
  { key: 'Z5', name: 'Máximo', lo: 168, hi: 999, accent: '#ff5a3c', deep: '#45150d', glow: 'rgba(255,90,60,0.34)' },
];
const HR_MAX = 185;
const LAD_LO = 96, LAD_HI = 190;
export function zoneFor(bpm) { return ZONES.find((z) => bpm < z.hi) || ZONES[4]; }
function mapX(bpm) { return Math.max(0, Math.min(1, (bpm - LAD_LO) / (LAD_HI - LAD_LO))) * 100; }

function sparkPath(hist, w, h) {
  if (!hist.length) return '';
  const lo = 92, hi = 188;
  return hist.map((b, i) => {
    const x = (i / (hist.length - 1)) * w;
    const y = h - ((Math.max(lo, Math.min(hi, b)) - lo) / (hi - lo)) * h;
    return (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
  }).join(' ');
}

export default function LiveHRScreen({ elapsed = '00:48:12', dist = '21.4' }) {
  const hr = useHeartRateSensor();
  const live = hr.status === 'connected';

  const [simBpm, setSimBpm] = useState(138);
  const [auto, setAuto] = useState(true);
  const [hist, setHist] = useState([]);
  const tRef = useRef(0);
  const idleRef = useRef(0);

  // Simulación — sólo corre mientras no haya un sensor real conectado.
  useEffect(() => {
    if (live) return;
    const id = setInterval(() => {
      tRef.current += 1;
      if (auto) {
        const t = tRef.current;
        const target = 139 + 44 * Math.sin(t * 0.165) + 7 * Math.sin(t * 0.9);
        setSimBpm((b) => {
          const next = b + (target - b) * 0.5 + (Math.random() - 0.5) * 2.5;
          return Math.round(Math.max(94, Math.min(184, next)));
        });
      }
      setSimBpm((b) => { setHist((h) => [...h.slice(-39), b]); return b; });
    }, 720);
    return () => clearInterval(id);
  }, [auto, live]);

  // Mientras hay sensor real conectado, el historial sigue las lecturas reales.
  useEffect(() => {
    if (!live || hr.bpm == null) return;
    setHist((h) => [...h.slice(-39), hr.bpm]);
  }, [live, hr.bpm]);

  const onSlide = (e) => {
    setAuto(false);
    setSimBpm(Number(e.target.value));
    clearTimeout(idleRef.current);
    idleRef.current = setTimeout(() => setAuto(true), 4000);
  };

  const bpm = live ? (hr.bpm ?? simBpm) : simBpm;
  const z = zoneFor(bpm);
  const zi = ZONES.indexOf(z);
  const pctMax = Math.round((bpm / HR_MAX) * 100);
  const beatDur = (60 / Math.max(60, bpm)).toFixed(2);
  const cream = 'rgba(255,255,255,0.96)';
  const muted = 'rgba(255,255,255,0.52)';
  const faint = 'rgba(255,255,255,0.12)';
  const dist5 = [9, 24, 38, 22, 7];

  return (
    <div className="scr" style={{
      color: cream,
      background: `radial-gradient(125% 72% at 50% 30%, ${z.glow} 0%, transparent 58%), ${z.deep}`,
      transition: 'background 0.9s cubic-bezier(.4,0,.2,1)',
    }}>
      <StatusBar color={cream} />

      <div className="row between" style={{ padding: '4px 18px 2px' }}>
        <div className="row gap8" style={{ background: 'rgba(0,0,0,0.22)', padding: '6px 11px 6px 9px', borderRadius: 30 }}>
          <Icon name="watch" size={16} color={cream} />
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.01em' }}>
            {live ? (hr.deviceName || 'Reloj conectado') : hr.status === 'connecting' ? 'Conectando…' : 'Sin reloj — pulso simulado'}
          </span>
          <span style={{ width: 7, height: 7, borderRadius: 4, background: live ? z.accent : muted }} />
        </div>
        <div className="row gap6" style={{ color: muted }}>
          <Icon name="clock" size={15} color={muted} />
          <span className="num" style={{ fontSize: 19, color: cream }}>{elapsed}</span>
        </div>
      </div>

      <div className="scroll-area">
        <div style={{ padding: '6px 20px 0', display: 'flex', flexDirection: 'column', height: '100%' }}>

          <div style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 14 }}>
            <div style={{ position: 'relative', width: 64, height: 64, display: 'grid', placeItems: 'center', marginBottom: 6 }}>
              <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `2px solid ${z.accent}` }} />
              <Icon name="heart" size={40} color={z.accent} fill={z.accent} sw={0} />
            </div>
            <div className="vu" style={{ gap: 6, alignItems: 'baseline' }}>
              <span className="num" style={{ fontSize: 120, color: z.accent, lineHeight: 0.8, transition: 'color 0.9s', textShadow: `0 0 38px ${z.glow}` }}>{bpm}</span>
            </div>
            <span className="label-cap" style={{ color: muted, marginTop: 8, fontSize: 12, letterSpacing: '0.22em' }}>Pulsaciones / min</span>
          </div>

          <div className="row" style={{ justifyContent: 'center', gap: 12, margin: '16px 0 6px' }}>
            <span className="num" style={{ fontSize: 30, color: z.accent, transition: 'color 0.9s' }}>{z.key}</span>
            <span style={{ width: 1, background: faint }} />
            <div>
              <div style={{ fontSize: 19, fontWeight: 800, color: cream, lineHeight: 1 }}>{z.name}</div>
              <div style={{ fontSize: 12, color: muted, marginTop: 2, fontWeight: 600 }}>{pctMax}% de tu FC máx · {z.lo === 0 ? '<111' : z.hi === 999 ? '168+' : z.lo + '–' + z.hi} ppm</div>
            </div>
          </div>

          <div style={{ height: 46, margin: '6px 0 2px' }}>
            <svg viewBox="0 0 320 46" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
              <path d={sparkPath(hist.length ? hist : [bpm, bpm], 320, 44)} fill="none" stroke={z.accent} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'stroke 0.9s', opacity: 0.92 }} />
            </svg>
          </div>

          <div style={{ marginTop: 4 }}>
            <div style={{ position: 'relative', height: 30, borderRadius: 8, overflow: 'hidden', display: 'flex' }}>
              {ZONES.map((zz, i) => {
                const a = Math.max(LAD_LO, zz.lo), b = Math.min(LAD_HI, zz.hi);
                const wpct = ((b - a) / (LAD_HI - LAD_LO)) * 100;
                const active = i === zi;
                return (
                  <div key={zz.key} style={{ width: wpct + '%', height: '100%', background: zz.accent, opacity: active ? 1 : 0.22, transition: 'opacity 0.5s', display: 'grid', placeItems: 'center' }}>
                    <span className="num" style={{ fontSize: 13, color: active ? '#10110a' : 'rgba(0,0,0,0.55)', fontWeight: 700 }}>{zz.key}</span>
                  </div>
                );
              })}
              <div style={{ position: 'absolute', top: -3, bottom: -3, left: `calc(${mapX(bpm)}% - 2px)`, width: 4, background: '#fff', borderRadius: 3, boxShadow: '0 0 0 2px rgba(0,0,0,0.35)', transition: 'left 0.6s cubic-bezier(.4,0,.2,1)' }} />
            </div>
            <div className="row between" style={{ marginTop: 5, color: muted, fontSize: 10, fontWeight: 600 }}>
              <span>{LAD_LO}</span><span>111</span><span>130</span><span>149</span><span>168</span><span>{LAD_HI}+</span>
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <div className="row between" style={{ marginBottom: 8 }}>
              <span className="label-cap" style={{ color: muted }}>Tiempo en cada zona</span>
              <span style={{ fontSize: 12, color: muted, fontWeight: 600 }}>{dist}&nbsp;km</span>
            </div>
            <div style={{ display: 'flex', gap: 4, height: 8, borderRadius: 4, overflow: 'hidden' }}>
              {ZONES.map((zz, i) => (
                <div key={zz.key} style={{ flex: dist5[i], background: zz.accent, opacity: i === zi ? 1 : 0.55, transition: 'opacity 0.5s' }} />
              ))}
            </div>
          </div>

          <div style={{ flex: '1 1 auto' }} />

          <div style={{ paddingBottom: 16 }}>
            {live ? (
              <div>
                <div className="row between" style={{ marginBottom: 10, alignItems: 'center' }}>
                  <span className="row gap8" style={{ fontSize: 13, fontWeight: 800, color: cream }}>
                    <span style={{ width: 8, height: 8, borderRadius: 4, background: z.accent }} />
                    {hr.deviceName || 'Sensor BLE'} · pulso real
                  </span>
                  <button onClick={hr.disconnect} style={{
                    border: `1px solid ${faint}`, background: 'rgba(0,0,0,0.18)', color: cream, cursor: 'pointer',
                    fontFamily: 'inherit', fontSize: 12, fontWeight: 700, padding: '7px 13px', borderRadius: 10,
                  }}>Desconectar</button>
                </div>
                {hr.samples.length > 0 && (
                  <div style={{ fontSize: 11.5, color: muted, fontWeight: 600 }}>
                    Promedio real: <b style={{ color: cream }}>{hr.avgBpm}</b> ppm · Máx: <b style={{ color: cream }}>{hr.maxBpm}</b> ppm · {hr.samples.length} lecturas
                  </div>
                )}
                <div style={{ fontSize: 11, color: muted, marginTop: 10, lineHeight: 1.4 }}>
                  El BPM, la zona y el gráfico de esta pantalla vienen en vivo de tu reloj/pulsómetro real
                  por Bluetooth (servicio estándar "Heart Rate" 0x180D) — sin datos inventados.
                </div>
              </div>
            ) : (
              <div>
                <div className="row between" style={{ marginBottom: 10, alignItems: 'center' }}>
                  <span className="label-cap" style={{ color: muted }}>Conectar tu reloj</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: auto ? z.accent : muted, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 6, height: 6, borderRadius: 3, background: auto ? z.accent : muted }} />
                    {auto ? 'SIMULADO · EN VIVO' : 'SIMULADO · MANUAL'}
                  </span>
                </div>
                <button
                  onClick={hr.connect}
                  disabled={hr.status === 'connecting'}
                  className="row gap8"
                  style={{
                    width: '100%', justifyContent: 'center', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                    background: z.accent, color: '#10110a', fontWeight: 800, fontSize: 14,
                    padding: '13px 16px', borderRadius: 13, opacity: hr.status === 'connecting' ? 0.65 : 1,
                    transition: 'background 0.5s',
                  }}>
                  <Icon name="watch" size={18} color="#10110a" />
                  {hr.status === 'connecting' ? 'Buscando dispositivos…' : 'Conectar reloj / pulsómetro BLE'}
                </button>
                {!hr.supported && (
                  <div style={{ fontSize: 11, color: muted, marginTop: 8, lineHeight: 1.4 }}>
                    Este navegador no soporta Web Bluetooth (probá Chrome/Edge en escritorio o Android, sobre HTTPS o localhost).
                    Mientras tanto podés seguir explorando con el simulador de abajo.
                  </div>
                )}
                {hr.error && <div style={{ fontSize: 11, color: '#ffb199', marginTop: 8 }}>{hr.error}</div>}

                <div style={{ marginTop: 16 }}>
                  <div className="row between" style={{ marginBottom: 8, alignItems: 'center' }}>
                    <span className="label-cap" style={{ color: muted }}>O simulá el esfuerzo</span>
                  </div>
                  <input className="effort" type="range" min="96" max="184" value={bpm} onChange={onSlide}
                    style={{ width: '100%', color: z.accent, background: `linear-gradient(90deg, ${z.accent} ${mapX(bpm)}%, rgba(255,255,255,0.14) ${mapX(bpm)}%)` }} />
                  <div style={{ fontSize: 11, color: muted, marginTop: 10, lineHeight: 1.4 }}>
                    Sin reloj a mano: arrastrá el control para cambiar de zona manualmente, o dejalo en automático
                    para ver cómo se sentiría un tramo real de ruta.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
