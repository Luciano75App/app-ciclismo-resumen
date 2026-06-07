import { Icon, StatusBar, MapHero, ElevationChart, HRZones, SplitRow, SPLITS } from './atoms';

/* ResumenActividad — Variante A "Sendero": clara, tonos tierra,
   ordenada y legible. La interpretación más fiel al patrón clásico
   de resumen de actividad post-ruta. */

function Card({ children, style }) {
  return (
    <div style={{
      background: 'var(--paper)', borderRadius: 18, padding: 16,
      boxShadow: '0 1px 0 rgba(255,255,255,0.6) inset, 0 1px 2px rgba(38,34,27,0.04)',
      border: '1px solid var(--line-2)', ...style
    }}>{children}</div>
  );
}

function StatCell({ icon, value, unit, label, accent, ink, muted }) {
  return (
    <div style={{ padding: '2px 2px' }}>
      <div className="row gap6" style={{ color: accent ? 'var(--lime-deep)' : muted, marginBottom: 6 }}>
        <Icon name={icon} size={15} color={accent ? 'var(--clay)' : muted} />
        <span className="label-cap" style={{ color: muted, fontSize: 9.5 }}>{label}</span>
      </div>
      <div className="vu" style={{ gap: 3 }}>
        <span className="num" style={{ fontSize: 28, color: ink }}>{value}</span>
        <span className="num" style={{ fontSize: 13, color: muted }}>{unit}</span>
      </div>
    </div>
  );
}

