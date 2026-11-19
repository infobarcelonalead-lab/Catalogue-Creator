import { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { TEMPLATE_THEMES } from '../data/templates';
import {
  CatalogData,
  CoverLayout,
  PresentationLayout,
  ProductLayout,
  TemplateId,
  WatermarkPosition,
} from '../types/catalog';
import { compressImageFile } from '../utils/imageUpload';

interface DesignStudioPanelProps {
  catalog: CatalogData;
  onChange: (updater: (prev: CatalogData) => CatalogData) => void;
}

const ACCENT_PRESETS = ['#1D4ED8', '#0F172A', '#059669', '#DC2626', '#1E3A5F', '#B45309', '#4338CA'];

export function DesignStudioPanel({ catalog, onChange }: DesignStudioPanelProps) {
  const [subTab, setSubTab] = useState<'templates' | 'layouts' | 'watermark'>('templates');
  const [logoError, setLogoError] = useState('');
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleSelectTemplate = (id: TemplateId) => {
    const theme = TEMPLATE_THEMES[id];
    onChange((prev) => ({
      ...prev,
      templateId: id,
      accentColor: theme.defaultAccent,
    }));
  };

  const handleWatermarkLogoUpload = async (file: File | undefined) => {
    if (!file) return;
    setLogoError('');
    try {
      const dataUrl = await compressImageFile(file, {
        maxWidth: 640,
        maxHeight: 640,
        preserveAlpha: true,
      });
      onChange((prev) => ({
        ...prev,
        watermark: {
          ...prev.watermark,
          enabled: true,
          mode: 'logo',
          logoDataUrl: dataUrl,
        },
      }));
    } catch (err) {
      setLogoError(err instanceof Error ? err.message : 'Error al subir logotipo.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
        {[
          { id: 'templates', label: 'Estilos' },
          { id: 'layouts', label: 'Disposición' },
          { id: 'watermark', label: 'Marca de agua' },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSubTab(item.id as typeof subTab)}
            className={`flex-1 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
              subTab === item.id
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {subTab === 'templates' ? (
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-1">Plantillas editoriales</h3>
            <p className="text-xs text-slate-500 mb-3">
              Aplica una dirección visual completa a portada, presentación y fichas de producto.
            </p>
            <div className="space-y-2.5">
              {(Object.keys(TEMPLATE_THEMES) as TemplateId[]).map((id) => {
                const theme = TEMPLATE_THEMES[id];
                const active = catalog.templateId === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => handleSelectTemplate(id)}
                    className={`w-full text-left p-3.5 rounded-lg border transition-colors flex items-start justify-between gap-3 ${
                      active
                        ? 'border-slate-900 bg-slate-50'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-900">{theme.name}</div>
                      <div className="text-xs text-slate-500 mt-0.5 leading-snug">
                        {theme.subtitle}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 pt-0.5">
                      <span
                        className="w-4 h-4 rounded-sm border border-black/15"
                        style={{ backgroundColor: theme.pageBg }}
                      />
                      <span
                        className="w-4 h-4 rounded-sm border border-black/15"
                        style={{ backgroundColor: theme.defaultAccent }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200">
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Color de acento personalizado
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {ACCENT_PRESETS.map((hex) => (
                <button
                  key={hex}
                  type="button"
                  onClick={() => onChange((prev) => ({ ...prev, accentColor: hex }))}
                  className={`w-7 h-7 rounded-md border transition-transform ${
                    catalog.accentColor.toLowerCase() === hex.toLowerCase()
                      ? 'ring-2 ring-slate-900 ring-offset-1 scale-105 border-white'
                      : 'border-black/15'
                  }`}
                  style={{ backgroundColor: hex }}
                  aria-label={`Color ${hex}`}
                />
              ))}
              <label className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-slate-200 bg-white text-xs text-slate-700 cursor-pointer hover:border-slate-300">
                <input
                  type="color"
                  value={catalog.accentColor}
                  onChange={(e) => onChange((prev) => ({ ...prev, accentColor: e.target.value }))}
                  className="w-4 h-4 border-0 p-0 bg-transparent cursor-pointer"
                />
                <span className="font-mono-tabular uppercase">{catalog.accentColor}</span>
              </label>
            </div>
          </div>
        </div>
      ) : null}

      {subTab === 'layouts' ? (
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-2.5">Estilo de portada</h3>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: 'full_bleed', label: 'Editorial Completa' },
                  { id: 'split', label: 'Portada Dividida' },
                  { id: 'framed', label: 'Póster Enmarcado' },
                ] as Array<{ id: CoverLayout; label: string }>
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onChange((prev) => ({ ...prev, coverLayout: opt.id }))}
                  className={`p-2.5 rounded-lg border text-xs font-medium text-center transition-colors ${
                    catalog.coverLayout === opt.id
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200">
            <h3 className="text-sm font-semibold text-slate-900 mb-2.5">Página de presentación</h3>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: 'asymmetric', label: 'Revista Asimétrica' },
                  { id: 'centered', label: 'Manifiesto Centrado' },
                  { id: 'lookbook', label: 'Lookbook Superior' },
                ] as Array<{ id: PresentationLayout; label: string }>
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onChange((prev) => ({ ...prev, presentationLayout: opt.id }))}
                  className={`p-2.5 rounded-lg border text-xs font-medium text-center transition-colors ${
                    catalog.presentationLayout === opt.id
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200">
            <h3 className="text-sm font-semibold text-slate-900 mb-2.5">Formato de páginas de producto</h3>
            <div className="space-y-2">
              {(
                [
                  {
                    id: 'grid_2x2',
                    label: 'Cuadrícula 2×2 Editorial',
                    desc: '4 productos por página con descripción y muestra de colores amplia',
                  },
                  {
                    id: 'grid_2x3',
                    label: 'Cuadrícula 2×3 Comercial',
                    desc: '6 productos por página ideal para catálogos amplios y promociones',
                  },
                  {
                    id: 'featured_list',
                    label: 'Lista Destacada',
                    desc: '3 fichas horizontales por página con imagen grande y doble botón',
                  },
                ] as Array<{ id: ProductLayout; label: string; desc: string }>
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onChange((prev) => ({ ...prev, productLayout: opt.id }))}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    catalog.productLayout === opt.id
                      ? 'border-slate-900 bg-slate-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="text-xs font-semibold text-slate-900">{opt.label}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 space-y-3">
            <label className="flex items-center justify-between gap-3 cursor-pointer">
              <div>
                <div className="text-xs font-semibold text-slate-900">Agrupar páginas por categoría</div>
                <div className="text-[11px] text-slate-500">
                  Abre nueva sección con título para cada categoría de prenda
                </div>
              </div>
              <input
                type="checkbox"
                checked={catalog.groupByCategory}
                onChange={(e) => onChange((prev) => ({ ...prev, groupByCategory: e.target.checked }))}
                className="w-4 h-4 accent-slate-900 rounded"
              />
            </label>

            <label className="flex items-center justify-between gap-3 cursor-pointer">
              <div>
                <div className="text-xs font-semibold text-slate-900">Incluir contraportada con códigos QR</div>
                <div className="text-[11px] text-slate-500">
                  Página final de cierre con QR directo a sporttanger.com y WhatsApp
                </div>
              </div>
              <input
                type="checkbox"
                checked={catalog.includeBackCover}
                onChange={(e) => onChange((prev) => ({ ...prev, includeBackCover: e.target.checked }))}
                className="w-4 h-4 accent-slate-900 rounded"
              />
            </label>
          </div>
        </div>
      ) : null}

      {subTab === 'watermark' ? (
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Marca de agua protectora</h3>
              <p className="text-xs text-slate-500">
                Protege tus fotografías en todas las páginas del PDF y catálogo web.
              </p>
            </div>
            <input
              type="checkbox"
              checked={catalog.watermark.enabled}
              onChange={(e) =>
                onChange((prev) => ({
                  ...prev,
                  watermark: { ...prev.watermark, enabled: e.target.checked },
                }))
              }
              className="w-4 h-4 accent-slate-900"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() =>
                onChange((prev) => ({
                  ...prev,
                  watermark: { ...prev.watermark, mode: 'text' },
                }))
              }
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                catalog.watermark.mode === 'text'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Texto personalizado
            </button>
            <button
              type="button"
              onClick={() =>
                onChange((prev) => ({
                  ...prev,
                  watermark: { ...prev.watermark, mode: 'logo' },
                }))
              }
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                catalog.watermark.mode === 'logo'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Logotipo PNG
            </button>
          </div>

          {catalog.watermark.mode === 'text' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Texto de la marca de agua
              </label>
              <input
                type="text"
                value={catalog.watermark.text}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    watermark: { ...prev.watermark, text: e.target.value },
                  }))
                }
                placeholder="SPORTTANGER.COM"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-slate-900"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Subir logotipo (compatible con PNG transparente)
              </label>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/png,image/webp,image/svg+xml,image/jpeg"
                onChange={(e) => handleWatermarkLogoUpload(e.target.files?.[0])}
                className="hidden"
              />
              {catalog.watermark.logoDataUrl ? (
                <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50">
                  <img
                    src={catalog.watermark.logoDataUrl}
                    alt="Logo marca de agua"
                    className="h-10 max-w-[160px] object-contain"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className="text-xs font-medium text-slate-700 hover:text-slate-900 px-2.5 py-1.5 rounded border border-slate-200 bg-white"
                    >
                      Cambiar
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onChange((prev) => ({
                          ...prev,
                          watermark: { ...prev.watermark, logoDataUrl: '' },
                        }))
                      }
                      className="p-1.5 text-slate-500 hover:text-red-600"
                      aria-label="Eliminar logo"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="w-full py-5 border border-dashed border-slate-300 rounded-lg text-xs font-medium text-slate-600 hover:border-slate-900 hover:text-slate-900 flex flex-col items-center gap-1.5 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  <span>Seleccionar logotipo PNG / WebP</span>
                </button>
              )}
              {logoError ? <p className="text-xs text-red-600">{logoError}</p> : null}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Posición</label>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { id: 'bottom_right', label: 'Esquina inferior' },
                  { id: 'top_right', label: 'Esquina superior' },
                  { id: 'center_diagonal', label: 'Centro diagonal' },
                  { id: 'tile', label: 'Mosaico discreto' },
                ] as Array<{ id: WatermarkPosition; label: string }>
              ).map((pos) => (
                <button
                  key={pos.id}
                  type="button"
                  onClick={() =>
                    onChange((prev) => ({
                      ...prev,
                      watermark: { ...prev.watermark, position: pos.id },
                    }))
                  }
                  className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
                    catalog.watermark.position === pos.id
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {pos.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700">Opacidad</span>
                <span className="font-mono-tabular text-slate-500">
                  {Math.round(catalog.watermark.opacity * 100)}%
                </span>
              </div>
              <input
                type="range"
                min={0.08}
                max={0.45}
                step={0.01}
                value={catalog.watermark.opacity}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    watermark: { ...prev.watermark, opacity: Number(e.target.value) },
                  }))
                }
                className="w-full accent-slate-900"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700">Inclinación</span>
                <span className="font-mono-tabular text-slate-500">{catalog.watermark.rotation}°</span>
              </div>
              <input
                type="range"
                min={-45}
                max={45}
                step={1}
                value={catalog.watermark.rotation}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    watermark: { ...prev.watermark, rotation: Number(e.target.value) },
                  }))
                }
                className="w-full accent-slate-900"
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-200">
            <span className="text-xs font-semibold text-slate-700">Tamaño</span>
            <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-md">
              {(['sm', 'md', 'lg'] as const).map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() =>
                    onChange((prev) => ({
                      ...prev,
                      watermark: { ...prev.watermark, size: sz },
                    }))
                  }
                  className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
                    catalog.watermark.size === sz
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600'
                  }`}
                >
                  {sz === 'sm' ? 'Pequeño' : sz === 'md' ? 'Medio' : 'Grande'}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center justify-between gap-3 cursor-pointer pt-2 border-t border-slate-200">
            <span className="text-xs font-semibold text-slate-800">Aplicar también en la portada</span>
            <input
              type="checkbox"
              checked={catalog.watermark.includeOnCover}
              onChange={(e) =>
                onChange((prev) => ({
                  ...prev,
                  watermark: { ...prev.watermark, includeOnCover: e.target.checked },
                }))
              }
              className="w-4 h-4 accent-slate-900"
            />
          </label>
        </div>
      ) : null}
    </div>
  );
}
