/* photoUtils — comprime una foto tomada con la cámara antes de guardarla.
   Sin esto, cada foto en alta resolución (varios MB) llenaría rápido el
   localStorage (límite ~5-10 MB del navegador). Redimensiona a un ancho
   máximo razonable y la guarda como JPEG comprimido en base64. */
export function compressPhoto(file, { maxWidth = 720, quality = 0.7 } = {}) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      img.onerror = reject;
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
