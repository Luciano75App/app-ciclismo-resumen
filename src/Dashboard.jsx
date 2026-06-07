import { Icon, MapHero } from './atoms';
import { initials as nameInitials } from './profileStore';

/* Dashboard — "Tablero de inicio": el hub de la app.
   Tema 'light' (Sendero) u 'dark' (Cabina). Recreado del prototipo Dashboard.jsx. */

function ProgressRing({ pct, size = 92, sw = 9, track, color = 'var(--lime)', children }) {
  const r = (size - sw) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={sw} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={sw}
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct)} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center' }}>{children}</div>
    </div>
  );
}

function Avatar({ initials, size = 30, bg, fg, ring }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: bg, color: fg,
      display: 'grid', placeItems: 'center', fontSize: size * 0.36, fontWeight: 700, flexShrink: 0,
      border: ring ? `2px solid ${ring}` : 'none', fontFamily: "'Hanken Grotesk', sans-serif"
    }}>{initials}</div>
  );
}

function todayLabel() {
  const d = new Date();
  const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  return `${dias[d.getDay()]}, ${d.getDate()} de ${meses[d.getMonth()]}`;
}

export default function Dashboard({ theme = 'light', showNav = true, profile, onStart }) {
  const dark = theme === 'dark';
  const name = profile?.name?.trim() || 'ciclista';
  const firstName = name.split(/\s+/)[0];
  const ini = profile ? nameInitials(profile.name) : 'M';
  const T = dark ? {
    bg: 'var(--night)', card: 'var(--panel)', card2: 'var(--panel-2)', ink: 'var(--cream)',
    muted: 'var(--ash)', line: 'var(--nline)', track: 'rgba(255,255,255,0.10)', navBg: 'var(--night-2)',
    navOff: 'var(--ash-2)', mapTheme: 'dark',
  } : {
    bg: 'var(--sand)', card: 'var(--paper)', card2: 'var(--sand-2)', ink: 'var(--bark)',
    muted: 'var(--stone)', line: 'var(--line-2)', track: 'var(--sand-2)', navBg: 'var(--paper)',
    navOff: 'var(--stone-2)', mapTheme: 'light',
  };

  function Card({ children, style, pad = 16 }) {
    return <div style={{ background: T.card, borderRadius: 18, padding: pad, border: `1px solid ${T.line}`, ...style }}>{children}</div>;
  }

  return (
    <div className="scr" style={{ background: T.bg, color: T.ink }}>

      <div className="scroll-area">
        <div style={{ padding: '8px 16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* encabezado */}
          <div className="row between" style={{ marginTop: 2 }}>
            <div>
              <div style={{ fontSize: 13, color: T.muted, fontWeight: 600 }}>{todayLabel()}</div>
              <h1 style={{ margin: '2px 0 0', fontSize: 26, fontWeight: 700, letterSpacing: '-0.01em' }}>Hola, {firstName}</h1>
            </div>
            <div className="row gap10">
              <div style={{ width: 40, height: 40, borderRadius: 12, background: T.card, border: `1px solid ${T.line}`, display: 'grid', placeItems: 'center', position: 'relative' }}>
                <Icon name="heart" size={19} color={T.ink} />
                <span style={{ position: 'absolute', top: 8, right: 9, width: 7, height: 7, borderRadius: 4, background: 'var(--lime)', border: `1.5px solid ${T.card}` }} />
              </div>
              <Avatar initials={ini} size={40} bg="var(--lime)" fg="var(--bark)" />
            </div>
          </div>

          {/* CTA empezar */}
          <button onClick={onStart} style={{
            border: 'none', background: 'var(--lime)', color: 'var(--bark)', borderRadius: 18, padding: 18,
            cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            boxShadow: dark ? '0 8px 26px rgba(200,242,48,0.22)' : 'none', fontFamily: 'inherit'
          }}>
            <div>
              <div style={{ fontSize: 21, fontWeight: 800, letterSpacing: '-0.01em' }}>Empezar a pedalear</div>
              <div style={{ fontSize: 12.5, fontWeight: 600, opacity: 0.65, marginTop: 2 }}>Grabá tu ruta con GPS real</div>
            </div>
            <span style={{ width: 50, height: 50, borderRadius: '50%', background: 'var(--bark)', display: 'grid', placeItems: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="var(--lime)"><path d="M6 4l11 6-11 6z" /></svg>
            </span>
          </button>

          {/* meta semanal */}
          <Card pad={18}>
            <div className="row between" style={{ marginBottom: 16 }}>
              <span className="label-cap" style={{ color: T.muted }}>Tu meta semanal</span>
              <span style={{ fontSize: 12, color: 'var(--lime-deep)', fontWeight: 700 }}>4 de 5 días ✓</span>
            </div>
            <div className="row gap10" style={{ gap: 18 }}>
              <ProgressRing pct={0.72} track={T.track}>
                <div>
                  <div className="num" style={{ fontSize: 26, color: T.ink, lineHeight: 0.9 }}>72<span style={{ fontSize: 13 }}>%</span></div>
                </div>
              </ProgressRing>
              <div style={{ flex: 1 }}>
                <div className="vu" style={{ gap: 6, alignItems: 'baseline' }}>
                  <span className="num" style={{ fontSize: 40, color: T.ink }}>86</span>
                  <span className="num" style={{ fontSize: 18, color: T.muted }}>/ 120 km</span>
                </div>
                <div style={{ fontSize: 12.5, color: T.muted, marginTop: 2, fontWeight: 500 }}>Te faltan <b style={{ color: T.ink }}>34 km</b> esta semana</div>
                <div style={{ height: 7, borderRadius: 4, background: T.track, marginTop: 10, overflow: 'hidden' }}>
                  <div style={{ width: '72%', height: '100%', borderRadius: 4, background: 'var(--lime)' }} />
                </div>
              </div>
            </div>
          </Card>

          {/* stats rápidas */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            {[['flame', '5', 'sem', 'Racha'], ['map', '312', 'km', 'Este mes'], ['mountain', '4.8', 'k m', 'Subido']].map(([ic, v, u, l], i) => (
              <Card key={i} pad={13} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Icon name={ic} size={17} color="var(--clay)" />
                <div className="vu" style={{ gap: 3 }}>
                  <span className="num" style={{ fontSize: 25, color: T.ink }}>{v}</span>
                  <span className="num" style={{ fontSize: 11, color: T.muted }}>{u}</span>
                </div>
                <span className="label-cap" style={{ color: T.muted, fontSize: 8.5 }}>{l}</span>
              </Card>
            ))}
          </div>

          {/* última ruta */}
          <div>
            <div className="row between" style={{ margin: '4px 2px 8px' }}>
              <span className="label-cap" style={{ color: T.muted }}>Tu última ruta</span>
              <span style={{ fontSize: 12, color: T.muted, fontWeight: 600 }}>Ver todas</span>
            </div>
            <Card pad={0} style={{ overflow: 'hidden' }}>
              <div style={{ height: 124, position: 'relative' }}>
                <MapHero theme={T.mapTheme} height={124} rounded={0} label={false} />
                <span style={{ position: 'absolute', top: 10, left: 12, fontSize: 9.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'var(--lime)', color: 'var(--bark)', padding: '3px 8px', borderRadius: 20 }}>Carretera</span>
              </div>
              <div style={{ padding: 14 }}>
                <div className="row between" style={{ alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700 }}>Ruta del Embalse</div>
                    <div style={{ fontSize: 12, color: T.muted, marginTop: 1, fontWeight: 500 }}>Hoy · 07:42</div>
                  </div>
                  <Icon name="back" size={20} color={T.muted} style={{ transform: 'scaleX(-1)' }} />
                </div>
                <div className="row" style={{ gap: 22, marginTop: 12 }}>
                  {[['42.6', 'km'], ['1:38', 'h'], ['612', 'm ↑'], ['148', 'ppm']].map(([v, u], i) => (
                    <div key={i}>
                      <div className="vu" style={{ gap: 3 }}>
                        <span className="num" style={{ fontSize: 22, color: T.ink }}>{v}</span>
                        <span className="num" style={{ fontSize: 11, color: T.muted }}>{u}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* reto de la semana */}
          <Card pad={16} style={{ background: dark ? 'var(--panel)' : 'var(--bark)', color: dark ? T.ink : 'var(--cream)', border: dark ? `1px solid ${T.line}` : 'none' }}>
            <div className="row between" style={{ marginBottom: 12 }}>
              <span className="row gap8" style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--lime)' }}>
                <Icon name="trophy" size={14} color="var(--lime)" /> Reto del club
              </span>
              <span style={{ fontSize: 11, color: 'rgba(243,239,227,0.6)', fontWeight: 600 }}>Termina en 3 días</span>
            </div>
            <div className="row between" style={{ alignItems: 'flex-end' }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: dark ? T.ink : '#fff' }}>Subida al Mirador</div>
                <div className="row" style={{ marginTop: 12, alignItems: 'center' }}>
                  <div className="row" style={{ marginRight: 10 }}>
                    {[['JL', '#c2643b'], ['AN', '#5fa37a'], ['RM', '#8b7bd8']].map(([ini, c], i) => (
                      <div key={i} style={{ marginLeft: i ? -10 : 0 }}><Avatar initials={ini} size={30} bg={c} fg="#fff" ring={dark ? 'var(--panel)' : 'var(--bark)'} /></div>
                    ))}
                    <div style={{ marginLeft: -10 }}><Avatar initials="+14" size={30} bg="rgba(255,255,255,0.16)" fg="#fff" ring={dark ? 'var(--panel)' : 'var(--bark)'} /></div>
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="vu" style={{ justifyContent: 'flex-end', gap: 4 }}>
                  <span className="num" style={{ fontSize: 38, color: 'var(--lime)' }}>2º</span>
                </div>
                <span className="label-cap" style={{ color: 'rgba(243,239,227,0.6)', fontSize: 9 }}>de 18 · vas a tope</span>
              </div>
            </div>
          </Card>

          {/* ruta sugerida */}
          <div>
            <div className="row between" style={{ margin: '4px 2px 8px' }}>
              <span className="label-cap" style={{ color: T.muted }}>Sugerida para ti</span>
              <span style={{ fontSize: 12, color: T.muted, fontWeight: 600 }}>Explorar</span>
            </div>
            <Card pad={14} style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: 14, overflow: 'hidden', flexShrink: 0, border: `1px solid ${T.line}` }}>
                <MapHero theme={T.mapTheme} height={64} rounded={0} label={false} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700 }}>Vuelta a la Sierra</div>
                <div className="row gap8" style={{ marginTop: 4, color: T.muted, fontSize: 12, fontWeight: 600 }}>
                  <span>58 km</span><span style={{ opacity: 0.4 }}>·</span><span>+940 m</span><span style={{ opacity: 0.4 }}>·</span>
                  <span style={{ color: 'var(--clay)' }}>Exigente</span>
                </div>
              </div>
              <span style={{ width: 36, height: 36, borderRadius: '50%', background: T.card2, display: 'grid', placeItems: 'center' }}>
                <Icon name="back" size={18} color={T.ink} style={{ transform: 'scaleX(-1)' }} />
              </span>
            </Card>
          </div>

        </div>
      </div>

      {/* nav inferior (oculto cuando la app real ya provee su propia barra) */}
      {showNav && <div className="navbar" style={{ background: T.navBg, borderTop: `1px solid ${dark ? 'var(--nline)' : 'var(--line)'}` }}>
        {[['home', 'Inicio'], ['map', 'Rutas'], ['plus', ''], ['trophy', 'Retos'], ['user', 'Perfil']].map(([ic, lb], i) =>
          ic === 'plus' ? (
            <div key={i} style={{ width: 50, height: 50, borderRadius: 16, background: dark ? 'var(--lime)' : 'var(--bark)', display: 'grid', placeItems: 'center', marginTop: -22, boxShadow: dark ? '0 6px 16px rgba(200,242,48,0.3)' : '0 6px 16px rgba(38,34,27,0.25)' }}>
              <Icon name="plus" size={24} color={dark ? 'var(--bark)' : 'var(--lime)'} sw={2.2} />
            </div>
          ) : (
            <div key={i} className="navitem" style={{ color: i === 0 ? (dark ? 'var(--lime)' : 'var(--bark)') : T.navOff }}>
              <Icon name={ic} size={21} color={i === 0 ? (dark ? 'var(--lime)' : 'var(--bark)') : T.navOff} sw={i === 0 ? 2 : 1.7} />
              <span>{lb}</span>
            </div>
          )
        )}
      </div>}
    </div>
  );
}
