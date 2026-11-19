import { useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Copy,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { QUICK_COLOR_PALETTE } from '../data/templates';
import { CatalogData, ColorSwatch, Product } from '../types/catalog';
import { formatPrice } from '../utils/formatters';
import { compressImageFile } from '../utils/imageUpload';

interface ProductsEditorPanelProps {
  catalog: CatalogData;
  onChange: (updater: (prev: CatalogData) => CatalogData) => void;
}

export function ProductsEditorPanel({ catalog, onChange }: ProductsEditorPanelProps) {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string>(catalog.products[0]?.id || '');
  const [customColorName, setCustomColorName] = useState('');
  const [customColorHex, setCustomColorHex] = useState('#1D4ED8');
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedProduct =
    catalog.products.find((p) => p.id === selectedId) || catalog.products[0] || null;

  const filteredProducts = catalog.products.filter((p) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  });

  const updateProduct = (id: string, patch: Partial<Product>) => {
    onChange((prev) => ({
      ...prev,
      products: prev.products.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }));
  };

  const handleAddProduct = () => {
    const nextNum = catalog.products.length + 1;
    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      sku: `ST-26${String(nextNum).padStart(2, '0')}`,
      name: `Nueva Prenda ${nextNum}`,
      category: 'Colección Temporada',
      description: 'Descripción técnica y detalles clave del artículo para tus clientes.',
      price: 59,
      sizes: 'S · M · L · XL',
      promoTag: '',
      imageUrl: catalog.products[0]?.imageUrl || '',
      colors: [
        { id: `c-${Date.now()}-1`, name: 'Negro Obsidiana', hex: '#141518' },
        { id: `c-${Date.now()}-2`, name: 'Blanco Tiza', hex: '#F4F4F0' },
      ],
    };
    onChange((prev) => ({ ...prev, products: [...prev.products, newProduct] }));
    setSelectedId(newProduct.id);
  };

  const handleDuplicate = (product: Product) => {
    const copy: Product = {
      ...product,
      id: `prod-${Date.now()}`,
      sku: `${product.sku}-B`,
      name: `${product.name} (Copia)`,
      colors: product.colors.map((c, idx) => ({ ...c, id: `c-${Date.now()}-${idx}` })),
    };
    onChange((prev) => ({ ...prev, products: [...prev.products, copy] }));
    setSelectedId(copy.id);
  };

  const handleDelete = (id: string) => {
    onChange((prev) => {
      const remaining = prev.products.filter((p) => p.id !== id);
      if (selectedId === id) {
        setSelectedId(remaining[0]?.id || '');
      }
      return { ...prev, products: remaining };
    });
  };

  const handleMove = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= catalog.products.length) return;
    onChange((prev) => {
      const next = [...prev.products];
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item);
      return { ...prev, products: next };
    });
  };

  const handleUploadPhoto = async (file: File | undefined) => {
    if (!file || !selectedProduct) return;
    setUploadError('');
    try {
      const dataUrl = await compressImageFile(file, { maxWidth: 1200, maxHeight: 1200, quality: 0.85 });
      updateProduct(selectedProduct.id, { imageUrl: dataUrl });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Error al subir la fotografía.');
    }
  };

  const handleAddColorSwatch = (swatch: Omit<ColorSwatch, 'id'>) => {
    if (!selectedProduct) return;
    const exists = selectedProduct.colors.some(
      (c) => c.hex.toLowerCase() === swatch.hex.toLowerCase() && c.name === swatch.name
    );
    if (exists) return;
    updateProduct(selectedProduct.id, {
      colors: [...selectedProduct.colors, { ...swatch, id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 5)}` }],
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar producto o SKU..."
            className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-slate-900"
          />
        </div>
        <button
          type="button"
          onClick={handleAddProduct}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 whitespace-nowrap shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          Añadir
        </button>
      </div>

      {/* Product Selector List */}
      <div className="space-y-1.5 max-h-[210px] overflow-y-auto pr-1">
        {filteredProducts.map((product) => {
          const realIndex = catalog.products.findIndex((p) => p.id === product.id);
          const active = selectedProduct?.id === product.id;
          return (
            <div
              key={product.id}
              onClick={() => setSelectedId(product.id)}
              className={`flex items-center gap-2.5 p-2 rounded-lg border cursor-pointer transition-colors ${
                active
                  ? 'border-slate-900 bg-slate-50'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <img
                src={product.imageUrl}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded object-cover border border-slate-200 shrink-0 bg-slate-100"
              />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-slate-900 truncate">{product.name}</div>
                <div className="text-[11px] text-slate-500 font-mono-tabular truncate">
                  {product.sku} · {formatPrice(product.price, catalog.currency)}
                </div>
              </div>
              <div className="flex items-center gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => handleMove(realIndex, -1)}
                  disabled={realIndex === 0}
                  className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-30"
                  title="Subir"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleMove(realIndex, 1)}
                  disabled={realIndex === catalog.products.length - 1}
                  className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-30"
                  title="Bajar"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDuplicate(product)}
                  className="p-1 text-slate-400 hover:text-slate-800"
                  title="Duplicar"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(product.id)}
                  className="p-1 text-slate-400 hover:text-red-600"
                  title="Eliminar"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Product Editor */}
      {selectedProduct ? (
        <div className="pt-4 border-t border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
              Editando ficha · {selectedProduct.sku}
            </h3>
          </div>

          {/* Photo Dropzone */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleUploadPhoto(e.target.files?.[0])}
              className="hidden"
            />
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleUploadPhoto(e.dataTransfer.files?.[0]);
              }}
              className="flex items-center gap-3 p-2.5 rounded-lg border border-dashed border-slate-300 bg-slate-50"
            >
              <img
                src={selectedProduct.imageUrl}
                alt={selectedProduct.name}
                referrerPolicy="no-referrer"
                className="w-16 h-12 rounded object-cover border border-slate-200 bg-white shrink-0"
              />
              <div className="flex-1 min-w-0">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Subir o arrastrar foto
                </button>
                <p className="text-[11px] text-slate-500 mt-1">
                  Optimización automática para PDF y web
                </p>
              </div>
            </div>
            {uploadError ? <p className="text-xs text-red-600 mt-1">{uploadError}</p> : null}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre del producto</label>
            <input
              type="text"
              value={selectedProduct.name}
              onChange={(e) => updateProduct(selectedProduct.id, { name: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Categoría</label>
              <input
                type="text"
                value={selectedProduct.category}
                onChange={(e) => updateProduct(selectedProduct.id, { category: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Referencia / SKU</label>
              <input
                type="text"
                value={selectedProduct.sku}
                onChange={(e) => updateProduct(selectedProduct.id, { sku: e.target.value })}
                className="w-full px-3 py-2 text-xs font-mono-tabular border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Precio ({catalog.currency})
              </label>
              <input
                type="number"
                min={0}
                step="0.5"
                value={selectedProduct.price}
                onChange={(e) => updateProduct(selectedProduct.id, { price: Number(e.target.value) || 0 })}
                className="w-full px-2.5 py-2 text-xs font-mono-tabular border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Precio anterior</label>
              <input
                type="number"
                min={0}
                step="0.5"
                value={selectedProduct.oldPrice ?? ''}
                onChange={(e) =>
                  updateProduct(selectedProduct.id, {
                    oldPrice: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                placeholder="Opcional"
                className="w-full px-2.5 py-2 text-xs font-mono-tabular border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Etiqueta promo</label>
              <input
                type="text"
                value={selectedProduct.promoTag || ''}
                onChange={(e) => updateProduct(selectedProduct.id, { promoTag: e.target.value })}
                placeholder="-20% / Nuevo"
                className="w-full px-2.5 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tallas disponibles</label>
            <input
              type="text"
              value={selectedProduct.sizes}
              onChange={(e) => updateProduct(selectedProduct.id, { sizes: e.target.value })}
              placeholder="S · M · L · XL"
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Descripción</label>
            <textarea
              rows={3}
              value={selectedProduct.description}
              onChange={(e) => updateProduct(selectedProduct.id, { description: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-slate-900 resize-none"
            />
          </div>

          {/* Colors Manager */}
          <div className="pt-2 border-t border-slate-200 space-y-2.5">
            <div className="text-xs font-semibold text-slate-800">Colores del producto</div>

            {selectedProduct.colors.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {selectedProduct.colors.map((c) => (
                  <div
                    key={c.id}
                    className="inline-flex items-center gap-1.5 pl-2 pr-1.5 py-1 rounded-md border border-slate-200 bg-white text-[11px] text-slate-800"
                  >
                    <span
                      className="w-3 h-3 rounded-full border border-black/20"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span>{c.name}</span>
                    <button
                      type="button"
                      onClick={() =>
                        updateProduct(selectedProduct.id, {
                          colors: selectedProduct.colors.filter((item) => item.id !== c.id),
                        })
                      }
                      className="text-slate-400 hover:text-red-600"
                      aria-label={`Quitar color ${c.name}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-slate-500">Sin colores asignados aún.</p>
            )}

            <div className="flex flex-wrap gap-1.5 pt-1">
              {QUICK_COLOR_PALETTE.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handleAddColorSwatch(preset)}
                  title={`Añadir ${preset.name}`}
                  className="w-6 h-6 rounded-full border border-black/20 hover:scale-110 transition-transform"
                  style={{ backgroundColor: preset.hex }}
                />
              ))}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="color"
                value={customColorHex}
                onChange={(e) => setCustomColorHex(e.target.value)}
                className="w-8 h-8 rounded border border-slate-200 p-0.5 bg-white cursor-pointer shrink-0"
              />
              <input
                type="text"
                value={customColorName}
                onChange={(e) => setCustomColorName(e.target.value)}
                placeholder="Nombre del color..."
                className="flex-1 px-2.5 py-1.5 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:border-slate-900"
              />
              <button
                type="button"
                onClick={() => {
                  if (!customColorName.trim()) return;
                  handleAddColorSwatch({ name: customColorName.trim(), hex: customColorHex });
                  setCustomColorName('');
                }}
                className="px-2.5 py-1.5 text-xs font-semibold rounded-md border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 whitespace-nowrap"
              >
                Añadir
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 text-center border border-dashed border-slate-300 rounded-lg">
          <p className="text-xs text-slate-500 mb-3">
            Todavía no hay productos en este catálogo.
          </p>
          <button
            type="button"
            onClick={handleAddProduct}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-white"
          >
            Crear primer producto
          </button>
        </div>
      )}
    </div>
  );
}
