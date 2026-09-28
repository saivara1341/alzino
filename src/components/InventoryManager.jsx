import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  AlertTriangle, 
  Edit3, 
  Trash2, 
  Barcode, 
  TrendingUp, 
  ShieldAlert, 
  Smartphone,
  CheckCircle,
  Hash
} from 'lucide-react';
import { renderBarcodeSvg } from '../utils/barcode';

const standardBrands = [
  'Apple', 
  'Samsung', 
  'OnePlus', 
  'Vivo', 
  'Oppo', 
  'Realme', 
  'Xiaomi / Redmi', 
  'Motorola', 
  'Google Pixel', 
  'iQOO',
  'Nothing',
  'boAt', 
  'Noise', 
  'Universal'
];

export default function InventoryManager({ 
  inventory, 
  setInventory, 
  role, 
  onSelectBarcode 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [gstFilter, setGstFilter] = useState('all'); // 'all' | 'gst' | 'non-gst'
  const [stockFilter, setStockFilter] = useState('all'); // 'all' | 'low' | 'out'
  const [sortBy, setSortBy] = useState('default'); // 'default' | 'name' | 'stock-asc' | 'stock-desc' | 'price-asc' | 'price-desc' | 'margin'
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isCustomBrand, setIsCustomBrand] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    category: 'New Mobiles',
    brand: '',
    name: '',
    description: '',
    isGst: true,
    hsn: '851712',
    gstRate: 18,
    buyPrice: '',
    sellPrice: '',
    mrp: '',
    stock: 1,
    lowStockThreshold: 2,
    barcode: '',
    imeisText: '',
    warranty: '1 Year Brand Warranty',
  });

  const categories = ['All', 'New Mobiles', 'Used Mobiles', 'Mobile Accessories', 'Home Appliances'];

  // Smart Filter and Sort products
  const filteredProducts = inventory.filter(item => {
    // Category match
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;

    // GST filter match
    const isItemGst = (item.gstRate && item.gstRate > 0) || item.isGst;
    const matchesGst = 
      gstFilter === 'all' || 
      (gstFilter === 'gst' && isItemGst) || 
      (gstFilter === 'non-gst' && !isItemGst);

    // Stock filter match
    const isLow = item.stock > 0 && item.stock <= (item.lowStockThreshold || 2);
    const isOut = item.stock === 0;
    const matchesStock = 
      stockFilter === 'all' ||
      (stockFilter === 'low' && isLow) ||
      (stockFilter === 'out' && isOut);

    // Multi-term keyword search across name, brand, category, description, barcode, and imeis
    const q = searchTerm.toLowerCase().trim();
    if (!q) return matchesCategory && matchesGst && matchesStock;

    const words = q.split(/\s+/).filter(Boolean);
    const haystack = [
      item.name || '',
      item.brand || '',
      item.category || '',
      item.description || '',
      item.barcode || '',
      ...(item.imeis || [])
    ].join(' ').toLowerCase();

    const matchesAllWords = words.every(word => haystack.includes(word));
    return matchesCategory && matchesGst && matchesStock && matchesAllWords;
  }).sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'stock-asc') return a.stock - b.stock;
    if (sortBy === 'stock-desc') return b.stock - a.stock;
    if (sortBy === 'price-asc') return a.sellPrice - b.sellPrice;
    if (sortBy === 'price-desc') return b.sellPrice - a.sellPrice;
    if (sortBy === 'margin') return (b.sellPrice - b.buyPrice) - (a.sellPrice - a.buyPrice);
    return 0;
  });

  const openAddModal = () => {
    setEditingItem(null);
    setIsCustomBrand(false);
    setFormData({
      category: 'Mobile Accessories',
      brand: 'Universal',
      name: '',
      description: '',
      isGst: true,
      hsn: '392690',
      gstRate: 18,
      buyPrice: '',
      sellPrice: '',
      mrp: '',
      stock: 5,
      lowStockThreshold: 2,
      barcode: `ALZ-${Date.now().toString().slice(-6)}`,
      imeisText: '',
      warranty: 'Standard Warranty',
    });
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setIsCustomBrand(Boolean(item.brand && !standardBrands.includes(item.brand)));
    const isItemGst = (item.gstRate && item.gstRate > 0) || item.isGst;
    setFormData({
      category: item.category,
      brand: item.brand || 'Apple',
      name: item.name,
      description: item.description || '',
      isGst: isItemGst,
      hsn: item.hsn || '851712',
      gstRate: item.gstRate !== undefined ? item.gstRate : 18,
      buyPrice: item.buyPrice,
      sellPrice: item.sellPrice,
      mrp: item.mrp || item.sellPrice,
      stock: item.stock,
      lowStockThreshold: item.lowStockThreshold || 2,
      barcode: item.barcode || '',
      imeisText: (item.imeis || []).join('\n'),
      warranty: item.warranty || '',
    });
    setShowModal(true);
  };

  const handleDelete = (id, name) => {
    if (confirm(`Delete "${name}" from ALZINO inventory? This cannot be undone.`)) {
      setInventory(prev => prev.filter(i => i.id !== id));
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.sellPrice) {
      alert("Please provide at least product name and selling price.");
      return;
    }

    const imeisArray = formData.imeisText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    // If mobile or appliance with IMEIs, sync stock count with IMEI count if specified
    const calculatedStock = imeisArray.length > 0 ? imeisArray.length : parseInt(formData.stock, 10) || 0;
    const finalGstRate = formData.isGst ? (parseFloat(formData.gstRate) || 18) : 0;

    if (editingItem) {
      setInventory(prev => prev.map(item => {
        if (item.id === editingItem.id) {
          return {
            ...item,
            category: formData.category,
            brand: formData.brand,
            name: formData.name,
            description: formData.description.trim(),
            isGst: formData.isGst,
            hsn: formData.hsn,
            gstRate: finalGstRate,
            buyPrice: parseFloat(formData.buyPrice) || 0,
            sellPrice: parseFloat(formData.sellPrice) || 0,
            mrp: parseFloat(formData.mrp) || parseFloat(formData.sellPrice),
            stock: calculatedStock,
            lowStockThreshold: parseInt(formData.lowStockThreshold, 10) || 2,
            barcode: formData.barcode,
            imeis: imeisArray,
            warranty: formData.warranty,
          };
        }
        return item;
      }));
    } else {
      const newItem = {
        id: `PROD-${Date.now().toString().slice(-4)}`,
        category: formData.category,
        brand: formData.brand,
        name: formData.name,
        description: formData.description.trim(),
        isGst: formData.isGst,
        hsn: formData.hsn,
        gstRate: finalGstRate,
        buyPrice: parseFloat(formData.buyPrice) || 0,
        sellPrice: parseFloat(formData.sellPrice) || 0,
        mrp: parseFloat(formData.mrp) || parseFloat(formData.sellPrice),
        stock: calculatedStock,
        lowStockThreshold: parseInt(formData.lowStockThreshold, 10) || 2,
        barcode: formData.barcode || `ALZ-${Date.now().toString().slice(-6)}`,
        imeis: imeisArray,
        warranty: formData.warranty,
        status: 'Active',
      };
      setInventory(prev => [newItem, ...prev]);
    }

    setShowModal(false);
  };

  return (
    <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
      
      {/* Sleek Minimalist Title Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Stock & Inventory</h2>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {filteredProducts.length} items
          </span>
        </div>

        <button 
          onClick={openAddModal}
          className="btn-primary"
          style={{ padding: '0.45rem 0.9rem', fontSize: '0.82rem' }}
        >
          <Plus size={15} />
          <span>New Product</span>
        </button>
      </div>

      {/* Unified Minimalist Filter Bar */}
      <div className="illoca-card" style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        
        {/* Row 1: Search & Sort */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search by name, model, description, barcode, or IMEI (e.g. 'universal pouch', 'samsung')..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '2.1rem', height: '34px', fontSize: '0.82rem' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>SORT:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-field"
              style={{ width: '150px', padding: '0.25rem 0.5rem', fontSize: '0.78rem', height: '34px' }}
            >
              <option value="default">Default</option>
              <option value="name">Name (A-Z)</option>
              <option value="stock-asc">Stock: Low to High</option>
              <option value="stock-desc">Stock: High to Low</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              {role === 'admin' && <option value="margin">Margin (Highest)</option>}
            </select>
          </div>
        </div>

        {/* Row 2: Categories & Segmented Scopes */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', borderTop: '1px solid var(--border-color)', paddingTop: '0.55rem' }}>
          
          {/* Categories */}
          <div style={{ display: 'flex', gap: '0.2rem', overflowX: 'auto' }}>
            {categories.map(cat => {
              const isActive = categoryFilter === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  style={{
                    padding: '0.2rem 0.55rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.74rem',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: isActive ? 700 : 500,
                    background: isActive ? 'var(--surface-primary)' : 'transparent',
                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                    border: `1px solid ${isActive ? 'var(--border-color)' : 'transparent'}`,
                    transition: 'var(--transition-smooth)',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer'
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Tax Segmented Bar */}
            <div className="segmented-bar">
              {[
                { id: 'all', label: 'All Tax' },
                { id: 'gst', label: 'GST Items' },
                { id: 'non-gst', label: 'Non-GST' },
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setGstFilter(t.id)}
                  className={`segmented-item ${gstFilter === t.id ? 'active' : ''}`}
                  style={{ fontSize: '0.68rem', padding: '0.15rem 0.45rem' }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Stock Status Segmented Bar */}
            <div className="segmented-bar">
              {[
                { id: 'all', label: 'All Stock' },
                { id: 'low', label: 'Low Stock' },
                { id: 'out', label: 'Out of Stock' },
              ].map(s => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStockFilter(s.id)}
                  className={`segmented-item ${stockFilter === s.id ? 'active' : ''}`}
                  style={{ fontSize: '0.68rem', padding: '0.15rem 0.45rem' }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Minimalist Stock Table */}
      <div className="illoca-card" style={{ padding: '0.5rem', overflowX: 'auto' }}>
        <table className="minimal-table">
          <thead>
            <tr>
              <th>Product & Description</th>
              <th>Tax Class</th>
              <th>Stock</th>
              <th>Serial / Barcode</th>
              {role === 'admin' && <th>Buy Price</th>}
              <th>Sell Price</th>
              {role === 'admin' && <th>Margin</th>}
              <th>Warranty</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                  No products match the selected filters or search keyword "{searchTerm}".
                </td>
              </tr>
            ) : (
              filteredProducts.map(item => {
                const isLow = item.stock > 0 && item.stock <= item.lowStockThreshold;
                const isOut = item.stock === 0;
                const marginAmt = item.sellPrice - item.buyPrice;
                const marginPct = item.sellPrice > 0 ? Math.round((marginAmt / item.sellPrice) * 100) : 0;
                const isItemGst = (item.gstRate && item.gstRate > 0) || item.isGst;

                return (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    {/* Product & Description */}
                    <td style={{ padding: '0.75rem 0.5rem', maxWidth: '320px' }}>
                      <div style={{ fontWeight: 600 }}>{item.name}</div>
                      
                      {/* Description / Compatibility keywords */}
                      {item.description && (
                        <div style={{ 
                          fontSize: '0.73rem', 
                          color: 'var(--text-secondary)', 
                          marginTop: '0.2rem',
                          lineHeight: 1.3,
                          fontStyle: 'italic'
                        }}>
                          {item.description}
                        </div>
                      )}

                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', gap: '0.4rem', marginTop: '0.2rem' }}>
                        <span className="mono-tag" style={{ fontSize: '0.68rem', padding: '0.05rem 0.35rem' }}>{item.brand}</span>
                        <span>{item.category}</span>
                        <span>• HSN: {item.hsn || '—'}</span>
                      </div>
                    </td>

                    {/* Tax Class (GST vs Non-GST) */}
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <span className="mono-tag" style={{
                        background: isItemGst ? 'var(--status-green-bg)' : 'var(--status-amber-bg)',
                        color: isItemGst ? 'var(--status-green)' : 'var(--status-amber)',
                        fontSize: '0.72rem',
                      }}>
                        {isItemGst ? `GST ${item.gstRate}%` : 'NON-GST (0%)'}
                      </span>
                    </td>

                    {/* Stock Status */}
                    <td style={{ padding: '0.65rem 0.85rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: isOut ? 'var(--status-red)' : isLow ? 'var(--status-amber)' : 'var(--status-green)',
                          flexShrink: 0
                        }} />
                        <span style={{
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 600,
                          fontSize: '0.82rem',
                          color: isOut ? 'var(--status-red)' : isLow ? 'var(--status-amber)' : 'var(--text-primary)'
                        }}>
                          {item.stock} {isOut ? '(Out)' : isLow ? '(Low)' : 'pcs'}
                        </span>
                      </div>
                    </td>

                    {/* IMEI / Barcode */}
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      {item.imeis && item.imeis.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                          {item.imeis.slice(0, 2).map(im => (
                            <span key={im} className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                              IMEI: {im}
                            </span>
                          ))}
                          {item.imeis.length > 2 && (
                            <span style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
                              +{item.imeis.length - 2} more IMEIs
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                          {item.barcode || '—'}
                        </span>
                      )}
                    </td>

                    {/* Buy Price (Admin only) */}
                    {role === 'admin' && (
                      <td style={{ padding: '0.75rem 0.5rem', fontFamily: 'var(--font-mono)' }}>
                        ₹{item.buyPrice.toLocaleString()}
                      </td>
                    )}

                    {/* Selling Price */}
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                        ₹{item.sellPrice.toLocaleString()}
                      </div>
                      {item.mrp && item.mrp > item.sellPrice && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                          MRP: ₹{item.mrp.toLocaleString()}
                        </div>
                      )}
                    </td>

                    {/* Margin (Admin only) */}
                    {role === 'admin' && (
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--status-green)' }}>
                          ₹{marginAmt.toLocaleString()}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                          ({marginPct}%)
                        </div>
                      </td>
                    )}

                    {/* Warranty */}
                    <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      {item.warranty || 'Standard'}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                        <button
                          onClick={() => onSelectBarcode(item)}
                          className="btn-outline"
                          style={{ padding: '0.35rem 0.5rem' }}
                          title="Print Barcode Label"
                        >
                          <Barcode size={14} color="var(--accent-primary)" />
                        </button>

                        <button
                          onClick={() => openEditModal(item)}
                          className="btn-outline"
                          style={{ padding: '0.35rem 0.5rem' }}
                          title="Edit Item"
                        >
                          <Edit3 size={14} />
                        </button>

                        <button
                          onClick={() => handleDelete(item.id, item.name)}
                          className="btn-outline"
                          style={{ padding: '0.35rem 0.5rem', color: 'var(--status-red)' }}
                          title="Delete Item"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="drawer-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <form onSubmit={handleSave} className="illoca-card animate-fade-in" style={{ maxWidth: '640px', width: '100%', padding: '1.5rem', background: 'var(--surface-primary)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Package size={20} color="var(--accent-primary)" />
                <h3 style={{ fontSize: '1.25rem' }}>{editingItem ? 'Edit Stock Item' : 'Add New Inventory Item'}</h3>
              </div>
              <button type="button" onClick={() => setShowModal(false)} className="btn-outline" style={{ padding: '0.2rem 0.5rem' }}>✕</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input-field"
                >
                  <option value="New Mobiles">New Mobiles</option>
                  <option value="Used Mobiles">Used Mobiles</option>
                  <option value="Mobile Accessories">Mobile Accessories</option>
                  <option value="Home Appliances">Home Appliances</option>
                  <option value="Spare Parts">Spare Parts</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Brand *</label>
                <select
                  value={standardBrands.includes(formData.brand) ? formData.brand : 'Other'}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'Other') {
                      setIsCustomBrand(true);
                      setFormData({ ...formData, brand: '' });
                    } else {
                      setIsCustomBrand(false);
                      setFormData({ ...formData, brand: val });
                    }
                  }}
                  className="input-field"
                  style={{ marginBottom: (isCustomBrand || !standardBrands.includes(formData.brand)) ? '0.35rem' : '0' }}
                >
                  {standardBrands.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                  <option value="Other">Other (Add Custom Brand)</option>
                </select>

                {(isCustomBrand || !standardBrands.includes(formData.brand)) && (
                  <input
                    type="text"
                    placeholder="Enter custom brand name..."
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    required
                    className="input-field animate-fade-in"
                    style={{ borderColor: 'var(--accent-primary)', fontSize: '0.85rem' }}
                    autoFocus
                  />
                )}
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Product Title / Model Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Universal Waterproof Mobile Pouch (All Models)"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="input-field"
                />
              </div>

              {/* Product Description & Search Keywords */}
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                  Product Description & Search Keywords (Allows easy search by model compatibility or feature):
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Universal mobile pouch waterproof bag case fits any model phone iPhone 13 14 15 Samsung S23 Vivo Oppo Realme swimming rain cover..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field"
                  style={{ fontSize: '0.82rem' }}
                />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Tip: If customer searches for "mobile pouch" or "samsung pouch", this item will instantly appear!
                </span>
              </div>

              {/* GST vs Non-GST Selector */}
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Tax Class *</label>
                <select
                  value={formData.isGst ? 'gst' : 'non-gst'}
                  onChange={(e) => setFormData({ ...formData, isGst: e.target.value === 'gst' })}
                  className="input-field"
                >
                  <option value="gst">GST Applicable Product</option>
                  <option value="non-gst">Non-GST / Tax Exempt (0%)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>GST Tax Rate (%)</label>
                <select
                  value={formData.isGst ? formData.gstRate : 0}
                  disabled={!formData.isGst}
                  onChange={(e) => setFormData({ ...formData, gstRate: parseFloat(e.target.value) })}
                  className="input-field"
                  style={{ opacity: formData.isGst ? 1 : 0.5 }}
                >
                  <option value={18}>18% (Standard Electronics)</option>
                  <option value={12}>12%</option>
                  <option value={28}>28%</option>
                  <option value={5}>5%</option>
                  <option value={0}>0% (Nil / Exempt)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Buying Price (Cost) ₹ *</label>
                <input
                  type="number"
                  placeholder="Cost Price"
                  value={formData.buyPrice}
                  onChange={(e) => setFormData({ ...formData, buyPrice: e.target.value })}
                  required
                  className="input-field"
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Selling Price ₹ *</label>
                <input
                  type="number"
                  placeholder="Selling Price"
                  value={formData.sellPrice}
                  onChange={(e) => setFormData({ ...formData, sellPrice: e.target.value })}
                  required
                  className="input-field"
                  style={{ fontWeight: 700, color: 'var(--accent-primary)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>MRP ₹</label>
                <input
                  type="number"
                  placeholder="Box MRP"
                  value={formData.mrp}
                  onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Stock Quantity (Pcs)</label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Low Stock Alert Threshold</label>
                <input
                  type="number"
                  value={formData.lowStockThreshold}
                  onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Barcode / EAN</label>
                <input
                  type="text"
                  placeholder="Scan or Generate"
                  value={formData.barcode}
                  onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                  className="input-field"
                  style={{ fontFamily: 'var(--font-mono)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>HSN Code</label>
                <input
                  type="text"
                  placeholder="e.g. 392690 or 851712"
                  value={formData.hsn}
                  onChange={(e) => setFormData({ ...formData, hsn: e.target.value })}
                  className="input-field"
                  style={{ fontFamily: 'var(--font-mono)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Warranty Details</label>
                <input
                  type="text"
                  placeholder="e.g. 1 Year Brand Warranty"
                  value={formData.warranty}
                  onChange={(e) => setFormData({ ...formData, warranty: e.target.value })}
                  className="input-field"
                />
              </div>

              {/* IMEI input textarea for Mobiles & Serialized items */}
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                  IMEI / Serial Numbers (One per line for mobiles/appliances):
                </label>
                <textarea
                  rows={2}
                  placeholder="Paste or Scan IMEIs (one per line):&#10;358249110294821&#10;358249110294822"
                  value={formData.imeisText}
                  onChange={(e) => setFormData({ ...formData, imeisText: e.target.value })}
                  className="input-field"
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button type="button" onClick={() => setShowModal(false)} className="btn-outline">Cancel</button>
              <button type="submit" className="btn-primary" style={{ padding: '0.65rem 1.4rem' }}>
                Save Item
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
