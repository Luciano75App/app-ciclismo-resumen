import { useState } from 'react';
import { Icon, StatusBar } from './atoms';
import { initials } from './profileStore';

/* Profile — Datos personales · IMC · Plan de entrenamiento personal.
   Cálculos reales de IMC, metabolismo basal (Mifflin-St Jeor) y FC máx
   (220 − edad), sobre el perfil real del usuario — editable y persistido
   en este dispositivo (ver profileStore.js). Exporta ProfileDataScreen y
   TrainingPlanScreen, ambas reciben `profile` y `onChange`. */

export function imcVal(kg, cm) { return kg / ((cm / 100) ** 2); }
export function imcCat(imc) {
  if (imc < 18.5) return { name: 'Bajo peso', color: '#5fa3c9', i: 0 };
  if (imc < 25) return { name: 'Saludable', color: '#5fa37a', i: 1 };
  if (imc < 30) return { name: 'Sobrepeso', color: 'var(--clay)', i: 2 };
  return { name: 'Obesidad', color: '#c0453b', i: 3 };
}
export function bmr({ sex, kg, cm, age }) {
  const base = 10 * kg + 6.25 * cm - 5 * age;
  return Math.round(sex === 'H' ? base + 5 : base - 161);
}
export function fcMax(age) { return 220 - age; }

function Segmented({ options, value, onChange, muted, line, active = 'var(--bark)', activeInk = '#fff' }) {
  return (
    <div className="row" style={{ background: line, borderRadius: 13, padding: 4, gap: 4 }}>
      {options.map((o) => {
        const on = o.v === value;
        return (
          <button key={o.v} onClick={() => onChange(o.v)} style={{
            flex: 1, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
            background: on ? active : 'transparent', color: on ? activeInk : muted,
            fontWeight: 700, fontSize: 13.5, padding: '10px 6px', borderRadius: 10,
            transition: 'all .18s', whiteSpace: 'nowrap',
          }}>{o.label}</button>
        );
      })}
    </div>
  );
}

function FieldSlider({ icon, label, value, unit, min, max, onChange, ink, muted, track, accent = 'var(--bark)' }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="row between" style={{ marginBottom: 9, alignItems: 'flex-end' }}>
        <span className="row gap8" style={{ color: muted, fontSize: 13, fontWeight: 600 }}>
          <Icon name={icon} size={16} color={muted} /> {label}
        </span>
        <span className="vu" style={{ gap: 6, alignItems: 'baseline' }}>
          <span className="num" style={{ fontSize: 30, color: ink }}>{value}</span>
          <span className="num" style={{ fontSize: 13, color: muted }}>{unit}</span>
        </span>
      </div>
      <input className="effort" type="range" min={min} max={max} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: '100%', color: accent, background: `linear-gradient(90deg, ${accent} ${pct}%, ${track} ${pct}%)` }} />
    </div>
  );
}

const T = { bg: 'var(--sand)', card: 'var(--paper)', card2: 'var(--sand-2)', ink: 'var(--bark)', muted: 'var(--stone)', line: 'var(--line-2)', track: 'var(--sand-2)' };
const Card = ({ children, style, pad = 18 }) => (
  <div style={{ background: T.card, borderRadius: 18, padding: pad, border: `1px solid ${T.line}`, ...style }}>{children}</div>
);