export default function VariantA() {
  const ink = 'var(--bark)', muted = 'var(--stone)';

  return (
    <div className="scr" style={{ background: 'var(--sand)', color: ink }}>
      <StatusBar color="var(--bark)" />

      {/* app bar */}
      <div className="row between" style={{ padding: '6px 16px 10px' }}>
        <Icon name="back" size={22} color={ink} />
        <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '0.01em' }}>Resumen</span>
        <div className="row gap12">
          <Icon name="share" size={20} color={ink} />
          <Icon name="more" size={20} color={ink} sw={2.4} />
        </div>
      </div>

      <div className="scroll-area">
        <div style={{ padding: '0 16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* mapa */}
          <div style={{ borderRadius: 20, overflow: 'hidden', border: '1px solid var(--line)' }}>
            <MapHero theme="light" height={196} rounded={0} />
          </div>

          {/* título de actividad */}
          <div>
            <div className="row gap8" style={{ marginBottom: 6 }}>
              <span style={{
                fontSize: 9.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'nowrap',
                background: 'var(--lime)', color: 'var(--bark)', padding: '3px 8px', borderRadius: 20
              }}>Ruta · Carretera</span>
            </div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, letterSpacing: '-0.01em' }}>Ruta del Embalse</h1>
            <div className="row gap6" style={{ color: muted, fontSize: 13, marginTop: 4, fontWeight: 500 }}>
              <Icon name="clock" size={14} color={muted} /> Dom 24 may · 07:42
            </div>
          </div>

          {/* hero distancia */}
          <Card style={{ padding: '18px 18px 16px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div>
              <span className="label-cap" style={{ color: muted }}>Distancia</span>
              <div className="vu" style={{ gap: 6, marginTop: 4 }}>
                <span className="num" style={{ fontSize: 62, color: ink }}>42.6</span>
                <span className="num" style={{ fontSize: 24, color: 'var(--lime-deep)' }}>km</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span className="label-cap" style={{ color: muted }}>Tiempo</span>
              <div className="num" style={{ fontSize: 30, color: ink, marginTop: 4 }}>1:38:21</div>
            </div>
          </Card>

          {/* grid de métricas */}
          <Card>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '18px 10px' }}>
              <StatCell icon="gauge"    value="26.0" unit="km/h" label="Vel. media" ink={ink} muted={muted} />
              <StatCell icon="bolt"     value="58.4" unit="km/h" label="Vel. máx"   ink={ink} muted={muted} accent />
              <StatCell icon="mountain" value="612"  unit="m"    label="Desnivel"   ink={ink} muted={muted} />
              <StatCell icon="heart"    value="148"  unit="ppm"  label="FC media"   ink={ink} muted={muted} accent />
              <StatCell icon="cadence"  value="84"   unit="rpm"  label="Cadencia"   ink={ink} muted={muted} />
              <StatCell icon="flame"    value="1240" unit="kcal" label="Calorías"   ink={ink} muted={muted} accent />
            </div>
          </Card>

          {/* perfil de elevación */}
          <Card>
            <div className="row between" style={{ marginBottom: 14 }}>
              <span className="label-cap" style={{ color: muted }}>Perfil de elevación</span>
              <span className="num" style={{ fontSize: 15, color: ink }}>+612 / −598 m</span>
            </div>
            <ElevationChart w={321} h={92} color="var(--clay)" fill="rgba(194,100,59,0.13)" grid="var(--line-2)" />
            <div className="row between" style={{ marginTop: 6, fontSize: 10.5, color: muted, fontWeight: 600 }}>
              <span>0 km</span><span>Alt. máx 384 m</span><span>42.6 km</span>
            </div>
          </Card>

          {/* zonas FC */}
          <Card>
            <div className="row between" style={{ marginBottom: 14 }}>
              <span className="label-cap" style={{ color: muted }}>Zonas de frecuencia</span>
              <span style={{ fontSize: 12, color: muted, fontWeight: 600 }}>máx <b style={{ color: ink }} className="num">176</b> ppm</span>
            </div>
            <HRZones track="var(--sand-2)" muted={muted} ink={ink} />
          </Card>

          {/* parciales */}
          <Card>
            <div className="row between" style={{ marginBottom: 6 }}>
              <span className="label-cap" style={{ color: muted }}>Parciales · vel. media</span>
              <span style={{ fontSize: 11, color: 'var(--lime-deep)', fontWeight: 700 }}>● más rápido</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {SPLITS.map((s, i) => (
                <div key={i} style={{ borderTop: i ? '1px solid var(--line-2)' : 'none' }}>
                  <SplitRow s={s} track="var(--sand-2)" muted={muted} ink={ink} />
                </div>
              ))}
            </div>
          </Card>

          {/* logros */}
          <div style={{ display: 'flex', gap: 12 }}>
            <Card style={{ flex: 1, display: 'flex', gap: 12, alignItems: 'center', padding: 14 }}>
              <div style={{ width: 38, height: 38, borderRadius: 11, background: 'var(--lime)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <Icon name="trophy" size={20} color="var(--bark)" sw={1.6} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: ink, lineHeight: 1.1 }}>Récord personal</div>
                <div style={{ fontSize: 11, color: muted, marginTop: 2 }}>Distancia más larga</div>
              </div>
            </Card>
            <Card style={{ flex: 1, display: 'flex', gap: 12, alignItems: 'center', padding: 14 }}>
              <div style={{ width: 38, height: 38, borderRadius: 11, background: 'var(--sand-2)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <Icon name="bolt" size={20} color="var(--clay)" sw={1.6} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: ink, lineHeight: 1.1 }}>2º mejor</div>
                <div style={{ fontSize: 11, color: muted, marginTop: 2 }}>Subida del Mirador</div>
              </div>
            </Card>
          </div>

          {/* acciones */}
          <div className="row gap10" style={{ marginTop: 2 }}>
            <button style={{
              flex: 1, border: 'none', background: 'var(--lime)', color: 'var(--bark)',
              fontFamily: 'inherit', fontWeight: 700, fontSize: 15, padding: '15px', borderRadius: 14, cursor: 'pointer'
            }}>
              Guardar actividad
            </button>
            <button style={{
              width: 54, border: '1.5px solid var(--line)', background: 'transparent',
              borderRadius: 14, display: 'grid', placeItems: 'center', cursor: 'pointer'
            }}>
              <Icon name="share" size={20} color={ink} />
            </button>
          </div>
        </div>
      </div>

      {/* nav inferior */}
      <div className="navbar" style={{ background: 'var(--paper)', borderTop: '1px solid var(--line)' }}>
        {[['home', 'Inicio', 0], ['map', 'Rutas', 0], ['plus', '', 1], ['trophy', 'Retos', 0], ['user', 'Perfil', 0]].map(([ic, lb, mid], i) =>
          mid ? (
            <div key={i} style={{ width: 50, height: 50, borderRadius: 16, background: 'var(--bark)', display: 'grid', placeItems: 'center', marginTop: -22, boxShadow: '0 6px 16px rgba(38,34,27,0.25)' }}>
              <Icon name="plus" size={24} color="var(--lime)" sw={2.2} />
            </div>
          ) : (
            <div key={i} className="navitem" style={{ color: i === 1 ? 'var(--bark)' : 'var(--stone-2)' }}>
              <Icon name={ic} size={21} color={i === 1 ? 'var(--bark)' : 'var(--stone-2)'} sw={i === 1 ? 2 : 1.7} />
              <span>{lb}</span>
            </div>
          )
        )}
      </div>
    </div>
  );
}
