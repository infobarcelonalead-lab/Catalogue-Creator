import { useMemo, useState } from 'react';
import {
  Check,
  Copy,
  Download,
  ExternalLink,
  RotateCcw,
} from 'lucide-react';
import { LANGUAGE_MAP } from '../data/templates';
import {
  AnalyticsStore,
  CatalogData,
  LanguageCode,
  TrafficSource,
} from '../types/catalog';
import {
  exportAnalyticsCsv,
  TRAFFIC_SOURCE_LABELS,
} from '../utils/analyticsStore';
import { formatPrice } from '../utils/formatters';

interface AnalyticsDashboardProps {
  catalog: CatalogData;
  analytics: AnalyticsStore;
  onOpenWebCatalog: (source: TrafficSource) => void;
  onResetAnalytics: () => void;
}

const EVENT_LABELS: Record<string, string> = {
  catalog_view: 'Visita al catálogo',
  product_view: 'Vista de producto',
  whatsapp_click: 'Clic pedir por WhatsApp',
  web_click: 'Clic visitar sporttanger.com',
  language_change: 'Cambio de idioma',
};

export function AnalyticsDashboard({
  catalog,
  analytics,
  onOpenWebCatalog,
  onResetAnalytics,
}: AnalyticsDashboardProps) {
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  const [utmSource, setUtmSource] = useState<TrafficSource>('instagram');
  const [copiedUtm, setCopiedUtm] = useState(false);

  const totals = useMemo(() => {
    const waClicks = analytics.daily.reduce((s, d) => s + d.whatsappClicks, 0);
    const webClicks = analytics.daily.reduce((s, d) => s + d.webClicks, 0);
    const totalBuyClicks = waClicks + webClicks;
    const convRate =
      analytics.totalViews > 0
        ? ((totalBuyClicks / analytics.totalViews) * 100).toFixed(1)
        : '0.0';
    return { waClicks, webClicks, totalBuyClicks, convRate };
  }, [analytics]);

  const rankedProducts = useMemo(() => {
    return catalog.products
      .map((product) => {
        const stats = analytics.productStats[product.id] || {
          views: 0,
          whatsappClicks: 0,
          webClicks: 0,
        };
        const buyClicks = stats.whatsappClicks + stats.webClicks;
        const rate = stats.views > 0 ? (buyClicks / stats.views) * 100 : 0;
        return { product, stats, buyClicks, rate };
      })
      .sort((a, b) => b.stats.views - a.stats.views);
  }, [catalog.products, analytics.productStats]);

  const sourceList = useMemo(() => {
    const entries = (Object.keys(TRAFFIC_SOURCE_LABELS) as TrafficSource[]).map((key) => ({
      key,
      label: TRAFFIC_SOURCE_LABELS[key],
      count: analytics.sources[key] || 0,
    }));
    const total = entries.reduce((s, e) => s + e.count, 0) || 1;
    return entries
      .map((e) => ({ ...e, pct: Math.round((e.count / total) * 100) }))
      .sort((a, b) => b.count - a.count);
  }, [analytics.sources]);

  const languageList = useMemo(() => {
    const codes = Object.keys(LANGUAGE_MAP) as LanguageCode[];
    const total = codes.reduce((s, c) => s + (analytics.languages[c] || 0), 0) || 1;
    return codes
      .map((code) => ({
        code,
        meta: LANGUAGE_MAP[code],
        count: analytics.languages[code] || 0,
        pct: Math.round(((analytics.languages[code] || 0) / total) * 100),
      }))
      .sort((a, b) => b.count - a.count);
  }, [analytics.languages]);

  const maxDailyViews = Math.max(...analytics.daily.map((d) => d.views), 10);

  const trackedLink = useMemo(() => {
    if (typeof window === 'undefined') return '';
    const url = new URL(window.location.href);
    url.searchParams.set('catalogo', '1');
    url.searchParams.set('utm_source', utmSource);
    url.searchParams.set('lang', catalog.primaryLanguage);
    return url.toString();
  }, [utmSource, catalog.primaryLanguage]);

  const handleCopyUtm = async () => {
    try {
      await navigator.clipboard.writeText(trackedLink);
      setCopiedUtm(true);
      setTimeout(() => setCopiedUtm(false), 2000);
    } catch {
      // Ignore clipboard failure
    }
  };

  const formatMinutes = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${String(s).padStart(2, '0')}s`;
  };

  const topProduct = rankedProducts[0];
  const topSource = sourceList[0];

  return (
    <div className="max-w-[1320px] mx-auto px-6 py-8 space-y-8">
      {/* Header Row */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold tracking-tight text-slate-900">
            Analíticas de Catálogo y Conversión
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Rendimiento real de visualizaciones, idiomas, fuentes de tráfico y pedidos en{' '}
            <span className="font-medium text-slate-700">{catalog.websiteDisplay}</span> y WhatsApp.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => onOpenWebCatalog(utmSource)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 whitespace-nowrap"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Probar catálogo y registrar evento
          </button>
          <button
            type="button"
            onClick={() => exportAnalyticsCsv(analytics, catalog.products)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            Exportar CSV
          </button>
          <button
            type="button"
            onClick={onResetAnalytics}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 whitespace-nowrap"
            title="Restablecer estadísticas locales"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reiniciar
          </button>
        </div>
      </div>

      {/* 4 KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-white border border-slate-200">
          <div className="text-xs font-medium text-slate-500">Visualizaciones del catálogo</div>
          <div className="mt-2 text-3xl font-mono-tabular font-semibold text-slate-900">
            {analytics.totalViews.toLocaleString('es-ES')}
          </div>
          <div className="mt-1.5 text-xs text-slate-500 font-mono-tabular">
            {analytics.uniqueVisitors.toLocaleString('es-ES')} sesiones únicas · 14 días
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200">
          <div className="text-xs font-medium text-slate-500">Clics en Pedir por WhatsApp</div>
          <div className="mt-2 text-3xl font-mono-tabular font-semibold text-emerald-700">
            {totals.waClicks.toLocaleString('es-ES')}
          </div>
          <div className="mt-1.5 text-xs text-slate-500 font-mono-tabular">
            {totals.totalBuyClicks > 0
              ? Math.round((totals.waClicks / totals.totalBuyClicks) * 100)
              : 0}
            % de la intención de compra
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200">
          <div className="text-xs font-medium text-slate-500">
            Clics hacia {catalog.websiteDisplay}
          </div>
          <div className="mt-2 text-3xl font-mono-tabular font-semibold text-blue-700">
            {totals.webClicks.toLocaleString('es-ES')}
          </div>
          <div className="mt-1.5 text-xs text-slate-500 font-mono-tabular">
            {totals.totalBuyClicks.toLocaleString('es-ES')} interacciones de compra totales
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200">
          <div className="text-xs font-medium text-slate-500">Tasa de conversión a clic</div>
          <div className="mt-2 text-3xl font-mono-tabular font-semibold text-slate-900">
            {totals.convRate}%
          </div>
          <div className="mt-1.5 text-xs text-slate-500 font-mono-tabular">
            Tiempo medio de lectura {formatMinutes(analytics.avgTimeSec)}
          </div>
        </div>
      </div>

      {/* Main Chart + Traffic Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* 14-day Trend Chart */}
        <div className="lg:col-span-8 p-6 rounded-xl bg-white border border-slate-200 flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-base font-display font-semibold text-slate-900">
                Evolución diaria de visualizaciones e intención de compra
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Últimos 14 días · Pasa el cursor sobre cada barra para ver el detalle diario.
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-600">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-slate-900 inline-block" />
                Vistas
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600 inline-block" />
                WhatsApp
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-blue-600 inline-block" />
                Web
              </span>
            </div>
          </div>

          <div className="relative h-[230px] flex items-end gap-2 pt-8 pb-2 border-b border-slate-200">
            {analytics.daily.map((day, idx) => {
              const viewPct = Math.max(6, Math.round((day.views / maxDailyViews) * 100));
              const waPct = Math.max(4, Math.round((day.whatsappClicks / maxDailyViews) * 100));
              const webPct = Math.max(3, Math.round((day.webClicks / maxDailyViews) * 100));
              const active = hoveredDay === idx;

              return (
                <div
                  key={day.date}
                  onMouseEnter={() => setHoveredDay(idx)}
                  onMouseLeave={() => setHoveredDay(null)}
                  className="flex-1 h-full flex flex-col justify-end items-center relative group cursor-pointer"
                >
                  {active ? (
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full z-10 bg-slate-900 text-white text-[11px] rounded-md px-2.5 py-1.5 whitespace-nowrap shadow-md pointer-events-none font-mono-tabular">
                      <div className="font-semibold text-slate-200 mb-0.5">{day.label}</div>
                      <div>Vistas: {day.views}</div>
                      <div>WhatsApp: {day.whatsappClicks} · Web: {day.webClicks}</div>
                    </div>
                  ) : null}

                  <div className="w-full h-full flex items-end justify-center gap-0.5 px-0.5">
                    <div
                      className={`w-2.5 rounded-t-xs transition-opacity ${
                        active ? 'bg-slate-900' : 'bg-slate-800/80'
                      }`}
                      style={{ height: `${viewPct}%` }}
                    />
                    <div
                      className="w-1.5 rounded-t-xs bg-emerald-600"
                      style={{ height: `${waPct}%` }}
                    />
                    <div
                      className="w-1.5 rounded-t-xs bg-blue-600"
                      style={{ height: `${webPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-2 text-[11px] font-mono-tabular text-slate-400">
            <span>{analytics.daily[0]?.label}</span>
            <span>{analytics.daily[Math.floor(analytics.daily.length / 2)]?.label}</span>
            <span>{analytics.daily[analytics.daily.length - 1]?.label}</span>
          </div>
        </div>

        {/* Traffic Sources + UTM Builder */}
        <div className="lg:col-span-4 p-6 rounded-xl bg-white border border-slate-200 flex flex-col justify-between space-y-5">
          <div>
            <h2 className="text-base font-display font-semibold text-slate-900">
              Fuentes de tráfico
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 mb-4">
              Canales desde donde tus clientes abren el catálogo.
            </p>

            <div className="space-y-3">
              {sourceList.map((src) => (
                <div key={src.key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-800">{src.label}</span>
                    <span className="font-mono-tabular text-slate-500">
                      {src.count} · {src.pct}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-slate-900"
                      style={{ width: `${src.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* UTM Link Generator */}
          <div className="pt-4 border-t border-slate-200 space-y-2">
            <div className="text-xs font-semibold text-slate-900">
              Generar enlace rastreado por canal
            </div>
            <div className="flex items-center gap-2">
              <select
                value={utmSource}
                onChange={(e) => setUtmSource(e.target.value as TrafficSource)}
                className="flex-1 px-2.5 py-1.5 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:border-slate-900"
              >
                {(Object.keys(TRAFFIC_SOURCE_LABELS) as TrafficSource[]).map((key) => (
                  <option key={key} value={key}>
                    {TRAFFIC_SOURCE_LABELS[key]}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleCopyUtm}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md bg-slate-900 text-white hover:bg-slate-800 whitespace-nowrap"
              >
                {copiedUtm ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedUtm ? 'Copiado' : 'Copiar'}
              </button>
            </div>
            <div className="text-[11px] font-mono-tabular text-slate-500 truncate bg-slate-50 px-2.5 py-1.5 rounded border border-slate-200">
              {trackedLink}
            </div>
          </div>
        </div>
      </div>

      {/* Product Performance Table */}
      <div className="rounded-xl bg-white border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-display font-semibold text-slate-900">
              Productos más vistos y rendimiento comercial
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Compara interés visual frente a clics reales en botones de pedido (WhatsApp y web).
            </p>
          </div>
          {topProduct ? (
            <div className="text-xs text-slate-600">
              Artículo líder:{' '}
              <strong className="text-slate-900">{topProduct.product.name}</strong> (
              <span className="font-mono-tabular">{topProduct.rate.toFixed(1)}%</span> conv.)
            </div>
          ) : null}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-6">Producto</th>
                <th className="py-3 px-4">Categoría</th>
                <th className="py-3 px-4 text-right">Precio</th>
                <th className="py-3 px-4 text-right">Vistas</th>
                <th className="py-3 px-4 text-right">WhatsApp</th>
                <th className="py-3 px-4 text-right">Web</th>
                <th className="py-3 px-6 text-right">Conversión</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {rankedProducts.map(({ product, stats, rate }) => (
                <tr key={product.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-6">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded object-cover border border-slate-200 shrink-0 bg-slate-100"
                      />
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900 text-xs truncate max-w-[240px]">
                          {product.name}
                        </div>
                        <div className="text-[11px] font-mono-tabular text-slate-500">
                          {product.sku}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-600">{product.category}</td>
                  <td className="py-3 px-4 text-right font-mono-tabular text-xs font-medium text-slate-900">
                    {formatPrice(product.price, catalog.currency)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono-tabular text-xs text-slate-700">
                    {stats.views.toLocaleString('es-ES')}
                  </td>
                  <td className="py-3 px-4 text-right font-mono-tabular text-xs font-semibold text-emerald-700">
                    {stats.whatsappClicks.toLocaleString('es-ES')}
                  </td>
                  <td className="py-3 px-4 text-right font-mono-tabular text-xs font-semibold text-blue-700">
                    {stats.webClicks.toLocaleString('es-ES')}
                  </td>
                  <td className="py-3 px-6 text-right font-mono-tabular text-xs font-semibold text-slate-900">
                    {rate.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Split: Language Preference + Strategy Summary + Recent Live Events */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 p-6 rounded-xl bg-white border border-slate-200 space-y-5">
          <div>
            <h2 className="text-base font-display font-semibold text-slate-900">
              Idiomas elegidos por clientes
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 mb-4">
              Distribución de consultas en el selector multilingüe del catálogo.
            </p>
            <div className="space-y-3">
              {languageList.map((item) => (
                <div key={item.code} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-800">
                      {item.meta.name}{' '}
                      <span className="text-slate-400">({item.meta.nativeName})</span>
                    </span>
                    <span className="font-mono-tabular text-slate-600">
                      {item.count} · {item.pct}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-blue-600"
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Recomendación de estrategia
            </h3>
            <p className="text-xs leading-relaxed text-slate-700">
              {topSource ? `${topSource.label} aporta el ${topSource.pct}% del tráfico. ` : ''}
              {topProduct
                ? `Coloca "${topProduct.product.name}" en la primera página de producto y comparte la portada con enlace UTM en tus historias para maximizar los pedidos por WhatsApp.`
                : 'Añade productos al catálogo para analizar su rendimiento comercial.'}
            </p>
          </div>
        </div>

        <div className="lg:col-span-7 p-6 rounded-xl bg-white border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-display font-semibold text-slate-900">
                Actividad reciente registrada
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Cada apertura del catálogo interactivo o clic en WhatsApp/Web se registra al instante.
              </p>
            </div>
            <span className="text-xs font-mono-tabular text-slate-400">
              {analytics.recentEvents.length} eventos
            </span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[280px] overflow-y-auto">
            {analytics.recentEvents.map((evt) => {
              const dt = new Date(evt.timestamp);
              const timeStr = dt.toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit',
              });
              return (
                <div
                  key={evt.id}
                  className="py-2.5 flex items-center justify-between gap-4 text-xs"
                >
                  <div className="min-w-0">
                    <span className="font-semibold text-slate-900">
                      {EVENT_LABELS[evt.type] || evt.type}
                    </span>
                    {evt.productName ? (
                      <span className="text-slate-600"> · {evt.productName}</span>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-3 shrink-0 text-[11px] text-slate-500 font-mono-tabular">
                    <span>{TRAFFIC_SOURCE_LABELS[evt.source]}</span>
                    <span aria-hidden="true">·</span>
                    <span>{LANGUAGE_MAP[evt.language]?.shortCode || evt.language}</span>
                    <span aria-hidden="true">·</span>
                    <span>{timeStr}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
