import { useCallback, useEffect, useRef, useState } from 'react';
import { haversine } from './geo';

/* useRideRecorder — graba una ruta real con el GPS del navegador
   (navigator.geolocation.watchPosition). Acumula puntos, distancia,
   tiempo en movimiento y velocidad — sin inventar datos. */
export function useRideRecorder() {
  const [status, setStatus] = useState('idle'); // idle | recording | paused | stopped
  const [points, setPoints] = useState([]);
  const [distance, setDistance] = useState(0);   // metros
  const [elapsed, setElapsed] = useState(0);     // ms (tiempo en movimiento)
  const [speed, setSpeed] = useState(0);         // m/s, instantánea (de la API GPS)
  const [error, setError] = useState(null);
  const [supported] = useState(() => 'geolocation' in navigator);

  const watchId = useRef(null);
  const lastPoint = useRef(null);
  const tickRef = useRef(null);
  const lastTick = useRef(null);

  const onPosition = useCallback((pos) => {
    const { latitude: lat, longitude: lng, speed: spd, accuracy } = pos.coords;
    // descarta lecturas de baja precisión (>50 m) — ruido típico en interiores
    if (accuracy && accuracy > 50) return;
    const p = { lat, lng, t: pos.timestamp };
    setPoints((prev) => [...prev, p]);
    if (lastPoint.current) {
      const d = haversine(lastPoint.current, p);
      // ignora saltos absurdos (ruido GPS) — > 200 m entre lecturas consecutivas
      if (d < 200) setDistance((prev) => prev + d);
    }
    lastPoint.current = p;
    setSpeed(spd != null && spd >= 0 ? spd : 0);
  }, []);

  const onError = useCallback((err) => {
    setError(err.message || 'No se pudo acceder al GPS');
  }, []);

  const start = useCallback(() => {
    if (!supported) { setError('Este navegador no soporta geolocalización'); return; }
    setError(null);
    setStatus('recording');
    lastTick.current = Date.now();
    watchId.current = navigator.geolocation.watchPosition(onPosition, onError, {
      enableHighAccuracy: true,
      maximumAge: 1000,
      timeout: 15000,
    });
  }, [supported, onPosition, onError]);

  const pause = useCallback(() => {
    setStatus((s) => (s === 'recording' ? 'paused' : s));
  }, []);

  const resume = useCallback(() => {
    setStatus((s) => (s === 'paused' ? 'recording' : s));
    lastTick.current = Date.now();
  }, []);

  const stop = useCallback(() => {
    if (watchId.current != null) navigator.geolocation.clearWatch(watchId.current);
    watchId.current = null;
    setStatus('stopped');
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setPoints([]);
    setDistance(0);
    setElapsed(0);
    setSpeed(0);
    setError(null);
    lastPoint.current = null;
  }, []);

  // Reloj — solo avanza mientras se está grabando (no en pausa).
  useEffect(() => {
    if (status === 'recording') {
      tickRef.current = setInterval(() => {
        const now = Date.now();
        const dt = now - (lastTick.current || now);
        lastTick.current = now;
        setElapsed((prev) => prev + dt);
      }, 1000);
    }
    return () => clearInterval(tickRef.current);
  }, [status]);

  useEffect(() => () => {
    if (watchId.current != null) navigator.geolocation.clearWatch(watchId.current);
  }, []);

  const avgSpeed = elapsed > 0 ? distance / (elapsed / 1000) : 0; // m/s

  return {
    status, points, distance, elapsed, speed, avgSpeed, error, supported,
    start, pause, resume, stop, reset,
  };
}