export function ProfileDataScreen({ profile, onChange, onSeePlan }) {
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(profile.name);
  const [draftEmail, setDraftEmail] = useState(profile.email);

  const set = (patch) => onChange({ ...profile, ...patch });
  const { sex, age, cm, kg } = profile;

  const saveContact = () => {
    set({ name: draftName.trim() || 'Tu nombre', email: draftEmail.trim() });
    setEditing(false);
  };

  const imc = imcVal(kg, cm);
  const cat = imcCat(imc);
  const gx = Math.max(0, Math.min(1, (imc - 15) / (37 - 15))) * 100;
  const segs = [
    { to: 18.5, c: '#5fa3c9' }, { to: 25, c: '#5fa37a' }, { to: 30, c: 'var(--clay)' }, { to: 37, c: '#c0453b' },
  ];

  return (
    <div className="scr" style={{ background: T.bg, color: T.ink }}>
      <StatusBar color={T.ink} />
      <div className="scroll-area">
        <div style={{ padding: '6px 16px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="row between" style={{ marginTop: 2 }}>
            <div className="row gap10">
              <span style={{ width: 38, height: 38, borderRadius: 12, background: T.card, border: `1px solid ${T.line}`, display: 'grid', placeItems: 'center' }}>
                <Icon name="back" size={20} color={T.ink} />
              </span>
              <div>
                <div className="label-cap" style={{ color: T.muted }}>Perfil</div>
                <h1 style={{ margin: '1px 0 0', fontSize: 23, fontWeight: 800, letterSpacing: '-0.01em' }}>Datos personales</h1>
              </div>
            </div>
            <Icon name="more" size={22} color={T.muted} />
          </div>

          <div style={{ fontSize: 13.5, color: T.muted, fontWeight: 500, lineHeight: 1.45, marginTop: -4 }}>
            Con estos datos calculamos tu <b style={{ color: T.ink }}>IMC</b> y diseñamos tu plan de entrenamiento personalizado.
            Movés los controles y los resultados se recalculan al instante (Mifflin-St Jeor / Tanaka).
          </div>

          <Card pad={14} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {editing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div>
                  <div className="label-cap" style={{ color: T.muted, marginBottom: 5 }}>Nombre</div>
                  <input value={draftName} onChange={(e) => setDraftName(e.target.value)}
                    placeholder="Tu nombre" style={{
                      width: '100%', border: `1px solid ${T.line}`, borderRadius: 10, padding: '10px 12px',
                      fontFamily: 'inherit', fontSize: 14, fontWeight: 600, color: T.ink, background: T.bg,
                    }} />
                </div>
                <div>
                  <div className="label-cap" style={{ color: T.muted, marginBottom: 5 }}>Correo</div>
                  <input value={draftEmail} onChange={(e) => setDraftEmail(e.target.value)} type="email"
                    placeholder="tu@correo.com" style={{
                      width: '100%', border: `1px solid ${T.line}`, borderRadius: 10, padding: '10px 12px',
                      fontFamily: 'inherit', fontSize: 14, fontWeight: 600, color: T.ink, background: T.bg,
                    }} />
                </div>
                <div className="row gap8">
                  <button onClick={saveContact} style={{ flex: 1, border: 'none', background: 'var(--lime)', color: 'var(--bark)', borderRadius: 10, padding: '10px 12px', fontFamily: 'inherit', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>Guardar</button>
                  <button onClick={() => { setDraftName(profile.name); setDraftEmail(profile.email); setEditing(false); }} style={{ flex: 1, border: `1px solid ${T.line}`, background: 'transparent', color: T.muted, borderRadius: 10, padding: '10px 12px', fontFamily: 'inherit', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Cancelar</button>
                </div>
              </div>
            ) : (
              <div className="row" style={{ alignItems: 'center', gap: 12 }}>
                <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'var(--lime)', color: 'var(--bark)', display: 'grid', placeItems: 'center', fontSize: 18, fontWeight: 800, flexShrink: 0 }}>{initials(profile.name)}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile.name}</div>
                  <div style={{ fontSize: 12, color: T.muted, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile.email || 'Sin correo todavía'}</div>
                </div>
                <button onClick={() => setEditing(true)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, color: 'var(--lime-deep)', fontWeight: 700, flexShrink: 0 }}>Editar</button>
              </div>
            )}
          </Card>

          <Card>
            <span className="row gap8" style={{ color: T.muted, fontSize: 13, fontWeight: 600, marginBottom: 11 }}>
              <Icon name="user" size={16} color={T.muted} /> Sexo
            </span>
            <Segmented options={[{ v: 'H', label: 'Hombre' }, { v: 'M', label: 'Mujer' }]} value={sex} onChange={(v) => set({ sex: v })} muted={T.muted} line={T.track} />
            <div style={{ fontSize: 11.5, color: T.muted, marginTop: 9, fontWeight: 500 }}>Se usa para estimar tu metabolismo basal.</div>
          </Card>

          <Card style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            <FieldSlider icon="clock" label="Edad" value={age} unit="años" min={16} max={80} onChange={(v) => set({ age: v })} ink={T.ink} muted={T.muted} track={T.track} accent="var(--bark)" />
            <FieldSlider icon="bars" label="Altura" value={cm} unit="cm" min={140} max={210} onChange={(v) => set({ cm: v })} ink={T.ink} muted={T.muted} track={T.track} accent="var(--bark)" />
            <FieldSlider icon="gauge" label="Peso" value={kg} unit="kg" min={45} max={130} onChange={(v) => set({ kg: v })} ink={T.ink} muted={T.muted} track={T.track} accent="var(--clay)" />
          </Card>

          <Card pad={18} style={{ background: 'var(--bark)', border: 'none', color: 'var(--cream)' }}>
            <div className="row between" style={{ alignItems: 'flex-start', gap: 10 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span className="label-cap" style={{ color: 'rgba(243,239,227,0.55)' }}>Tu índice de masa corporal</span>
                <div className="vu" style={{ gap: 8, alignItems: 'baseline', marginTop: 8 }}>
                  <span className="num" style={{ fontSize: 64, color: cat.color, lineHeight: 0.8 }}>{imc.toFixed(1)}</span>
                  <span className="num" style={{ fontSize: 16, color: 'rgba(243,239,227,0.5)' }}>kg/m²</span>
                </div>
              </div>
              <span style={{ background: cat.color, color: '#fff', fontSize: 11.5, fontWeight: 800, padding: '6px 11px', borderRadius: 20, marginTop: 6, whiteSpace: 'nowrap', flexShrink: 0 }}>{cat.name}</span>
            </div>
            <div style={{ marginTop: 18 }}>
              <div style={{ position: 'relative', display: 'flex', height: 10, borderRadius: 6, overflow: 'hidden' }}>
                {segs.map((s, i) => {
                  const from = i === 0 ? 15 : segs[i - 1].to;
                  const w = ((s.to - from) / (37 - 15)) * 100;
                  return <div key={i} style={{ width: w + '%', background: s.c, opacity: cat.i === i ? 1 : 0.4 }} />;
                })}
                <div style={{ position: 'absolute', top: -4, bottom: -4, left: `calc(${gx}% - 2px)`, width: 4, background: '#fff', borderRadius: 3, boxShadow: '0 0 0 2px rgba(0,0,0,0.4)', transition: 'left .25s' }} />
              </div>
              <div className="row between" style={{ marginTop: 7, color: 'rgba(243,239,227,0.5)', fontSize: 9.5, fontWeight: 600 }}>
                <span>18.5</span><span>25</span><span>30</span>
              </div>
            </div>
          </Card>

          <button onClick={onSeePlan} style={{ border: 'none', background: 'var(--lime)', color: 'var(--bark)', borderRadius: 16, padding: 17,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: 'inherit', marginTop: 2 }}>
            <span style={{ fontSize: 16.5, fontWeight: 800 }}>Ver mi plan personal</span>
            <Icon name="back" size={20} color="var(--bark)" sw={2.2} style={{ transform: 'scaleX(-1)' }} />
          </button>

          <div style={{ fontSize: 11, color: T.muted, lineHeight: 1.5 }}>
            IMC = peso ÷ altura² (fórmula real). Metabolismo basal estimado con Mifflin-St Jeor y FC máx con la
            fórmula clásica 220 − edad. Estos son cálculos reales sobre los datos que ingreses; lo que falta para
            ser 100% preciso es tu composición corporal real (% grasa) y una prueba de esfuerzo.
          </div>
        </div>
      </div>
    </div>
  );
}

const ACTIVITY = {
  sedentario: { label: 'Sedentario', factor: 1.30, note: 'Poco movimiento, trabajo de oficina.' },
  moderado: { label: 'Moderado', factor: 1.55, note: 'Sales a rodar varios días por semana.' },
  activo: { label: 'Activo', factor: 1.80, note: 'Entrenas casi a diario o trabajo físico.' },
};
const GOALS = {
  grasa: { label: 'Bajar grasa', factorTxt: '−500 kcal/día', deficit: 500, zoneLo: 0.60, zoneHi: 0.70, zoneName: 'Quema de grasa', focus: 'Volumen suave y constante en Z2', accent: 'var(--clay)' },
  mantener: { label: 'Mantener', factorTxt: 'equilibrio', deficit: 0, zoneLo: 0.65, zoneHi: 0.75, zoneName: 'Aeróbico', focus: 'Mezcla de rodajes y algún tempo', accent: '#5fa37a' },
  resistencia: { label: 'Resistencia', factorTxt: '+250 kcal/día', deficit: -250, zoneLo: 0.70, zoneHi: 0.85, zoneName: 'Tempo / Umbral', focus: 'Series largas y subidas', accent: 'var(--lime-deep)' },
};
const WEEK_PLAN = {
  grasa: [
    { d: 'Lun', t: 'Rodaje suave', z: 'Z2', dur: '45 min', km: '18 km' },
    { d: 'Mié', t: 'Tempo ligero', z: 'Z3', dur: '40 min', km: '16 km' },
    { d: 'Vie', t: 'Rodaje suave', z: 'Z2', dur: '50 min', km: '20 km' },
    { d: 'Sáb', t: 'Salida larga', z: 'Z2', dur: '1:40 h', km: '48 km' },
  ],
  mantener: [
    { d: 'Mar', t: 'Rodaje medio', z: 'Z2', dur: '50 min', km: '20 km' },
    { d: 'Jue', t: 'Intervalos', z: 'Z4', dur: '45 min', km: '18 km' },
    { d: 'Dom', t: 'Salida larga', z: 'Z3', dur: '2:00 h', km: '55 km' },
  ],
  resistencia: [
    { d: 'Lun', t: 'Series', z: 'Z4', dur: '55 min', km: '22 km' },
    { d: 'Mié', t: 'Subidas', z: 'Z4', dur: '1:10 h', km: '26 km' },
    { d: 'Vie', t: 'Tempo', z: 'Z3', dur: '1:00 h', km: '28 km' },
    { d: 'Dom', t: 'Fondo largo', z: 'Z3', dur: '2:40 h', km: '78 km' },
  ],
};

export function TrainingPlanScreen({ profile, onChange, onBack }) {
  const goal = profile.goal in GOALS ? profile.goal : 'mantener';
  const act = profile.activity in ACTIVITY ? profile.activity : 'moderado';
  const setGoal = (v) => onChange({ ...profile, goal: v });
  const setAct = (v) => onChange({ ...profile, activity: v });
  const p = profile;

  const g = GOALS[goal];
  const a = ACTIVITY[act];
  const basal = bmr(p);
  const diario = Math.round(basal * a.factor);
  const objetivo = diario - g.deficit;
  const fmax = fcMax(p.age);
  const zLo = Math.round(fmax * g.zoneLo);
  const zHi = Math.round(fmax * g.zoneHi);
  const week = WEEK_PLAN[goal];
  const kgSemana = (g.deficit * 7 / 7700);

  return (
    <div className="scr" style={{ background: T.bg, color: T.ink }}>
      <StatusBar color={T.ink} />
      <div className="scroll-area">
        <div style={{ padding: '6px 16px 22px', display: 'flex', flexDirection: 'column', gap: 13 }}>
          <div className="row between" style={{ marginTop: 2 }}>
            <div className="row gap10">
              <span onClick={onBack} style={{ width: 38, height: 38, borderRadius: 12, background: T.card, border: `1px solid ${T.line}`, display: 'grid', placeItems: 'center', cursor: onBack ? 'pointer' : 'default' }}>
                <Icon name="back" size={20} color={T.ink} />
              </span>
              <div>
                <div className="label-cap" style={{ color: T.muted }}>Para {p.name} · {p.kg} kg · IMC {imcVal(p.kg, p.cm).toFixed(1)}</div>
                <h1 style={{ margin: '1px 0 0', fontSize: 23, fontWeight: 800, letterSpacing: '-0.01em' }}>Tu plan personal</h1>
              </div>
            </div>
          </div>

          <div>
            <span className="label-cap" style={{ color: T.muted, marginLeft: 2 }}>¿Qué quieres conseguir?</span>
            <div style={{ marginTop: 8 }}>
              <Segmented options={Object.keys(GOALS).map((k) => ({ v: k, label: GOALS[k].label }))} value={goal} onChange={setGoal} muted={T.muted} line={T.track} active={g.accent} activeInk="#fff" />
            </div>
          </div>
          <div>
            <span className="label-cap" style={{ color: T.muted, marginLeft: 2 }}>¿Cuánto te mueves al día?</span>
            <div style={{ marginTop: 8 }}>
              <Segmented options={Object.keys(ACTIVITY).map((k) => ({ v: k, label: ACTIVITY[k].label }))} value={act} onChange={setAct} muted={T.muted} line={T.track} active="var(--bark)" activeInk="#fff" />
            </div>
            <div style={{ fontSize: 11.5, color: T.muted, marginTop: 8, fontWeight: 500, marginLeft: 2 }}>{a.note} <span style={{ color: T.ink, fontWeight: 700 }}>×{a.factor.toFixed(2)}</span></div>
          </div>

          <Card pad={18} style={{ background: 'var(--bark)', border: 'none', color: 'var(--cream)' }}>
            <div className="row between" style={{ alignItems: 'flex-start', gap: 10 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span className="label-cap" style={{ color: 'rgba(243,239,227,0.55)' }}>Tu objetivo diario de energía</span>
                <div className="vu" style={{ gap: 7, alignItems: 'baseline', marginTop: 8 }}>
                  <span className="num" style={{ fontSize: 54, color: 'var(--lime)', lineHeight: 0.8 }}>{objetivo.toLocaleString('es')}</span>
                  <span className="num" style={{ fontSize: 16, color: 'rgba(243,239,227,0.5)' }}>kcal</span>
                </div>
              </div>
              <span style={{ background: g.accent, color: '#fff', fontSize: 11.5, fontWeight: 800, padding: '6px 11px', borderRadius: 20, whiteSpace: 'nowrap', flexShrink: 0 }}>{g.factorTxt}</span>
            </div>
            {goal === 'grasa' && (
              <div className="row gap8" style={{ marginTop: 14, fontSize: 12.5, color: 'rgba(243,239,227,0.78)', fontWeight: 500, lineHeight: 1.4 }}>
                <Icon name="flame" size={16} color="var(--clay)" fill="var(--clay)" sw={0} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>Con este déficit perderás <b style={{ color: 'var(--lime)' }}>≈ {Math.abs(kgSemana).toFixed(1)} kg</b> de grasa por semana de forma sostenible.</span>
              </div>
            )}
          </Card>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Card pad={14} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span className="label-cap" style={{ color: T.muted, fontSize: 9 }}>Metabolismo basal</span>
              <div className="vu" style={{ gap: 6 }}>
                <span className="num" style={{ fontSize: 30, color: T.ink }}>{basal.toLocaleString('es')}</span>
                <span className="num" style={{ fontSize: 12, color: T.muted }}>kcal</span>
              </div>
              <span style={{ fontSize: 11, color: T.muted, fontWeight: 500 }}>En reposo, sin moverte (Mifflin-St Jeor).</span>
            </Card>
            <Card pad={14} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span className="label-cap" style={{ color: T.muted, fontSize: 9 }}>Gasto diario</span>
              <div className="vu" style={{ gap: 6 }}>
                <span className="num" style={{ fontSize: 30, color: T.ink }}>{diario.toLocaleString('es')}</span>
                <span className="num" style={{ fontSize: 12, color: T.muted }}>kcal</span>
              </div>
              <span style={{ fontSize: 11, color: T.muted, fontWeight: 500 }}>{a.label} · ×{a.factor.toFixed(2)}</span>
            </Card>
          </div>

          <Card pad={16}>
            <div className="row between" style={{ marginBottom: 12 }}>
              <span className="row gap8" style={{ color: T.ink, fontSize: 14, fontWeight: 700 }}>
                <Icon name="heart" size={17} color={g.accent} fill={g.accent} sw={0} /> Zona {g.zoneName}
              </span>
              <span className="label-cap" style={{ color: T.muted, fontSize: 9 }}>FC máx {fmax} ppm</span>
            </div>
            <div className="vu" style={{ gap: 6, alignItems: 'baseline' }}>
              <span className="num" style={{ fontSize: 40, color: T.ink }}>{zLo}–{zHi}</span>
              <span className="num" style={{ fontSize: 15, color: T.muted }}>ppm</span>
            </div>
            <div style={{ position: 'relative', height: 9, borderRadius: 5, background: T.track, marginTop: 12, overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${g.zoneLo * 100}%`, width: `${(g.zoneHi - g.zoneLo) * 100}%`, background: g.accent, borderRadius: 5 }} />
            </div>
            <div className="row between" style={{ marginTop: 6, color: T.muted, fontSize: 9.5, fontWeight: 600 }}>
              <span>50%</span><span>70%</span><span>90%</span><span>FC máx</span>
            </div>
            <div style={{ fontSize: 12.5, color: T.muted, marginTop: 11, fontWeight: 500, lineHeight: 1.45 }}>
              Pedalea aquí para quemar grasa como combustible principal. {g.focus}.
            </div>
          </Card>

          <div>
            <div className="row between" style={{ margin: '4px 2px 8px' }}>
              <span className="label-cap" style={{ color: T.muted }}>Tu semana</span>
              <span style={{ fontSize: 12, color: T.muted, fontWeight: 600 }}>{week.length} sesiones</span>
            </div>
            <Card pad={6}>
              {week.map((s, i) => (
                <div key={i} className="row gap12" style={{ padding: '11px 10px', borderTop: i ? `1px solid ${T.line}` : 'none' }}>
                  <span className="num" style={{ width: 34, fontSize: 16, color: g.accent }}>{s.d}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14.5, fontWeight: 700 }}>{s.t}</div>
                    <div className="row gap6" style={{ fontSize: 11.5, color: T.muted, fontWeight: 600, marginTop: 1 }}>
                      <span>{s.dur}</span><span style={{ opacity: 0.4 }}>·</span><span>{s.km}</span>
                    </div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 800, color: T.muted, background: T.card2, padding: '4px 9px', borderRadius: 7 }}>{s.z}</span>
                </div>
              ))}
            </Card>
          </div>

          <Card pad={16} style={{ background: 'var(--lime-soft)', border: '1px solid rgba(166,207,31,0.45)' }}>
            <span className="row gap8" style={{ color: 'var(--bark)', fontSize: 14, fontWeight: 800, marginBottom: 11 }}>
              <Icon name="check" size={17} color="var(--lime-deep)" sw={2.4} /> En cada salida
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {[
                ['clock', 'Bebe agua cada 15–20 min, aunque no tengas sed.'],
                ['flame', 'Repón energía pasada 1 h o cada 500 kcal quemadas.'],
                ['gauge', 'Mantén el pulso dentro de la zona ' + g.zoneName.toLowerCase() + '.'],
              ].map(([ic, tx], i) => (
                <div key={i} className="row gap10" style={{ alignItems: 'flex-start' }}>
                  <Icon name={ic} size={15} color="var(--bark-2)" style={{ flexShrink: 0, marginTop: 1 }} />
                  <span style={{ fontSize: 12.5, color: 'var(--bark-2)', fontWeight: 500, lineHeight: 1.35 }}>{tx}</span>
                </div>
              ))}
            </div>
          </Card>

          <div style={{ fontSize: 11, color: T.muted, lineHeight: 1.5 }}>
            Estos números son <b style={{ color: T.ink }}>cálculos reales</b> aplicados a tu perfil (Mifflin-St Jeor +
            factor de actividad − déficit/superávit del objetivo). El plan semanal y "en cada salida" son
            recomendaciones generales de ejemplo — un plan 100% a medida necesitaría tu historial real de
            entrenamientos.
          </div>
        </div>
      </div>
    </div>
  );
}
