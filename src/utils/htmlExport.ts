import QRCode from 'qrcode';
import { CATALOG_UI_STRINGS, LANGUAGE_MAP, TEMPLATE_THEMES } from '../data/templates';
import { CatalogData, LanguageCode } from '../types/catalog';
import { buildGeneralWhatsAppUrl, normalizeWebsiteUrl } from './formatters';
import { urlToDataUrl } from './imageUpload';

/**
 * Builds a 100% standalone, zero-cloud interactive HTML catalog file ready to upload
 * directly to sporttanger.com (e.g. sporttanger.com/catalogo.html) or share offline.
 * Includes full multilingual switcher (ES/FR/EN/AR + RTL), category filters, search,
 * interactive color selection, watermark protection, QR codes, and direct WhatsApp ordering.
 */
export async function buildStandaloneInteractiveHtml(catalog: CatalogData): Promise<string> {
  const theme = TEMPLATE_THEMES[catalog.templateId] || TEMPLATE_THEMES.editorial_urbano;

  // Inline all images as Data URLs so the exported HTML file works completely offline
  const [coverImage, studioImage, watermarkLogo, ...productImages] = await Promise.all([
    urlToDataUrl(catalog.cover.imageUrl),
    urlToDataUrl(catalog.presentation.studioImageUrl),
    catalog.watermark.logoDataUrl ? urlToDataUrl(catalog.watermark.logoDataUrl) : Promise.resolve(''),
    ...catalog.products.map((p) => urlToDataUrl(p.imageUrl)),
  ]);

  const websiteHref = normalizeWebsiteUrl(catalog.websiteUrl);
  const waGeneralHref = buildGeneralWhatsAppUrl(catalog, catalog.primaryLanguage);

  const [storeQr, waQr] = await Promise.all([
    QRCode.toDataURL(websiteHref, { width: 180, margin: 1, color: { dark: '#0F172A', light: '#FFFFFF' } }),
    QRCode.toDataURL(waGeneralHref, { width: 180, margin: 1, color: { dark: '#0F172A', light: '#FFFFFF' } }),
  ]);

  const embeddedCatalog: CatalogData = {
    ...catalog,
    cover: { ...catalog.cover, imageUrl: coverImage },
    presentation: { ...catalog.presentation, studioImageUrl: studioImage },
    watermark: { ...catalog.watermark, logoDataUrl: watermarkLogo },
    products: catalog.products.map((p, i) => ({ ...p, imageUrl: productImages[i] || p.imageUrl })),
  };

  // Serialize UI strings (plain serializable subset)
  const uiDict: Record<string, Record<string, string>> = {};
  (Object.keys(CATALOG_UI_STRINGS) as LanguageCode[]).forEach((code) => {
    const s = CATALOG_UI_STRINGS[code];
    uiDict[code] = {
      collectionLabel: s.collectionLabel,
      presentationLabel: s.presentationLabel,
      productsLabel: s.productsLabel,
      orderWhatsApp: s.orderWhatsApp,
      orderWeb: s.orderWeb,
      visitStore: s.visitStore,
      availableColors: s.availableColors,
      sizesLabel: s.sizesLabel,
      refLabel: s.refLabel,
      scanStore: s.scanStore,
      scanWhatsApp: s.scanWhatsApp,
      allCategories: s.allCategories,
      searchPlaceholder: s.searchPlaceholder,
      noProductsFound: s.noProductsFound,
      selectedColor: s.selectedColor,
      directOrderHeading: s.directOrderHeading,
      languageLabel: s.languageLabel,
    };
  });

  const payload = JSON.stringify({
    catalog: embeddedCatalog,
    theme,
    uiDict,
    languages: LANGUAGE_MAP,
    storeQr,
    waQr,
  }).replace(/</g, '\\u003c');

  return `<!doctype html>
<html lang="${catalog.primaryLanguage}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(catalog.cover.title)} — ${escapeHtml(catalog.brandName)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Playfair+Display:wght@500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap" rel="stylesheet" />
  <style>
    :root {
      --bg: ${theme.pageBg};
      --surface: ${theme.surfaceBg};
      --text: ${theme.textPrimary};
      --muted: ${theme.textMuted};
      --border: ${theme.borderColor};
      --accent: ${catalog.accentColor};
      --heading-font: ${theme.headingFont === 'editorial' ? "'Playfair Display', Georgia, serif" : "'Plus Jakarta Sans', system-ui, sans-serif"};
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'DM Sans', system-ui, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.55;
      -webkit-font-smoothing: antialiased;
    }
    a { color: inherit; text-decoration: none; }
    .container { max-width: 1180px; margin: 0 auto; padding: 0 24px; }
    .topbar {
      position: sticky; top: 0; z-index: 40;
      background: color-mix(in srgb, var(--bg) 92%, transparent);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid var(--border);
    }
    .topbar-inner {
      display: flex; align-items: center; justify-content: space-between;
      gap: 20px; height: 64px;
    }
    .brand { font-family: var(--heading-font); font-weight: 700; font-size: 18px; letter-spacing: -0.02em; white-space: nowrap; }
    .lang-bar { display: flex; align-items: center; gap: 4px; background: var(--surface); border: 1px solid var(--border); padding: 3px; border-radius: 8px; }
    .lang-btn {
      border: none; background: transparent; color: var(--muted);
      font-size: 12px; font-weight: 600; padding: 5px 10px; border-radius: 6px;
      cursor: pointer; transition: all 150ms ease;
    }
    .lang-btn.active { background: var(--accent); color: #fff; }
    .cta-primary {
      display: inline-flex; align-items: center; gap: 8px;
      background: #059669; color: #fff; font-size: 13px; font-weight: 600;
      padding: 9px 16px; border-radius: 8px; white-space: nowrap;
      transition: opacity 150ms ease;
    }
    .cta-primary:hover { opacity: 0.92; }
    .hero {
      position: relative; min-height: 520px; display: flex; align-items: flex-end;
      overflow: hidden; border-bottom: 1px solid var(--border);
    }
    .hero img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
    .hero-scrim { position: absolute; inset: 0; background: ${theme.coverOverlay}; }
    .hero-content { position: relative; z-index: 2; padding: 64px 0 56px; color: #fff; max-width: 720px; }
    .hero-eyebrow { font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase; opacity: 0.85; margin-bottom: 14px; }
    .hero h1 { font-family: var(--heading-font); font-size: clamp(2rem, 4.5vw, 3.6rem); line-height: 1.08; margin-bottom: 16px; }
    .hero p { font-size: 16px; opacity: 0.92; max-width: 58ch; margin-bottom: 24px; }
    .hero-meta { display: flex; flex-wrap: wrap; gap: 16px; font-size: 13px; opacity: 0.88; }
    .section { padding: 64px 0; border-bottom: 1px solid var(--border); }
    .story-grid { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 40px; align-items: center; }
    .story-img { width: 100%; aspect-ratio: 4/3; object-fit: cover; border-radius: 10px; border: 1px solid var(--border); }
    .section-kicker { font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--accent); font-weight: 600; margin-bottom: 10px; }
    h2 { font-family: var(--heading-font); font-size: clamp(1.5rem, 2.8vw, 2.25rem); line-height: 1.18; margin-bottom: 16px; }
    .pillars { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 32px; }
    .pillar { padding: 20px; background: var(--surface); border: 1px solid var(--border); border-radius: 10px; }
    .pillar h3 { font-size: 15px; font-weight: 700; margin-bottom: 6px; }
    .pillar p { font-size: 13px; color: var(--muted); }
    .toolbar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 28px; }
    .cats { display: flex; flex-wrap: wrap; gap: 6px; }
    .cat-btn {
      border: 1px solid var(--border); background: var(--surface); color: var(--text);
      padding: 7px 14px; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer;
    }
    .cat-btn.active { background: var(--accent); color: #fff; border-color: var(--accent); }
    .search-input {
      border: 1px solid var(--border); background: var(--surface); color: var(--text);
      padding: 9px 14px; border-radius: 8px; font-size: 14px; min-width: 260px;
    }
    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
    .card {
      background: var(--surface); border: 1px solid var(--border); border-radius: 12px;
      overflow: hidden; display: flex; flex-direction: column; position: relative;
    }
    .card-media { position: relative; aspect-ratio: 4/3; background: #E2E8F0; overflow: hidden; }
    .card-media img { width: 100%; height: 100%; object-fit: cover; }
    .wm-overlay {
      position: absolute; inset: 0; pointer-events: none; display: flex;
      align-items: center; justify-content: center; overflow: hidden;
    }
    .card-body { padding: 18px; display: flex; flex-direction: column; flex: 1; gap: 10px; }
    .card-meta { font-size: 12px; color: var(--muted); display: flex; justify-content: space-between; gap: 8px; }
    .card-title { font-family: var(--heading-font); font-size: 17px; font-weight: 700; }
    .card-desc { font-size: 13px; color: var(--muted); flex: 1; }
    .swatches { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
    .swatch-btn {
      width: 22px; height: 22px; border-radius: 999px; border: 2px solid transparent;
      cursor: pointer; outline: 1px solid rgba(0,0,0,0.2);
    }
    .swatch-btn.active { border-color: var(--accent); transform: scale(1.12); }
    .price-row { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; padding-top: 8px; border-top: 1px solid var(--border); }
    .price { font-family: 'JetBrains Mono', monospace; font-size: 18px; font-weight: 700; }
    .old-price { font-family: 'JetBrains Mono', monospace; font-size: 13px; color: var(--muted); text-decoration: line-through; margin-inline-start: 8px; }
    .card-actions { display: grid; grid-template-columns: 1fr auto; gap: 8px; margin-top: 6px; }
    .btn-wa {
      display: inline-flex; align-items: center; justify-content: center; gap: 6px;
      background: #059669; color: #fff; font-size: 13px; font-weight: 600;
      padding: 10px 12px; border-radius: 8px;
    }
    .btn-web {
      display: inline-flex; align-items: center; justify-content: center;
      border: 1px solid var(--border); color: var(--text); font-size: 13px; font-weight: 600;
      padding: 10px 12px; border-radius: 8px;
    }
    .footer-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 36px; align-items: center; }
    .qr-pair { display: flex; gap: 20px; justify-content: flex-end; flex-wrap: wrap; }
    .qr-card { background: #fff; color: #0F172A; padding: 14px; border-radius: 10px; border: 1px solid var(--border); text-align: center; width: 160px; }
    .qr-card img { width: 112px; height: 112px; display: block; margin: 0 auto 8px; }
    .qr-card span { font-size: 11px; color: #475569; display: block; }
    @media (max-width: 960px) {
      .grid { grid-template-columns: repeat(2, 1fr); }
      .story-grid, .footer-grid, .pillars { grid-template-columns: 1fr; }
      .qr-pair { justify-content: flex-start; }
    }
    @media (max-width: 620px) {
      .grid { grid-template-columns: 1fr; }
      .search-input { width: 100%; }
    }
  </style>
</head>
<body>
  <div id="app"></div>
  <script>
    const DATA = ${payload};
    let currentLang = DATA.catalog.primaryLanguage || 'es';
    let activeCat = '__ALL__';
    let searchTerm = '';
    const selectedColors = {};

    function formatPrice(amount, currency) {
      const n = Number.isInteger(amount) ? String(amount) : Number(amount || 0).toFixed(2);
      if (currency === 'MAD') return n + ' MAD';
      if (currency === '$') return '$' + n;
      return n + ' €';
    }

    function getCover(lang) {
      const c = DATA.catalog.cover;
      if (lang === DATA.catalog.primaryLanguage) return c;
      const tr = (c.translations && c.translations[lang]) || {};
      return {
        eyebrow: tr.eyebrow || c.eyebrow,
        title: tr.title || c.title,
        subtitle: tr.subtitle || c.subtitle,
        season: tr.season || c.season,
        edition: tr.edition || c.edition,
        imageUrl: c.imageUrl
      };
    }

    function getPres(lang) {
      const p = DATA.catalog.presentation;
      if (lang === DATA.catalog.primaryLanguage) return p;
      const tr = (p.translations && p.translations[lang]) || {};
      return {
        heading: tr.heading || p.heading,
        story: tr.story || p.story,
        studioImageUrl: p.studioImageUrl,
        shippingNote: tr.shippingNote || p.shippingNote,
        backCoverHeadline: tr.backCoverHeadline || p.backCoverHeadline,
        backCoverSubline: tr.backCoverSubline || p.backCoverSubline,
        pillars: p.pillars.map((pl, idx) => ({
          title: (tr.pillars && tr.pillars[idx] && tr.pillars[idx].title) || pl.title,
          text: (tr.pillars && tr.pillars[idx] && tr.pillars[idx].text) || pl.text
        }))
      };
    }

    function getProd(p, lang) {
      if (lang === DATA.catalog.primaryLanguage) return p;
      const tr = (p.translations && p.translations[lang]) || {};
      return {
        ...p,
        name: tr.name || p.name,
        category: tr.category || p.category,
        description: tr.description || p.description,
        promoTag: tr.promoTag || p.promoTag || ''
      };
    }

    function getColorName(c, lang) {
      if (lang === DATA.catalog.primaryLanguage) return c.name;
      return (c.translations && c.translations[lang]) || c.name;
    }

    function buildWaLink(text) {
      const digits = (DATA.catalog.whatsappNumber || '').replace(/[^\\d]/g, '') || '212600123456';
      return 'https://wa.me/' + digits + '?text=' + encodeURIComponent(text);
    }

    function watermarkHtml() {
      const wm = DATA.catalog.watermark;
      if (!wm || !wm.enabled) return '';
      const content = wm.mode === 'logo' && wm.logoDataUrl
        ? '<img src="' + wm.logoDataUrl + '" alt="Marca de agua" style="max-height:38px;object-fit:contain;" />'
        : '<span style="font-family:Plus Jakarta Sans,sans-serif;font-weight:700;letter-spacing:0.18em;font-size:13px;color:#0F172A;">' + (wm.text || 'SPORTTANGER.COM') + '</span>';
      return '<div class="wm-overlay" style="opacity:' + wm.opacity + ';transform:rotate(' + wm.rotation + 'deg);">' + content + '</div>';
    }

    function render() {
      const langMeta = DATA.languages[currentLang] || { dir: 'ltr', shortCode: 'ES' };
      document.documentElement.lang = currentLang;
      document.documentElement.dir = langMeta.dir;

      const ui = DATA.uiDict[currentLang] || DATA.uiDict.es;
      const cover = getCover(currentLang);
      const pres = getPres(currentLang);
      const webUrl = DATA.catalog.websiteUrl.startsWith('http') ? DATA.catalog.websiteUrl : 'https://' + DATA.catalog.websiteUrl;

      const localizedProducts = DATA.catalog.products.map(p => getProd(p, currentLang));
      const categories = Array.from(new Set(localizedProducts.map(p => p.category)));
      const filtered = localizedProducts.filter(p => {
        const matchCat = activeCat === '__ALL__' || p.category === activeCat;
        const q = searchTerm.trim().toLowerCase();
        const matchQ = !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
        return matchCat && matchQ;
      });

      const enabledLangs = DATA.catalog.enabledLanguages && DATA.catalog.enabledLanguages.length ? DATA.catalog.enabledLanguages : ['es'];

      const root = document.getElementById('app');
      root.innerHTML = \`
        <header class="topbar">
          <div class="container topbar-inner">
            <a href="\${webUrl}" target="_blank" rel="noopener" class="brand">\${DATA.catalog.brandName}</a>
            <div style="display:flex;align-items:center;gap:12px;">
              \${enabledLangs.length > 1 ? \`
                <div class="lang-bar" role="group" aria-label="\${ui.languageLabel}">
                  \${enabledLangs.map(code => \`
                    <button class="lang-btn \${code === currentLang ? 'active' : ''}" data-lang="\${code}">
                      \${(DATA.languages[code] && DATA.languages[code].shortCode) || code.toUpperCase()}
                    </button>
                  \`).join('')}
                </div>
              \` : ''}
              <a class="cta-primary" href="\${buildWaLink('Hola ' + DATA.catalog.brandName + ' — ' + DATA.catalog.websiteDisplay)}" target="_blank" rel="noopener">
                \${ui.orderWhatsApp}
              </a>
            </div>
          </div>
        </header>

        <section class="hero">
          <img src="\${cover.imageUrl}" alt="\${cover.title}" />
          <div class="hero-scrim"></div>
          <div class="container hero-content">
            <div class="hero-eyebrow">\${cover.eyebrow}</div>
            <h1>\${cover.title}</h1>
            <p>\${cover.subtitle}</p>
            <div class="hero-meta">
              <span>\${cover.season}</span>
              <span>·</span>
              <span>\${cover.edition}</span>
              <span>·</span>
              <a href="\${webUrl}" target="_blank" rel="noopener" style="text-decoration:underline;">\${DATA.catalog.websiteDisplay}</a>
            </div>
          </div>
        </section>

        <section class="section">
          <div class="container">
            <div class="story-grid">
              <div>
                <div class="section-kicker">\${ui.presentationLabel}</div>
                <h2>\${pres.heading}</h2>
                <p style="color:var(--muted);font-size:15px;">\${pres.story}</p>
                <p style="margin-top:16px;font-size:13px;font-weight:600;color:var(--accent);">\${pres.shippingNote}</p>
              </div>
              <img class="story-img" src="\${pres.studioImageUrl}" alt="\${pres.heading}" />
            </div>
            <div class="pillars">
              \${pres.pillars.map((pl, idx) => \`
                <div class="pillar">
                  <h3>0\${idx + 1}. \${pl.title}</h3>
                  <p>\${pl.text}</p>
                </div>
              \`).join('')}
            </div>
          </div>
        </section>

        <section class="section">
          <div class="container">
            <div class="section-kicker">\${ui.productsLabel}</div>
            <div class="toolbar">
              <div class="cats">
                <button class="cat-btn \${activeCat === '__ALL__' ? 'active' : ''}" data-cat="__ALL__">\${ui.allCategories}</button>
                \${categories.map(cat => \`
                  <button class="cat-btn \${activeCat === cat ? 'active' : ''}" data-cat="\${cat}">\${cat}</button>
                \`).join('')}
              </div>
              <input id="searchBox" class="search-input" type="search" value="\${searchTerm}" placeholder="\${ui.searchPlaceholder}" />
            </div>

            \${filtered.length === 0 ? '<p style="color:var(--muted);padding:32px 0;">' + ui.noProductsFound + '</p>' : \`
              <div class="grid">
                \${filtered.map(p => {
                  const chosenIdx = selectedColors[p.id] || 0;
                  const chosenSwatch = (p.colors && p.colors[chosenIdx]) || null;
                  const chosenColorName = chosenSwatch ? getColorName(chosenSwatch, currentLang) : '';
                  const priceText = formatPrice(p.price, DATA.catalog.currency);
                  const waHref = buildWaLink(p.name + ' (' + p.sku + ')' + (chosenColorName ? ' — ' + chosenColorName : '') + ' — ' + priceText + ' · ' + DATA.catalog.websiteDisplay);
                  return \`
                    <article class="card">
                      <div class="card-media">
                        <img src="\${p.imageUrl}" alt="\${p.name}" />
                        \${watermarkHtml()}
                      </div>
                      <div class="card-body">
                        <div class="card-meta">
                          <span>\${p.category} · \${ui.refLabel} \${p.sku}</span>
                          \${p.promoTag ? '<span style="color:var(--accent);font-weight:600;">' + p.promoTag + '</span>' : ''}
                        </div>
                        <div class="card-title">\${p.name}</div>
                        <p class="card-desc">\${p.description}</p>
                        <div style="font-size:12px;color:var(--muted);">\${ui.sizesLabel}: \${p.sizes}</div>
                        \${p.colors && p.colors.length ? \`
                          <div class="swatches">
                            \${p.colors.map((c, idx) => \`
                              <button class="swatch-btn \${idx === chosenIdx ? 'active' : ''}" data-prod="\${p.id}" data-cidx="\${idx}" title="\${getColorName(c, currentLang)}" style="background:\${c.hex};"></button>
                            \`).join('')}
                            <span style="font-size:12px;color:var(--muted);">\${chosenColorName}</span>
                          </div>
                        \` : ''}
                        <div class="price-row">
                          <div>
                            <span class="price">\${priceText}</span>
                            \${p.oldPrice ? '<span class="old-price">' + formatPrice(p.oldPrice, DATA.catalog.currency) + '</span>' : ''}
                          </div>
                        </div>
                        <div class="card-actions">
                          <a class="btn-wa" href="\${waHref}" target="_blank" rel="noopener">\${ui.orderWhatsApp}</a>
                          <a class="btn-web" href="\${webUrl}" target="_blank" rel="noopener">\${ui.orderWeb}</a>
                        </div>
                      </div>
                    </article>
                  \`;
                }).join('')}
              </div>
            \`}
          </div>
        </section>

        <footer class="section" style="border-bottom:none;">
          <div class="container footer-grid">
            <div>
              <div class="section-kicker">\${DATA.catalog.websiteDisplay}</div>
              <h2>\${pres.backCoverHeadline}</h2>
              <p style="color:var(--muted);max-width:52ch;margin-bottom:18px;">\${pres.backCoverSubline}</p>
              <div style="font-size:14px;display:flex;flex-wrap:wrap;gap:16px;">
                <a href="\${webUrl}" target="_blank" rel="noopener" style="font-weight:600;color:var(--accent);">\${DATA.catalog.websiteDisplay}</a>
                <span>·</span>
                <span>WhatsApp: \${DATA.catalog.whatsappNumber}</span>
                <span>·</span>
                <span>\${DATA.catalog.email}</span>
              </div>
            </div>
            <div class="qr-pair">
              <div class="qr-card">
                <img src="\${DATA.storeQr}" alt="QR Web" />
                <span>\${ui.scanStore}</span>
              </div>
              <div class="qr-card">
                <img src="\${DATA.waQr}" alt="QR WhatsApp" />
                <span>\${ui.scanWhatsApp}</span>
              </div>
            </div>
          </div>
        </footer>
      \`;

      root.querySelectorAll('[data-lang]').forEach(btn => {
        btn.addEventListener('click', () => {
          currentLang = btn.getAttribute('data-lang');
          activeCat = '__ALL__';
          render();
        });
      });
      root.querySelectorAll('[data-cat]').forEach(btn => {
        btn.addEventListener('click', () => {
          activeCat = btn.getAttribute('data-cat');
          render();
        });
      });
      root.querySelectorAll('[data-prod]').forEach(btn => {
        btn.addEventListener('click', () => {
          selectedColors[btn.getAttribute('data-prod')] = Number(btn.getAttribute('data-cidx'));
          render();
        });
      });
      const sb = document.getElementById('searchBox');
      if (sb) {
        sb.addEventListener('input', (e) => {
          searchTerm = e.target.value;
          const pos = e.target.selectionStart;
          render();
          const nb = document.getElementById('searchBox');
          if (nb) { nb.focus(); nb.setSelectionRange(pos, pos); }
        });
      }
    }

    render();
  </script>
</body>
</html>`;
}

function escapeHtml(value: string): string {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function downloadTextFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
