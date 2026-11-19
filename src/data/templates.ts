import { CatalogData, LanguageCode, LanguageMeta, TemplateId, TemplateTheme } from '../types/catalog';

export const SUPPORTED_LANGUAGES: LanguageMeta[] = [
  { code: 'es', name: 'Español', nativeName: 'Español', shortCode: 'ES', dir: 'ltr' },
  { code: 'fr', name: 'Francés', nativeName: 'Français', shortCode: 'FR', dir: 'ltr' },
  { code: 'en', name: 'Inglés', nativeName: 'English', shortCode: 'EN', dir: 'ltr' },
  { code: 'ar', name: 'Árabe', nativeName: 'العربية', shortCode: 'AR', dir: 'rtl' },
];

export const LANGUAGE_MAP: Record<LanguageCode, LanguageMeta> = SUPPORTED_LANGUAGES.reduce(
  (acc, item) => {
    acc[item.code] = item;
    return acc;
  },
  {} as Record<LanguageCode, LanguageMeta>
);

export interface CatalogUIStrings {
  collectionLabel: string;
  presentationLabel: string;
  productsLabel: string;
  orderWhatsApp: string;
  orderWeb: string;
  visitStore: string;
  availableColors: string;
  sizesLabel: string;
  refLabel: string;
  scanStore: string;
  scanWhatsApp: string;
  allCategories: string;
  searchPlaceholder: string;
  noProductsFound: string;
  pageLabel: string;
  selectedColor: string;
  directOrderHeading: string;
  languageLabel: string;
  whatsappMessageTemplate: (opts: {
    product: string;
    sku: string;
    color?: string;
    price: string;
    website: string;
  }) => string;
  whatsappGeneralMessage: (website: string) => string;
}

