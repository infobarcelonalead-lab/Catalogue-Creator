import { useState } from 'react';
import { CATALOG_UI_STRINGS, LANGUAGE_MAP, TEMPLATE_THEMES } from '../data/templates';
import { CatalogData, LanguageCode, Product } from '../types/catalog';
import {
  buildGeneralWhatsAppUrl,
  buildProductWhatsAppUrl,
  chunkProductsForPages,
  formatPrice,
  getLocalizedColorName,
  getLocalizedCover,
  getLocalizedPresentation,
  getLocalizedProduct,
  normalizeWebsiteUrl,
} from '../utils/formatters';
import { QrCodeBox } from './QrCodeBox';

interface CatalogPagesProps {
  catalog: CatalogData;
  language: LanguageCode;
  scale?: number;
}

function SafeCatalogImage({
  src,
  alt,
  className = '',
  fallbackTitle,
}: {
  src: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-slate-100 text-slate-400 p-4 text-center ${className}`}
      >
        <svg className="w-8 h-8 mb-2 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <circle cx="9" cy="10" r="1.5" />
          <path d="M21 15l-5-5L5 20" />
        </svg>
        <span className="text-[11px] font-medium text-slate-500 line-clamp-2">
          {fallbackTitle || alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}

function WatermarkOverlay({ catalog, isCover }: { catalog: CatalogData; isCover?: boolean }) {
  const wm = catalog.watermark;
  if (!wm.enabled) return null;
  if (isCover && !wm.includeOnCover) return null;

  const sizeClass =
    wm.size === 'sm' ? 'text-[12px]' : wm.size === 'lg' ? 'text-[22px]' : 'text-[16px]';
  const logoHeight = wm.size === 'sm' ? 28 : wm.size === 'lg' ? 64 : 44;

  const renderMark = () =>
    wm.mode === 'logo' && wm.logoDataUrl ? (
      <img
        src={wm.logoDataUrl}
        alt="Marca de agua"
        referrerPolicy="no-referrer"
        style={{ height: logoHeight, maxWidth: 220 }}
        className="object-contain select-none"
      />
    ) : (
      <span
        className={`font-display font-bold tracking-[0.22em] uppercase select-none whitespace-nowrap ${sizeClass}`}
        style={{ color: isCover ? '#FFFFFF' : '#0F172A' }}
      >
        {wm.text || 'SPORTTANGER.COM'}
      </span>
    );

  if (wm.position === 'tile') {
    return (
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden z-20 grid grid-cols-3 grid-rows-4 items-center justify-items-center"
        style={{ opacity: wm.opacity }}
      >
        {Array.from({ length: 12 }).map((_, idx) => (
          <div key={idx} style={{ transform: `rotate(${wm.rotation}deg)` }}>
            {renderMark()}
          </div>
        ))}
      </div>
    );
  }

  if (wm.position === 'center_diagonal') {
    return (
      <div
        className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center"
        style={{ opacity: wm.opacity }}
      >
        <div style={{ transform: `rotate(${wm.rotation}deg)` }}>{renderMark()}</div>
      </div>
    );
  }

  const posClass =
    wm.position === 'top_right'
      ? 'top-10 right-10'
      : 'bottom-14 right-10';

  return (
    <div
      className={`absolute ${posClass} pointer-events-none z-20`}
      style={{ opacity: wm.opacity, transform: `rotate(${wm.rotation}deg)` }}
    >
      {renderMark()}
    </div>
  );
}

export function CatalogPages({ catalog, language, scale = 1 }: CatalogPagesProps) {
  const theme = TEMPLATE_THEMES[catalog.templateId] || TEMPLATE_THEMES.editorial_urbano;
  const ui = CATALOG_UI_STRINGS[language] || CATALOG_UI_STRINGS.es;
  const langMeta = LANGUAGE_MAP[language] || LANGUAGE_MAP.es;
  const cover = getLocalizedCover(catalog, language);
  const pres = getLocalizedPresentation(catalog, language);

  const websiteHref = normalizeWebsiteUrl(catalog.websiteUrl);
  const generalWaHref = buildGeneralWhatsAppUrl(catalog, language);
  const headingClass = theme.headingFont === 'editorial' ? 'font-editorial' : 'font-display';

  const productPages = chunkProductsForPages(
    catalog.products,
    catalog.productLayout,
    catalog.groupByCategory,
    language,
    catalog.primaryLanguage
  );

  const totalPages = 2 + productPages.length + (catalog.includeBackCover ? 1 : 0);

  const pageShellStyle: React.CSSProperties = {
    width: 794,
    height: 1123,
    backgroundColor: theme.pageBg,
    color: theme.textPrimary,
    borderColor: theme.borderColor,
  };

  const renderFooter = (pageNum: number) => (
    <div
      className="h-12 px-10 border-t flex items-center justify-between text-[11px] shrink-0"
      style={{ borderColor: theme.borderColor, color: theme.textMuted }}
    >
      <div className="flex items-center gap-3">
        <span className="font-semibold" style={{ color: theme.textPrimary }}>
          {catalog.brandName}
        </span>
        <span aria-hidden="true">·</span>
        <a
          href={websiteHref}
          target="_blank"
          rel="noopener noreferrer"
          data-pdf-link={websiteHref}
          className="underline decoration-dotted underline-offset-2"
          style={{ color: catalog.accentColor }}
        >
          {catalog.websiteDisplay}
        </a>
      </div>
      <div className="flex items-center gap-4">
        <a
          href={generalWaHref}
          target="_blank"
          rel="noopener noreferrer"
          data-pdf-link={generalWaHref}
          className="font-mono-tabular"
        >
          WhatsApp: {catalog.whatsappNumber}
        </a>
        <span aria-hidden="true">·</span>
        <span className="font-mono-tabular">
          {ui.pageLabel} {pageNum} / {totalPages}
        </span>
      </div>
    </div>
  );

  const renderProductCard = (product: Product, layout: CatalogData['productLayout']) => {
    const loc = getLocalizedProduct(product, language, catalog.primaryLanguage);
    const defaultColor = product.colors[0]
      ? getLocalizedColorName(product.colors[0], language, catalog.primaryLanguage)
      : undefined;
    const waHref = buildProductWhatsAppUrl(catalog, product, language, defaultColor);

    if (layout === 'featured_list') {
      return (
        <div
          key={product.id}
          className="flex gap-5 rounded-lg border overflow-hidden p-4 h-[268px]"
          style={{ backgroundColor: theme.surfaceBg, borderColor: theme.borderColor }}
        >
          <div className="w-[265px] h-full shrink-0 rounded-md overflow-hidden bg-slate-200/60">
            <SafeCatalogImage
              src={product.imageUrl}
              alt={loc.name}
              fallbackTitle={loc.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col flex-1 min-w-0 justify-between py-0.5">
            <div>
              <div className="flex items-center justify-between gap-2 text-[11px] mb-1.5" style={{ color: theme.textMuted }}>
                <span className="truncate">
                  {loc.category} · {ui.refLabel} {product.sku}
                </span>
                {loc.promoTag ? (
                  <span className="font-semibold shrink-0" style={{ color: catalog.accentColor }}>
                    {loc.promoTag}
                  </span>
                ) : null}
              </div>
              <h3 className={`${headingClass} text-[20px] font-bold leading-snug mb-2`}>
                {loc.name}
              </h3>
              <p className="text-[12.5px] leading-relaxed line-clamp-3" style={{ color: theme.textMuted }}>
                {loc.description}
              </p>
            </div>

            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px]" style={{ color: theme.textMuted }}>
                <span>
                  <strong style={{ color: theme.textPrimary }}>{ui.sizesLabel}:</strong> {product.sizes}
                </span>
                {product.colors.length > 0 ? (
                  <div className="flex items-center gap-1.5">
                    {product.colors.slice(0, 5).map((c) => (
                      <span key={c.id} className="inline-flex items-center gap-1">
                        <span
                          className="w-3 h-3 rounded-full border border-black/20 inline-block"
                          style={{ backgroundColor: c.hex }}
                        />
                        <span>{getLocalizedColorName(c, language, catalog.primaryLanguage)}</span>
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>

              <div
                className="pt-2.5 border-t flex items-center justify-between gap-3"
                style={{ borderColor: theme.borderColor }}
              >
                <div className="flex items-baseline gap-2">
                  <span className="font-mono-tabular text-[20px] font-bold">
                    {formatPrice(product.price, catalog.currency)}
                  </span>
                  {product.oldPrice ? (
                    <span
                      className="font-mono-tabular text-[12px] line-through"
                      style={{ color: theme.textMuted }}
                    >
                      {formatPrice(product.oldPrice, catalog.currency)}
                    </span>
                  ) : null}
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={waHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-pdf-link={waHref}
                    className="px-3.5 py-1.5 rounded-md text-[11px] font-semibold text-white bg-[#059669]"
                  >
                    {ui.orderWhatsApp}
                  </a>
                  <a
                    href={websiteHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-pdf-link={websiteHref}
                    className="px-3 py-1.5 rounded-md text-[11px] font-semibold border"
                    style={{ borderColor: theme.borderColor, color: theme.textPrimary }}
                  >
                    {catalog.websiteDisplay}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    const compact = layout === 'grid_2x3';
    return (
      <div
        key={product.id}
        className="flex flex-col rounded-lg border overflow-hidden"
        style={{
          backgroundColor: theme.surfaceBg,
          borderColor: theme.borderColor,
          height: compact ? 286 : 436,
        }}
      >
        <div
          className="w-full shrink-0 overflow-hidden bg-slate-200/50"
          style={{ height: compact ? 136 : 238 }}
        >
          <SafeCatalogImage
            src={product.imageUrl}
            alt={loc.name}
            fallbackTitle={loc.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className={`flex flex-col flex-1 justify-between ${compact ? 'p-3' : 'p-4'}`}>
          <div>
            <div className="flex items-center justify-between gap-2 text-[10px] mb-1" style={{ color: theme.textMuted }}>
              <span className="truncate">
                {loc.category} · {product.sku}
              </span>
              {loc.promoTag ? (
                <span className="font-semibold shrink-0" style={{ color: catalog.accentColor }}>
                  {loc.promoTag}
                </span>
              ) : null}
            </div>
            <h3 className={`${headingClass} font-bold leading-snug line-clamp-1 ${compact ? 'text-[14px]' : 'text-[16px] mb-1'}`}>
              {loc.name}
            </h3>
            {!compact ? (
              <p className="text-[11.5px] leading-relaxed line-clamp-2 mb-2" style={{ color: theme.textMuted }}>
                {loc.description}
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2 text-[10.5px]" style={{ color: theme.textMuted }}>
              <span className="truncate">
                {ui.sizesLabel}: {product.sizes}
              </span>
              {product.colors.length > 0 ? (
                <div className="flex items-center gap-1 shrink-0">
                  {product.colors.slice(0, 4).map((c) => (
                    <span
                      key={c.id}
                      title={getLocalizedColorName(c, language, catalog.primaryLanguage)}
                      className="w-3 h-3 rounded-full border border-black/20 inline-block"
                      style={{ backgroundColor: c.hex }}
                    />
                  ))}
                </div>
              ) : null}
            </div>

            {!compact && product.colors.length > 0 ? (
              <div className="text-[10px] truncate" style={{ color: theme.textMuted }}>
                {product.colors
                  .map((c) => getLocalizedColorName(c, language, catalog.primaryLanguage))
                  .join(' · ')}
              </div>
            ) : null}

            <div
              className="pt-2 border-t flex items-center justify-between gap-2"
              style={{ borderColor: theme.borderColor }}
            >
              <div className="flex items-baseline gap-1.5">
                <span className={`font-mono-tabular font-bold ${compact ? 'text-[15px]' : 'text-[17px]'}`}>
                  {formatPrice(product.price, catalog.currency)}
                </span>
                {product.oldPrice ? (
                  <span
                    className="font-mono-tabular text-[11px] line-through"
                    style={{ color: theme.textMuted }}
                  >
                    {formatPrice(product.oldPrice, catalog.currency)}
                  </span>
                ) : null}
              </div>
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                data-pdf-link={waHref}
                className="px-2.5 py-1 rounded text-[10px] font-semibold text-white bg-[#059669] whitespace-nowrap"
              >
                {ui.orderWhatsApp}
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      dir={langMeta.dir}
      className="flex flex-col items-center gap-8"
      style={{
        transform: scale !== 1 ? `scale(${scale})` : undefined,
        transformOrigin: 'top center',
      }}
    >
      {/* PAGE 1: COVER */}
      <article
        className="catalog-a4-page relative shadow-sm border overflow-hidden flex flex-col"
        style={pageShellStyle}
      >
        <WatermarkOverlay catalog={catalog} isCover />

        {catalog.coverLayout === 'full_bleed' ? (
          <div className="relative w-full h-full flex flex-col justify-between">
            <SafeCatalogImage
              src={catalog.cover.imageUrl}
              alt={cover.title}
              fallbackTitle={cover.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0" style={{ background: theme.coverOverlay }} />

            <div className="relative z-10 px-12 pt-12 flex items-center justify-between text-white">
              <span className="text-[12px] tracking-[0.2em] uppercase font-semibold">
                {cover.eyebrow}
              </span>
              <span className="font-mono-tabular text-[12px] opacity-90">{cover.season}</span>
            </div>

            <div className="relative z-10 px-12 pb-14 text-white">
              <div
                className="w-14 h-1 mb-6"
                style={{ backgroundColor: catalog.accentColor }}
              />
              <h1
                className={`${headingClass} text-[54px] font-bold leading-[1.05] tracking-tight mb-5 max-w-[640px]`}
                style={{ textWrap: 'balance' }}
              >
                {cover.title}
              </h1>
              <p className="text-[16px] leading-relaxed opacity-90 max-w-[540px] mb-10">
                {cover.subtitle}
              </p>

              <div className="pt-6 border-t border-white/25 flex items-center justify-between text-[13px]">
                <div className="flex items-center gap-3">
                  <span className="font-semibold">{cover.edition}</span>
                  <span aria-hidden="true">·</span>
                  <a
                    href={websiteHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-pdf-link={websiteHref}
                    className="underline underline-offset-4"
                  >
                    {catalog.websiteDisplay}
                  </a>
                </div>
                <a
                  href={generalWaHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-pdf-link={generalWaHref}
                  className="font-mono-tabular font-medium"
                >
                  WhatsApp {catalog.whatsappNumber}
                </a>
              </div>
            </div>
          </div>
        ) : catalog.coverLayout === 'split' ? (
          <div className="w-full h-full grid grid-cols-12">
            <div className="col-span-5 px-10 py-14 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="text-[11px] uppercase tracking-[0.18em] font-semibold" style={{ color: catalog.accentColor }}>
                  {cover.eyebrow}
                </div>
                <div className="text-[12px] font-mono-tabular" style={{ color: theme.textMuted }}>
                  {cover.season} · {cover.edition}
                </div>
              </div>

              <div>
                <h1
                  className={`${headingClass} text-[40px] font-bold leading-[1.08] tracking-tight mb-5`}
                  style={{ textWrap: 'balance' }}
                >
                  {cover.title}
                </h1>
                <p className="text-[14px] leading-relaxed" style={{ color: theme.textMuted }}>
                  {cover.subtitle}
                </p>
              </div>

              <div className="space-y-3 pt-6 border-t" style={{ borderColor: theme.borderColor }}>
                <a
                  href={websiteHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-pdf-link={websiteHref}
                  className="block text-[14px] font-bold"
                  style={{ color: catalog.accentColor }}
                >
                  {catalog.websiteDisplay}
                </a>
                <a
                  href={generalWaHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-pdf-link={generalWaHref}
                  className="block text-[12px] font-mono-tabular"
                  style={{ color: theme.textMuted }}
                >
                  WhatsApp: {catalog.whatsappNumber}
                </a>
              </div>
            </div>
            <div className="col-span-7 h-full relative">
              <SafeCatalogImage
                src={catalog.cover.imageUrl}
                alt={cover.title}
                fallbackTitle={cover.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        ) : (
          /* FRAMED POSTER */
          <div className="w-full h-full p-12 flex flex-col justify-between">
            <div className="flex items-center justify-between pb-5 border-b" style={{ borderColor: theme.borderColor }}>
              <span className="text-[12px] uppercase tracking-[0.2em] font-bold" style={{ color: catalog.accentColor }}>
                {cover.eyebrow}
              </span>
              <span className="font-mono-tabular text-[12px]" style={{ color: theme.textMuted }}>
                {cover.season} · {cover.edition}
              </span>
            </div>

            <div className="my-7 flex-1 rounded-md overflow-hidden border" style={{ borderColor: theme.borderColor }}>
              <SafeCatalogImage
                src={catalog.cover.imageUrl}
                alt={cover.title}
                fallbackTitle={cover.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="grid grid-cols-12 gap-6 items-end pt-2">
              <div className="col-span-8">
                <h1 className={`${headingClass} text-[38px] font-bold leading-[1.08] mb-3`}>
                  {cover.title}
                </h1>
                <p className="text-[13.5px] leading-relaxed" style={{ color: theme.textMuted }}>
                  {cover.subtitle}
                </p>
              </div>
              <div className="col-span-4 text-right space-y-1.5">
                <a
                  href={websiteHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-pdf-link={websiteHref}
                  className="block text-[13px] font-bold"
                  style={{ color: catalog.accentColor }}
                >
                  {catalog.websiteDisplay}
                </a>
                <a
                  href={generalWaHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-pdf-link={generalWaHref}
                  className="block text-[11.5px] font-mono-tabular"
                  style={{ color: theme.textMuted }}
                >
                  {catalog.whatsappNumber}
                </a>
              </div>
            </div>
          </div>
        )}
      </article>

      {/* PAGE 2: BRAND PRESENTATION */}
      <article
        className="catalog-a4-page relative shadow-sm border overflow-hidden flex flex-col justify-between"
        style={pageShellStyle}
      >
        <WatermarkOverlay catalog={catalog} />

        <div className="flex-1 px-12 pt-12 pb-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <span className="text-[11px] uppercase tracking-[0.18em] font-semibold" style={{ color: catalog.accentColor }}>
                01. {ui.presentationLabel}
              </span>
              <span className="font-mono-tabular text-[11px]" style={{ color: theme.textMuted }}>
                {catalog.websiteDisplay}
              </span>
            </div>

            {catalog.presentationLayout === 'asymmetric' ? (
              <div className="grid grid-cols-12 gap-8 items-start mb-9">
                <div className="col-span-6">
                  <h2 className={`${headingClass} text-[30px] font-bold leading-[1.15] mb-4`}>
                    {pres.heading}
                  </h2>
                  <p className="text-[13.5px] leading-[1.68]" style={{ color: theme.textMuted }}>
                    {pres.story}
                  </p>
                </div>
                <div className="col-span-6">
                  <div className="rounded-lg overflow-hidden border h-[330px]" style={{ borderColor: theme.borderColor }}>
                    <SafeCatalogImage
                      src={catalog.presentation.studioImageUrl}
                      alt={pres.heading}
                      fallbackTitle={pres.heading}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            ) : catalog.presentationLayout === 'centered' ? (
              <div className="text-center max-w-[600px] mx-auto mb-8">
                <h2 className={`${headingClass} text-[32px] font-bold leading-[1.15] mb-4`}>
                  {pres.heading}
                </h2>
                <p className="text-[13.5px] leading-[1.7] mb-6" style={{ color: theme.textMuted }}>
                  {pres.story}
                </p>
                <div className="rounded-lg overflow-hidden border h-[250px]" style={{ borderColor: theme.borderColor }}>
                  <SafeCatalogImage
                    src={catalog.presentation.studioImageUrl}
                    alt={pres.heading}
                    fallbackTitle={pres.heading}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            ) : (
              /* LOOKBOOK TOP */
              <div className="mb-8">
                <div className="rounded-lg overflow-hidden border h-[290px] mb-6" style={{ borderColor: theme.borderColor }}>
                  <SafeCatalogImage
                    src={catalog.presentation.studioImageUrl}
                    alt={pres.heading}
                    fallbackTitle={pres.heading}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="grid grid-cols-12 gap-6 items-start">
                  <h2 className={`${headingClass} col-span-5 text-[26px] font-bold leading-[1.15]`}>
                    {pres.heading}
                  </h2>
                  <p className="col-span-7 text-[13px] leading-[1.68]" style={{ color: theme.textMuted }}>
                    {pres.story}
                  </p>
                </div>
              </div>
            )}

            {/* 3 Brand Pillars */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {pres.pillars.map((pillar, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-lg border"
                  style={{ backgroundColor: theme.surfaceBg, borderColor: theme.borderColor }}
                >
                  <div className="font-mono-tabular text-[11px] font-semibold mb-1.5" style={{ color: catalog.accentColor }}>
                    0{idx + 1}
                  </div>
                  <h3 className="font-display text-[13.5px] font-bold mb-1.5">{pillar.title}</h3>
                  <p className="text-[11.5px] leading-relaxed" style={{ color: theme.textMuted }}>
                    {pillar.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Direct Ordering Strip + QR Codes */}
          <div
            className="p-5 rounded-lg border flex items-center justify-between gap-6"
            style={{ backgroundColor: theme.surfaceBg, borderColor: theme.borderColor }}
          >
            <div className="space-y-2 max-w-[380px]">
              <div className="text-[11px] uppercase tracking-[0.14em] font-semibold" style={{ color: catalog.accentColor }}>
                {ui.directOrderHeading}
              </div>
              <p className="text-[12.5px] font-medium">{pres.shippingNote}</p>
              <div className="flex flex-wrap items-center gap-4 pt-1 text-[12px]">
                <a
                  href={websiteHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-pdf-link={websiteHref}
                  className="font-bold underline underline-offset-4"
                  style={{ color: catalog.accentColor }}
                >
                  {catalog.websiteDisplay}
                </a>
                <a
                  href={generalWaHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-pdf-link={generalWaHref}
                  className="font-mono-tabular font-semibold text-[#059669]"
                >
                  WhatsApp: {catalog.whatsappNumber}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4 shrink-0">
              <QrCodeBox value={websiteHref} size={74} label={ui.scanStore} />
              <QrCodeBox value={generalWaHref} size={74} label={ui.scanWhatsApp} />
            </div>
          </div>
        </div>

        {renderFooter(2)}
      </article>

      {/* PAGES 3..N: PRODUCT PAGES */}
      {productPages.map((page, pageIdx) => {
        const pageNumber = 3 + pageIdx;
        return (
          <article
            key={`prod-page-${pageIdx}`}
            className="catalog-a4-page relative shadow-sm border overflow-hidden flex flex-col justify-between"
            style={pageShellStyle}
          >
            <WatermarkOverlay catalog={catalog} />

            <div className="flex-1 px-10 pt-10 pb-6 flex flex-col">
              <div
                className="flex items-baseline justify-between pb-4 mb-6 border-b"
                style={{ borderColor: theme.borderColor }}
              >
                <div>
                  <span className="text-[10.5px] uppercase tracking-[0.18em] font-semibold block mb-1" style={{ color: catalog.accentColor }}>
                    {cover.season} · {ui.collectionLabel}
                  </span>
                  <h2 className={`${headingClass} text-[24px] font-bold leading-none`}>
                    {page.categoryHeading || ui.productsLabel}
                  </h2>
                </div>
                <span className="font-mono-tabular text-[11px]" style={{ color: theme.textMuted }}>
                  {catalog.websiteDisplay}
                </span>
              </div>

              {catalog.productLayout === 'featured_list' ? (
                <div className="flex flex-col gap-5 flex-1">
                  {page.items.map((p) => renderProductCard(p, 'featured_list'))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-5 flex-1 content-start">
                  {page.items.map((p) => renderProductCard(p, catalog.productLayout))}
                </div>
              )}
            </div>

            {renderFooter(pageNumber)}
          </article>
        );
      })}

      {/* FINAL PAGE: BACK COVER WITH QR CODES */}
      {catalog.includeBackCover ? (
        <article
          className="catalog-a4-page relative shadow-sm border overflow-hidden flex flex-col justify-between"
          style={pageShellStyle}
        >
          <WatermarkOverlay catalog={catalog} />

          <div className="flex-1 px-14 py-16 flex flex-col justify-between items-center text-center">
            <div className="text-[12px] uppercase tracking-[0.22em] font-semibold" style={{ color: catalog.accentColor }}>
              {catalog.brandName} · {cover.season}
            </div>

            <div className="max-w-[540px] space-y-5">
              <h2 className={`${headingClass} text-[42px] font-bold leading-[1.1]`}>
                {pres.backCoverHeadline}
              </h2>
              <p className="text-[15px] leading-relaxed" style={{ color: theme.textMuted }}>
                {pres.backCoverSubline}
              </p>

              <div className="pt-4 flex items-center justify-center gap-10">
                <div className="flex flex-col items-center">
                  <QrCodeBox value={websiteHref} size={136} />
                  <a
                    href={websiteHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-pdf-link={websiteHref}
                    className="mt-3 text-[13px] font-bold underline underline-offset-4"
                    style={{ color: catalog.accentColor }}
                  >
                    {catalog.websiteDisplay}
                  </a>
                  <span className="text-[11px] mt-0.5" style={{ color: theme.textMuted }}>
                    {ui.scanStore}
                  </span>
                </div>

                <div className="flex flex-col items-center">
                  <QrCodeBox value={generalWaHref} size={136} />
                  <a
                    href={generalWaHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-pdf-link={generalWaHref}
                    className="mt-3 text-[13px] font-bold text-[#059669]"
                  >
                    {ui.orderWhatsApp}
                  </a>
                  <span className="text-[11px] font-mono-tabular mt-0.5" style={{ color: theme.textMuted }}>
                    {catalog.whatsappNumber}
                  </span>
                </div>
              </div>
            </div>

            <div
              className="w-full pt-6 border-t flex items-center justify-between text-[12px]"
              style={{ borderColor: theme.borderColor, color: theme.textMuted }}
            >
              <span>{catalog.email}</span>
              <span>Instagram {catalog.instagramHandle}</span>
              <span className="font-semibold" style={{ color: theme.textPrimary }}>
                {catalog.websiteDisplay}
              </span>
            </div>
          </div>

          {renderFooter(totalPages)}
        </article>
      ) : null}
    </div>
  );
}
