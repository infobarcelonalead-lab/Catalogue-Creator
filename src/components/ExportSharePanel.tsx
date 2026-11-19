import { useRef, useState } from 'react';
import {
  Check,
  Copy,
  Download,
  ExternalLink,
  FileCode2,
  FileJson,
  FileText,
  Instagram,
  Mail,
  MessageCircle,
  Printer,
  Share2,
  Upload,
} from 'lucide-react';
import { LANGUAGE_MAP } from '../data/templates';
import { CatalogData, LanguageCode } from '../types/catalog';
import {
  buildGeneralWhatsAppUrl,
  getLocalizedCover,
  normalizeWebsiteUrl,
} from '../utils/formatters';
import { buildStandaloneInteractiveHtml, downloadTextFile } from '../utils/htmlExport';
import { PdfExportProgress } from '../utils/pdfExport';

interface ExportSharePanelProps {
  catalog: CatalogData;
  activePreviewLang: LanguageCode;
  onSelectPreviewLang: (lang: LanguageCode) => void;
  onDownloadPdf: () => Promise<void>;
  onDownloadInstagramKit: () => Promise<void>;
  onOpenWebCatalog: () => void;
  onImportJson: (nextCatalog: CatalogData) => void;
  pdfProgress: PdfExportProgress | null;
}

