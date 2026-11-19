export type LanguageCode = 'es' | 'fr' | 'en' | 'ar';

export interface LanguageMeta {
  code: LanguageCode;
  name: string;
  nativeName: string;
  shortCode: string;
  dir: 'ltr' | 'rtl';
}

export type TemplateId =
  | 'editorial_urbano'
  | 'lino_mediterraneo'
  | 'atleta_nocturno'
  | 'boutique_minimalista'
  | 'campana_promocional';

export type CoverLayout = 'full_bleed' | 'split' | 'framed';
export type PresentationLayout = 'asymmetric' | 'centered' | 'lookbook';
export type ProductLayout = 'grid_2x2' | 'grid_2x3' | 'featured_list';
export type WatermarkPosition = 'bottom_right' | 'top_right' | 'center_diagonal' | 'tile';

export interface ColorSwatch {
  id: string;
  name: string;
  hex: string;
  translations?: Partial<Record<LanguageCode, string>>;
}

export interface ProductTranslation {
  name?: string;
  category?: string;
  description?: string;
  promoTag?: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  description: string;
  price: number;
  oldPrice?: number;
  sizes: string;
  promoTag?: string;
  imageUrl: string;
  colors: ColorSwatch[];
  translations?: Partial<Record<LanguageCode, ProductTranslation>>;
}

export interface CoverTranslation {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  season?: string;
  edition?: string;
}

export interface CoverConfig {
  eyebrow: string;
  title: string;
  subtitle: string;
  season: string;
  edition: string;
  imageUrl: string;
  translations?: Partial<Record<LanguageCode, CoverTranslation>>;
}

export interface BrandPillar {
  title: string;
  text: string;
}

export interface PresentationTranslation {
  heading?: string;
  story?: string;
  shippingNote?: string;
  pillars?: BrandPillar[];
  backCoverHeadline?: string;
  backCoverSubline?: string;
}

export interface PresentationConfig {
  heading: string;
  story: string;
  studioImageUrl: string;
  pillars: [BrandPillar, BrandPillar, BrandPillar];
  shippingNote: string;
  backCoverHeadline: string;
  backCoverSubline: string;
  translations?: Partial<Record<LanguageCode, PresentationTranslation>>;
}

export interface WatermarkConfig {
  enabled: boolean;
  includeOnCover: boolean;
  mode: 'text' | 'logo';
  text: string;
  logoDataUrl: string;
  opacity: number; // 0.08 to 0.45
  size: 'sm' | 'md' | 'lg';
  rotation: number; // -45 to 45
  position: WatermarkPosition;
}

export interface CatalogData {
  id: string;
  brandName: string;
  currency: '€' | 'MAD' | '$';
  websiteUrl: string;
  websiteDisplay: string;
  whatsappNumber: string;
  email: string;
  instagramHandle: string;
  primaryLanguage: LanguageCode;
  enabledLanguages: LanguageCode[];
  templateId: TemplateId;
  accentColor: string;
  coverLayout: CoverLayout;
  presentationLayout: PresentationLayout;
  productLayout: ProductLayout;
  groupByCategory: boolean;
  includeBackCover: boolean;
  cover: CoverConfig;
  presentation: PresentationConfig;
  watermark: WatermarkConfig;
  products: Product[];
}

export interface TemplateTheme {
  id: TemplateId;
  name: string;
  subtitle: string;
  defaultAccent: string;
  pageBg: string;
  surfaceBg: string;
  textPrimary: string;
  textMuted: string;
  borderColor: string;
  coverOverlay: string;
  isDark: boolean;
  headingFont: 'display' | 'editorial';
}

export type TrafficSource =
  | 'whatsapp'
  | 'instagram'
  | 'facebook'
  | 'website'
  | 'email_qr'
  | 'direct';

export type AnalyticsEventType =
  | 'catalog_view'
  | 'product_view'
  | 'whatsapp_click'
  | 'web_click'
  | 'language_change';

export interface AnalyticsEvent {
  id: string;
  timestamp: string;
  type: AnalyticsEventType;
  productId?: string;
  productName?: string;
  source: TrafficSource;
  language: LanguageCode;
}

export interface DailyMetric {
  date: string;
  label: string;
  views: number;
  whatsappClicks: number;
  webClicks: number;
}

export interface ProductAnalytics {
  views: number;
  whatsappClicks: number;
  webClicks: number;
}

export interface AnalyticsStore {
  totalViews: number;
  uniqueVisitors: number;
  avgTimeSec: number;
  daily: DailyMetric[];
  sources: Record<TrafficSource, number>;
  languages: Record<LanguageCode, number>;
  productStats: Record<string, ProductAnalytics>;
  recentEvents: AnalyticsEvent[];
}
