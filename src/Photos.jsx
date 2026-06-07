import { useEffect, useRef, useState } from 'react';
import { Icon, StatusBar } from './atoms';

/* Photos — Fotos geolocalizadas durante la ruta + "Resumen dinámico"
   (replay animado de la ruta con las fotos apareciendo en su punto GPS).
   Recreación visual del prototipo Photos.jsx, con datos de ejemplo
   y una animación real (requestAnimationFrame) controlable. */

const ROUTE_D = 'M40 178 C 64 150, 56 112, 96 104 C 132 97, 150 128, 188 116 C 224 104, 214 64, 252 58 C 292 52, 296 96, 322 110 C 344 122, 366 132, 352 150';
const WP = [
  { t: 0.15, km: 7, cap: 'Salida del bosque' },
  { t: 0.42, km: 18, cap: 'Mirador del Lago' },
  { t: 0.68, km: 29, cap: 'Alto del Puerto' },
  { t: 0.90, km: 38, cap: 'Bajada final' },
];
const fmtT = (s) => { s = Math.round(s); const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60; return (h ? h + ':' : '') + String(m).padStart(h ? 2 : 1, '0') + ':' + String(ss).padStart(2, '0'); };

function MapBg({ children, height }) {
  return (
    <div style={{ position: 'relative', height, width: '100%', overflow: 'hidden',
      background: 'radial-gradient(120% 90% at 78% 18%, #1d2622 0%, transparent 42%), linear-gradient(150deg, #23211a, #1b1913)' }}>
      {children}
    </div>
  );
}

