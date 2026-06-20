import { useEffect, useRef, useState } from 'react';

/* useWakeLock — evita que la pantalla se apague sola mientras `active` es true,
   usando la Screen Wake Lock API nativa del navegador. Esto es clave durante
   una grabación de ruta: si la pantalla se apaga, el sistema pausa la pestaña
   y se pierden lecturas de GPS, el reloj y los avisos de voz. Mantener la
   pantalla encendida (aunque sea con brillo bajo) evita ese corte.

   No evita la pérdida de datos si el usuario cambia de app o apaga la
   pantalla manualmente con el botón físico — eso lo decide el sistema
   operativo y ninguna web puede evitarlo. */
export function useWakeLock(active) {
  const [held, setHeld] = useState(false);
  const [supported] = useState(() => typeof navigator !== 'undefined' && 'wakeLock' in navigator);
  const lockRef = useRef(null);

  useEffect(() => {
    if (!supported || !active) return;
    let cancelled = false;

    const acquire = async () => {
      try {
        const lock = await navigator.wakeLock.request('screen');
        if (cancelled) { lock.release(); return; }
        lockRef.current = lock;
        setHeld(true);
        lock.addEventListener('release', () => setHeld(false));
      } catch {
        setHeld(false);
      }
    };

    acquire();

    // Si el sistema soltó el wake lock (p. ej. al volver de cambiar de app
    // brevemente), lo volvemos a pedir en cuanto la pestaña es visible otra vez.
    const onVisible = () => {
      if (document.visibilityState === 'visible' && !lockRef.current) acquire();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisible);
      if (lockRef.current) {
        lockRef.current.release().catch(() => {});
        lockRef.current = null;
      }
      setHeld(false);
    };
  }, [active, supported]);

  return { supported, held };
}