export const CATALOG_UI_STRINGS: Record<LanguageCode, CatalogUIStrings> = {
  es: {
    collectionLabel: 'Catálogo Oficial',
    presentationLabel: 'Presentación de Colección',
    productsLabel: 'Selección de Productos',
    orderWhatsApp: 'Pedir por WhatsApp',
    orderWeb: 'Ver en web',
    visitStore: 'Tienda Online',
    availableColors: 'Colores',
    sizesLabel: 'Tallas',
    refLabel: 'Ref.',
    scanStore: 'Escanea para visitar la tienda',
    scanWhatsApp: 'Escanea para pedir por WhatsApp',
    allCategories: 'Todas',
    searchPlaceholder: 'Buscar por prenda, referencia o categoría...',
    noProductsFound: 'No hay artículos que coincidan con tu búsqueda.',
    pageLabel: 'Pág.',
    selectedColor: 'Color elegido',
    directOrderHeading: 'Pedidos directos y atención personalizada',
    languageLabel: 'Idioma',
    whatsappMessageTemplate: ({ product, sku, color, price, website }) =>
      `Hola SportTanger, quiero pedir: ${product} (Ref. ${sku})${color ? ` — Color: ${color}` : ''} — Precio: ${price}. Visto en el catálogo de ${website}.`,
    whatsappGeneralMessage: (website) =>
      `Hola SportTanger, me gustaría recibir información y hacer un pedido del catálogo de ${website}.`,
  },
  fr: {
    collectionLabel: 'Catalogue Officiel',
    presentationLabel: 'Présentation de la Collection',
    productsLabel: 'Sélection de Produits',
    orderWhatsApp: 'Commander via WhatsApp',
    orderWeb: 'Voir sur le site',
    visitStore: 'Boutique en Ligne',
    availableColors: 'Couleurs',
    sizesLabel: 'Tailles',
    refLabel: 'Réf.',
    scanStore: 'Scannez pour visiter la boutique',
    scanWhatsApp: 'Scannez pour commander sur WhatsApp',
    allCategories: 'Toutes',
    searchPlaceholder: 'Rechercher un article, une référence ou une catégorie...',
    noProductsFound: 'Aucun article ne correspond à votre recherche.',
    pageLabel: 'Page',
    selectedColor: 'Couleur choisie',
    directOrderHeading: 'Commandes directes et conseil personnalisé',
    languageLabel: 'Langue',
    whatsappMessageTemplate: ({ product, sku, color, price, website }) =>
      `Bonjour SportTanger, je souhaite commander : ${product} (Réf. ${sku})${color ? ` — Couleur : ${color}` : ''} — Prix : ${price}. Vu dans le catalogue ${website}.`,
    whatsappGeneralMessage: (website) =>
      `Bonjour SportTanger, je souhaite obtenir des informations et passer une commande depuis le catalogue ${website}.`,
  },
  en: {
    collectionLabel: 'Official Lookbook',
    presentationLabel: 'Collection Overview',
    productsLabel: 'Curated Selection',
    orderWhatsApp: 'Order via WhatsApp',
    orderWeb: 'View Online',
    visitStore: 'Online Store',
    availableColors: 'Colors',
    sizesLabel: 'Sizes',
    refLabel: 'SKU',
    scanStore: 'Scan to visit online store',
    scanWhatsApp: 'Scan to order on WhatsApp',
    allCategories: 'All',
    searchPlaceholder: 'Search by item, SKU, or category...',
    noProductsFound: 'No items match your current filter.',
    pageLabel: 'Page',
    selectedColor: 'Selected color',
    directOrderHeading: 'Direct orders & personal styling support',
    languageLabel: 'Language',
    whatsappMessageTemplate: ({ product, sku, color, price, website }) =>
      `Hello SportTanger, I would like to order: ${product} (SKU ${sku})${color ? ` — Color: ${color}` : ''} — Price: ${price}. Seen on the ${website} catalog.`,
    whatsappGeneralMessage: (website) =>
      `Hello SportTanger, I would like to place an order from the ${website} catalog.`,
  },
  ar: {
    collectionLabel: 'الكتالوج الرسمي',
    presentationLabel: 'تقديم المجموعة',
    productsLabel: 'تشكيلة المنتجات',
    orderWhatsApp: 'اطلب عبر واتساب',
    orderWeb: 'عرض في الموقع',
    visitStore: 'المتجر الإلكتروني',
    availableColors: 'الألوان',
    sizesLabel: 'المقاسات',
    refLabel: 'المرجع',
    scanStore: 'امسح الرمز لزيارة المتجر',
    scanWhatsApp: 'امسح الرمز للطلب عبر واتساب',
    allCategories: 'الكل',
    searchPlaceholder: 'ابحث عن منتج، مرجع أو فئة...',
    noProductsFound: 'لا توجد منتجات مطابقة لبحثك حالياً.',
    pageLabel: 'صفحة',
    selectedColor: 'اللون المختار',
    directOrderHeading: 'طلبات مباشرة وخدمة عملاء مخصصة',
    languageLabel: 'اللغة',
    whatsappMessageTemplate: ({ product, sku, color, price, website }) =>
      `مرحباً سبورت طنجة، أرغب في طلب: ${product} (المرجع ${sku})${color ? ` — اللون: ${color}` : ''} — السعر: ${price}. من كتالوج ${website}.`,
    whatsappGeneralMessage: (website) =>
      `مرحباً سبورت طنجة، أرغب في الاستفسار وتقديم طلب من كتالوج ${website}.`,
  },
};

