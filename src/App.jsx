import { useEffect, useState } from 'react';
import { Icon } from './atoms';
import VariantA from './VariantA';
import VariantB from './VariantB';
import VariantC from './VariantC';
import Dashboard from './Dashboard';
import LiveHRScreen from './LiveHR';
import { ActiveMapScreen, ActiveCockpitScreen, PairScreen } from './ActiveRide';
import { ProfileDataScreen, TrainingPlanScreen } from './Profile';
import { ActivePhotoScreen, PhotoReplayScreen } from './Photos';
import RecordRide from './RecordRide';
import RealSummary from './RealSummary';
import ActivityHistory from './ActivityHistory';
import { listActivities, deleteActivity, backendStatus } from './activityStore';
import { loadProfile, saveProfile } from './profileStore';

/* ───────────────────────────────────────────────────────────────────────
   App Ciclismo — experiencia real, de pantalla completa, con navegación
   inferior fija. Las "maquetas / bocetos de diseño" originales del handoff
   quedan disponibles aparte (botón discreto), para no mezclar el producto
   real con las variantes de exploración visual.
   ─────────────────────────────────────────────────────────────────────── */

const NAV = [
  { id: 'inicio',    label: 'Inicio',    icon: 'home' },
  { id: 'pulso',     label: 'Pulso',     icon: 'heart' },
  { id: 'grabar',    label: 'Grabar',    icon: 'plus' },
  { id: 'historial', label: 'Historial', icon: 'bars' },
  { id: 'perfil',    label: 'Perfil',    icon: 'user' },
];

function BottomNav({ active, onChange }) {
  return (
    <nav className="navbar" style={{
      position: 'sticky', bottom: 0, left: 0, right: 0,
      background: 'var(--paper)', borderTop: '1px solid var(--line)',
      boxShadow: '0 -6px 24px rgba(0,0,0,0.06)', zIndex: 20,
    }}>
      {NAV.map((n) => {
        const on = active === n.id;
        return (
          <button key={n.id} onClick={() => onChange(n.id)} className="navitem"
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              color: on ? 'var(--bark)' : 'var(--stone-2)', padding: '4px 10px', borderRadius: 12,
              transition: 'color 0.15s' }}>
            <span style={{
              display: 'grid', placeItems: 'center', width: 38, height: 28, borderRadius: 10,
              background: on ? 'var(--lime)' : 'transparent', transition: 'background 0.15s',
            }}>
              <Icon name={n.icon} size={18} color={on ? 'var(--bark)' : 'var(--stone-2)'} sw={1.8} />
            </span>
            {n.label}
          </button>
        );
      })}
    </nav>
  );
}

/* ── Inicio: tablero real + acceso directo a grabar ───────────────────── */
function InicioScreen({ profile, onStart }) {
  return <Dashboard theme="light" showNav={false} profile={profile} onStart={onStart} />;
}

/* ── Pulso en vivo ─────────────────────────────────────────────────────── */
function PulsoScreen() {
  return <LiveHRScreen />;
}

/* ── Grabar: flujo real de grabación de ruta con GPS ──────────────────── */
function GrabarScreen({ profile }) {
  const [view, setView] = useState('record'); // record | summary
  const [picked, setPicked] = useState(null);
  return view === 'record' ? (
    <RecordRide profile={profile} onSaved={(act) => { setPicked(act); setView('summary'); }} />
  ) : (
    <RealSummary activity={picked} onBack={() => setView('record')} />
  );
}

