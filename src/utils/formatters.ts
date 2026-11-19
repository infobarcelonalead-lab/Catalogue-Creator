import { CATALOG_UI_STRINGS } from '../data/templates';
import {
  BrandPillar,
  CatalogData,
  ColorSwatch,
  LanguageCode,
  Product,
} from '../types/catalog';

export function formatPrice(amount: number, currency: CatalogData['currency']): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  const formatted = Number.isInteger(safe) ? safe.toString() : safe.toFixed(2);
  if (currency === 'MAD') {
    return `${formatted} MAD`;
  }
  if (currency === '$') {
    return `$${formatted}`;
  }
  return `${formatted} €`;
}

export function normalizeWebsiteUrl(url: string): string {
  const trimmed = (url || 'sporttanger.com').trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

export function cleanWhatsAppDigits(phone: string): string {
  return (phone || '').replace(/[^\d]/g, '');
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const digits = cleanWhatsAppDigits(phone) || '212600123456';
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function buildProductWhatsAppUrl(
  catalog: CatalogData,
  product: Product,
  lang: LanguageCode,
  selectedColorName?: string
): string {
  const localized = getLocalizedProduct(product, lang, catalog.primaryLanguage);
  const ui = CATALOG_UI_STRINGS[lang] || CATALOG_UI_STRINGS.es;
  const price = formatPrice(product.price, catalog.currency);
  const message = ui.whatsappMessageTemplate({
    product: localized.name,
    sku: product.sku,
    color: selectedColorName,
    price,
    website: catalog.websiteDisplay || 'sporttanger.com',
  });
  return buildWhatsAppUrl(catalog.whatsappNumber, message);
}

export function buildGeneralWhatsAppUrl(catalog: CatalogData, lang: LanguageCode): string {
  const ui = CATALOG_UI_STRINGS[lang] || CATALOG_UI_STRINGS.es;
  const message = ui.whatsappGeneralMessage(catalog.websiteDisplay || 'sporttanger.com');
  return buildWhatsAppUrl(catalog.whatsappNumber, message);
}

export function getLocalizedCover(catalog: CatalogData, lang: LanguageCode) {
  const base = catalog.cover;
  if (lang === catalog.primaryLanguage) {
    return {
      eyebrow: base.eyebrow,
      title: base.title,
      subtitle: base.subtitle,
      season: base.season,
      edition: base.edition,
    };
  }
  const tr = base.translations?.[lang];
  return {
    eyebrow: tr?.eyebrow?.trim() || base.eyebrow,
    title: tr?.title?.trim() || base.title,
    subtitle: tr?.subtitle?.trim() || base.subtitle,
    season: tr?.season?.trim() || base.season,
    edition: tr?.edition?.trim() || base.edition,
  };
}

export function getLocalizedPresentation(catalog: CatalogData, lang: LanguageCode) {
  const base = catalog.presentation;
  if (lang === catalog.primaryLanguage) {
    return {
      heading: base.heading,
      story: base.story,
      shippingNote: base.shippingNote,
      pillars: base.pillars as BrandPillar[],
      backCoverHeadline: base.backCoverHeadline,
      backCoverSubline: base.backCoverSubline,
    };
  }
  const tr = base.translations?.[lang];
  const mergedPillars: BrandPillar[] = base.pillars.map((pillar, idx) => ({
    title: tr?.pillars?.[idx]?.title?.trim() || pillar.title,
    text: tr?.pillars?.[idx]?.text?.trim() || pillar.text,
  }));
  return {
    heading: tr?.heading?.trim() || base.heading,
    story: tr?.story?.trim() || base.story,
    shippingNote: tr?.shippingNote?.trim() || base.shippingNote,
    pillars: mergedPillars,
    backCoverHeadline: tr?.backCoverHeadline?.trim() || base.backCoverHeadline,
    backCoverSubline: tr?.backCoverSubline?.trim() || base.backCoverSubline,
  };
}

export function getLocalizedProduct(
  product: Product,
  lang: LanguageCode,
  primaryLanguage: LanguageCode
) {
  if (lang === primaryLanguage) {
    return {
      name: product.name,
      category: product.category,
      description: product.description,
      promoTag: product.promoTag || '',
    };
  }
  const tr = product.translations?.[lang];
  return {
    name: tr?.name?.trim() || product.name,
    category: tr?.category?.trim() || product.category,
    description: tr?.description?.trim() || product.description,
    promoTag: tr?.promoTag !== undefined && tr.promoTag.trim() !== '' ? tr.promoTag : product.promoTag || '',
  };
}

export function getLocalizedColorName(
  swatch: ColorSwatch,
  lang: LanguageCode,
  primaryLanguage: LanguageCode
): string {
  if (lang === primaryLanguage) return swatch.name;
  return swatch.translations?.[lang]?.trim() || swatch.name;
}

export function getTranslationCompleteness(catalog: CatalogData, lang: LanguageCode): {
  completed: number;
  total: number;
  percent: number;
} {
  if (lang === catalog.primaryLanguage) {
    return { completed: 1, total: 1, percent: 100 };
  }

  let total = 0;
  let completed = 0;

  // Cover fields (4)
  const coverTr = catalog.cover.translations?.[lang];
  const coverChecks = [
    coverTr?.eyebrow,
    coverTr?.title,
    coverTr?.subtitle,
    coverTr?.season,
  ];
  total += coverChecks.length;
  completed += coverChecks.filter((v) => v && v.trim().length > 0).length;

  // Presentation fields (3)
  const presTr = catalog.presentation.translations?.[lang];
  const presChecks = [presTr?.heading, presTr?.story, presTr?.shippingNote];
  total += presChecks.length;
  completed += presChecks.filter((v) => v && v.trim().length > 0).length;

  // Product fields (3 per product: name, category, description)
  for (const product of catalog.products) {
    const pTr = product.translations?.[lang];
    total += 3;
    if (pTr?.name?.trim()) completed += 1;
    if (pTr?.category?.trim()) completed += 1;
    if (pTr?.description?.trim()) completed += 1;
  }

  const percent = total === 0 ? 100 : Math.round((completed / total) * 100);
  return { completed, total, percent };
}

export function chunkProductsForPages(
  products: Product[],
  layout: CatalogData['productLayout'],
  groupByCategory: boolean,
  lang: LanguageCode,
  primaryLanguage: LanguageCode
): Array<{ categoryHeading?: string; items: Product[] }> {
  const perPage = layout === 'grid_2x3' ? 6 : layout === 'featured_list' ? 3 : 4;

  if (!groupByCategory) {
    const pages: Array<{ categoryHeading?: string; items: Product[] }> = [];
    for (let i = 0; i < products.length; i += perPage) {
      pages.push({ items: products.slice(i, i + perPage) });
    }
    return pages;
  }

  const groups = new Map<string, Product[]>();
  for (const product of products) {
    const localizedCat = getLocalizedProduct(product, lang, primaryLanguage).category || 'General';
    const list = groups.get(localizedCat) || [];
    list.push(product);
    groups.set(localizedCat, list);
  }

  const pages: Array<{ categoryHeading?: string; items: Product[] }> = [];
  for (const [cat, items] of groups.entries()) {
    for (let i = 0; i < items.length; i += perPage) {
      pages.push({
        categoryHeading: cat,
        items: items.slice(i, i + perPage),
      });
    }
  }
  return pages;
}
