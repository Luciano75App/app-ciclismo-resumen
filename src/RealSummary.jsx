import { useMemo } from 'react';
import { Icon } from './atoms';
import { projectToViewBox, pointsToPath, fmtClock, fmtKm } from './geo';

/* RealSummary — "Resumen de actividad" pero con datos 100% reales,
   tomados de una grabación GPS guardada (ver RecordRide / activityStore).
   Muestra honestamente qué se puede medir solo con GPS y qué falta
   (desnivel, FC, calorías → requieren altímetro y sensor de pulso). */

function Card({ children, style }) {
  return (
    <div style={{
      background: 'var(--paper)', borderRadius: 18, padding: 16,
      boxShadow: '0 1px 0 rgba(255,255,255,0.6) inset, 0 1px 2px rgba(38,34,27,0.04)',
      border: '1px solid var(--line-2)', ...style
    }}>{children}</div>
  );
}

function RouteMap({ points }) {
  const path = useMemo(() => {
    if (!points || points.length < 2) return null;
    return pointsToPath(projectToViewBox(points, 393, 196));
  }, [points]);
  return (
    <div style={{ borderRadius: 20, overflow: 'hidden', border: '1px solid var(--line)', position: 'relative', height: 196,
      background: 'linear-gradient(150deg, #e9e3d4, #ddd6c4)' }}>
      <svg viewBox="0 0 393 196" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        {path && (
          <>
            <path d={path} fill="none" stroke="rgba(0,0,0,0.18)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" transform="translate(0,2.5)" />
            <path d={path} fill="none" stroke="var(--lime)" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />
          </>
        )}
      </svg>
      <span className="ph-note" style={{ background: 'rgba(255,255,255,0.65)', color: 'var(--stone)' }}>
        traza GPS real · {points?.length || 0} puntos
      </span>
    </div>
  );
}

