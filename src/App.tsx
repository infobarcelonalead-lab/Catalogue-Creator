import { useCallback, useEffect, useRef, useState } from 'react';
import { Download, Eye, ZoomIn, ZoomOut } from 'lucide-react';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { CatalogPages } from './components/CatalogPages';
import { ContentEditorPanel } from './components/ContentEditorPanel';
import { DesignStudioPanel } from './components/DesignStudioPanel';
import { ExportSharePanel } from './components/ExportSharePanel';
import { MultilingualPanel } from './components/MultilingualPanel';
import { ProductsEditorPanel } from './components/ProductsEditorPanel';
import { WebCatalogViewer } from './components/WebCatalogViewer';
import { DEFAULT_CATALOG, LANGUAGE_MAP } from './data/templates';
import {
  AnalyticsEventType,
  AnalyticsStore,
  CatalogData,
  LanguageCode,
  TrafficSource,
} from './types/catalog';
import {
  createInitialAnalytics,
  detectTrafficSourceFromUrl,
  loadAnalytics,
  recordAnalyticsEvent,
  saveAnalytics,
} from './utils/analyticsStore';
import {
  exportCatalogToPdf,
  exportCoverPagePng,
  PdfExportProgress,
} from './utils/pdfExport';

const CATALOG_STORAGE_KEY = 'sporttanger_studio_catalog_v2';

type StudioTab = 'design' | 'content' | 'products' | 'languages' | 'analytics' | 'export';

function loadSavedCatalog(): CatalogData {
  try {
    const raw = localStorage.getItem(CATALOG_STORAGE_KEY);
    if (!raw) return DEFAULT_CATALOG;
    const parsed = JSON.parse(raw) as CatalogData;
    if (!parsed || !parsed.cover || !Array.isArray(parsed.products)) {
      return DEFAULT_CATALOG;
    }
    return {
      ...DEFAULT_CATALOG,
      ...parsed,
      enabledLanguages:
        Array.isArray(parsed.enabledLanguages) && parsed.enabledLanguages.length > 0
          ? parsed.enabledLanguages
          : DEFAULT_CATALOG.enabledLanguages,
      primaryLanguage: parsed.primaryLanguage || DEFAULT_CATALOG.primaryLanguage,
    };
  } catch {
    return DEFAULT_CATALOG;
  }
}