/* ── Historial real (backend / localStorage) ──────────────────────────── */
function HistorialScreen() {
  const [activities, setActivities] = useState([]);
  const [selected, setSelected] = useState(null);
  const [backendUp, setBackendUp] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    const [up, list] = await Promise.all([backendStatus(), listActivities()]);
    setBackendUp(up);
    setActivities(list);
    setLoading(false);
  };

  useEffect(() => { refresh(); }, []);

  const handleDelete = async (id) => {
    await deleteActivity(id);
    if (selected?.id === id) setSelected(null);
    refresh();
  };

  if (selected) return <RealSummary activity={selected} onBack={() => setSelected(null)} />;

  return (
    <div style={{ position: 'relative', height: '100%' }}>
      <ActivityHistory activities={activities} onOpen={setSelected} onDelete={handleDelete} />
      <div className="row gap8" style={{
        position: 'absolute', top: 10, left: 18, right: 18, zIndex: 5,
        fontSize: 10.5, color: 'var(--stone)', fontWeight: 600,
        background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 10, padding: '6px 10px',
      }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: backendUp ? 'var(--lime-deep)' : 'var(--clay)', flexShrink: 0 }} />
        <span>
          {backendUp === null ? 'comprobando servidor…'
            : backendUp ? 'conectado al servidor (Express + SQLite)'
            : 'sin servidor — guardando en este dispositivo'}
          {!loading && ` · ${activities.length} actividad${activities.length === 1 ? '' : 'es'}`}
        </span>
      </div>
    </div>
  );
}

/* ── Perfil · IMC · plan de entrenamiento ──────────────────────────────── */
function PerfilScreen({ profile, onChange }) {
  const [screen, setScreen] = useState('datos'); // datos | plan
  return screen === 'datos'
    ? <ProfileDataScreen profile={profile} onChange={onChange} onSeePlan={() => setScreen('plan')} />
    : <TrainingPlanScreen profile={profile} onChange={onChange} onBack={() => setScreen('datos')} />;
}

/* ───────────────────────────────────────────────────────────────────────
   Bocetos de diseño — las variantes y exploraciones visuales del handoff
   original, agrupadas en una vista aparte para no mezclarlas con la app.
   ─────────────────────────────────────────────────────────────────────── */

const VARIANTS = [
  { id: 'a', label: 'A · Sendero', sub: 'Clara · tonos tierra', Comp: VariantA },
  { id: 'b', label: 'B · Cabina', sub: 'Oscura · datos con brillo', Comp: VariantB },
  { id: 'c', label: 'C · Editorial', sub: 'Tipografía a gran escala', Comp: VariantC },
];

const ACTIVE_VARIANTS = [
  { id: 'mapa', label: 'Mapa dominante', Comp: ActiveMapScreen },
  { id: 'cifras', label: 'Cabina de cifras', Comp: ActiveCockpitScreen },
  { id: 'pair', label: 'Conectar sensores', Comp: PairScreen },
];

const PHOTO_VARIANTS = [
  { id: 'capturar', label: 'Capturar fotos', Comp: ActivePhotoScreen },
  { id: 'replay', label: 'Resumen dinámico (replay)', Comp: PhotoReplayScreen },
];

const SKETCH_GROUPS = [
  { id: 'home', label: 'Pantalla de inicio (variantes A/B/C)' },
  { id: 'activa', label: 'Ruta activa (variantes)' },
  { id: 'fotos', label: 'Fotos en la ruta (variantes)' },
];

function Pill({ options, active, onChange, getLabel = (o) => o.label, getId = (o) => o.id }) {
  return (
    <div className="row gap10" style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 14, padding: 6, flexWrap: 'wrap' }}>
      {options.map((o) => (
        <button key={getId(o)} onClick={() => onChange(getId(o))} style={{
          border: 'none', cursor: 'pointer', fontFamily: 'inherit',
          padding: '9px 16px', borderRadius: 10, fontSize: 13, fontWeight: 700,
          background: active === getId(o) ? 'var(--bark)' : 'transparent',
          color: active === getId(o) ? 'var(--lime)' : 'var(--bark)',
          transition: 'background 0.15s, color 0.15s',
        }}>{getLabel(o)}</button>
      ))}
    </div>
  );
}

