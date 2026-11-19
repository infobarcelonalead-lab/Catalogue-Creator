import {
  AnalyticsEvent,
  AnalyticsEventType,
  AnalyticsStore,
  LanguageCode,
  Product,
  TrafficSource,
} from '../types/catalog';

const ANALYTICS_STORAGE_KEY = 'sporttanger_studio_analytics_v1';

export const TRAFFIC_SOURCE_LABELS: Record<TrafficSource, string> = {
  whatsapp: 'WhatsApp Directo',
  instagram: 'Instagram Bio / Stories',
  facebook: 'Facebook',
  website: 'Web sporttanger.com',
  email_qr: 'Correo y QR Impreso',
  direct: 'Enlace Directo',
};

function buildSeedDailyMetrics() {
  const days = [];
  const baseViews = [64, 78, 71, 95, 112, 128, 104, 118, 134, 146, 129, 158, 174, 192];
  const baseWa = [11, 14, 12, 19, 23, 28, 21, 25, 29, 34, 27, 36, 41, 47];
  const baseWeb = [8, 9, 10, 12, 16, 18, 15, 17, 21, 22, 19, 24, 27, 31];
  const now = new Date();

  for (let i = 13; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const idx = 13 - i;
    const iso = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
    days.push({
      date: iso,
      label,
      views: baseViews[idx],
      whatsappClicks: baseWa[idx],
      webClicks: baseWeb[idx],
    });
  }
  return days;
}

export function createInitialAnalytics(products: Product[]): AnalyticsStore {
  const daily = buildSeedDailyMetrics();
  const totalViews = daily.reduce((s, d) => s + d.views, 0);

  const productStats: AnalyticsStore['productStats'] = {};
  const seedWeights = [
    { views: 486, whatsappClicks: 118, webClicks: 74 },
    { views: 442, whatsappClicks: 109, webClicks: 81 },
    { views: 378, whatsappClicks: 84, webClicks: 52 },
    { views: 297, whatsappClicks: 66, webClicks: 42 },
  ];

  products.forEach((p, i) => {
    productStats[p.id] = seedWeights[i] || {
      views: Math.max(45, 180 - i * 25),
      whatsappClicks: Math.max(8, 34 - i * 6),
      webClicks: Math.max(6, 22 - i * 4),
    };
  });

  const now = Date.now();
  const recentEvents: AnalyticsEvent[] = [
    {
      id: 'evt-seed-1',
      timestamp: new Date(now - 1000 * 60 * 14).toISOString(),
      type: 'whatsapp_click',
      productId: products[1]?.id,
      productName: products[1]?.name || 'Zapatillas Stride Tanger Aero',
      source: 'instagram',
      language: 'es',
    },
    {
      id: 'evt-seed-2',
      timestamp: new Date(now - 1000 * 60 * 37).toISOString(),
      type: 'web_click',
      productId: products[0]?.id,
      productName: products[0]?.name || 'Chaqueta Técnica Atlas Pro',
      source: 'whatsapp',
      language: 'fr',
    },
    {
      id: 'evt-seed-3',
      timestamp: new Date(now - 1000 * 60 * 62).toISOString(),
      type: 'catalog_view',
      source: 'website',
      language: 'ar',
    },
    {
      id: 'evt-seed-4',
      timestamp: new Date(now - 1000 * 60 * 95).toISOString(),
      type: 'whatsapp_click',
      productId: products[2]?.id,
      productName: products[2]?.name || 'Sudadera Heavyweight 480g',
      source: 'facebook',
      language: 'en',
    },
  ];

  return {
    totalViews,
    uniqueVisitors: Math.round(totalViews * 0.68),
    avgTimeSec: 164,
    daily,
    sources: {
      whatsapp: 542,
      instagram: 438,
      website: 289,
      facebook: 184,
      email_qr: 102,
      direct: 48,
    },
    languages: {
      es: 734,
      fr: 482,
      ar: 264,
      en: 123,
    },
    productStats,
    recentEvents,
  };
}

