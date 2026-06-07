import { useEffect, useState } from 'react';
import { Icon, StatusBar, MapHero } from './atoms';
import { zoneFor } from './LiveHR';

/* ActiveRide — "Ruta activa": 3 pantallas (mapa dominante, cabina de
   cifras, emparejar sensores). Recreación visual del prototipo
   ActiveRide.jsx con datos de ejemplo y un cronómetro real (setInterval). */

function useTimer(start) {
  const [s, setS] = useState(start);
  useEffect(() => { const id = setInterval(() => setS((x) => x + 1), 1000); return () => clearInterval(id); }, []);
  const hh = String(Math.floor(s / 3600)).padStart(2, '0');
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

function TopChips() {
  const ink = 'var(--cream)';
  const chip = (children, key) => (
    <div key={key} className="row gap6" style={{ background: 'rgba(0,0,0,0.34)', backdropFilter: 'blur(8px)', padding: '6px 11px', borderRadius: 30, fontSize: 11.5, fontWeight: 700, color: ink }}>{children}</div>
  );
  return (
    <div className="row between" style={{ padding: '4px 16px' }}>
      {chip([<span key="d" style={{ width: 8, height: 8, borderRadius: 4, background: '#ff5a3c' }} />, <span key="t">GRABANDO</span>], 'rec')}
      <div className="row gap8">
        {chip([<Icon key="i" name="pin" size={13} color="var(--lime)" />, <span key="t">GPS</span>], 'gps')}
        {chip([<Icon key="w" name="watch" size={14} color="var(--cream)" />, <span key="d" style={{ width: 7, height: 7, borderRadius: 4, background: 'var(--lime)' }} />], 'watch')}
      </div>
    </div>
  );
}

function RideControls({ accent = 'var(--lime)' }) {
  return (
    <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', padding: '0 8px' }}>
      <button style={{ width: 62, height: 62, borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.06)', color: 'var(--cream)', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em' }}>VUELTA</span>
      </button>
      <button style={{ width: 86, height: 86, borderRadius: '50%', border: 'none', background: accent, color: '#15140f', display: 'grid', placeItems: 'center', cursor: 'pointer', boxShadow: '0 8px 28px rgba(200,242,48,0.4)' }}>
        <span style={{ display: 'flex', gap: 5 }}><span style={{ width: 7, height: 26, background: '#15140f', borderRadius: 2 }} /><span style={{ width: 7, height: 26, background: '#15140f', borderRadius: 2 }} /></span>
      </button>
      <button style={{ width: 62, height: 62, borderRadius: '50%', border: '1.5px solid rgba(255,90,60,0.4)', background: 'rgba(255,90,60,0.12)', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
        <span style={{ width: 22, height: 22, background: '#ff5a3c', borderRadius: 5 }} />
      </button>
    </div>
  );
}

function Metric({ value, unit, label, color = 'var(--cream)', big }) {
  const muted = 'rgba(255,255,255,0.5)';
  return (
    <div>
      <div className="vu" style={{ gap: 4 }}>
        <span className="num" style={{ fontSize: big ? 56 : 34, color, lineHeight: 0.9 }}>{value}</span>
        <span className="num" style={{ fontSize: big ? 18 : 13, color: muted }}>{unit}</span>
      </div>
      <div className="label-cap" style={{ color: muted, marginTop: 5, fontSize: 9.5 }}>{label}</div>
    </div>
  );
}

export function ActiveMapScreen() {
  const t = useTimer(2892);
  const z = zoneFor(138);
  return (
    <div className="scr" style={{ background: 'var(--night)', color: 'var(--cream)' }}>
      <div style={{ position: 'relative', flex: '1 1 auto' }}>
        <MapHero theme="dark" height={520} rounded={0} label={false} live={true} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
          <StatusBar color="var(--cream)" />
          <TopChips />
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 120, background: 'linear-gradient(transparent, var(--night))' }} />
      </div>
      <div style={{ background: 'var(--night)', padding: '4px 20px 20px', marginTop: -8 }}>
        <div style={{ width: 38, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.18)', margin: '0 auto 18px' }} />
        <div className="row between" style={{ alignItems: 'flex-start', marginBottom: 20 }}>
          <Metric value="21.4" unit="km" label="Distancia" big />
          <div style={{ textAlign: 'right' }}>
            <div className="num" style={{ fontSize: 34, lineHeight: 0.9 }}>{t}</div>
            <div className="label-cap" style={{ color: 'rgba(255,255,255,0.5)', marginTop: 6, fontSize: 9.5 }}>Tiempo</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, paddingTop: 18, borderTop: '1px solid var(--nline)', marginBottom: 22 }}>
          <Metric value="27.3" unit="km/h" label="Velocidad" />
          <div>
            <div className="vu" style={{ gap: 4 }}>
              <span className="num" style={{ fontSize: 34, color: z.accent, lineHeight: 0.9 }}>138</span>
              <span className="num" style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>ppm</span>
            </div>
            <div className="row gap6" style={{ marginTop: 5 }}>
              <span style={{ width: 7, height: 7, borderRadius: 4, background: z.accent }} />
              <span className="label-cap" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 9.5 }}>{z.key} · {z.name}</span>
            </div>
          </div>
          <Metric value="+412" unit="m" label="Desnivel" />
        </div>
        <RideControls />
      </div>
    </div>
  );
}

