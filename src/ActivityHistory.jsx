import { Icon, StatusBar } from './atoms';
import { fmtClock, fmtKm } from './geo';

/* ActivityHistory — lista de actividades reales guardadas localmente
   (capa de persistencia en activityStore.js / localStorage). */
export default function ActivityHistory({ activities, onOpen, onDelete }) {
  const ink = 'var(--bark)', muted = 'var(--stone)';
  return (
    <div className="scr" style={{ background: 'var(--sand)', color: ink }}>
      <StatusBar color="var(--bark)" />
      <div className="row between" style={{ padding: '6px 16px 10px' }}>
        <span style={{ fontSize: 15, fontWeight: 700 }}>Historial · actividades reales</span>
      </div>
      <div className="scroll-area">
        <div style={{ padding: '0 16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {activities.length === 0 && (
            <div style={{ padding: '40px 16px', textAlign: 'center', color: muted, fontSize: 13 }}>
              Sin actividades guardadas todavía.<br />Grabá una ruta con GPS para verla acá.
            </div>
          )}
          {activities.map((a) => (
            <div key={a.id} style={{
              background: 'var(--paper)', borderRadius: 16, padding: 14,
              border: '1px solid var(--line-2)', display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <button onClick={() => onOpen(a)} style={{ all: 'unset', cursor: 'pointer', flex: 1, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: 'var(--lime)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <Icon name="route" size={20} color="var(--bark)" sw={1.7} />
                </div>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: ink }}>{a.name}</div>
                  <div style={{ fontSize: 12, color: muted, marginTop: 2 }}>
                    {fmtKm(a.distanceM)} km · {fmtClock(a.durationMs)} · {new Date(a.startedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                  </div>
                </div>
              </button>
              <button onClick={() => onDelete(a.id)} title="Eliminar" style={{
                all: 'unset', cursor: 'pointer', width: 32, height: 32, display: 'grid', placeItems: 'center',
                borderRadius: 10, color: muted,
              }}>
                <Icon name="more" size={16} color={muted} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
