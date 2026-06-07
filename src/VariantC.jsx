import { Icon, StatusBar, MapHero, ElevationChart, SPLITS } from './atoms';

/* VariantC — "Editorial": tipografía condensada a gran escala, ritmo
   asimétrico, lima como bloque de color. Expresiva, tipo revista. */

function Rule() {
  return <div style={{ height: 1, background: 'var(--bark)', opacity: 0.14 }} />;
}

function Kicker({ children, color }) {
  return (
    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', whiteSpace: 'nowrap', color: color || 'var(--stone)' }}>{children}</span>
  );
}

export default function VariantC() {
  const ink = 'var(--bark)', muted = 'var(--stone)';

  return (
    <div className="scr" style={{ background: 'var(--sand)', color: ink }}>
      <StatusBar color="var(--bark)" />
      <div className="row between" style={{ padding: '6px 22px 4px' }}>
        <Icon name="back" size={22} color={ink} />
        <Kicker color={muted}>Resumen</Kicker>
        <Icon name="share" size={20} color={ink} />
      </div>

      <div className="scroll-area">
        <div style={{ padding: '8px 22px 22px' }}>
          {/* kicker */}
          <div className="row between" style={{ alignItems: 'baseline', marginBottom: 2 }}>
            <Kicker color="var(--clay)">Ruta · Carretera</Kicker>
            <Kicker color={muted}>Dom 24 may · 07:42</Kicker>
          </div>
          <h1 className="semi" style={{ margin: '5px 0 6px', fontSize: 30, fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1 }}>
            Ruta del Embalse
          </h1>

          {/* número héroe */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginTop: 6 }}>
            <span className="num" style={{ fontSize: 132, color: ink, letterSpacing: '-0.02em' }}>42.6</span>
            <div style={{ paddingTop: 14 }}>
              <div className="num" style={{ fontSize: 30, color: 'var(--lime-deep)', lineHeight: 0.9 }}>km</div>
              <div style={{ marginTop: 4, width: 26, height: 6, background: 'var(--lime)' }} />
            </div>
          </div>
          <Kicker color={muted}>Distancia recorrida</Kicker>

          {/* tres stats en fila editorial */}
          <div style={{ marginTop: 18 }}><Rule /></div>
          <div className="row between" style={{ padding: '14px 0' }}>
            {[['1:38:21', 'En movimiento'], ['26.0', 'Vel. media · km/h'], ['58.4', 'Vel. máx · km/h']].map(([v, l], i) => (
              <div key={i} style={{ flex: 1, borderLeft: i ? '1px solid rgba(38,34,27,0.14)' : 'none', paddingLeft: i ? 14 : 0 }}>
                <div className="num" style={{ fontSize: 30, color: ink }}>{v}</div>
                <Kicker color={muted}>{l}</Kicker>
              </div>
            ))}
          </div>

          {/* banda lima */}
          <div style={{ background: 'var(--lime)', borderRadius: 16, padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '6px 0 18px' }}>
            <div>
              <div className="num" style={{ fontSize: 46, color: 'var(--bark)', lineHeight: 0.9 }}>1240</div>
              <Kicker color="rgba(38,34,27,0.6)">Calorías quemadas</Kicker>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="num" style={{ fontSize: 46, color: 'var(--bark)', lineHeight: 0.9 }}>612<span style={{ fontSize: 22 }}>m</span></div>
              <Kicker color="rgba(38,34,27,0.6)">Desnivel positivo</Kicker>
            </div>
          </div>

          {/* mapa, tira enmarcada */}
          <Kicker color={muted}>El recorrido</Kicker>
          <div style={{ borderRadius: 14, overflow: 'hidden', marginTop: 8, border: '1px solid var(--line)' }}>
            <MapHero theme="light" height={168} rounded={0} label={false} />
          </div>

          {/* terreno */}
          <div className="row between" style={{ alignItems: 'baseline', margin: '22px 0 2px' }}>
            <Kicker color={muted}>El terreno</Kicker>
            <span className="num" style={{ fontSize: 16, color: ink }}>Alt. máx 384 m</span>
          </div>
          <Rule />
          <div style={{ padding: '12px 0 2px' }}>
            <ElevationChart w={349} h={88} color="var(--clay)" fill="rgba(194,100,59,0.13)" />
          </div>

          {/* por tramos */}
          <div style={{ margin: '20px 0 2px' }}><Kicker color={muted}>Por tramos · km/h</Kicker></div>
          <Rule />
          {SPLITS.map((s, i) => (
            <div key={i} className="row between" style={{ padding: '13px 0', borderBottom: '1px solid rgba(38,34,27,0.08)' }}>
              <span className="num" style={{ fontSize: 22, width: 80, color: s.best ? 'var(--bark)' : muted }}>{s.km}<span style={{ fontSize: 12 }}> km</span></span>
              <div style={{ flex: 1, margin: '0 14px', height: 3, background: 'rgba(38,34,27,0.08)', position: 'relative' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${(s.spd / 30) * 100}%`, background: s.best ? 'var(--lime-deep)' : 'var(--stone-2)' }} />
              </div>
              <span className="num" style={{ fontSize: 24, color: ink, width: 56, textAlign: 'right' }}>{s.spd.toFixed(1)}</span>
            </div>
          ))}

          {/* logro — declaración */}
          <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'var(--bark)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <Icon name="check" size={24} color="var(--lime)" sw={2.4} />
            </div>
            <div>
              <div className="semi" style={{ fontSize: 21, fontWeight: 700, lineHeight: 0.95 }}>Récord personal</div>
              <Kicker color={muted}>Tu salida más larga hasta hoy</Kicker>
            </div>
          </div>

          {/* CTA */}
          <button style={{
            width: '100%', border: 'none', background: 'var(--bark)', color: 'var(--lime)', fontFamily: "'Barlow Semi Condensed', sans-serif",
            fontWeight: 700, fontSize: 18, letterSpacing: '0.02em', padding: '16px', borderRadius: 13, cursor: 'pointer', marginTop: 26
          }}>
            GUARDAR ACTIVIDAD
          </button>
        </div>
      </div>
    </div>
  );
}