export function ActiveCockpitScreen() {
  const t = useTimer(2892);
  const z = zoneFor(138);
  const muted = 'rgba(255,255,255,0.5)';
  return (
    <div className="scr" style={{ background: 'var(--night)', color: 'var(--cream)' }}>
      <StatusBar color="var(--cream)" />
      <TopChips />
      <div className="scroll-area">
        <div style={{ padding: '8px 22px 0', display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ textAlign: 'center', paddingTop: 22 }}>
            <span className="label-cap" style={{ color: muted, letterSpacing: '0.2em' }}>Velocidad</span>
            <div className="vu" style={{ justifyContent: 'center', gap: 8, marginTop: 2 }}>
              <span className="num" style={{ fontSize: 128, lineHeight: 0.82 }}>31.4</span>
              <span className="num" style={{ fontSize: 26, color: 'var(--lime)' }}>km/h</span>
            </div>
            <span style={{ fontSize: 12, color: muted, fontWeight: 600 }}>media 27.3 · máx 54.8 km/h</span>
          </div>
          <div style={{ margin: '24px 0 18px', borderRadius: 14, padding: '14px 16px', background: z.deep, border: `1px solid ${z.accent}`, transition: 'background 0.6s' }}>
            <div className="row between">
              <div className="row gap10">
                <Icon name="heart" size={22} color={z.accent} fill={z.accent} sw={0} />
                <div>
                  <div className="vu" style={{ gap: 4 }}>
                    <span className="num" style={{ fontSize: 36, color: z.accent, lineHeight: 0.9 }}>138</span>
                    <span className="num" style={{ fontSize: 13, color: muted }}>ppm</span>
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--cream)' }}>{z.key} · {z.name}</div>
                <div className="label-cap" style={{ color: muted, fontSize: 9.5, marginTop: 3 }}>75% de tu FC máx</div>
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '22px 12px' }}>
            <div style={{ borderRight: '1px solid var(--nline)' }}><Metric value={t} unit="" label="Tiempo" /></div>
            <Metric value="21.4" unit="km" label="Distancia" />
            <div style={{ borderRight: '1px solid var(--nline)' }}><Metric value="86" unit="rpm" label="Cadencia" /></div>
            <Metric value="+412" unit="m" label="Desnivel" />
          </div>
          <div style={{ flex: '1 1 auto', minHeight: 14 }} />
          <div style={{ paddingBottom: 18 }}><RideControls /></div>
        </div>
      </div>
    </div>
  );
}

