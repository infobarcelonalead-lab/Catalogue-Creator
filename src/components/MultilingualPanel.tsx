import { useState } from 'react';
import { CopyCheck, Eye, Globe } from 'lucide-react';
import { LANGUAGE_MAP, SUPPORTED_LANGUAGES } from '../data/templates';
import { CatalogData, LanguageCode } from '../types/catalog';
import { getTranslationCompleteness } from '../utils/formatters';

interface MultilingualPanelProps {
  catalog: CatalogData;
  activePreviewLang: LanguageCode;
  onSelectPreviewLang: (lang: LanguageCode) => void;
  onChange: (updater: (prev: CatalogData) => CatalogData) => void;
}

export function MultilingualPanel({
  catalog,
  activePreviewLang,
  onSelectPreviewLang,
  onChange,
}: MultilingualPanelProps) {
  const secondaryLanguages = catalog.enabledLanguages.filter((l) => l !== catalog.primaryLanguage);
  const [editingLang, setEditingLang] = useState<LanguageCode>(
    secondaryLanguages[0] || (catalog.primaryLanguage === 'es' ? 'fr' : 'es')
  );
  const [section, setSection] = useState<'cover' | 'presentation' | 'products'>('cover');
  const [copiedNotice, setCopiedNotice] = useState(false);

  const toggleLanguage = (code: LanguageCode) => {
    if (code === catalog.primaryLanguage) return;
    onChange((prev) => {
      const exists = prev.enabledLanguages.includes(code);
      const nextEnabled = exists
        ? prev.enabledLanguages.filter((l) => l !== code)
        : [...prev.enabledLanguages, code];
      return { ...prev, enabledLanguages: nextEnabled };
    });
    if (!catalog.enabledLanguages.includes(code)) {
      setEditingLang(code);
    }
  };

  const handleSetPrimary = (code: LanguageCode) => {
    onChange((prev) => ({
      ...prev,
      primaryLanguage: code,
      enabledLanguages: prev.enabledLanguages.includes(code)
        ? prev.enabledLanguages
        : [code, ...prev.enabledLanguages],
    }));
    onSelectPreviewLang(code);
  };

  const handleCopyFromPrimary = (targetLang: LanguageCode) => {
    onChange((prev) => ({
      ...prev,
      cover: {
        ...prev.cover,
        translations: {
          ...prev.cover.translations,
          [targetLang]: {
            eyebrow: prev.cover.eyebrow,
            title: prev.cover.title,
            subtitle: prev.cover.subtitle,
            season: prev.cover.season,
            edition: prev.cover.edition,
          },
        },
      },
      presentation: {
        ...prev.presentation,
        translations: {
          ...prev.presentation.translations,
          [targetLang]: {
            heading: prev.presentation.heading,
            story: prev.presentation.story,
            shippingNote: prev.presentation.shippingNote,
            backCoverHeadline: prev.presentation.backCoverHeadline,
            backCoverSubline: prev.presentation.backCoverSubline,
            pillars: prev.presentation.pillars.map((p) => ({ ...p })),
          },
        },
      },
      products: prev.products.map((prod) => ({
        ...prod,
        translations: {
          ...prod.translations,
          [targetLang]: {
            name: prod.name,
            category: prod.category,
            description: prod.description,
            promoTag: prod.promoTag || '',
          },
        },
      })),
    }));
    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 2200);
  };

  const activeTarget = editingLang === catalog.primaryLanguage
    ? SUPPORTED_LANGUAGES.find((l) => l.code !== catalog.primaryLanguage)?.code || 'fr'
    : editingLang;

  const targetMeta = LANGUAGE_MAP[activeTarget];
  const coverTr = catalog.cover.translations?.[activeTarget] || {};
  const presTr = catalog.presentation.translations?.[activeTarget] || {};

  return (
    <div className="space-y-6">
      {/* Primary Language & Enabled Languages */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Catálogo multilingüe</h3>
            <p className="text-xs text-slate-500">
              Define el idioma principal y activa idiomas adicionales para el selector de tus clientes.
            </p>
          </div>
          <Globe className="w-4 h-4 text-slate-400 shrink-0" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Idioma principal</label>
          <select
            value={catalog.primaryLanguage}
            onChange={(e) => handleSetPrimary(e.target.value as LanguageCode)}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-slate-900"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name} ({lang.nativeName}) {lang.dir === 'rtl' ? '— RTL' : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2 pt-1">
          <div className="text-xs font-semibold text-slate-700">Idiomas disponibles para el cliente</div>
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isPrimary = lang.code === catalog.primaryLanguage;
            const isEnabled = catalog.enabledLanguages.includes(lang.code);
            const progress = getTranslationCompleteness(catalog, lang.code);
            const isPreviewing = activePreviewLang === lang.code;

            return (
              <div
                key={lang.code}
                className="flex items-center justify-between gap-2 p-2.5 rounded-lg border border-slate-200 bg-white"
              >
                <label className="flex items-center gap-2.5 cursor-pointer min-w-0">
                  <input
                    type="checkbox"
                    checked={isEnabled}
                    disabled={isPrimary}
                    onChange={() => toggleLanguage(lang.code)}
                    className="w-4 h-4 accent-slate-900"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                      <span>{lang.name}</span>
                      <span className="text-slate-400 font-normal">· {lang.nativeName}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono-tabular">
                      {isPrimary ? 'Idioma base (100%)' : `Traducido ${progress.percent}%`}
                      {lang.dir === 'rtl' ? ' · Lectura RTL' : ''}
                    </div>
                  </div>
                </label>

                <div className="flex items-center gap-1.5 shrink-0">
                  {!isPrimary && isEnabled ? (
                    <button
                      type="button"
                      onClick={() => setEditingLang(lang.code)}
                      className={`px-2 py-1 text-[11px] font-semibold rounded border transition-colors ${
                        activeTarget === lang.code
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-slate-200 text-slate-700 hover:border-slate-400'
                      }`}
                    >
                      Traducir
                    </button>
                  ) : null}
                  {isEnabled ? (
                    <button
                      type="button"
                      onClick={() => onSelectPreviewLang(lang.code)}
                      title={`Ver vista previa en ${lang.name}`}
                      className={`p-1.5 rounded border transition-colors ${
                        isPreviewing
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-slate-200 text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Translation Editor Workbench */}
      <div className="pt-4 border-t border-slate-200 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
              Editor de traducciones · {targetMeta.name} ({targetMeta.nativeName})
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Los campos vacíos usan automáticamente el idioma principal como respaldo.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg flex-1">
            {[
              { id: 'cover', label: 'Portada' },
              { id: 'presentation', label: 'Presentación' },
              { id: 'products', label: 'Productos' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSection(tab.id as typeof section)}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  section === tab.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => handleCopyFromPrimary(activeTarget)}
            className="inline-flex items-center gap-1 px-2.5 py-2 text-[11px] font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shrink-0 whitespace-nowrap"
            title="Rellenar con textos del idioma principal como plantilla"
          >
            <CopyCheck className="w-3.5 h-3.5" />
            {copiedNotice ? 'Copiado' : 'Clonar base'}
          </button>
        </div>

        {section === 'cover' ? (
          <div className="space-y-3" dir={targetMeta.dir}>
            {(
              [
                { key: 'eyebrow', label: 'Antetítulo', base: catalog.cover.eyebrow },
                { key: 'title', label: 'Título de portada', base: catalog.cover.title },
                { key: 'subtitle', label: 'Subtítulo', base: catalog.cover.subtitle, multiline: true },
                { key: 'season', label: 'Temporada', base: catalog.cover.season },
                { key: 'edition', label: 'Edición', base: catalog.cover.edition },
              ] as const
            ).map((field) => (
              <div key={field.key}>
                <div className="flex items-baseline justify-between gap-2 mb-1" dir="ltr">
                  <label className="text-xs font-semibold text-slate-700">{field.label}</label>
                  <span className="text-[11px] text-slate-400 truncate max-w-[190px]">
                    Base: {field.base}
                  </span>
                </div>
                {'multiline' in field && field.multiline ? (
                  <textarea
                    rows={2}
                    value={coverTr[field.key] || ''}
                    onChange={(e) =>
                      onChange((prev) => ({
                        ...prev,
                        cover: {
                          ...prev.cover,
                          translations: {
                            ...prev.cover.translations,
                            [activeTarget]: {
                              ...prev.cover.translations?.[activeTarget],
                              [field.key]: e.target.value,
                            },
                          },
                        },
                      }))
                    }
                    placeholder={field.base}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-slate-900 resize-none"
                  />
                ) : (
                  <input
                    type="text"
                    value={coverTr[field.key] || ''}
                    onChange={(e) =>
                      onChange((prev) => ({
                        ...prev,
                        cover: {
                          ...prev.cover,
                          translations: {
                            ...prev.cover.translations,
                            [activeTarget]: {
                              ...prev.cover.translations?.[activeTarget],
                              [field.key]: e.target.value,
                            },
                          },
                        },
                      }))
                    }
                    placeholder={field.base}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-slate-900"
                  />
                )}
              </div>
            ))}
          </div>
        ) : null}

        {section === 'presentation' ? (
          <div className="space-y-3" dir={targetMeta.dir}>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" dir="ltr">
                Titular de presentación
              </label>
              <input
                type="text"
                value={presTr.heading || ''}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    presentation: {
                      ...prev.presentation,
                      translations: {
                        ...prev.presentation.translations,
                        [activeTarget]: {
                          ...prev.presentation.translations?.[activeTarget],
                          heading: e.target.value,
                        },
                      },
                    },
                  }))
                }
                placeholder={catalog.presentation.heading}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" dir="ltr">
                Historia de marca
              </label>
              <textarea
                rows={3}
                value={presTr.story || ''}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    presentation: {
                      ...prev.presentation,
                      translations: {
                        ...prev.presentation.translations,
                        [activeTarget]: {
                          ...prev.presentation.translations?.[activeTarget],
                          story: e.target.value,
                        },
                      },
                    },
                  }))
                }
                placeholder={catalog.presentation.story}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-slate-900 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" dir="ltr">
                Condiciones de envío
              </label>
              <input
                type="text"
                value={presTr.shippingNote || ''}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    presentation: {
                      ...prev.presentation,
                      translations: {
                        ...prev.presentation.translations,
                        [activeTarget]: {
                          ...prev.presentation.translations?.[activeTarget],
                          shippingNote: e.target.value,
                        },
                      },
                    },
                  }))
                }
                placeholder={catalog.presentation.shippingNote}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" dir="ltr">
                Titular de contraportada
              </label>
              <input
                type="text"
                value={presTr.backCoverHeadline || ''}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    presentation: {
                      ...prev.presentation,
                      translations: {
                        ...prev.presentation.translations,
                        [activeTarget]: {
                          ...prev.presentation.translations?.[activeTarget],
                          backCoverHeadline: e.target.value,
                        },
                      },
                    },
                  }))
                }
                placeholder={catalog.presentation.backCoverHeadline}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-slate-900"
              />
            </div>
          </div>
        ) : null}

        {section === 'products' ? (
          <div className="space-y-4">
            {catalog.products.map((product) => {
              const pTr = product.translations?.[activeTarget] || {};
              const updateProdTr = (patch: Partial<typeof pTr>) => {
                onChange((prev) => ({
                  ...prev,
                  products: prev.products.map((item) =>
                    item.id === product.id
                      ? {
                          ...item,
                          translations: {
                            ...item.translations,
                            [activeTarget]: {
                              ...item.translations?.[activeTarget],
                              ...patch,
                            },
                          },
                        }
                      : item
                  ),
                }));
              };

              return (
                <div
                  key={product.id}
                  className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-900 truncate">
                      {product.name}
                    </span>
                    <span className="text-[11px] font-mono-tabular text-slate-500 shrink-0">
                      {product.sku}
                    </span>
                  </div>

                  <div className="space-y-2" dir={targetMeta.dir}>
                    <input
                      type="text"
                      value={pTr.name || ''}
                      onChange={(e) => updateProdTr({ name: e.target.value })}
                      placeholder={`Nombre (${product.name})`}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:border-slate-900"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={pTr.category || ''}
                        onChange={(e) => updateProdTr({ category: e.target.value })}
                        placeholder={`Categoría (${product.category})`}
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:border-slate-900"
                      />
                      <input
                        type="text"
                        value={pTr.promoTag || ''}
                        onChange={(e) => updateProdTr({ promoTag: e.target.value })}
                        placeholder={`Etiqueta (${product.promoTag || 'Promo'})`}
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:border-slate-900"
                      />
                    </div>
                    <textarea
                      rows={2}
                      value={pTr.description || ''}
                      onChange={(e) => updateProdTr({ description: e.target.value })}
                      placeholder={product.description}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:border-slate-900 resize-none"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
