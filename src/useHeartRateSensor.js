import { useCallback, useRef, useState } from 'react';

/* useHeartRateSensor — conecta un pulsómetro/reloj real por Bluetooth (BLE)
   usando el "Heart Rate Service" estándar (0x180D) vía Web Bluetooth API.
   Sin datos inventados: el BPM viene del sensor real.

   Requisitos del navegador: Chrome/Edge de escritorio o Android, sobre
   HTTPS o localhost. iOS Safari no soporta Web Bluetooth todavía. */

const HR_SERVICE = 'heart_rate';
const HR_MEASUREMENT_CHAR = 'heart_rate_measurement';

// Decodifica el valor binario del characteristic 0x2A37 según el estándar BLE GATT.
function parseHeartRate(dataView) {
  const flags = dataView.getUint8(0);
  const is16bit = flags & 0x1;
  const bpm = is16bit ? dataView.getUint16(1, /* littleEndian */ true) : dataView.getUint8(1);
  return bpm;
}

export function useHeartRateSensor() {
  const [supported] = useState(() => typeof navigator !== 'undefined' && !!navigator.bluetooth);
  const [status, setStatus] = useState('disconnected'); // disconnected | connecting | connected
  const [bpm, setBpm] = useState(null);
  const [deviceName, setDeviceName] = useState(null);
  const [error, setError] = useState(null);
  const [samples, setSamples] = useState([]); // [{t, bpm}]

  const deviceRef = useRef(null);
  const charRef = useRef(null);

  const onMeasurement = useCallback((event) => {
    const value = event.target.value; // DataView
    const reading = parseHeartRate(value);
    setBpm(reading);
    setSamples((prev) => [...prev, { t: Date.now(), bpm: reading }]);
  }, []);

  const disconnect = useCallback(() => {
    try {
      charRef.current?.removeEventListener('characteristicvaluechanged', onMeasurement);
      charRef.current?.stopNotifications().catch(() => {});
      deviceRef.current?.gatt?.disconnect();
    } catch { /* ignore */ }
    deviceRef.current = null;
    charRef.current = null;
    setStatus('disconnected');
    setBpm(null);
    setDeviceName(null);
  }, [onMeasurement]);

  const connect = useCallback(async () => {
    if (!supported) {
      setError('Este navegador no soporta Web Bluetooth (probá Chrome/Edge en escritorio o Android).');
      return;
    }
    setError(null);
    setStatus('connecting');
    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: [HR_SERVICE] }],
        optionalServices: [HR_SERVICE],
      });
      deviceRef.current = device;
      setDeviceName(device.name || 'Sensor BLE');

      device.addEventListener('gattserverdisconnected', () => {
        setStatus('disconnected');
        setBpm(null);
      });

      const server = await device.gatt.connect();
      const service = await server.getPrimaryService(HR_SERVICE);
      const characteristic = await service.getCharacteristic(HR_MEASUREMENT_CHAR);
      charRef.current = characteristic;

      await characteristic.startNotifications();
      characteristic.addEventListener('characteristicvaluechanged', onMeasurement);

      setStatus('connected');
    } catch (err) {
      setStatus('disconnected');
      if (err?.name === 'NotFoundError') {
        setError('No se eligió ningún dispositivo (cancelaste el selector de Bluetooth).');
      } else {
        setError(err?.message || 'No se pudo conectar al sensor de pulso.');
      }
    }
  }, [supported, onMeasurement]);

  const reset = useCallback(() => setSamples([]), []);

  const avgBpm = samples.length
    ? Math.round(samples.reduce((s, x) => s + x.bpm, 0) / samples.length)
    : null;
  const maxBpm = samples.length ? Math.max(...samples.map((s) => s.bpm)) : null;

  return {
    supported, status, bpm, deviceName, error, samples, avgBpm, maxBpm,
    connect, disconnect, reset,
  };
}
