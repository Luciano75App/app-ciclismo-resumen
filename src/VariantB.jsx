import { Icon, StatusBar, MapHero, ElevationChart, HRZones, SplitRow, SPLITS } from './atoms';

/* VariantB — "Cabina": modo oscuro cálido, datos con brillo lima,
   mapa a sangre con degradado. Sensación de panel/cabina de datos. */

function Panel({ children, style }) {
  return (
    <div style={{
      background: 'var(--panel)', borderRadius: 18, padding: 16,
      border: '1px solid var(--nline)', ...style
    }}>{children}</div>
  );
}

const glow = '0 0 22px rgba(200,242,48,0.35)';

export default function VariantB() {
  const ink = 'var(--cream)', muted = 'var(--ash)';

  return (
    <div className="scr" style={{ background: 'var(--night)', color: ink }}>
      {/* mapa a sangre con título superpuesto */}
      <div style={{ position: 'relative' }}>
        <MapHero theme="dark" height={296} rounded={0} label={false}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(180deg, rgba(22,20,15,0.55) 0%, transparent 22%, transparent 52%, var(--night) 99%)'
          }} />
        </MapHero>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
          <StatusBar color="var(--cream)" />
          <div className="row between" style={{ padding: '4px 16px' }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(8px)', display: 'grid', placeItems: 'center' }}>
              <Icon name="back" size={22} color="var(--cream)" />
            </div>
            <div className="row gap8">
              <div style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(8px)', display: 'grid', placeItems: 'center' }}>
                <Icon name="share" size={19} color="var(--cream)" />
              </div>
              <div style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(8px)', display: 'grid', placeItems: 'center' }}>
                <Icon name="more" size={19} color="var(--cream)" sw={2.4} />
              </div>
            </div>
          </div>
        </div>
        <div style={{ position: 'absolute', bottom: 14, left: 20, right: 20 }}>
          <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--lime)' }}>Ruta · Carretera</span>
          <h1 style={{ margin: '4px 0 0', fontSize: 27, fontWeight: 700, letterSpacing: '-0.01em', color: '#fff' }}>Ruta del Embalse</h1>
          <div className="row gap6" style={{ color: 'rgba(243,239,227,0.75)', fontSize: 12.5, marginTop: 3, fontWeight: 500 }}>
            <Icon name="clock" size={13} color="rgba(243,239,227,0.75)" /> Dom 24 may · 07:42
          </div>
        </div>
      </div>

      <div className="scroll-area">
        <div style={{ padding: '14px 16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* trío hero con brillo */}
          <Panel style={{ display: 'flex', justifyContent: 'space-between', padding: '18px 8px' }}>
            {[['42.6', 'km', 'Distancia'], ['1:38', 'h', 'Tiempo móvil'], ['26.0', 'km/h', 'Vel. media']].map(([v, u, l], i) => (
              <div key={i} style={{ flex: 1, textAlign: 'center', borderLeft: i ? '1px solid var(--nline)' : 'none' }}>
                <div className="vu" style={{ justifyContent: 'center', gap: 3 }}>
                  <span className="num" style={{ fontSize: 38, color: 'var(--lime)', textShadow: glow }}>{v}</span>
                  <span className="num" style={{ fontSize: 14, color: muted }}>{u}</span>
                </div>
                <div className="label-cap" style={{ color: muted, marginTop: 5, fontSize: 9 }}>{l}</div>
              </div>
            ))}
          </Panel>

          {/* fila secundaria */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[['mountain', '612', 'm', 'Desnivel +', 'var(--lime)'],
              ['bolt', '58.4', 'km/h', 'Vel. máx', 'var(--lime)'],
              ['heart', '148', 'ppm', 'FC media', 'var(--clay)'],
              ['flame', '1240', 'kcal', 'Calorías', 'var(--clay)']].map(([ic, v, u, l, c], i) => (
              <Panel key={i} style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 11, background: 'var(--panel-2)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <Icon name={ic} size={18} color={c} />
                </div>
                <div>
                  <div className="vu" style={{ gap: 3 }}>
                    <span className="num" style={{ fontSize: 25, color: ink }}>{v}</span>
                    <span className="num" style={{ fontSize: 12, color: muted }}>{u}</span>
                  </div>
                  <div className="label-cap" style={{ color: muted, fontSize: 8.5, marginTop: 2 }}>{l}</div>
                </div>
              </Panel>
            ))}
          </div>

          {/* elevación */}
          <Panel>
            <div className="row between" style={{ marginBottom: 14 }}>
              <span className="label-cap" style={{ color: muted }}>Perfil de elevación</span>
              <span className="num" style={{ fontSize: 14, color: ink }}>Alt. máx 384 m</span>
            </div>
            <ElevationChart w={321} h={92} color="var(--lime)" fill="rgba(200,242,48,0.12)" grid="var(--nline-2)" />
          </Panel>

          {/* zonas FC */}
          <Panel>
            <div className="row between" style={{ marginBottom: 14 }}>
              <span className="label-cap" style={{ color: muted }}>Zonas de frecuencia</span>
              <span style={{ fontSize: 12, color: muted, fontWeight: 600 }}>máx <b className="num" style={{ color: 'var(--lime)' }}>176</b> ppm</span>
            </div>
            <HRZones track="var(--panel-2)" muted={muted} ink={ink} />
          </Panel>

          {/* parciales */}
          <Panel>
            <div className="row between" style={{ marginBottom: 4 }}>
              <span className="label-cap" style={{ color: muted }}>Parciales · vel. media</span>
              <span style={{ fontSize: 11, color: 'var(--lime)', fontWeight: 700 }}>● más rápido</span>
            </div>
            {SPLITS.map((s, i) => (
              <div key={i} style={{ borderTop: i ? '1px solid var(--nline-2)' : 'none' }}>
                <SplitRow s={s} track="var(--panel-2)" muted={muted} ink={ink} />
              </div>
            ))}
          </Panel>

          {/* logros */}
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1, borderRadius: 16, padding: 14, background: 'linear-gradient(135deg, var(--lime), var(--lime-deep))', color: 'var(--bark)' }}>
              <Icon name="trophy" size={20} color="var(--bark)" sw={1.7} />
              <div style={{ fontSize: 13, fontWeight: 800, marginTop: 8, lineHeight: 1.1 }}>Récord personal</div>
              <div style={{ fontSize: 11, opacity: 0.7, marginTop: 1 }}>Distancia más larga</div>
            </div>
            <div style={{ flex: 1, borderRadius: 16, padding: 14, background: 'var(--panel)', border: '1px solid var(--nline)' }}>
              <Icon name="bolt" size={20} color="var(--lime)" sw={1.7} />
              <div style={{ fontSize: 13, fontWeight: 800, marginTop: 8, lineHeight: 1.1, color: ink }}>2º mejor tiempo</div>
              <div style={{ fontSize: 11, color: muted, marginTop: 1 }}>Subida del Mirador</div>
            </div>
          </div>

          {/* CTA */}
          <button style={{
            border: 'none', background: 'var(--lime)', color: 'var(--bark)', fontFamily: 'inherit',
            fontWeight: 800, fontSize: 15, padding: '16px', borderRadius: 15, cursor: 'pointer', marginTop: 2, boxShadow: glow
          }}>
            Guardar actividad
          </button>
        </div>
      </div>

      {/* nav inferior */}
      <div className="navbar" style={{ background: 'var(--night-2)', borderTop: '1px solid var(--nline)' }}>
        {[['home', 'Inicio'], ['map', 'Rutas'], ['plus', ''], ['trophy', 'Retos'], ['user', 'Perfil']].map(([ic, lb], i) =>
          ic === 'plus' ? (
            <div key={i} style={{ width: 50, height: 50, borderRadius: 16, background: 'var(--lime)', display: 'grid', placeItems: 'center', marginTop: -22, boxShadow: glow }}>
              <Icon name="plus" size={24} color="var(--bark)" sw={2.2} />
            </div>
          ) : (
            <div key={i} className="navitem" style={{ color: i === 1 ? 'var(--lime)' : 'var(--ash-2)' }}>
              <Icon name={ic} size={21} color={i === 1 ? 'var(--lime)' : 'var(--ash-2)'} sw={i === 1 ? 2 : 1.7} />
              <span>{lb}</span>
            </div>
          )
        )}
      </div>
    </div>
  );
}
