import { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { CatalogData } from '../types/catalog';
import { compressImageFile } from '../utils/imageUpload';

interface ContentEditorPanelProps {
  catalog: CatalogData;
  onChange: (updater: (prev: CatalogData) => CatalogData) => void;
}

export function ContentEditorPanel({ catalog, onChange }: ContentEditorPanelProps) {
  const [subTab, setSubTab] = useState<'cover' | 'presentation' | 'channels'>('cover');
  const [uploadError, setUploadError] = useState('');
  const coverInputRef = useRef<HTMLInputElement>(null);
  const studioInputRef = useRef<HTMLInputElement>(null);

  const handleImagePick = async (file: File | undefined, target: 'cover' | 'studio') => {
    if (!file) return;
    setUploadError('');
    try {
      const dataUrl = await compressImageFile(file, { maxWidth: 1600, maxHeight: 1600, quality: 0.86 });
      if (target === 'cover') {
        onChange((prev) => ({ ...prev, cover: { ...prev.cover, imageUrl: dataUrl } }));
      } else {
        onChange((prev) => ({
          ...prev,
          presentation: { ...prev.presentation, studioImageUrl: dataUrl },
        }));
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'No se pudo procesar la imagen.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
        {[
          { id: 'cover', label: 'Portada' },
          { id: 'presentation', label: 'Presentación' },
          { id: 'channels', label: 'Web y WhatsApp' },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSubTab(item.id as typeof subTab)}
            className={`flex-1 px-2.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
              subTab === item.id
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {uploadError ? (
        <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
          {uploadError}
        </div>
      ) : null}

      {subTab === 'cover' ? (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Fotografía de portada
            </label>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleImagePick(e.target.files?.[0], 'cover')}
              className="hidden"
            />
            <div className="flex items-center gap-3 p-2.5 rounded-lg border border-slate-200 bg-slate-50">
              <img
                src={catalog.cover.imageUrl}
                alt="Vista previa de portada"
                referrerPolicy="no-referrer"
                className="w-14 h-18 rounded object-cover border border-slate-200 bg-white shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-slate-900">Imagen principal A4</div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Recomendado vertical 3:4. Compresión automática optimizada.
                </p>
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Subir foto
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Antetítulo</label>
            <input
              type="text"
              value={catalog.cover.eyebrow}
              onChange={(e) =>
                onChange((prev) => ({ ...prev, cover: { ...prev.cover, eyebrow: e.target.value } }))
              }
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Título principal</label>
            <input
              type="text"
              value={catalog.cover.title}
              onChange={(e) =>
                onChange((prev) => ({ ...prev, cover: { ...prev.cover, title: e.target.value } }))
              }
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Subtítulo comercial</label>
            <textarea
              rows={3}
              value={catalog.cover.subtitle}
              onChange={(e) =>
                onChange((prev) => ({ ...prev, cover: { ...prev.cover, subtitle: e.target.value } }))
              }
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-slate-900 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Temporada</label>
              <input
                type="text"
                value={catalog.cover.season}
                onChange={(e) =>
                  onChange((prev) => ({ ...prev, cover: { ...prev.cover, season: e.target.value } }))
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Edición / Campaña</label>
              <input
                type="text"
                value={catalog.cover.edition}
                onChange={(e) =>
                  onChange((prev) => ({ ...prev, cover: { ...prev.cover, edition: e.target.value } }))
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-slate-900"
              />
            </div>
          </div>
        </div>
      ) : null}

      {subTab === 'presentation' ? (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Imagen de estudio / tienda
            </label>
            <input
              ref={studioInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleImagePick(e.target.files?.[0], 'studio')}
              className="hidden"
            />
            <div className="flex items-center gap-3 p-2.5 rounded-lg border border-slate-200 bg-slate-50">
              <img
                src={catalog.presentation.studioImageUrl}
                alt="Vista previa de presentación"
                referrerPolicy="no-referrer"
                className="w-16 h-12 rounded object-cover border border-slate-200 bg-white shrink-0"
              />
              <button
                type="button"
                onClick={() => studioInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
              >
                <Upload className="w-3.5 h-3.5" />
                Cambiar fotografía
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Titular de presentación</label>
            <input
              type="text"
              value={catalog.presentation.heading}
              onChange={(e) =>
                onChange((prev) => ({
                  ...prev,
                  presentation: { ...prev.presentation, heading: e.target.value },
                }))
              }
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Historia de marca</label>
            <textarea
              rows={4}
              value={catalog.presentation.story}
              onChange={(e) =>
                onChange((prev) => ({
                  ...prev,
                  presentation: { ...prev.presentation, story: e.target.value },
                }))
              }
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-slate-900 resize-none"
            />
          </div>

          <div className="space-y-3 pt-2 border-t border-slate-200">
            <div className="text-xs font-semibold text-slate-800">3 pilares comerciales</div>
            {catalog.presentation.pillars.map((pillar, idx) => (
              <div key={idx} className="space-y-1.5 pb-3 border-b border-slate-100 last:border-0">
                <input
                  type="text"
                  value={pillar.title}
                  onChange={(e) =>
                    onChange((prev) => {
                      const nextPillars = [...prev.presentation.pillars] as CatalogData['presentation']['pillars'];
                      nextPillars[idx] = { ...nextPillars[idx], title: e.target.value };
                      return {
                        ...prev,
                        presentation: { ...prev.presentation, pillars: nextPillars },
                      };
                    })
                  }
                  placeholder={`Título pilar ${idx + 1}`}
                  className="w-full px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-md bg-white focus:outline-none focus:border-slate-900"
                />
                <textarea
                  rows={2}
                  value={pillar.text}
                  onChange={(e) =>
                    onChange((prev) => {
                      const nextPillars = [...prev.presentation.pillars] as CatalogData['presentation']['pillars'];
                      nextPillars[idx] = { ...nextPillars[idx], text: e.target.value };
                      return {
                        ...prev,
                        presentation: { ...prev.presentation, pillars: nextPillars },
                      };
                    })
                  }
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:border-slate-900 resize-none"
                />
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Condiciones de envío y pedido
            </label>
            <input
              type="text"
              value={catalog.presentation.shippingNote}
              onChange={(e) =>
                onChange((prev) => ({
                  ...prev,
                  presentation: { ...prev.presentation, shippingNote: e.target.value },
                }))
              }
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-slate-900"
            />
          </div>

          <div className="pt-2 border-t border-slate-200 space-y-3">
            <div className="text-xs font-semibold text-slate-800">Contraportada</div>
            <input
              type="text"
              value={catalog.presentation.backCoverHeadline}
              onChange={(e) =>
                onChange((prev) => ({
                  ...prev,
                  presentation: { ...prev.presentation, backCoverHeadline: e.target.value },
                }))
              }
              placeholder="Titular de cierre"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-slate-900"
            />
            <textarea
              rows={2}
              value={catalog.presentation.backCoverSubline}
              onChange={(e) =>
                onChange((prev) => ({
                  ...prev,
                  presentation: { ...prev.presentation, backCoverSubline: e.target.value },
                }))
              }
              placeholder="Texto secundario de cierre"
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-slate-900 resize-none"
            />
          </div>
        </div>
      ) : null}

      {subTab === 'channels' ? (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre comercial</label>
            <input
              type="text"
              value={catalog.brandName}
              onChange={(e) => onChange((prev) => ({ ...prev, brandName: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Sitio web promocionado
            </label>
            <input
              type="text"
              value={catalog.websiteDisplay}
              onChange={(e) => {
                const display = e.target.value.replace(/^https?:\/\//i, '').trim();
                onChange((prev) => ({
                  ...prev,
                  websiteDisplay: display,
                  websiteUrl: display ? `https://${display}` : 'https://sporttanger.com',
                }));
              }}
              placeholder="sporttanger.com"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-slate-900"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Aparece en portada, pie de página, botones de compra y códigos QR escaneables.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Número de WhatsApp para pedidos (con prefijo país)
            </label>
            <input
              type="text"
              value={catalog.whatsappNumber}
              onChange={(e) => onChange((prev) => ({ ...prev, whatsappNumber: e.target.value }))}
              placeholder="+212 6 00 12 34 56"
              className="w-full px-3 py-2 text-sm font-mono-tabular border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Moneda</label>
              <select
                value={catalog.currency}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    currency: e.target.value as CatalogData['currency'],
                  }))
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-slate-900"
              >
                <option value="€">Euro (€)</option>
                <option value="MAD">Dirham (MAD)</option>
                <option value="$">Dólar ($)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Instagram</label>
              <input
                type="text"
                value={catalog.instagramHandle}
                onChange={(e) => onChange((prev) => ({ ...prev, instagramHandle: e.target.value }))}
                placeholder="@sporttanger"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Correo de pedidos / atención
            </label>
            <input
              type="email"
              value={catalog.email}
              onChange={(e) => onChange((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="pedidos@sporttanger.com"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-slate-900"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
