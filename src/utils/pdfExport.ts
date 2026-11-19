import { toJpeg, toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

export interface PdfExportProgress {
  currentPage: number;
  totalPages: number;
  stage: 'rendering' | 'saving';
}

/**
 * Generates a print-ready A4 PDF from all `.catalog-a4-page` nodes inside `container`,
 * embedding real clickable PDF hyperlinks for every element marked with `data-pdf-link`.
 */
export async function exportCatalogToPdf(
  container: HTMLElement,
  filename: string,
  onProgress?: (progress: PdfExportProgress) => void
): Promise<void> {
  const pages = Array.from(container.querySelectorAll<HTMLElement>('.catalog-a4-page'));
  if (pages.length === 0) {
    throw new Error('No se encontraron páginas del catálogo para exportar.');
  }

  // Wait for web fonts to settle before rasterizing
  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const pageWidthMm = 210;
  const pageHeightMm = 297;

  for (let i = 0; i < pages.length; i++) {
    const pageEl = pages[i];
    onProgress?.({ currentPage: i + 1, totalPages: pages.length, stage: 'rendering' });

    const pageRect = pageEl.getBoundingClientRect();
    const scaleX = pageWidthMm / (pageRect.width || 794);
    const scaleY = pageHeightMm / (pageRect.height || 1123);

    // Collect clickable links prior to rasterizing
    const linkElements = Array.from(pageEl.querySelectorAll<HTMLElement>('[data-pdf-link]'));
    const linkZones = linkElements
      .map((el) => {
        const url = el.getAttribute('data-pdf-link');
        if (!url) return null;
        const rect = el.getBoundingClientRect();
        const x = (rect.left - pageRect.left) * scaleX;
        const y = (rect.top - pageRect.top) * scaleY;
        const w = rect.width * scaleX;
        const h = rect.height * scaleY;
        if (w <= 0 || h <= 0) return null;
        return { x, y, w, h, url };
      })
      .filter((z): z is { x: number; y: number; w: number; h: number; url: string } => z !== null);

    const imgData = await toJpeg(pageEl, {
      quality: 0.93,
      pixelRatio: 2,
      cacheBust: true,
      skipAutoScale: true,
    });

    if (i > 0) {
      pdf.addPage('a4', 'portrait');
    }

    pdf.addImage(imgData, 'JPEG', 0, 0, pageWidthMm, pageHeightMm, undefined, 'FAST');

    for (const zone of linkZones) {
      pdf.link(zone.x, zone.y, zone.w, zone.h, { url: zone.url });
    }
  }

  onProgress?.({ currentPage: pages.length, totalPages: pages.length, stage: 'saving' });
  const safeName = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  pdf.save(safeName);
}

/**
 * Exports the cover page as a high-resolution PNG suitable for Instagram Stories/Feed.
 */
export async function exportCoverPagePng(
  container: HTMLElement,
  filename: string
): Promise<void> {
  const coverEl = container.querySelector<HTMLElement>('.catalog-a4-page');
  if (!coverEl) {
    throw new Error('No se encontró la portada del catálogo.');
  }
  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }
  const pngUrl = await toPng(coverEl, {
    pixelRatio: 2,
    cacheBust: true,
  });
  const a = document.createElement('a');
  a.href = pngUrl;
  a.download = filename.endsWith('.png') ? filename : `${filename}.png`;
  a.click();
}