// ── Pantalla 1: capturar foto durante la ruta (datos de ejemplo) ──
export function ActivePhotoScreen() {
  const pathRef = useRef(null);
  const [pts, setPts] = useState([]);
  useEffect(() => {
    const path = pathRef.current; if (!path) return;
    const L = path.getTotalLength();
    setPts(WP.map((w) => { const p = path.getPointAtLength(w.t * L); return { x: p.x, y: p.y }; }));
  }, []);
  const cream = 'var(--cream)', muted = 'rgba(255,255,255,0.5)';
  return (
    <div className="scr" style={{ background: 'var(--night)', color: cream }}>
      <div style={{ position: 'relative', flex: '1 1 auto' }}>
        <MapBg height={560}>
          <svg viewBox="0 0 393 230" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
            <path ref={pathRef} d={ROUTE_D} fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" transform="translate(0,2.5)" />
            <path d={ROUTE_D} fill="none" stroke="var(--lime)" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="40" cy="178" r="7" fill="var(--lime)" stroke="#16140f" strokeWidth="3" />
            {pts.map((p, i) => (
              <g key={i} transform={`translate(${p.x},${p.y})`}>
                <circle r="14" fill="var(--lime)" stroke="#16140f" strokeWidth="2.5" />
                <g transform="translate(-7,-7) scale(0.7)"><Icon name="camera" size={14} color="#15140d" sw={1.8} /></g>
              </g>
            ))}
            <g transform="translate(352,150)">
              <circle r="9" fill="#2b6fff" stroke="#fff" strokeWidth="3" /><circle r="3.2" fill="#fff" />
            </g>
          </svg>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0 }}><StatusBar color={cream} /></div>
          <div style={{ position: 'absolute', left: '50%', bottom: 26, transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 9,
            background: 'rgba(0,0,0,0.62)', backdropFilter: 'blur(8px)', padding: '9px 15px', borderRadius: 30, whiteSpace: 'nowrap' }}>
            <Icon name="camera" size={17} color="var(--lime)" />
            <span style={{ fontSize: 13, fontWeight: 700 }}>Foto guardada</span>
            <span style={{ fontSize: 13, color: muted, fontWeight: 600 }}>· km 18 · Mirador</span>
          </div>
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 80, background: 'linear-gradient(transparent, var(--night))' }} />
        </MapBg>
      </div>

      <div style={{ background: 'var(--night)', padding: '6px 20px 20px' }}>
        <div className="row between" style={{ margin: '2px 2px 10px' }}>
          <span className="label-cap" style={{ color: muted }}>4 fotos en esta ruta</span>
          <span style={{ fontSize: 12, color: muted, fontWeight: 600 }}>Ver galería</span>
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {WP.map((w, i) => (
            <div key={i} style={{ flex: 1, aspectRatio: '1', borderRadius: 12, background: 'var(--panel)', border: '1px solid var(--nline)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
              <Icon name="camera" size={18} color="var(--ash)" />
              <span className="num" style={{ fontSize: 13, color: 'var(--ash)' }}>km {w.km}</span>
            </div>
          ))}
        </div>
        <div className="row between" style={{ alignItems: 'center', padding: '0 4px' }}>
          <button style={{ width: 62, height: 62, borderRadius: '50%', border: '1.5px solid rgba(255,90,60,0.4)', background: 'rgba(255,90,60,0.12)', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
            <span style={{ width: 22, height: 22, background: '#ff5a3c', borderRadius: 5 }} />
          </button>
          <button style={{ width: 88, height: 88, borderRadius: '50%', border: '4px solid var(--lime)', background: 'rgba(200,242,48,0.14)', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
            <span style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--lime)', display: 'grid', placeItems: 'center' }}>
              <Icon name="camera" size={30} color="var(--bark)" sw={1.7} />
            </span>
          </button>
          <button style={{ width: 62, height: 62, borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.06)', color: cream, display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
            <span style={{ display: 'flex', gap: 4 }}><span style={{ width: 6, height: 22, background: cream, borderRadius: 2 }} /><span style={{ width: 6, height: 22, background: cream, borderRadius: 2 }} /></span>
          </button>
        </div>
        <div className="row" style={{ justifyContent: 'center', gap: 64, marginTop: 8 }}>
          <span style={{ fontSize: 10.5, color: muted, fontWeight: 600 }}>Parar</span>
          <span style={{ fontSize: 10.5, color: 'var(--lime)', fontWeight: 700 }}>Sacar foto</span>
          <span style={{ fontSize: 10.5, color: muted, fontWeight: 600 }}>Pausa</span>
        </div>
      </div>
    </div>
  );
}

// ── Pantalla 2: RESUMEN DINÁMICO (replay animado real con rAF) ──
export function PhotoReplayScreen() {
  const pathRef = useRef(null);
  const trackRef = useRef(null);
  const [L, setL] = useState(0);
  const [p, setP] = useState(0); // progreso 0..1
  const [playing, setPlaying] = useState(true);
  const playingRef = useRef(true);
  const draggingRef = useRef(false);
  const pRef = useRef(0);
  const DUR = 16000;

  useEffect(() => {
    const path = pathRef.current; if (!path) return;
    setL(path.getTotalLength());
  }, []);

  useEffect(() => {
    let raf, last = performance.now();
    const tick = (now) => {
      const dt = now - last; last = now;
      if (playingRef.current && !draggingRef.current) {
        pRef.current = Math.min(1, pRef.current + dt / DUR);
        setP(pRef.current);
        if (pRef.current >= 1) { playingRef.current = false; setPlaying(false); }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const toggle = () => {
    if (pRef.current >= 1) { pRef.current = 0; setP(0); }
    playingRef.current = !playingRef.current;
    setPlaying(playingRef.current);
  };
  const scrubTo = (clientX) => {
    const r = trackRef.current.getBoundingClientRect();
    const np = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
    pRef.current = np; setP(np);
  };
  const onTrackDown = (e) => { draggingRef.current = true; playingRef.current = false; setPlaying(false); scrubTo(e.clientX); trackRef.current.setPointerCapture(e.pointerId); };
  const onTrackMove = (e) => { if (draggingRef.current) scrubTo(e.clientX); };
  const onTrackUp = (e) => { draggingRef.current = false; try { trackRef.current.releasePointerCapture(e.pointerId); } catch { /* noop */ } };

  const point = (() => {
    const path = pathRef.current;
    if (!path || !L) return { x: 40, y: 178 };
    const pt = path.getPointAtLength(p * L);
    return { x: pt.x, y: pt.y };
  })();

  let idx = -1;
  for (let i = 0; i < WP.length; i++) if (p >= WP[i].t) idx = i;
  const active = idx >= 0 ? WP[idx] : null;
  const dist = (p * 42.6).toFixed(1);
  const elev = Math.round(p * 612);
  const time = fmtT(p * 5901);

  const cream = 'var(--cream)', muted = 'rgba(255,255,255,0.5)';

  return (
    <div className="scr" style={{ background: 'var(--night)', color: cream }}>
      <StatusBar color={cream} />
      <div className="row between" style={{ padding: '6px 18px 8px' }}>
        <Icon name="back" size={22} color={cream} />
        <span style={{ fontSize: 15, fontWeight: 700 }}>Resumen dinámico</span>
        <Icon name="share" size={20} color={cream} />
      </div>

      <div className="scroll-area">
        <div style={{ padding: '0 16px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ padding: '0 4px' }}>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: '-0.01em' }}>Ruta del Embalse</h1>
            <div style={{ fontSize: 12.5, color: muted, fontWeight: 500, marginTop: 2 }}>Dom 24 may · 42.6 km · 4 fotos</div>
          </div>

          <div style={{ borderRadius: 18, overflow: 'hidden', border: '1px solid var(--nline)' }}>
            <MapBg height={236}>
              <svg viewBox="0 0 393 230" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
                <path ref={pathRef} d={ROUTE_D} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                <path d={ROUTE_D} fill="none" stroke="var(--lime)" strokeWidth="4.4" strokeLinecap="round" strokeLinejoin="round"
                  strokeDasharray={L} strokeDashoffset={L * (1 - p)} />
                {WP.map((w, i) => {
                  const path = pathRef.current;
                  if (!path || !L) return null;
                  const pt = path.getPointAtLength(w.t * L);
                  const on = p >= w.t;
                  return (
                    <g key={i} transform={`translate(${pt.x},${pt.y})`} style={{ opacity: on ? 1 : 0.32, transition: 'opacity 0.3s' }}>
                      <circle r={on ? 13 : 9.5} fill="var(--lime)" stroke="#16140f" strokeWidth="2.5" />
                      <g transform="translate(-6.3,-6.3) scale(0.63)"><Icon name="camera" size={14} color="#15140d" sw={2} /></g>
                    </g>
                  );
                })}
                <circle cx={point.x} cy={point.y} r="13" fill="#fff" opacity="0.22" />
                <circle cx={point.x} cy={point.y} r="6.5" fill="#fff" stroke="var(--lime)" strokeWidth="3" />
              </svg>
            </MapBg>
          </div>

          <div style={{ position: 'relative', height: 220, borderRadius: 18, overflow: 'hidden', background: 'var(--night-2)', border: '1px solid var(--nline)' }}>
            {WP.map((w, i) => (
              <div key={i} style={{ position: 'absolute', inset: 0, opacity: idx === i ? 1 : 0,
                transform: idx === i ? 'scale(1)' : 'scale(1.04)', transition: 'opacity 0.5s, transform 0.7s', pointerEvents: 'none',
                background: 'radial-gradient(120% 90% at 30% 20%, #2b3a2b 0%, #1b1913 70%)' }}>
                <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 96, background: 'linear-gradient(transparent, rgba(0,0,0,0.6))' }} />
                <div style={{ position: 'absolute', left: 14, bottom: 13, display: 'flex', alignItems: 'center', gap: 9 }}>
                  <span style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--lime)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                    <Icon name="camera" size={17} color="var(--bark)" sw={1.7} />
                  </span>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', textShadow: '0 1px 6px rgba(0,0,0,0.6)' }}>{w.cap}</div>
                    <div className="num" style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', textShadow: '0 1px 6px rgba(0,0,0,0.6)' }}>km {w.km}</div>
                  </div>
                </div>
              </div>
            ))}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12,
              opacity: idx < 0 ? 1 : 0, transition: 'opacity 0.4s', pointerEvents: 'none', textAlign: 'center', padding: 30 }}>
              <span style={{ width: 54, height: 54, borderRadius: '50%', background: 'rgba(200,242,48,0.14)', display: 'grid', placeItems: 'center' }}>
                <Icon name="camera" size={26} color="var(--lime)" />
              </span>
              <div style={{ fontSize: 14, color: muted, fontWeight: 600, maxWidth: 220, lineHeight: 1.4 }}>Tus fotos aparecen al pasar por el punto donde las sacaste</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            {[[dist, 'km', 'Distancia'], [elev, 'm ↑', 'Desnivel'], [time, '', 'Tiempo']].map(([v, u, l], i) => (
              <div key={i} style={{ background: 'var(--panel)', borderRadius: 13, padding: '11px 13px', border: '1px solid var(--nline)' }}>
                <div className="vu" style={{ gap: 3 }}>
                  <span className="num" style={{ fontSize: 23, color: cream }}>{v}</span>
                  <span className="num" style={{ fontSize: 11, color: muted }}>{u}</span>
                </div>
                <span className="label-cap" style={{ color: muted, fontSize: 8.5 }}>{l}</span>
              </div>
            ))}
          </div>

          <div className="row gap12" style={{ alignItems: 'center', marginTop: 2 }}>
            <button onClick={toggle} style={{ width: 50, height: 50, borderRadius: '50%', border: 'none', background: 'var(--lime)', display: 'grid', placeItems: 'center', cursor: 'pointer', flexShrink: 0, boxShadow: '0 4px 16px rgba(200,242,48,0.3)' }}>
              {playing
                ? <span style={{ display: 'flex', gap: 4 }}><span style={{ width: 5, height: 18, background: 'var(--bark)', borderRadius: 1.5 }} /><span style={{ width: 5, height: 18, background: 'var(--bark)', borderRadius: 1.5 }} /></span>
                : <svg width="20" height="20" viewBox="0 0 20 20" fill="var(--bark)"><path d="M6 4l11 6-11 6z" /></svg>}
            </button>
            <div style={{ flex: 1 }}>
              <div ref={trackRef} onPointerDown={onTrackDown} onPointerMove={onTrackMove} onPointerUp={onTrackUp}
                style={{ position: 'relative', height: 30, display: 'flex', alignItems: 'center', cursor: 'pointer', touchAction: 'none' }}>
                <div style={{ position: 'absolute', left: 0, right: 0, height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.14)' }} />
                <div style={{ position: 'absolute', left: 0, height: 5, borderRadius: 3, background: 'var(--lime)', width: `${p * 100}%` }} />
                {WP.map((w, i) => (
                  <span key={i} style={{ position: 'absolute', left: `${w.t * 100}%`, transform: 'translateX(-50%)', width: 14, height: 14, borderRadius: '50%',
                    background: 'var(--night-2)', border: `2px solid ${idx >= i ? 'var(--lime)' : 'rgba(255,255,255,0.3)'}`, display: 'grid', placeItems: 'center', transition: 'border-color 0.3s' }}>
                    <Icon name="camera" size={8} color={idx >= i ? 'var(--lime)' : 'rgba(255,255,255,0.4)'} sw={2} />
                  </span>
                ))}
                <div style={{ position: 'absolute', left: `${p * 100}%`, transform: 'translateX(-50%)', width: 16, height: 16, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 5px rgba(0,0,0,0.5)', pointerEvents: 'none' }} />
              </div>
            </div>
          </div>

          <div className="row gap10" style={{ marginTop: 4 }}>
            <button style={{ flex: 1, border: 'none', background: 'var(--lime)', color: 'var(--bark)', fontFamily: 'inherit', fontWeight: 800, fontSize: 15, padding: '15px', borderRadius: 14, cursor: 'pointer' }}>Compartir vídeo</button>
            <button style={{ width: 54, border: '1.5px solid var(--nline)', background: 'transparent', borderRadius: 14, display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
              <Icon name="share" size={20} color={cream} />
            </button>
          </div>

          <div style={{ fontSize: 11, color: muted, lineHeight: 1.5 }}>
            La animación es real (se calcula sobre la curva SVG con <code>getPointAtLength</code>) — podés
            arrastrar la línea de tiempo. Las fotos y la ruta son de ejemplo; con datos reales, cada foto se
            ubicaría en su coordenada GPS exacta dentro del trayecto grabado.
          </div>
        </div>
      </div>
    </div>
  );
}