export const TEMPLATE_THEMES: Record<TemplateId, TemplateTheme> = {
  editorial_urbano: {
    id: 'editorial_urbano',
    name: 'Editorial Urbano',
    subtitle: 'Contraste limpio, líneas arquitectónicas y fotografía protagonista',
    defaultAccent: '#1D4ED8',
    pageBg: '#FFFFFF',
    surfaceBg: '#F8FAFC',
    textPrimary: '#0F172A',
    textMuted: '#475569',
    borderColor: '#E2E8F0',
    coverOverlay: 'linear-gradient(180deg, rgba(15,23,42,0.52) 0%, rgba(15,23,42,0.12) 45%, rgba(15,23,42,0.88) 100%)',
    isDark: false,
    headingFont: 'display',
  },
  lino_mediterraneo: {
    id: 'lino_mediterraneo',
    name: 'Lino Mediterráneo',
    subtitle: 'Papel piedra cálido, tipografía serif y serenidad costera',
    defaultAccent: '#1E3A5F',
    pageBg: '#FAF8F5',
    surfaceBg: '#F2EFEA',
    textPrimary: '#1C1917',
    textMuted: '#57534E',
    borderColor: '#E5DFD7',
    coverOverlay: 'linear-gradient(180deg, rgba(28,25,23,0.48) 0%, rgba(28,25,23,0.12) 45%, rgba(28,25,23,0.84) 100%)',
    isDark: false,
    headingFont: 'editorial',
  },
  atleta_nocturno: {
    id: 'atleta_nocturno',
    name: 'Atleta Nocturno',
    subtitle: 'Superficie obsidiana de alto impacto para colecciones técnicas',
    defaultAccent: '#38BDF8',
    pageBg: '#0F172A',
    surfaceBg: '#1E293B',
    textPrimary: '#F8FAFC',
    textMuted: '#94A3B8',
    borderColor: '#334155',
    coverOverlay: 'linear-gradient(180deg, rgba(2,6,23,0.58) 0%, rgba(2,6,23,0.22) 45%, rgba(2,6,23,0.92) 100%)',
    isDark: true,
    headingFont: 'display',
  },
  boutique_minimalista: {
    id: 'boutique_minimalista',
    name: 'Boutique Minimalista',
    subtitle: 'Espacio en blanco de galería y detalle monocromo atemporal',
    defaultAccent: '#18181B',
    pageBg: '#FFFFFF',
    surfaceBg: '#FAFAFA',
    textPrimary: '#18181B',
    textMuted: '#71717A',
    borderColor: '#E4E4E7',
    coverOverlay: 'linear-gradient(180deg, rgba(24,24,27,0.46) 0%, rgba(24,24,27,0.08) 48%, rgba(24,24,27,0.86) 100%)',
    isDark: false,
    headingFont: 'editorial',
  },
  campana_promocional: {
    id: 'campana_promocional',
    name: 'Campaña Promocional',
    subtitle: 'Jerarquía comercial clara para temporadas de descuento y lanzamientos',
    defaultAccent: '#DC2626',
    pageBg: '#FFFFFF',
    surfaceBg: '#F8FAFC',
    textPrimary: '#0F172A',
    textMuted: '#475569',
    borderColor: '#E2E8F0',
    coverOverlay: 'linear-gradient(180deg, rgba(15,23,42,0.55) 0%, rgba(15,23,42,0.18) 45%, rgba(15,23,42,0.9) 100%)',
    isDark: false,
    headingFont: 'display',
  },
};

export const QUICK_COLOR_PALETTE: Array<{ name: string; hex: string; translations: Partial<Record<LanguageCode, string>> }> = [
  { name: 'Negro Obsidiana', hex: '#141518', translations: { fr: 'Noir Obsidienne', en: 'Obsidian Black', ar: 'أسود أوبسيديان' } },
  { name: 'Blanco Tiza', hex: '#F4F4F0', translations: { fr: 'Blanc Craie', en: 'Chalk White', ar: 'أبيض طباشيري' } },
  { name: 'Azul Marino', hex: '#1B2A4A', translations: { fr: 'Bleu Marine', en: 'Midnight Navy', ar: 'أزرق كحلي' } },
  { name: 'Gris Grafito', hex: '#4B5563', translations: { fr: 'Gris Graphite', en: 'Graphite Gray', ar: 'رمادي غرافيت' } },
  { name: 'Oliva Técnico', hex: '#556347', translations: { fr: 'Olive Technique', en: 'Tech Olive', ar: 'زيتوني تقني' } },
  { name: 'Arena Mediterránea', hex: '#C8B8A2', translations: { fr: 'Sable Méditerranée', en: 'Coastal Sand', ar: 'رملي متوسطي' } },
  { name: 'Azul Cobalto', hex: '#1D4ED8', translations: { fr: 'Bleu Cobalt', en: 'Cobalt Blue', ar: 'أزرق كوبالت' } },
  { name: 'Carmesí Sport', hex: '#B91C1C', translations: { fr: 'Cramoisi Sport', en: 'Sport Crimson', ar: 'قرمزي رياضي' } },
];