function SketchesView({ onClose }) {
  const [group, setGroup] = useState('home');
  const [variant, setVariant] = useState('a');
  const [activeVariant, setActiveVariant] = useState('mapa');
  const [photoVariant, setPhotoVariant] = useState('capturar');

  let Screen, sub;
  if (group === 'home') {
    Screen = VARIANTS.find((v) => v.id === variant).Comp;
    sub = VARIANTS.find((v) => v.id === variant).sub + ' · datos de ejemplo';
  } else if (group === 'activa') {
    Screen = ACTIVE_VARIANTS.find((v) => v.id === activeVariant).Comp;
    sub = 'datos de ejemplo · el cronómetro corre en tiempo real';
  } else {
    Screen = PHOTO_VARIANTS.find((v) => v.id === photoVariant).Comp;
    sub = 'datos de ejemplo · el replay anima sobre la curva SVG real';
  }

  return (
    <div className="phone-stage" style={{ flexDirection: 'column', gap: 16, minHeight: '100dvh' }}>
      <div className="row gap10" style={{ alignItems: 'center' }}>
        <button onClick={onClose} className="row gap6" style={{
          border: '1px solid var(--line)', background: 'var(--paper)', cursor: 'pointer',
          padding: '9px 14px', borderRadius: 10, fontSize: 13, fontWeight: 700, color: 'var(--bark)', fontFamily: 'inherit',
        }}>
          <Icon name="back" size={16} /> Volver a la app
        </button>
        <span style={{ fontSize: 12, color: 'var(--stone)', fontWeight: 600 }}>
          Bocetos de diseño · exploraciones visuales del handoff original
        </span>
      </div>
      <Pill options={SKETCH_GROUPS} active={group} onChange={setGroup} />
      {group === 'home' && <Pill options={VARIANTS} active={variant} onChange={setVariant} />}
      {group === 'activa' && <Pill options={ACTIVE_VARIANTS} active={activeVariant} onChange={setActiveVariant} />}
      {group === 'fotos' && <Pill options={PHOTO_VARIANTS} active={photoVariant} onChange={setPhotoVariant} />}
      <div style={{ fontSize: 12, color: 'var(--stone)', fontWeight: 600 }}>{sub}</div>
      <div className="phone-frame"><Screen /></div>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────────
   App — pantalla completa real, con barra de navegación inferior fija.
   ─────────────────────────────────────────────────────────────────────── */

function App() {
  const [tab, setTab] = useState('inicio');
  const [showSketches, setShowSketches] = useState(false);
  const [profile, setProfile] = useState(() => loadProfile());

  const updateProfile = (next) => {
    setProfile(next);
    saveProfile(next);
  };

  if (showSketches) return <SketchesView onClose={() => setShowSketches(false)} />;

  return (
    <div style={{ height: '100dvh', width: '100vw', display: 'flex', flexDirection: 'column', background: 'var(--sand)', overflow: 'hidden' }}>
      <div className="scr" style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {tab === 'inicio' && <InicioScreen profile={profile} onStart={() => setTab('grabar')} />}
        {tab === 'pulso' && <PulsoScreen />}
        {tab === 'grabar' && <GrabarScreen profile={profile} />}
        {tab === 'historial' && <HistorialScreen />}
        {tab === 'perfil' && <PerfilScreen profile={profile} onChange={updateProfile} />}
      </div>
      <BottomNav active={tab} onChange={setTab} />
      <button onClick={() => setShowSketches(true)} style={{
        position: 'fixed', bottom: 78, right: 14, zIndex: 30,
        border: '1px solid var(--line)', background: 'var(--paper)', cursor: 'pointer',
        padding: '7px 12px', borderRadius: 999, fontSize: 11, fontWeight: 700,
        color: 'var(--stone)', fontFamily: 'inherit', boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
        opacity: 0.8,
      }} title="Ver las exploraciones visuales del diseño original">
        Ver bocetos de diseño
      </button>
    </div>
  );
}

export default App;