export function loadAnalytics(products: Product[]): AnalyticsStore {
  try {
    const raw = localStorage.getItem(ANALYTICS_STORAGE_KEY);
    if (!raw) {
      const seeded = createInitialAnalytics(products);
      localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    const parsed = JSON.parse(raw) as AnalyticsStore;
    if (!parsed || !Array.isArray(parsed.daily)) {
      return createInitialAnalytics(products);
    }
    return parsed;
  } catch {
    return createInitialAnalytics(products);
  }
}

export function saveAnalytics(store: AnalyticsStore): void {
  try {
    localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Ignore storage quota errors
  }
}

export function detectTrafficSourceFromUrl(): TrafficSource {
  try {
    const params = new URLSearchParams(window.location.search);
    const utm = (params.get('utm_source') || params.get('src') || '').toLowerCase();
    if (utm.includes('wa') || utm.includes('whatsapp')) return 'whatsapp';
    if (utm.includes('ig') || utm.includes('insta')) return 'instagram';
    if (utm.includes('fb') || utm.includes('facebook')) return 'facebook';
    if (utm.includes('web') || utm.includes('sporttanger')) return 'website';
    if (utm.includes('mail') || utm.includes('qr') || utm.includes('pdf')) return 'email_qr';
  } catch {
    // Ignore URL parsing issues
  }
  return 'direct';
}

export function recordAnalyticsEvent(
  current: AnalyticsStore,
  event: {
    type: AnalyticsEventType;
    productId?: string;
    productName?: string;
    source?: TrafficSource;
    language: LanguageCode;
  }
): AnalyticsStore {
  const source = event.source || detectTrafficSourceFromUrl();
  const todayIso = new Date().toISOString().slice(0, 10);
  const todayLabel = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });

  const daily = [...current.daily];
  let lastDay = daily[daily.length - 1];
  if (!lastDay || lastDay.date !== todayIso) {
    lastDay = { date: todayIso, label: todayLabel, views: 0, whatsappClicks: 0, webClicks: 0 };
    daily.push(lastDay);
    if (daily.length > 14) daily.shift();
  } else {
    lastDay = { ...lastDay };
    daily[daily.length - 1] = lastDay;
  }

  const nextSources = { ...current.sources };
  const nextLanguages = { ...current.languages };
  const nextProductStats = { ...current.productStats };

  let totalViews = current.totalViews;
  let uniqueVisitors = current.uniqueVisitors;

  if (event.type === 'catalog_view') {
    totalViews += 1;
    uniqueVisitors += 1;
    lastDay.views += 1;
    nextSources[source] = (nextSources[source] || 0) + 1;
    nextLanguages[event.language] = (nextLanguages[event.language] || 0) + 1;
  }

  if (event.type === 'language_change') {
    nextLanguages[event.language] = (nextLanguages[event.language] || 0) + 1;
  }

  if (event.productId) {
    const prev = nextProductStats[event.productId] || { views: 0, whatsappClicks: 0, webClicks: 0 };
    const updated = { ...prev };
    if (event.type === 'product_view') {
      updated.views += 1;
    } else if (event.type === 'whatsapp_click') {
      updated.whatsappClicks += 1;
      lastDay.whatsappClicks += 1;
    } else if (event.type === 'web_click') {
      updated.webClicks += 1;
      lastDay.webClicks += 1;
    }
    nextProductStats[event.productId] = updated;
  } else {
    if (event.type === 'whatsapp_click') lastDay.whatsappClicks += 1;
    if (event.type === 'web_click') lastDay.webClicks += 1;
  }

  const newEvent: AnalyticsEvent = {
    id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    type: event.type,
    productId: event.productId,
    productName: event.productName,
    source,
    language: event.language,
  };

  const next: AnalyticsStore = {
    ...current,
    totalViews,
    uniqueVisitors,
    daily,
    sources: nextSources,
    languages: nextLanguages,
    productStats: nextProductStats,
    recentEvents: [newEvent, ...current.recentEvents].slice(0, 30),
  };

  saveAnalytics(next);
  return next;
}

export function exportAnalyticsCsv(store: AnalyticsStore, products: Product[]): void {
  const rows: string[][] = [
    ['Seccion', 'Elemento', 'Visualizaciones', 'Clics WhatsApp', 'Clics Web', 'Tasa Conversion (%)'],
  ];

  for (const p of products) {
    const stat = store.productStats[p.id] || { views: 0, whatsappClicks: 0, webClicks: 0 };
    const totalClicks = stat.whatsappClicks + stat.webClicks;
    const rate = stat.views > 0 ? ((totalClicks / stat.views) * 100).toFixed(1) : '0.0';
    rows.push([
      'Producto',
      `${p.sku} - ${p.name}`,
      String(stat.views),
      String(stat.whatsappClicks),
      String(stat.webClicks),
      rate,
    ]);
  }

  (Object.keys(store.sources) as TrafficSource[]).forEach((src) => {
    rows.push(['Fuente Trafico', TRAFFIC_SOURCE_LABELS[src], String(store.sources[src]), '', '', '']);
  });

  const csv = rows
    .map((cols) => cols.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `analiticas-sporttanger-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
