/* atoms.jsx — piezas compartidas de la pantalla "Resumen de actividad"
   Recreadas a partir del prototipo de diseño (atoms.jsx del handoff). */

// ── Iconos de línea minimalistas (afordancias de UI, no ilustración) ──
const ICON_PATHS = {
  back:    'M13 4l-6 6 6 6',
  share:   'M6 10v6a1 1 0 001 1h6a1 1 0 001-1v-6 M10 12V3 M7 6l3-3 3 3',
  more:    'M5 10h.01 M10 10h.01 M15 10h.01',
  heart:   'M10 16s-6-3.7-6-8a3.2 3.2 0 016-1.4A3.2 3.2 0 0116 8c0 4.3-6 8-6 8z',
  clock:   'M10 5v5l3 2 M10 17a7 7 0 100-14 7 7 0 000 14z',
  mountain:'M3 16l4.5-8 3 4 2.5-4L17 16z',
  flame:   'M10 17c2.8 0 4.5-1.9 4.5-4.4 0-2.6-2-3.8-1.6-6.6-1.9.8-3.2 2.2-3.2 4.1 0 .7-.6 1-1 .6-.6-.6-.9-1.5-.8-2.5C6.4 9 5.5 10.7 5.5 12.6 5.5 15.1 7.2 17 10 17z',
  gauge:   'M10 17a7 7 0 110-14 7 7 0 010 14z M10 10l3-2.5',
  bolt:    'M11 3l-6 8h4l-1 6 6-8h-4z',
  check:   'M4 10.5l4 4 8-9',
  trophy:  'M6 4h8v3a4 4 0 01-8 0V4z M6 6H4v1a2 2 0 002 2 M14 6h2v1a2 2 0 01-2 2 M8 13h4 M10 11v2 M7 16h6',
  home:    'M4 9l6-5 6 5v7a1 1 0 01-1 1h-3v-5H8v5H5a1 1 0 01-1-1z',
  map:     'M3 5l4.5-1.5L12.5 5 17 3.5v12L12.5 17 7.5 15.5 3 17z M7.5 4v11.5 M12.5 5v11.5',
  plus:    'M10 4v12 M4 10h12',
  user:    'M10 10a3 3 0 100-6 3 3 0 000 6z M4 17c0-3 2.7-5 6-5s6 2 6 5',
  cadence: 'M10 17a7 7 0 110-14 7 7 0 010 14z M10 7v3l2 2',
  signal:  'M3 14h2v3H3z M7.5 10h2v7h-2z M12 6h2v11h-2z',
  wifi:    'M2 7c4.5-4 11.5-4 16 0 M5 10c2.8-2.4 7.2-2.4 10 0 M8 13c1.1-1 2.9-1 4 0 M10 16h.01',
  pin:     'M10 17s5-4.6 5-8.5A5 5 0 005 8.5C5 12.4 10 17 10 17z M10 8.5h.01',
  route:   'M6 16a2 2 0 100-4 2 2 0 000 4z M14 8a2 2 0 100-4 2 2 0 000 4z M14 6h-4a4 4 0 00-4 4',
  bars:    'M5 16V9 M10 16V4 M15 16v-5',
  camera:  'M3 7h2.4l1-2h5.2l1 2H16a1 1 0 011 1v6a1 1 0 01-1 1H3a1 1 0 01-1-1V8a1 1 0 011-1z M10 13.2a2.4 2.4 0 100-4.8 2.4 2.4 0 000 4.8z',
  watch:   'M7 4.5h6 M7 15.5h6 M6 7a4 4 0 118 0v6a4 4 0 11-8 0z',
};

export function Icon({ name, size = 18, color = 'currentColor', sw = 1.7, fill = 'none', style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill={fill} stroke={color}
      strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d={ICON_PATHS[name]} />
    </svg>
  );
}

// ── Status bar Android ──
export function StatusBar({ color = 'var(--bark)', time = '7:42' }) {
  return (
    <div className="statusbar" style={{ color }}>
      <span>{time}</span>
      <span className="sb-icons">
        <Icon name="signal" size={15} sw={0} fill={color} />
        <Icon name="wifi" size={15} color={color} sw={1.6} />
        <svg width="22" height="15" viewBox="0 0 24 15" fill="none">
          <rect x="1" y="3" width="19" height="9" rx="2.5" stroke={color} strokeWidth="1.4" opacity="0.5"/>
          <rect x="3" y="5" width="13" height="5" rx="1" fill={color}/>
          <rect x="21" y="5.5" width="2" height="4" rx="1" fill={color} opacity="0.5"/>
        </svg>
      </span>
    </div>
  );
}

const ROUTE_D = 'M40 178 C 64 150, 56 112, 96 104 C 132 97, 150 128, 188 116 C 224 104, 214 64, 252 58 C 292 52, 296 96, 322 110 C 344 122, 366 132, 352 150';

/* ── Mapa de ruta — placeholder estilizado (NO cartografía real) ──
   Fondo tierra + curvas de nivel suaves (CSS) + traza GPS. */