export default function RealSummary({ activity, onBack }) {
  const ink = 'var(--bark)', muted = 'var(--stone)';
  if (!activity) {
    return (
      <div className="scr" style={{ background: 'var(--sand)', color: ink, alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ flex: 1, display: 'grid', placeItems: 'center', padding: 24, textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>Todavía no grabaste ninguna ruta</div>
            <div style={{ fontSize: 13, color: muted }}>Andá a "Grabar ruta" para registrar una actividad real con tu GPS.</div>
          </div>
        </div>
      </div>
    );
  }

  const km = activity.distanceM / 1000;
  const hours = activity.durationMs / 3600000;
  const avgKmh = activity.avgSpeedKmh ?? (hours > 0 ? km / hours : 0);
  const date = new Date(activity.startedAt);

  return (
    <div className="scr" style={{ background: 'var(--sand)', color: ink }}>
      <div className="row between" style={{ padding: '6px 16px 10px' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
          <Icon name="back" size={22} color={ink} />
        </button>
        <span style={{ fontSize: 15, fontWeight: 700 }}>Resumen · datos reales</span>
        <Icon name="share" size={20} color={ink} />
      </div>

      <div className="scroll-area">
        <div style={{ padding: '0 16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <RouteMap points={activity.points} />

          <div>
            <div className="row gap8" style={{ marginBottom: 6 }}>
              <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                background: 'var(--lime)', color: 'var(--bark)', padding: '3px 8px', borderRadius: 20 }}>GPS real · grabada en vivo</span>
            </div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: '-0.01em' }}>{activity.name}</h1>
            <div className="row gap6" style={{ color: muted, fontSize: 13, marginTop: 4, fontWeight: 500 }}>
              <Icon name="clock" size={14} color={muted} />
              {date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })} · {date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>

          <Card style={{ padding: '18px 18px 16px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div>
              <span className="label-cap" style={{ color: muted }}>Distancia</span>
              <div className="vu" style={{ gap: 6, marginTop: 4 }}>
                <span className="num" style={{ fontSize: 56, color: ink }}>{fmtKm(activity.distanceM)}</span>
                <span className="num" style={{ fontSize: 22, color: 'var(--lime-deep)' }}>km</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span className="label-cap" style={{ color: muted }}>Tiempo</span>
              <div className="num" style={{ fontSize: 28, color: ink, marginTop: 4 }}>{fmtClock(activity.durationMs)}</div>
            </div>
          </Card>

          <Card>
            <div className="label-cap" style={{ color: muted, marginBottom: 12 }}>Métricas medidas con GPS</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 10px' }}>
              <div>
                <div className="row gap6" style={{ color: muted, marginBottom: 6 }}>
                  <Icon name="gauge" size={15} color={muted} />
                  <span className="label-cap" style={{ color: muted, fontSize: 9.5 }}>Vel. media</span>
                </div>
                <div className="vu" style={{ gap: 3 }}>
                  <span className="num" style={{ fontSize: 26, color: ink }}>{avgKmh.toFixed(1)}</span>
                  <span className="num" style={{ fontSize: 12, color: muted }}>km/h</span>
                </div>
              </div>
              <div>
                <div className="row gap6" style={{ color: muted, marginBottom: 6 }}>
                  <Icon name="route" size={15} color={muted} />
                  <span className="label-cap" style={{ color: muted, fontSize: 9.5 }}>Puntos GPS</span>
                </div>
                <div className="vu" style={{ gap: 3 }}>
                  <span className="num" style={{ fontSize: 26, color: ink }}>{activity.points?.length || 0}</span>
                </div>
              </div>
              {activity.elevation && (
                <>
                  <div>
                    <div className="row gap6" style={{ color: muted, marginBottom: 6 }}>
                      <Icon name="mountain" size={15} color={muted} />
                      <span className="label-cap" style={{ color: muted, fontSize: 9.5 }}>Desnivel +</span>
                    </div>
                    <div className="vu" style={{ gap: 3 }}>
                      <span className="num" style={{ fontSize: 26, color: ink }}>{activity.elevation.gainM}</span>
                      <span className="num" style={{ fontSize: 12, color: muted }}>m</span>
                    </div>
                  </div>
                  <div>
                    <div className="row gap6" style={{ color: muted, marginBottom: 6 }}>
                      <Icon name="mountain" size={15} color={muted} style={{ transform: 'scaleY(-1)' }} />
                      <span className="label-cap" style={{ color: muted, fontSize: 9.5 }}>Desnivel −</span>
                    </div>
                    <div className="vu" style={{ gap: 3 }}>
                      <span className="num" style={{ fontSize: 26, color: ink }}>{activity.elevation.lossM}</span>
                      <span className="num" style={{ fontSize: 12, color: muted }}>m</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </Card>

          {activity.estCalories ? (
            <Card style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--sand-2)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <Icon name="flame" size={22} color="var(--clay)" fill="var(--clay)" sw={0} />
              </span>
              <div style={{ flex: 1 }}>
                <span className="label-cap" style={{ color: muted }}>Calorías · estimación</span>
                <div className="vu" style={{ gap: 6, marginTop: 2 }}>
                  <span className="num" style={{ fontSize: 28, color: ink }}>{activity.estCalories.toLocaleString('es')}</span>
                  <span className="num" style={{ fontSize: 13, color: muted }}>kcal</span>
                </div>
              </div>
            </Card>
          ) : null}

          {activity.heartRate ? (
            <Card>
              <div className="row between" style={{ marginBottom: 12 }}>
                <span className="label-cap" style={{ color: muted }}>Frecuencia cardíaca · sensor BLE real</span>
                <span style={{ fontSize: 11, color: muted, fontWeight: 600 }}>{activity.heartRate.device}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 10px' }}>
                <div>
                  <div className="row gap6" style={{ color: muted, marginBottom: 6 }}>
                    <Icon name="heart" size={15} color="var(--clay)" />
                    <span className="label-cap" style={{ color: muted, fontSize: 9.5 }}>FC media</span>
                  </div>
                  <div className="vu" style={{ gap: 3 }}>
                    <span className="num" style={{ fontSize: 26, color: ink }}>{activity.heartRate.avgBpm}</span>
                    <span className="num" style={{ fontSize: 12, color: muted }}>ppm</span>
                  </div>
                </div>
                <div>
                  <div className="row gap6" style={{ color: muted, marginBottom: 6 }}>
                    <Icon name="bolt" size={15} color="var(--clay)" />
                    <span className="label-cap" style={{ color: muted, fontSize: 9.5 }}>FC máx</span>
                  </div>
                  <div className="vu" style={{ gap: 3 }}>
                    <span className="num" style={{ fontSize: 26, color: ink }}>{activity.heartRate.maxBpm}</span>
                    <span className="num" style={{ fontSize: 12, color: muted }}>ppm</span>
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 10.5, color: muted, marginTop: 10 }}>
                {activity.heartRate.samples.length} lecturas reales del sensor (Web Bluetooth · GATT Heart Rate Service 0x180D)
              </div>
            </Card>
          ) : (
            <Card style={{ background: 'var(--sand-2)', border: '1px dashed var(--line)' }}>
              <div className="row gap8" style={{ color: muted, fontSize: 13 }}>
                <Icon name="heart" size={16} color={muted} />
                Sin datos de pulso — no conectaste un sensor Bluetooth durante esta grabación.
              </div>
            </Card>
          )}

          {!activity.elevation && (
            <Card style={{ background: 'var(--sand-2)', border: '1px dashed var(--line)' }}>
              <div className="row gap8" style={{ color: muted, fontSize: 13 }}>
                <Icon name="mountain" size={16} color={muted} />
                Esta grabación no tiene datos de desnivel — tu GPS no reportó altitud con suficiente
                precisión durante la salida (algunos celulares no traen barómetro).
              </div>
            </Card>
          )}

          <Card style={{ background: 'var(--sand-2)', border: '1px dashed var(--line)' }}>
            <div className="label-cap" style={{ color: muted, marginBottom: 8 }}>Aún no disponible (requiere otro sensor)</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, color: muted }}>
              <div className="row gap8"><Icon name="cadence" size={16} color={muted} /> Cadencia — necesita un sensor en la biela/pedalier</div>
            </div>
            <div style={{ fontSize: 10.5, color: muted, marginTop: 10, lineHeight: 1.4 }}>
              El desnivel viene de la altitud reportada por tu GPS y las calorías son una estimación con el
              método MET (velocidad media + tu peso + desnivel) — el mismo enfoque que usan la mayoría de
              relojes deportivos sin medidor de potencia.
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
