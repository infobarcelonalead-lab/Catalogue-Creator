import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ExternalLink, MessageCircle, Search } from 'lucide-react';
import { CATALOG_UI_STRINGS, LANGUAGE_MAP, TEMPLATE_THEMES } from '../data/templates';
import {
  AnalyticsEventType,
  CatalogData,
  LanguageCode,
  TrafficSource,
} from '../types/catalog';
import {
  buildGeneralWhatsAppUrl,
  buildProductWhatsAppUrl,
  formatPrice,
  getLocalizedColorName,
  getLocalizedCover,
  getLocalizedPresentation,
  getLocalizedProduct,
  normalizeWebsiteUrl,
} from '../utils/formatters';
import { QrCodeBox } from './QrCodeBox';

interface WebCatalogViewerProps {
  catalog: CatalogData;
  initialLanguage: LanguageCode;
  trafficSource: TrafficSource;
  showBackToEditor?: boolean;
  onBackToEditor?: () => void;
  onTrackEvent: (event: {
    type: AnalyticsEventType;
    productId?: string;
    productName?: string;
    source: TrafficSource;
    language: LanguageCode;
  }) => void;
}

export function WebCatalogViewer({
  catalog,
  initialLanguage,
  trafficSource,
  showBackToEditor = true,
  onBackToEditor,
  onTrackEvent,
}: WebCatalogViewerProps) {
  const [lang, setLang] = useState<LanguageCode>(
    catalog.enabledLanguages.includes(initialLanguage)
      ? initialLanguage
      : catalog.primaryLanguage
  );
  const [activeCategory, setActiveCategory] = useState<string>('__ALL__');
  const [search, setSearch] = useState('');
  const [selectedColorIdx, setSelectedColorIdx] = useState<Record<string, number>>({});
  const trackedOpenRef = useRef(false);

  const theme = TEMPLATE_THEMES[catalog.templateId] || TEMPLATE_THEMES.editorial_urbano;
  const ui = CATALOG_UI_STRINGS[lang] || CATALOG_UI_STRINGS.es;
  const langMeta = LANGUAGE_MAP[lang] || LANGUAGE_MAP.es;
  const cover = getLocalizedCover(catalog, lang);
  const pres = getLocalizedPresentation(catalog, lang);
  const websiteHref = normalizeWebsiteUrl(catalog.websiteUrl);
  const generalWaHref = buildGeneralWhatsAppUrl(catalog, lang);
  const headingClass = theme.headingFont === 'editorial' ? 'font-editorial' : 'font-display';

  // Record a real catalog_view once when viewer opens
  useEffect(() => {
    if (trackedOpenRef.current) return;
    trackedOpenRef.current = true;
    onTrackEvent({
      type: 'catalog_view',
      source: trafficSource,
      language: lang,
    });
  }, [lang, onTrackEvent, trafficSource]);

  const localizedProducts = useMemo(
    () =>
      catalog.products.map((product) => ({
        raw: product,
        loc: getLocalizedProduct(product, lang, catalog.primaryLanguage),
      })),
    [catalog.products, catalog.primaryLanguage, lang]
  );

  const categories = useMemo(
    () => Array.from(new Set(localizedProducts.map((p) => p.loc.category))),
    [localizedProducts]
  );

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return localizedProducts.filter(({ raw, loc }) => {
      const catOk = activeCategory === '__ALL__' || loc.category === activeCategory;
      const qOk =
        !q ||
        loc.name.toLowerCase().includes(q) ||
        raw.sku.toLowerCase().includes(q) ||
        loc.category.toLowerCase().includes(q) ||
        loc.description.toLowerCase().includes(q);
      return catOk && qOk;
    });
  }, [localizedProducts, activeCategory, search]);

  const handleChangeLanguage = (nextLang: LanguageCode) => {
    setLang(nextLang);
    setActiveCategory('__ALL__');
    onTrackEvent({
      type: 'language_change',
      source: trafficSource,
      language: nextLang,
    });
  };

  return (
    <div
      dir={langMeta.dir}
      className="min-h-screen transition-colors"
      style={{ backgroundColor: theme.pageBg, color: theme.textPrimary }}
    >
      {/* Clean Sticky Header */}
      <header
        className="sticky top-0 z-30 border-b backdrop-blur-md"
        style={{
          backgroundColor: theme.isDark ? 'rgba(15,23,42,0.92)' : 'rgba(255,255,255,0.94)',
          borderColor: theme.borderColor,
        }}
      >
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between gap-6">
          <div className="flex items-center gap-4 min-w-0">
            {showBackToEditor && onBackToEditor ? (
              <button
                type="button"
                onClick={onBackToEditor}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors whitespace-nowrap shrink-0"
                style={{ borderColor: theme.borderColor, color: theme.textPrimary }}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Volver al estudio
              </button>
            ) : null}
            <a
              href={websiteHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                onTrackEvent({ type: 'web_click', source: trafficSource, language: lang })
              }
              className={`${headingClass} text-lg font-bold tracking-tight whitespace-nowrap truncate`}
            >
              {catalog.brandName}
            </a>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Customer Language Selector */}
            {catalog.enabledLanguages.length > 1 ? (
              <div
                className="flex items-center gap-0.5 p-0.5 rounded-lg border"
                style={{ backgroundColor: theme.surfaceBg, borderColor: theme.borderColor }}
                role="group"
                aria-label={ui.languageLabel}
              >
                {catalog.enabledLanguages.map((code) => {
                  const meta = LANGUAGE_MAP[code];
                  const isActive = code === lang;
                  return (
                    <button
                      key={code}
                      type="button"
                      onClick={() => handleChangeLanguage(code)}
                      className="px-2.5 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap"
                      style={
                        isActive
                          ? { backgroundColor: catalog.accentColor, color: '#FFFFFF' }
                          : { color: theme.textMuted }
                      }
                      title={meta.nativeName}
                    >
                      {meta.shortCode}
                    </button>
                  );
                })}
              </div>
            ) : null}

            <a
              href={generalWaHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                onTrackEvent({ type: 'whatsapp_click', source: trafficSource, language: lang })
              }
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-[#059669] text-white hover:opacity-95 whitespace-nowrap"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              {ui.orderWhatsApp}
            </a>
          </div>
        </div>
      </header>

      {/* Hero Cover */}
      <section className="relative min-h-[480px] flex items-end overflow-hidden border-b" style={{ borderColor: theme.borderColor }}>
        <img
          src={catalog.cover.imageUrl}
          alt={cover.title}
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: theme.coverOverlay }} />

        <div className="relative z-10 max-w-[1200px] w-full mx-auto px-6 py-16 text-white">
          <div className="text-xs uppercase tracking-[0.2em] font-semibold opacity-90 mb-3">
            {cover.eyebrow}
          </div>
          <h1
            className={`${headingClass} text-4xl sm:text-5xl font-bold leading-[1.06] max-w-2xl mb-4`}
            style={{ textWrap: 'balance' }}
          >
            {cover.title}
          </h1>
          <p className="text-base opacity-90 max-w-xl mb-6 leading-relaxed">{cover.subtitle}</p>
          <div className="flex flex-wrap items-center gap-3 text-xs opacity-90">
            <span>{cover.season}</span>
            <span aria-hidden="true">·</span>
            <span>{cover.edition}</span>
            <span aria-hidden="true">·</span>
            <a
              href={websiteHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                onTrackEvent({ type: 'web_click', source: trafficSource, language: lang })
              }
              className="underline underline-offset-4 font-semibold"
            >
              {catalog.websiteDisplay}
            </a>
          </div>
        </div>
      </section>

      {/* Presentation & Brand Story */}
      <section className="py-16 border-b" style={{ borderColor: theme.borderColor }}>
        <div className="max-w-[1200px] mx-auto px-6 space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-4">
              <div
                className="text-xs uppercase tracking-[0.16em] font-semibold"
                style={{ color: catalog.accentColor }}
              >
                {ui.presentationLabel}
              </div>
              <h2 className={`${headingClass} text-3xl font-bold leading-tight`}>
                {pres.heading}
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: theme.textMuted }}>
                {pres.story}
              </p>
              <p className="text-xs font-semibold pt-2" style={{ color: catalog.accentColor }}>
                {pres.shippingNote}
              </p>
            </div>
            <div className="lg:col-span-6">
              <div
                className="rounded-xl overflow-hidden border aspect-[4/3]"
                style={{ borderColor: theme.borderColor }}
              >
                <img
                  src={catalog.presentation.studioImageUrl}
                  alt={pres.heading}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {pres.pillars.map((pillar, idx) => (
              <div
                key={idx}
                className="p-5 rounded-xl border"
                style={{ backgroundColor: theme.surfaceBg, borderColor: theme.borderColor }}
              >
                <div
                  className="font-mono-tabular text-xs font-semibold mb-1.5"
                  style={{ color: catalog.accentColor }}
                >
                  0{idx + 1}
                </div>
                <h3 className="font-display text-sm font-bold mb-1.5">{pillar.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: theme.textMuted }}>
                  {pillar.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Product Grid */}
      <section className="py-16 border-b" style={{ borderColor: theme.borderColor }}>
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div>
              <div
                className="text-xs uppercase tracking-[0.16em] font-semibold mb-1"
                style={{ color: catalog.accentColor }}
              >
                {ui.productsLabel}
              </div>
              <h2 className={`${headingClass} text-2xl sm:text-3xl font-bold`}>
                {cover.season}
              </h2>
            </div>

            <div className="relative w-full sm:w-72">
              <Search
                className="w-4 h-4 absolute top-1/2 -translate-y-1/2 opacity-50"
                style={{ insetInlineStart: 12 }}
              />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={ui.searchPlaceholder}
                className="w-full py-2 text-sm rounded-lg border focus:outline-none"
                style={{
                  paddingInlineStart: 36,
                  paddingInlineEnd: 12,
                  backgroundColor: theme.surfaceBg,
                  borderColor: theme.borderColor,
                  color: theme.textPrimary,
                }}
              />
            </div>
          </div>

          {/* Category Filter Bar */}
          <div className="flex flex-wrap items-center gap-2 mb-8">
            <button
              type="button"
              onClick={() => setActiveCategory('__ALL__')}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors"
              style={
                activeCategory === '__ALL__'
                  ? {
                      backgroundColor: catalog.accentColor,
                      borderColor: catalog.accentColor,
                      color: '#FFFFFF',
                    }
                  : {
                      backgroundColor: theme.surfaceBg,
                      borderColor: theme.borderColor,
                      color: theme.textPrimary,
                    }
              }
            >
              {ui.allCategories}
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors"
                style={
                  activeCategory === cat
                    ? {
                        backgroundColor: catalog.accentColor,
                        borderColor: catalog.accentColor,
                        color: '#FFFFFF',
                      }
                    : {
                        backgroundColor: theme.surfaceBg,
                        borderColor: theme.borderColor,
                        color: theme.textPrimary,
                      }
                }
              >
                {cat}
              </button>
            ))}
          </div>

          {filteredProducts.length === 0 ? (
            <div className="py-16 text-center text-sm" style={{ color: theme.textMuted }}>
              {ui.noProductsFound}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(({ raw, loc }) => {
                const chosenIdx = selectedColorIdx[raw.id] ?? 0;
                const chosenSwatch = raw.colors[chosenIdx];
                const chosenColorName = chosenSwatch
                  ? getLocalizedColorName(chosenSwatch, lang, catalog.primaryLanguage)
                  : undefined;
                const waHref = buildProductWhatsAppUrl(catalog, raw, lang, chosenColorName);

                return (
                  <article
                    key={raw.id}
                    onClick={() =>
                      onTrackEvent({
                        type: 'product_view',
                        productId: raw.id,
                        productName: raw.name,
                        source: trafficSource,
                        language: lang,
                      })
                    }
                    className="rounded-xl border overflow-hidden flex flex-col transition-transform duration-150 hover:-translate-y-0.5"
                    style={{ backgroundColor: theme.surfaceBg, borderColor: theme.borderColor }}
                  >
                    <div className="relative aspect-[4/3] bg-slate-200/40 overflow-hidden">
                      <img
                        src={raw.imageUrl}
                        alt={loc.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      {catalog.watermark.enabled ? (
                        <div
                          className="absolute inset-0 pointer-events-none flex items-center justify-center"
                          style={{ opacity: catalog.watermark.opacity }}
                        >
                          <div style={{ transform: `rotate(${catalog.watermark.rotation}deg)` }}>
                            {catalog.watermark.mode === 'logo' && catalog.watermark.logoDataUrl ? (
                              <img
                                src={catalog.watermark.logoDataUrl}
                                alt="Marca de agua"
                                className="h-9 object-contain"
                              />
                            ) : (
                              <span className="font-display font-bold tracking-[0.2em] text-xs uppercase text-slate-900">
                                {catalog.watermark.text}
                              </span>
                            )}
                          </div>
                        </div>
                      ) : null}
                    </div>

                    <div className="p-5 flex flex-col flex-1 justify-between gap-4">
                      <div className="space-y-2">
                        <div
                          className="flex items-center justify-between gap-2 text-xs"
                          style={{ color: theme.textMuted }}
                        >
                          <span className="truncate">
                            {loc.category} · {ui.refLabel} {raw.sku}
                          </span>
                          {loc.promoTag ? (
                            <span
                              className="font-semibold shrink-0"
                              style={{ color: catalog.accentColor }}
                            >
                              {loc.promoTag}
                            </span>
                          ) : null}
                        </div>

                        <h3 className={`${headingClass} text-lg font-bold leading-snug`}>
                          {loc.name}
                        </h3>
                        <p className="text-xs leading-relaxed" style={{ color: theme.textMuted }}>
                          {loc.description}
                        </p>
                      </div>

                      <div className="space-y-3">
                        <div className="text-xs" style={{ color: theme.textMuted }}>
                          <strong style={{ color: theme.textPrimary }}>{ui.sizesLabel}:</strong>{' '}
                          {raw.sizes}
                        </div>

                        {raw.colors.length > 0 ? (
                          <div
                            className="flex flex-wrap items-center gap-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {raw.colors.map((swatch, idx) => (
                              <button
                                key={swatch.id}
                                type="button"
                                onClick={() => {
                                  setSelectedColorIdx((prev) => ({ ...prev, [raw.id]: idx }));
                                  onTrackEvent({
                                    type: 'product_view',
                                    productId: raw.id,
                                    productName: raw.name,
                                    source: trafficSource,
                                    language: lang,
                                  });
                                }}
                                title={getLocalizedColorName(
                                  swatch,
                                  lang,
                                  catalog.primaryLanguage
                                )}
                                className={`w-5 h-5 rounded-full border border-black/25 transition-transform ${
                                  idx === chosenIdx
                                    ? 'ring-2 ring-offset-1 ring-slate-900 scale-110'
                                    : ''
                                }`}
                                style={{ backgroundColor: swatch.hex }}
                              />
                            ))}
                            {chosenColorName ? (
                              <span className="text-xs" style={{ color: theme.textMuted }}>
                                {chosenColorName}
                              </span>
                            ) : null}
                          </div>
                        ) : null}

                        <div
                          className="pt-3 border-t flex items-baseline gap-2"
                          style={{ borderColor: theme.borderColor }}
                        >
                          <span className="font-mono-tabular text-xl font-bold">
                            {formatPrice(raw.price, catalog.currency)}
                          </span>
                          {raw.oldPrice ? (
                            <span
                              className="font-mono-tabular text-xs line-through"
                              style={{ color: theme.textMuted }}
                            >
                              {formatPrice(raw.oldPrice, catalog.currency)}
                            </span>
                          ) : null}
                        </div>

                        <div
                          className="grid grid-cols-[1fr_auto] gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <a
                            href={waHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() =>
                              onTrackEvent({
                                type: 'whatsapp_click',
                                productId: raw.id,
                                productName: raw.name,
                                source: trafficSource,
                                language: lang,
                              })
                            }
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-[#059669] text-white text-xs font-semibold hover:opacity-95 whitespace-nowrap"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            {ui.orderWhatsApp}
                          </a>
                          <a
                            href={websiteHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() =>
                              onTrackEvent({
                                type: 'web_click',
                                productId: raw.id,
                                productName: raw.name,
                                source: trafficSource,
                                language: lang,
                              })
                            }
                            className="inline-flex items-center justify-center gap-1 px-3 py-2.5 rounded-lg border text-xs font-semibold hover:opacity-80 whitespace-nowrap"
                            style={{ borderColor: theme.borderColor, color: theme.textPrimary }}
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            {ui.orderWeb}
                          </a>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Footer with QR Codes */}
      <footer className="py-16">
        <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-3">
            <div
              className="text-xs uppercase tracking-[0.18em] font-semibold"
              style={{ color: catalog.accentColor }}
            >
              {catalog.websiteDisplay}
            </div>
            <h2 className={`${headingClass} text-3xl font-bold`}>{pres.backCoverHeadline}</h2>
            <p className="text-sm max-w-xl" style={{ color: theme.textMuted }}>
              {pres.backCoverSubline}
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs">
              <a
                href={websiteHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  onTrackEvent({ type: 'web_click', source: trafficSource, language: lang })
                }
                className="font-bold underline underline-offset-4"
                style={{ color: catalog.accentColor }}
              >
                {catalog.websiteDisplay}
              </a>
              <span aria-hidden="true">·</span>
              <span className="font-mono-tabular">WhatsApp: {catalog.whatsappNumber}</span>
              <span aria-hidden="true">·</span>
              <span>{catalog.email}</span>
            </div>
          </div>

          <div className="lg:col-span-5 flex items-start lg:justify-end gap-6 flex-wrap">
            <QrCodeBox value={websiteHref} size={108} label={ui.scanStore} />
            <QrCodeBox value={generalWaHref} size={108} label={ui.scanWhatsApp} />
          </div>
        </div>
      </footer>
    </div>
  );
}