export function PairScreen() {
  const muted = 'rgba(255,255,255,0.52)';
  const rows = [
    { ic: 'watch', name: 'Reloj GPS', sub: 'Pulso · GPS · navegación', state: 'connected', batt: 82 },
    { ic: 'heart', name: 'Banda de pulso', sub: 'Sensor en el pecho', state: 'connecting' },
    { ic: 'cadence', name: 'Sensor de cadencia', sub: 'Biela · rpm', state: 'add' },
    { ic: 'gauge', name: 'Potenciómetro', sub: 'Vatios', state: 'add' },
  ];
  return (
    <div className="scr" style={{ background: 'var(--night)', color: 'var(--cream)' }}>
      <div style={{ position: 'absolute', inset: 0, opacity: 0.5 }}>
        <MapHero theme="dark" height={852} rounded={0} label={false} live={true} />
      </div>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(22,20,15,0.4), rgba(22,20,15,0.75) 40%, var(--night) 78%)' }} />
      <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <StatusBar color="var(--cream)" />
        <div className="row" style={{ padding: '6px 18px', gap: 14 }}>
          <Icon name="back" size={22} color="var(--cream)" />
          <span style={{ fontSize: 15, fontWeight: 700 }}>Antes de empezar</span>
        </div>
        <div style={{ flex: '1 1 auto' }} />
        <div style={{ background: 'var(--night-2)', borderRadius: '24px 24px 0 0', padding: '8px 20px 22px', borderTop: '1px solid var(--nline)' }}>
          <div style={{ width: 38, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.18)', margin: '0 auto 16px' }} />
          <div className="row between" style={{ marginBottom: 4 }}>
            <h2 style={{ margin: 0, fontSize: 21, fontWeight: 800 }}>Conectar sensores</h2>
            <span className="row gap6" style={{ fontSize: 11.5, color: 'var(--lime)', fontWeight: 700 }}>
              <span style={{ width: 7, height: 7, borderRadius: 4, background: 'var(--lime)' }} /> Buscando…
            </span>
          </div>
          <p style={{ margin: '0 0 14px', fontSize: 12.5, color: muted, lineHeight: 1.4 }}>
            Vincula tu reloj para registrar las pulsaciones y avisarte al cambiar de zona durante la ruta.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {rows.map((r, i) => (
              <div key={i} className="row between" style={{ background: 'var(--panel)', borderRadius: 14, padding: '12px 14px', border: r.state === 'connected' ? '1px solid rgba(200,242,48,0.35)' : '1px solid var(--nline)' }}>
                <div className="row gap12">
                  <div style={{ width: 40, height: 40, borderRadius: 11, background: 'var(--panel-2)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                    <Icon name={r.ic} size={20} color={r.state === 'connected' ? 'var(--lime)' : 'var(--cream)'} />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{r.name}</div>
                    <div style={{ fontSize: 11, color: muted, marginTop: 1 }}>{r.sub}</div>
                  </div>
                </div>
                {r.state === 'connected' && (
                  <div className="row gap8">
                    <span className="row gap6" style={{ fontSize: 11, color: muted, fontWeight: 600 }}>
                      <svg width="20" height="12" viewBox="0 0 24 14" fill="none"><rect x="1" y="2" width="18" height="10" rx="2.5" stroke="var(--lime)" strokeWidth="1.3" /><rect x="3" y="4" width="13" height="6" rx="1" fill="var(--lime)" /><rect x="20" y="4.5" width="2" height="4" rx="1" fill="var(--lime)" /></svg>
                      {r.batt}%
                    </span>
                    <span style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--lime)', display: 'grid', placeItems: 'center' }}>
                      <Icon name="check" size={16} color="#15140f" sw={2.6} />
                    </span>
                  </div>
                )}
                {r.state === 'connecting' && <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--lime)' }}>Vinculando…</span>}
                {r.state === 'add' && (
                  <span style={{ width: 30, height: 30, borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.22)', display: 'grid', placeItems: 'center' }}>
                    <Icon name="plus" size={18} color="var(--cream)" sw={2} />
                  </span>
                )}
              </div>
            ))}
          </div>
          <button style={{ width: '100%', border: 'none', background: 'var(--lime)', color: '#15140f', fontFamily: 'inherit', fontWeight: 800, fontSize: 16, padding: '16px', borderRadius: 15, cursor: 'pointer', marginTop: 16, boxShadow: '0 6px 22px rgba(200,242,48,0.3)' }}>
            Empezar a grabar
          </button>
          <button style={{ width: '100%', border: 'none', background: 'transparent', color: muted, fontFamily: 'inherit', fontWeight: 600, fontSize: 13, padding: '12px', cursor: 'pointer' }}>
            Continuar sin sensores
          </button>
        </div>
      </div>
    </div>
  );
}