export function MapHero({ theme = 'light', height = 230, route = ROUTE_D, rounded = 0, label = true, live = false, children }) {
  const dark = theme === 'dark';
  const baseA = dark ? '#23211a' : '#e9e3d4';
  const baseB = dark ? '#1b1913' : '#ddd6c4';
  const contour = dark ? 'rgba(243,239,227,0.05)' : 'rgba(38,34,27,0.055)';
  const water = dark ? '#1d2622' : '#dfe6dc';
  return (
    <div style={{
      position: 'relative', height, width: '100%', overflow: 'hidden', borderRadius: rounded,
      background: `radial-gradient(120% 90% at 78% 18%, ${water} 0%, transparent 42%),
                   linear-gradient(150deg, ${baseA}, ${baseB})`,
    }}>
      <div style={{ position: 'absolute', inset: -20, opacity: dark ? 0.9 : 1,
        backgroundImage: `repeating-radial-gradient(60% 80% at 30% 70%, transparent 0 17px, ${contour} 17px 18.5px)` }} />
      <div style={{ position: 'absolute', inset: -20,
        backgroundImage: `repeating-radial-gradient(70% 60% at 80% 25%, transparent 0 22px, ${contour} 22px 23.5px)` }} />
      <svg viewBox="0 0 393 230" preserveAspectRatio="xMidYMid slice"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <path d={route} fill="none" stroke={dark ? 'rgba(0,0,0,0.35)' : 'rgba(0,0,0,0.18)'} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" transform="translate(0,2.5)"/>
        <path d={route} fill="none" stroke="var(--lime)" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="40" cy="178" r="7" fill="var(--lime)" stroke={dark ? '#16140f' : '#fff'} strokeWidth="3"/>
        {live ? (
          <g transform="translate(352,150)">
            <circle r="16" fill="#2b6fff" opacity="0.25" />
            <circle r="9" fill="#2b6fff" stroke="#fff" strokeWidth="3"/>
            <circle r="3.2" fill="#fff"/>
          </g>
        ) : (
          <g transform="translate(352,150)">
            <rect x="-6" y="-6" width="12" height="12" rx="2.5" fill={dark ? '#16140f' : '#26221b'} stroke="var(--lime)" strokeWidth="2.4" transform="rotate(45)"/>
          </g>
        )}
      </svg>
      {children}
      {label && (
        <span className="ph-note" style={{
          background: dark ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.65)',
          color: dark ? 'var(--ash)' : 'var(--stone)' }}>mapa · ruta GPS</span>
      )}
    </div>
  );
}

// ── Perfil de elevación (área, viz de datos) ──
const ELEV_TOP = 'M0 78 L24 70 L52 84 L84 44 L120 56 L150 30 L186 52 L226 36 L268 62 L300 22 L338 48 L372 30 L393 50';
export function ElevationChart({ w = 353, h = 96, color = 'var(--clay)', fill, grid }) {
  return (
    <svg viewBox={`0 0 393 96`} width={w} height={h} preserveAspectRatio="none" style={{ display: 'block' }}>
      {grid && [24, 48, 72].map((y) => (
        <line key={y} x1="0" y1={y} x2="393" y2={y} stroke={grid} strokeWidth="1" strokeDasharray="2 4"/>
      ))}
      <path d={`${ELEV_TOP} L393 96 L0 96 Z`} fill={fill || 'rgba(194,100,59,0.14)'} />
      <path d={ELEV_TOP} fill="none" stroke={color} strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round"/>
    </svg>
  );
}

// ── Zonas de frecuencia cardíaca (barras horizontales) ──
const HR_ZONES = [
  { z: 'Z1', name: 'Recuperación', pct: 8,  min: '7 min' },
  { z: 'Z2', name: 'Aeróbico',     pct: 22, min: '21 min' },
  { z: 'Z3', name: 'Tempo',        pct: 41, min: '40 min' },
  { z: 'Z4', name: 'Umbral',       pct: 23, min: '23 min' },
  { z: 'Z5', name: 'Máximo',       pct: 6,  min: '6 min' },
];
export function HRZones({ track = 'var(--line-2)', muted = 'var(--stone)', ink = 'var(--bark)' }) {
  const intens = ['#cfe6a0', '#bfe04e', 'var(--lime)', 'var(--lime-deep)', 'var(--clay)'];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
      {HR_ZONES.map((z, i) => (
        <div key={z.z} className="row gap10">
          <span className="num" style={{ fontSize: 14, width: 22, color: muted }}>{z.z}</span>
          <div style={{ flex: 1, height: 9, borderRadius: 5, background: track, overflow: 'hidden' }}>
            <div style={{ width: `${z.pct}%`, height: '100%', borderRadius: 5, background: intens[i] }} />
          </div>
          <span style={{ fontSize: 11, color: muted, width: 46, textAlign: 'right', fontWeight: 600 }}>{z.min}</span>
        </div>
      ))}
    </div>
  );
}

// ── Parciales (splits) ──
const SPLITS = [
  { km: '0–10',  spd: 27.4, t: '21:54', best: false },
  { km: '10–20', spd: 24.1, t: '24:53', best: false },
  { km: '20–30', spd: 28.9, t: '20:46', best: true  },
  { km: '30–40', spd: 25.6, t: '23:26', best: false },
  { km: '40–42.6', spd: 22.0, t: '07:22', best: false },
];
export function SplitRow({ s, max = 30, track, muted, ink }) {
  return (
    <div className="row gap10" style={{ padding: '7px 0' }}>
      <span className="num" style={{ fontSize: 17, width: 54, color: ink }}>{s.km}<span style={{ fontSize: 10, color: muted }}> km</span></span>
      <div style={{ flex: 1, height: 8, borderRadius: 4, background: track, overflow: 'hidden' }}>
        <div style={{ width: `${(s.spd / max) * 100}%`, height: '100%', borderRadius: 4,
          background: s.best ? 'var(--lime)' : muted, opacity: s.best ? 1 : 0.45 }} />
      </div>
      <span className="num" style={{ fontSize: 16, width: 52, textAlign: 'right', color: ink }}>{s.spd.toFixed(1)}</span>
      <span style={{ fontSize: 11, color: muted, width: 44, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{s.t}</span>
    </div>
  );
}

export { SPLITS, HR_ZONES };