export const DEFAULT_CATALOG: CatalogData = {
  id: 'sporttanger-otono-invierno-2026',
  brandName: 'SportTanger',
  currency: '€',
  websiteUrl: 'https://sporttanger.com',
  websiteDisplay: 'sporttanger.com',
  whatsappNumber: '+212 6 00 12 34 56',
  email: 'pedidos@sporttanger.com',
  instagramHandle: '@sporttanger',
  primaryLanguage: 'es',
  enabledLanguages: ['es', 'fr', 'en', 'ar'],
  templateId: 'editorial_urbano',
  accentColor: '#1D4ED8',
  coverLayout: 'full_bleed',
  presentationLayout: 'asymmetric',
  productLayout: 'grid_2x2',
  groupByCategory: false,
  includeBackCover: true,
  cover: {
    eyebrow: 'SportTanger · Colección Oficial',
    title: 'Movimiento Urbano & Rendimiento',
    subtitle: 'Prendas técnicas, calzado de precisión y básicos de temporada diseñados para la ciudad y el entrenamiento diario.',
    season: 'Temporada 2026',
    edition: 'Edición Limitada N.º 04',
    imageUrl: '/src/assets/images/cover_sporttanger_editorial_1795130544239.jpg',
    translations: {
      fr: {
        eyebrow: 'SportTanger · Collection Officielle',
        title: 'Mouvement Urbain & Performance',
        subtitle: 'Vêtements techniques, chaussures de précision et essentiels de saison conçus pour la ville et l’entraînement.',
        season: 'Saison 2026',
        edition: 'Édition Limitée N° 04',
      },
      en: {
        eyebrow: 'SportTanger · Official Collection',
        title: 'Urban Motion & Performance',
        subtitle: 'Technical apparel, precision running footwear, and seasonal essentials engineered for city pace and daily training.',
        season: 'Season 2026',
        edition: 'Limited Issue No. 04',
      },
      ar: {
        eyebrow: 'سبورت طنجة · المجموعة الرسمية',
        title: 'حركة عصرية وأداء رياضي',
        subtitle: 'ملابس تقنية، أحذية جري دقيقة وأساسيات موسمية مصممة لإيقاع المدينة والتدريب اليومي.',
        season: 'موسم 2026',
        edition: 'الإصدار المحدود رقم 04',
      },
    },
  },
  presentation: {
    heading: 'Diseño técnico nacido entre el Atlántico y el Mediterráneo',
    story:
      'En sporttanger.com seleccionamos y confeccionamos moda deportiva contemporánea que equilibra confort térmico, cortes limpios y durabilidad real. Cada pieza de este catálogo está lista para envío rápido y atención directa por WhatsApp para asesorarte con tallas, disponibilidad y pedidos al por menor o profesional.',
    studioImageUrl: '/src/assets/images/studio_sporttanger_story_1795130544640.jpg',
    pillars: [
      {
        title: 'Tejidos de Alto Rendimiento',
        text: 'Algodón peinado de alto gramaje y membranas técnicas transpirables pensadas para durar varias temporadas.',
      },
      {
        title: 'Pedido Directo por WhatsApp',
        text: 'Haz clic en cualquier prenda del catálogo para enviar referencia, color y talla directamente a nuestro equipo.',
      },
      {
        title: 'Envío Rápido y Garantía',
        text: 'Despacho en 24–48 h desde nuestro almacén central con seguimiento y cambios sencillos desde sporttanger.com.',
      },
    ],
    shippingNote: 'Envíos gratuitos a partir de 90 € · Pago contra reembolso o compra online en sporttanger.com',
    backCoverHeadline: 'Haz tu pedido hoy mismo',
    backCoverSubline: 'Escanea cualquiera de los códigos QR o pulsa los enlaces para comprar en sporttanger.com o hablar por WhatsApp.',
    translations: {
      fr: {
        heading: 'Design technique né entre l’Atlantique et la Méditerranée',
        story:
          'Sur sporttanger.com, nous sélectionnons une mode sportive contemporaine qui allie confort thermique, coupes nettes et durabilité. Chaque pièce de ce catalogue est prête pour une expédition rapide avec accompagnement direct sur WhatsApp.',
        pillars: [
          {
            title: 'Matières Haute Performance',
            text: 'Coton lourd peigné et membranes techniques respirantes conçues pour résister au quotidien.',
          },
          {
            title: 'Commande Directe WhatsApp',
            text: 'Cliquez sur n’importe quel article pour envoyer instantanément la référence, la couleur et votre taille.',
          },
          {
            title: 'Livraison Rapide 24–48h',
            text: 'Expédition suivie depuis notre entrepôt avec échange simple via sporttanger.com.',
          },
        ],
        shippingNote: 'Livraison offerte dès 90 € · Paiement à la livraison ou commande en ligne sur sporttanger.com',
        backCoverHeadline: 'Commandez dès aujourd’hui',
        backCoverSubline: 'Scannez un code QR ou cliquez sur les liens pour commander sur sporttanger.com ou via WhatsApp.',
      },
      en: {
        heading: 'Technical design shaped between the Atlantic and the Mediterranean',
        story:
          'At sporttanger.com we curate contemporary sportswear balancing thermal comfort, clean architectural cuts, and lasting durability. Every piece in this lookbook is stocked for fast dispatch with direct WhatsApp sizing assistance.',
        pillars: [
          {
            title: 'Performance Textiles',
            text: 'Heavyweight combed cotton and breathable technical shells built to hold structure across seasons.',
          },
          {
            title: 'Instant WhatsApp Ordering',
            text: 'Tap any product in this catalog to send its SKU, chosen color, and size directly to our sales desk.',
          },
          {
            title: 'Fast 24–48h Dispatch',
            text: 'Tracked delivery from our central hub with hassle-free size exchanges on sporttanger.com.',
          },
        ],
        shippingNote: 'Free delivery on orders over €90 · Cash on delivery or online checkout at sporttanger.com',
        backCoverHeadline: 'Place your order today',
        backCoverSubline: 'Scan either QR code or tap the links below to shop sporttanger.com or message us on WhatsApp.',
      },
      ar: {
        heading: 'تصميم تقني مستوحى من التقاء الأطلسي بالمتوسط',
        story:
          'في sporttanger.com نقدم أزياء رياضية عصرية تجمع بين الراحة الحرارية والقصّات الأنيقة والمتانة العالية. كل قطعة في هذا الكتالوج متوفرة للشحن السريع مع مساعدة فورية عبر واتساب لاختيار المقاس واللون المناسبين.',
        pillars: [
          {
            title: 'خامات عالية الأداء',
            text: 'قطن ثقيل ممشط وأقمشة تقنية مسامية مصممة للاستخدام اليومي المكثف.',
          },
          {
            title: 'طلب مباشر عبر واتساب',
            text: 'اضغط على أي منتج لإرسال المرجع واللون والمقاس مباشرة إلى فريق المبيعات.',
          },
          {
            title: 'شحن سريع خلال 24-48 ساعة',
            text: 'توصيل موثوق مع إمكانية الاستبدال السهل عبر متجرنا sporttanger.com.',
          },
        ],
        shippingNote: 'شحن مجاني للطلبات فوق 90 يورو · الدفع عند الاستلام أو عبر sporttanger.com',
        backCoverHeadline: 'اطلب تشكيلتك اليوم',
        backCoverSubline: 'امسح رمز الاستجابة السريعة أو اضغط على الروابط للطلب عبر sporttanger.com أو واتساب.',
      },
    },
  },
  watermark: {
    enabled: true,
    includeOnCover: false,
    mode: 'text',
    text: 'SPORTTANGER.COM',
    logoDataUrl: '',
    opacity: 0.14,
    size: 'md',
    rotation: -24,
    position: 'bottom_right',
  },
  products: [
    {
      id: 'prod-tracksuit-01',
      sku: 'ST-2601',
      name: 'Chaqueta Técnica Atlas Pro',
      category: 'Conjuntos Técnicos',
      description: 'Tejido interlock elástico de 320 gsm con cremallera termosellada y bolsillos ocultos de corte ergonómico.',
      price: 79,
      oldPrice: 95,
      sizes: 'S · M · L · XL',
      promoTag: 'Novedad',
      imageUrl: '/src/assets/images/product_tech_tracksuit_1795130545701.jpg',
      colors: [
        { id: 'c1', name: 'Negro Obsidiana', hex: '#141518', translations: { fr: 'Noir Obsidienne', en: 'Obsidian Black', ar: 'أسود أوبسيديان' } },
        { id: 'c2', name: 'Gris Grafito', hex: '#4B5563', translations: { fr: 'Gris Graphite', en: 'Graphite Gray', ar: 'رمادي غرافيت' } },
        { id: 'c3', name: 'Azul Marino', hex: '#1B2A4A', translations: { fr: 'Bleu Marine', en: 'Midnight Navy', ar: 'أزرق كحلي' } },
      ],
      translations: {
        fr: {
          name: 'Veste Technique Atlas Pro',
          category: 'Ensembles Techniques',
          description: 'Maille interlock extensible 320 gsm avec zip thermosoudé et poches zippées discrètes.',
          promoTag: 'Nouveau',
        },
        en: {
          name: 'Atlas Pro Technical Track Jacket',
          category: 'Technical Sets',
          description: '320 gsm stretch interlock knit with seam-sealed zipper and concealed ergonomic pockets.',
          promoTag: 'New Arrival',
        },
        ar: {
          name: 'سترة أطلس برو التقنية',
          category: 'أطقم تقنية',
          description: 'نسيج إنترلوك مرن بوزن 320 غرام مع سحاب محكم الإغلاق وجيوب مخفية مريحة.',
          promoTag: 'وصل حديثاً',
        },
      },
    },
    {
      id: 'prod-sneakers-02',
      sku: 'ST-2602',
      name: 'Zapatillas Stride Tanger Aero',
      category: 'Calzado Running',
      description: 'Mediasuela de espuma reactiva de doble densidad con malla técnica ventilada y suela de tracción urbana.',
      price: 112,
      oldPrice: 135,
      sizes: '39 · 40 · 41 · 42 · 43 · 44',
      promoTag: '-17% Promo',
      imageUrl: '/src/assets/images/product_runner_sneakers_1795130546152.jpg',
      colors: [
        { id: 'c4', name: 'Blanco Tiza', hex: '#F4F4F0', translations: { fr: 'Blanc Craie', en: 'Chalk White', ar: 'أبيض طباشيري' } },
        { id: 'c5', name: 'Azul Cobalto', hex: '#1D4ED8', translations: { fr: 'Bleu Cobalt', en: 'Cobalt Blue', ar: 'أزرق كوبالت' } },
        { id: 'c6', name: 'Gris Grafito', hex: '#4B5563', translations: { fr: 'Gris Graphite', en: 'Graphite Gray', ar: 'رمادي غرافيت' } },
      ],
      translations: {
        fr: {
          name: 'Baskets Stride Tanger Aero',
          category: 'Chaussures Running',
          description: 'Semelle intermédiaire réactive double densité avec mesh respirant et adhérence urbaine.',
          promoTag: '-17% Promo',
        },
        en: {
          name: 'Stride Tanger Aero Runners',
          category: 'Running Footwear',
          description: 'Dual-density responsive foam midsole with engineered breathable mesh and urban grip outsole.',
          promoTag: '17% Off',
        },
        ar: {
          name: 'حذاء سترايد طنجة إيرو',
          category: 'أحذية الجري',
          description: 'نعل أوسط إسفنجي مزدوج الكثافة مع شبك تقني للتهوية وثبات عالي في الطرقات.',
          promoTag: 'خصم 17%',
        },
      },
    },
    {
      id: 'prod-hoodie-03',
      sku: 'ST-2603',
      name: 'Sudadera Heavyweight 480g',
      category: 'Streetwear Urbano',
      description: 'Algodón orgánico cepillado de 480 gsm, capucha estructurada de doble capa y caída relajada contemporánea.',
      price: 68,
      sizes: 'S · M · L · XL · XXL',
      promoTag: 'Más Vendido',
      imageUrl: '/src/assets/images/product_oversized_hoodie_1795130545630.jpg',
      colors: [
        { id: 'c7', name: 'Azul Marino', hex: '#1B2A4A', translations: { fr: 'Bleu Marine', en: 'Midnight Navy', ar: 'أزرق كحلي' } },
        { id: 'c8', name: 'Negro Obsidiana', hex: '#141518', translations: { fr: 'Noir Obsidienne', en: 'Obsidian Black', ar: 'أسود أوبسيديان' } },
        { id: 'c9', name: 'Arena Mediterránea', hex: '#C8B8A2', translations: { fr: 'Sable Méditerranée', en: 'Coastal Sand', ar: 'رملي متوسطي' } },
      ],
      translations: {
        fr: {
          name: 'Sweat à Capuche Heavyweight 480g',
          category: 'Streetwear Urbain',
          description: 'Coton biologique brossé 480 gsm, capuche doublée structurée et coupe décontractée moderne.',
          promoTag: 'Best-seller',
        },
        en: {
          name: 'Heavyweight 480g Studio Hoodie',
          category: 'Urban Streetwear',
          description: '480 gsm brushed organic cotton, structured double-lined hood, and clean relaxed drape.',
          promoTag: 'Best Seller',
        },
        ar: {
          name: 'هودي قطن ثقيل 480 غرام',
          category: 'أزياء الشارع',
          description: 'قطن عضوي مصقول بوزن 480 غرام، قبعة مزدوجة متماسكة وقصّة مريحة عصرية.',
          promoTag: 'الأكثر مبيعاً',
        },
      },
    },
    {
      id: 'prod-windbreaker-04',
      sku: 'ST-2604',
      name: 'Cortavientos Impermeable Rift',
      category: 'Exterior & Clima',
      description: 'Nylon ripstop ultraligero repelente al agua y viento, costuras selladas y bolsillo pectoral con cierre estanco.',
      price: 94,
      oldPrice: 115,
      sizes: 'S · M · L · XL',
      promoTag: 'Edición Limitada',
      imageUrl: '/src/assets/images/product_windbreaker_shell_1795130545014.jpg',
      colors: [
        { id: 'c10', name: 'Oliva Técnico', hex: '#556347', translations: { fr: 'Olive Technique', en: 'Tech Olive', ar: 'زيتوني تقني' } },
        { id: 'c11', name: 'Negro Obsidiana', hex: '#141518', translations: { fr: 'Noir Obsidienne', en: 'Obsidian Black', ar: 'أسود أوبسيديان' } },
      ],
      translations: {
        fr: {
          name: 'Coupe-Vent Imperméable Rift',
          category: 'Extérieur & Météo',
          description: 'Nylon ripstop ultraléger déperlant et coupe-vent avec poche poitrine étanche.',
          promoTag: 'Édition Limitée',
        },
        en: {
          name: 'Rift Weatherproof Shell Jacket',
          category: 'Outerwear',
          description: 'Ultralight water-repellent ripstop nylon shell with taped seams and storm chest pocket.',
          promoTag: 'Limited Run',
        },
        ar: {
          name: 'جاكيت ريفت مقاوم للرياح والمطر',
          category: 'ملابس خارجية',
          description: 'نايلون ريبستوب خفيف الوزن طارد للماء والرياح مع جيب صدري بسحاب مقاوم للرطوبة.',
          promoTag: 'إصدار محدود',
        },
      },
    },
  ],
};
