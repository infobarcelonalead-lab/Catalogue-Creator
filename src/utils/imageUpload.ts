export async function compressImageFile(
  file: File,
  options: { maxWidth?: number; maxHeight?: number; quality?: number; preserveAlpha?: boolean } = {}
): Promise<string> {
  const { maxWidth = 1400, maxHeight = 1400, quality = 0.84, preserveAlpha = false } = options;

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('No se pudo leer el archivo de imagen.'));
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Formato de imagen no válido.'));
    image.src = dataUrl;
  });

  let { width, height } = img;
  if (width > maxWidth || height > maxHeight) {
    const ratio = Math.min(maxWidth / width, maxHeight / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return dataUrl;

  if (!preserveAlpha) {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);
  }
  ctx.drawImage(img, 0, 0, width, height);

  const mime = preserveAlpha || file.type === 'image/png' ? 'image/png' : 'image/jpeg';
  return canvas.toDataURL(mime, quality);
}

/**
 * Converts a local asset URL (like /src/assets/images/...) into an inline base64 Data URL
 * so standalone exported HTML catalogs work 100% offline on any hosting (e.g. sporttanger.com).
 */
export async function urlToDataUrl(url: string): Promise<string> {
  if (!url || url.startsWith('data:')) return url;
  try {
    const response = await fetch(url);
    if (!response.ok) return url;
    const blob = await response.blob();
    return await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(typeof reader.result === 'string' ? reader.result : url);
      reader.onerror = () => resolve(url);
      reader.readAsDataURL(blob);
    });
  } catch {
    return url;
  }
}