export function ExportSharePanel({
  catalog,
  activePreviewLang,
  onSelectPreviewLang,
  onDownloadPdf,
  onDownloadInstagramKit,
  onOpenWebCatalog,
  onImportJson,
  pdfProgress,
}: ExportSharePanelProps) {
  const [busyHtml, setBusyHtml] = useState(false);
  const [busyInsta, setBusyInsta] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const jsonInputRef = useRef<HTMLInputElement>(null);

  const websiteHref = normalizeWebsiteUrl(catalog.websiteUrl);
  const coverLoc = getLocalizedCover(catalog, activePreviewLang);

  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}?catalogo=1&lang=${activePreviewLang}`
      : websiteHref;

  const shareText = `${coverLoc.title} — ${coverLoc.season} · Descubre el catálogo completo de ${catalog.brandName} en ${catalog.websiteDisplay}`;

  const handleDownloadStandaloneHtml = async () => {
    setBusyHtml(true);
    setErrorMsg('');
    try {
      const html = await buildStandaloneInteractiveHtml(catalog);
      const slug = (catalog.id || 'catalogo-sporttanger').replace(/[^a-z0-9-_]/gi, '-').toLowerCase();
      downloadTextFile(html, `${slug}-interactivo.html`, 'text/html;charset=utf-8');
      setStatusMessage(
        'HTML interactivo descargado con todos los idiomas e imágenes integradas. Súbelo directamente a sporttanger.com.'
      );
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'No se pudo generar el HTML interactivo.');
    } finally {
      setBusyHtml(false);
    }
  };

  const handleInstagramKit = async () => {
    setBusyInsta(true);
    setErrorMsg('');
    try {
      await onDownloadInstagramKit();
      const caption = `${coverLoc.title} (${coverLoc.season})\n\n${coverLoc.subtitle}\n\nCatálogo y pedidos: ${catalog.websiteDisplay}\nWhatsApp directo: ${catalog.whatsappNumber}\n${catalog.instagramHandle}`;
      try {
        await navigator.clipboard.writeText(caption);
      } catch {
        // Ignore clipboard denial
      }
      setStatusMessage('Portada PNG descargada y texto promocional copiado para Instagram.');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'No se pudo exportar la portada PNG.');
    } finally {
      setBusyInsta(false);
    }
  };

  const handleCopyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      setErrorMsg('No se pudo copiar el enlace al portapapeles.');
    }
  };

  const handleExportJson = () => {
    const json = JSON.stringify(catalog, null, 2);
    downloadTextFile(
      json,
      `sporttanger-backup-${new Date().toISOString().slice(0, 10)}.json`,
      'application/json;charset=utf-8'
    );
    setStatusMessage('Copia de seguridad local (.json) descargada.');
  };

  const handleImportFile = async (file: File | undefined) => {
    if (!file) return;
    setErrorMsg('');
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as CatalogData;
      if (!parsed || !parsed.cover || !Array.isArray(parsed.products)) {
        throw new Error('El archivo no corresponde a un proyecto válido de SportTanger Studio.');
      }
      onImportJson(parsed);
      setStatusMessage('Proyecto restaurado correctamente desde copia local.');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error al importar el archivo JSON.');
    }
  };

  const waShareHref = buildGeneralWhatsAppUrl(
    catalog,
    activePreviewLang
  );
  const fbShareHref = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(websiteHref)}&quote=${encodeURIComponent(shareText)}`;
  const pinShareHref = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(websiteHref)}&description=${encodeURIComponent(shareText)}`;
  const mailShareHref = `mailto:?subject=${encodeURIComponent(`${catalog.brandName} — ${coverLoc.title}`)}&body=${encodeURIComponent(`${shareText}\n\nTienda online: ${websiteHref}\nPedidos WhatsApp: ${waShareHref}`)}`;

  return (
    <div className="space-y-6">
      {statusMessage ? (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
          {statusMessage}
        </div>
      ) : null}
      {errorMsg ? (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
          {errorMsg}
        </div>
      ) : null}

      {/* Section 1: PDF A4 Export */}
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">1. Catálogo PDF profesional A4</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Genera un solo archivo PDF con enlaces clicables reales hacia {catalog.websiteDisplay} y tu WhatsApp en cada ficha.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Idioma de exportación del PDF
          </label>
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            {catalog.enabledLanguages.map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => onSelectPreviewLang(code)}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  activePreviewLang === code
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {LANGUAGE_MAP[code]?.shortCode} · {LANGUAGE_MAP[code]?.name}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={onDownloadPdf}
          disabled={Boolean(pdfProgress)}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-60"
        >
          <FileText className="w-4 h-4" />
          {pdfProgress
            ? pdfProgress.stage === 'rendering'
              ? `Generando página ${pdfProgress.currentPage} de ${pdfProgress.totalPages}...`
              : 'Guardando archivo PDF...'
            : `Descargar PDF A4 (${LANGUAGE_MAP[activePreviewLang]?.shortCode})`}
        </button>

        <button
          type="button"
          onClick={() => window.print()}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
        >
          <Printer className="w-3.5 h-3.5" />
          Imprimir / Guardar PDF vectorial
        </button>
      </div>

      {/* Section 2: Standalone Interactive HTML (Zero Cloud) */}
      <div className="pt-5 border-t border-slate-200 space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            2. Catálogo web interactivo (sin servidor ni nube)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Descarga un único archivo <span className="font-mono-tabular">.html</span> autónomo con selector multilingüe, filtros, buscador y WhatsApp, listo para subir a tu hosting de{' '}
            <strong className="text-slate-800">{catalog.websiteDisplay}</strong>.
          </p>
        </div>

        <button
          type="button"
          onClick={handleDownloadStandaloneHtml}
          disabled={busyHtml}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg bg-blue-700 text-white hover:bg-blue-800 disabled:opacity-60"
        >
          <FileCode2 className="w-4 h-4" />
          {busyHtml ? 'Empaquetando imágenes e idiomas...' : 'Descargar HTML interactivo (.html)'}
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenWebCatalog}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Abrir vista cliente
          </button>
          <button
            type="button"
            onClick={handleCopyShareLink}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedLink ? 'Copiado' : 'Copiar enlace'}
          </button>
        </div>
      </div>

      {/* Section 3: Social Sharing & Instagram Kit */}
      <div className="pt-5 border-t border-slate-200 space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">3. Compartir en redes y correo</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Difunde tu nueva temporada con clientes directamente por tus canales de venta.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <a
            href={waShareHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-[#059669] text-white hover:opacity-95"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            WhatsApp
          </a>
          <button
            type="button"
            onClick={handleInstagramKit}
            disabled={busyInsta}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
          >
            <Instagram className="w-3.5 h-3.5" />
            {busyInsta ? 'Exportando...' : 'Kit Instagram'}
          </button>
          <a
            href={fbShareHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
          >
            <Share2 className="w-3.5 h-3.5" />
            Facebook
          </a>
          <a
            href={pinShareHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
          >
            <Download className="w-3.5 h-3.5" />
            Pinterest
          </a>
        </div>

        <a
          href={mailShareHref}
          className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
        >
          <Mail className="w-3.5 h-3.5" />
          Enviar por correo electrónico
        </a>
      </div>

      {/* Section 4: Local JSON Backup */}
      <div className="pt-5 border-t border-slate-200 space-y-2.5">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">4. Copia de seguridad local</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Guarda o recupera tus catálogos y fotografías en tu ordenador sin cuentas externas.
          </p>
        </div>
        <input
          ref={jsonInputRef}
          type="file"
          accept="application/json,.json"
          onChange={(e) => handleImportFile(e.target.files?.[0])}
          className="hidden"
        />
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleExportJson}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
          >
            <FileJson className="w-3.5 h-3.5" />
            Guardar .json
          </button>
          <button
            type="button"
            onClick={() => jsonInputRef.current?.click()}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
          >
            <Upload className="w-3.5 h-3.5" />
            Cargar .json
          </button>
        </div>
      </div>
    </div>
  );
}
