import { useEffect, useRef, useState } from 'react';

/* useVoiceCoach — locutor por voz en vivo durante la grabación de una ruta.
   Usa la Web Speech API (SpeechSynthesis), 100% nativa del navegador,
   sin servicios externos. Anuncia, con datos REALES de la grabación:

     1) cada kilómetro recorrido → distancia, pulso real (si hay sensor) y
        calorías quemadas (estimación MET, igual que el resto de la app)
     2) recordatorios de hidratación cada cierto tiempo de actividad
     3) avisos para reponer energía (comer algo) cuando las calorías
        quemadas superan un umbral — el umbral se ajusta según tu IMC
        (perfil real, calculado en Profile.jsx)

   No hay nada inventado: sólo lee los valores que ya calcula/mide la app
   y los lee en voz alta en el momento justo. */

function imcOf(profile) {
  if (!profile?.kg || !profile?.cm) return null;
  return profile.kg / ((profile.cm / 100) ** 2);
}

export function useVoiceCoach({ enabled, active, distanceM = 0, elapsedMs = 0, bpm, kcal = 0, profile, hydrationMinutes = 15 }) {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const [lastMessage, setLastMessage] = useState('');
  const lastKm = useRef(0);
  const lastHydrationSlot = useRef(0);
  const lastMealKcal = useRef(0);

  const speak = (text) => {
    if (!supported) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'es-ES';
      u.rate = 1.0;
      u.pitch = 1.0;
      window.speechSynthesis.speak(u);
    } catch { /* algunos navegadores móviles bloquean si no hubo gesto del usuario */ }
    setLastMessage(text);
  };

  // Reinicia contadores al empezar una nueva grabación.
  useEffect(() => {
    if (active && elapsedMs < 1500) {
      lastKm.current = 0;
      lastHydrationSlot.current = 0;
      lastMealKcal.current = 0;
    }
  }, [active, elapsedMs]);

  useEffect(() => {
    if (!enabled || !supported || !active) return;

    // 1) Cada kilómetro recorrido (datos reales: GPS + sensor BLE + estimación MET)
    const km = Math.floor(distanceM / 1000);
    if (km > lastKm.current) {
      lastKm.current = km;
      const parts = [`Llevás ${km} kilómetro${km === 1 ? '' : 's'} recorridos.`];
      if (bpm) parts.push(`Tu pulso real es de ${bpm} pulsaciones por minuto.`);
      if (kcal) parts.push(`Calorías quemadas hasta ahora: ${kcal}.`);
      speak(parts.join(' '));
      return;
    }

    // 2) Hidratación — cada N minutos de actividad
    const slot = Math.floor(elapsedMs / 60000 / hydrationMinutes);
    if (slot > 0 && slot !== lastHydrationSlot.current) {
      lastHydrationSlot.current = slot;
      speak('Recordatorio: tomá un trago de agua, aunque no sientas sed todavía.');
      return;
    }

    // 3) Reposición de energía — umbral de calorías ajustado según tu IMC real
    if (kcal > 0) {
      const imc = imcOf(profile);
      let threshold = 250; // kcal base entre avisos
      if (imc != null) {
        if (imc < 18.5) threshold = 190;       // bajo peso → reponer antes
        else if (imc >= 30) threshold = 320;   // obesidad → espaciar más los avisos de comer
        else if (imc >= 25) threshold = 280;   // sobrepeso
      }
      if (kcal - lastMealKcal.current >= threshold) {
        lastMealKcal.current = kcal;
        speak(`Ya quemaste ${kcal} calorías. Es un buen momento para comer algo liviano, como una fruta o una barrita de cereal, y reponer energía.`);
      }
    }
  }, [enabled, supported, active, distanceM, elapsedMs, bpm, kcal, profile, hydrationMinutes]);

  // Si se apaga el coach, corta cualquier locución en curso.
  useEffect(() => {
    if (!enabled && supported) window.speechSynthesis.cancel();
  }, [enabled, supported]);

  return { supported, lastMessage, speak };
}