export default function App() {
  const [catalog, setCatalog] = useState<CatalogData>(() => loadSavedCatalog());
  const [analytics, setAnalytics] = useState<AnalyticsStore>(() =>
    loadAnalytics(loadSavedCatalog().products)
  );
  const [activeTab, setActiveTab] = useState<StudioTab>('design');
  const [previewLang, setPreviewLang] = useState<LanguageCode>(() => {
    try {
      const qLang = new URLSearchParams(window.location.search).get('lang') as LanguageCode | null;
      if (qLang && LANGUAGE_MAP[qLang]) return qLang;
    } catch {
      // Ignore URL read issues
    }
    return loadSavedCatalog().primaryLanguage;
  });
  const [zoom, setZoom] = useState<number>(0.76);
  const [viewMode, setViewMode] = useState<'studio' | 'client'>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.has('catalogo') ? 'client' : 'studio';
    } catch {
      return 'studio';
    }
  });
  const [clientSource, setClientSource] = useState<TrafficSource>(() =>
    detectTrafficSourceFromUrl()
  );
  const [pdfProgress, setPdfProgress] = useState<PdfExportProgress | null>(null);
  const [toast, setToast] = useState<string>('');

  const exportStageRef = useRef<HTMLDivElement>(null);

  // Auto-save catalog locally (zero external cloud dependency)
  useEffect(() => {
    try {
      localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(catalog));
    } catch {
      // Ignore quota exceeded
    }
  }, [catalog]);

  // Keep preview language valid if disabled
  useEffect(() => {
    if (!catalog.enabledLanguages.includes(previewLang)) {
      setPreviewLang(catalog.primaryLanguage);
    }
  }, [catalog.enabledLanguages, catalog.primaryLanguage, previewLang]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast((prev) => (prev === msg ? '' : prev)), 3200);
  }, []);

  const handleTrackEvent = useCallback(
    (event: {
      type: AnalyticsEventType;
      productId?: string;
      productName?: string;
      source: TrafficSource;
      language: LanguageCode;
    }) => {
      setAnalytics((prev) => recordAnalyticsEvent(prev, event));
    },
    []
  );

  const handleDownloadPdf = useCallback(async () => {
    if (!exportStageRef.current) return;
    try {
      setPdfProgress({ currentPage: 1, totalPages: 1, stage: 'rendering' });
      const slug = (catalog.brandName || 'sporttanger')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-');
      await exportCatalogToPdf(
        exportStageRef.current,
        `${slug}-catalogo-${previewLang}.pdf`,
        (prog) => setPdfProgress(prog)
      );
      showToast(`PDF descargado en ${LANGUAGE_MAP[previewLang]?.name} con enlaces clicables.`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error al generar el PDF.');
    } finally {
      setPdfProgress(null);
    }
  }, [catalog.brandName, previewLang, showToast]);

  const handleDownloadInstagramKit = useCallback(async () => {
    if (!exportStageRef.current) return;
    await exportCoverPagePng(
      exportStageRef.current,
      `sporttanger-portada-${previewLang}.png`
    );
  }, [previewLang]);

  const handleResetAnalytics = useCallback(() => {
    const fresh = createInitialAnalytics(catalog.products);
    saveAnalytics(fresh);
    setAnalytics(fresh);
    showToast('Panel de analíticas reiniciado.');
  }, [catalog.products, showToast]);

  // Customer-facing Interactive Web Catalog mode
  if (viewMode === 'client') {
    return (
      <WebCatalogViewer
        catalog={catalog}
        initialLanguage={previewLang}
        trafficSource={clientSource}
        showBackToEditor
        onBackToEditor={() => setViewMode('studio')}
        onTrackEvent={handleTrackEvent}
      />
    );
  }

  const navItems: Array<{ id: StudioTab; label: string }> = [
    { id: 'design', label: 'Diseño' },
    { id: 'content', label: 'Contenido' },
    { id: 'products', label: 'Productos' },
    { id: 'languages', label: 'Idiomas' },
    { id: 'analytics', label: 'Analíticas' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F7F9] text-slate-900">
      {/* 3-Zone Top Bar Contract (no-print) */}
      <header className="no-print sticky top-0 z-30 h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between gap-8">
        {/* Zone 1: Single-element brand wordmark */}
        <button
          type="button"
          onClick={() => setActiveTab('design')}
          className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 cursor-pointer"
        >
          SportTanger Studio
        </button>

        {/* Zone 2: 5 concise single-line text nav links */}
        <nav className="flex items-center gap-6 overflow-x-auto" aria-label="Secciones del estudio">
          {navItems.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`relative py-5 text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active ? 'text-slate-900 font-semibold' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {item.label}
                {active ? (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900" />
                ) : null}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Single primary CTA */}
        <div className="shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('export')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'export'
                ? 'bg-blue-700 text-white'
                : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            Exportar y PDF
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      {activeTab === 'analytics' ? (
        <main className="no-print flex-1 overflow-y-auto">
          <AnalyticsDashboard
            catalog={catalog}
            analytics={analytics}
            onOpenWebCatalog={(source) => {
              setClientSource(source);
              setViewMode('client');
            }}
            onResetAnalytics={handleResetAnalytics}
          />
        </main>
      ) : (
        <div className="no-print flex-1 flex flex-col lg:flex-row min-h-0">
          {/* Left Editor Inspector */}
          <aside className="w-full lg:w-[400px] xl:w-[420px] shrink-0 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 lg:h-[calc(100vh-64px)] lg:overflow-y-auto p-6">
            {activeTab === 'design' ? (
              <DesignStudioPanel catalog={catalog} onChange={setCatalog} />
            ) : null}

            {activeTab === 'content' ? (
              <ContentEditorPanel catalog={catalog} onChange={setCatalog} />
            ) : null}

            {activeTab === 'products' ? (
              <ProductsEditorPanel catalog={catalog} onChange={setCatalog} />
            ) : null}

            {activeTab === 'languages' ? (
              <MultilingualPanel
                catalog={catalog}
                activePreviewLang={previewLang}
                onSelectPreviewLang={setPreviewLang}
                onChange={setCatalog}
              />
            ) : null}

            {activeTab === 'export' ? (
              <ExportSharePanel
                catalog={catalog}
                activePreviewLang={previewLang}
                onSelectPreviewLang={setPreviewLang}
                onDownloadPdf={handleDownloadPdf}
                onDownloadInstagramKit={handleDownloadInstagramKit}
                onOpenWebCatalog={() => {
                  setClientSource('direct');
                  setViewMode('client');
                }}
                onImportJson={(next) => setCatalog(next)}
                pdfProgress={pdfProgress}
              />
            ) : null}
          </aside>

          {/* Right Live A4 Preview Canvas */}
          <main className="flex-1 flex flex-col min-w-0 lg:h-[calc(100vh-64px)]">
            {/* Workspace Toolbar */}
            <div className="px-6 py-3 bg-[#F6F7F9] border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-slate-500">
                  Vista A4 · {catalog.products.length} productos
                </span>
                <span aria-hidden="true" className="text-slate-300">
                  /
                </span>
                {/* Preview Language Selector */}
                <div className="flex items-center gap-1 p-0.5 bg-white border border-slate-200 rounded-md">
                  {catalog.enabledLanguages.map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => setPreviewLang(code)}
                      className={`px-2 py-1 text-[11px] font-semibold rounded transition-colors ${
                        previewLang === code
                          ? 'bg-slate-900 text-white'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title={`Previsualizar en ${LANGUAGE_MAP[code]?.name}`}
                    >
                      {LANGUAGE_MAP[code]?.shortCode}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-1.5 py-1">
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.max(0.5, Number((z - 0.1).toFixed(2))))}
                    className="p-1 text-slate-500 hover:text-slate-900"
                    aria-label="Alejar vista previa"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] font-mono-tabular text-slate-600 w-10 text-center">
                    {Math.round(zoom * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.min(1.05, Number((z + 0.1).toFixed(2))))}
                    className="p-1 text-slate-500 hover:text-slate-900"
                    aria-label="Acercar vista previa"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setClientSource('direct');
                    setViewMode('client');
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 whitespace-nowrap"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Vista cliente
                </button>

                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={Boolean(pdfProgress)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#059669] text-white hover:opacity-95 disabled:opacity-60 whitespace-nowrap"
                >
                  <Download className="w-3.5 h-3.5" />
                  {pdfProgress
                    ? `PDF ${pdfProgress.currentPage}/${pdfProgress.totalPages}`
                    : 'Descargar PDF'}
                </button>
              </div>
            </div>

            {/* Scrollable A4 Preview Area */}
            <div className="flex-1 overflow-auto p-6 sm:p-10">
              <div className="flex justify-center">
                <CatalogPages catalog={catalog} language={previewLang} scale={zoom} />
              </div>
            </div>
          </main>
        </div>
      )}

      {/* Unscaled off-screen export & print stage (exact 794x1123 A4 geometry for crisp PDF links & vector print) */}
      <div
        className="print-only-container fixed -left-[9999px] top-0 pointer-events-none"
        aria-hidden="true"
      >
        <div ref={exportStageRef}>
          <CatalogPages catalog={catalog} language={previewLang} scale={1} />
        </div>
      </div>

      {/* Transient Feedback Toast */}
      {toast ? (
        <div className="no-print fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-lg bg-slate-900 text-white text-xs font-medium shadow-lg">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
