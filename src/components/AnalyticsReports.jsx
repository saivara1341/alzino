import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  IndianRupee, 
  Download, 
  Printer, 
  Calendar, 
  DollarSign, 
  PieChart, 
  ShoppingBag, 
  FileSpreadsheet,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Smartphone,
  Wrench,
  Package,
  Layers,
  Search,
  Percent,
  Tag,
  Clock,
  ShieldCheck
} from 'lucide-react';

export default function AnalyticsReports({ 
  invoices = [], 
  expenses = [], 
  inventory = [], 
  customers = [], 
  usedPurchases = [],
  repairJobs = [],
  onPrintInvoice = () => {}, 
  role = 'admin' 
}) {
  const [dateFilter, setDateFilter] = useState('all'); // 'today' | 'month' | 'all'
  const [selectedCategoryTab, setSelectedCategoryTab] = useState('All');
  const [productSearchTerm, setProductSearchTerm] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthStr = todayStr.substring(0, 7);

  // 1. Filtered Invoices by Date
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      if (dateFilter === 'today') return inv.date === todayStr;
      if (dateFilter === 'month') return inv.date && inv.date.startsWith(currentMonthStr);
      return true;
    });
  }, [invoices, dateFilter, todayStr, currentMonthStr]);

  // 2. Filtered Expenses by Date
  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => {
      if (dateFilter === 'today') return exp.date === todayStr;
      if (dateFilter === 'month') return exp.date && exp.date.startsWith(currentMonthStr);
      return true;
    });
  }, [expenses, dateFilter, todayStr, currentMonthStr]);

  // 3. Filtered Inward Purchases (Outflow for buying used phones)
  const filteredUsedPurchases = useMemo(() => {
    return usedPurchases.filter(p => {
      if (dateFilter === 'today') return p.date === todayStr;
      if (dateFilter === 'month') return p.date && p.date.startsWith(currentMonthStr);
      return true;
    });
  }, [usedPurchases, dateFilter, todayStr, currentMonthStr]);

  // =========================================================================
  // CASH INFLOW TRACKING
  // =========================================================================
  // Inflow from POS product sales
  const posInflow = filteredInvoices
    .filter(i => !i.isRefurbishedResale && !i.isRepairInvoice)
    .reduce((s, i) => s + (Number(i.paidAmount) || 0), 0);

  // Inflow from Refurbished Mobiles sales
  const refurbInflow = filteredInvoices
    .filter(i => i.isRefurbishedResale || (i.items && i.items.some(it => it.category === 'Used Mobiles')))
    .reduce((s, i) => s + (Number(i.paidAmount) || 0), 0);

  // Inflow from Mobile Repairs & Servicing
  const repairInflow = filteredInvoices
    .filter(i => i.isRepairInvoice || i.repairJobRef || (i.items && i.items.some(it => it.category === 'Repair Services')))
    .reduce((s, i) => s + (Number(i.paidAmount) || 0), 0);

  // Repair intake advance payments collected
  const repairAdvancesCollected = repairJobs
    .filter(j => {
      if (dateFilter === 'today') return j.date === todayStr;
      if (dateFilter === 'month') return j.date && j.date.startsWith(currentMonthStr);
      return true;
    })
    .reduce((s, j) => s + (Number(j.advancePaid) || 0), 0);

  const totalCashInflow = posInflow + refurbInflow + repairInflow;

  // Breakdown by payment instrument
  const cashInflow = filteredInvoices.filter(i => i.paymentMode === 'Cash').reduce((s, i) => s + (Number(i.paidAmount) || 0), 0);
  const upiInflow = filteredInvoices.filter(i => i.paymentMode?.includes('UPI')).reduce((s, i) => s + (Number(i.paidAmount) || 0), 0);
  const cardInflow = filteredInvoices.filter(i => i.paymentMode === 'Card' || i.paymentMode?.includes('Card')).reduce((s, i) => s + (Number(i.paidAmount) || 0), 0);
  const totalKhataGiven = filteredInvoices.reduce((s, i) => s + (Number(i.khataDue) || 0), 0);

  // =========================================================================
  // CASH OUTFLOW TRACKING
  // =========================================================================
  // Admin recorded operational expenses (Rent, Electricity, Salaries, Tea, Logistics)
  const totalExpensesAmt = filteredExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  // Cash paid out to customers for buying second-hand devices
  const usedPhoneBuyPayouts = filteredUsedPurchases.reduce((sum, p) => sum + (Number(p.buyPrice) || 0), 0);

  const totalCashOutflow = totalExpensesAmt + usedPhoneBuyPayouts;

  // Net Cash Register Balance (Inflow - Outflow)
  const netCashFlow = totalCashInflow - totalCashOutflow;

  // =========================================================================
  // FINANCIAL P&L AND PROFIT TRACKING (MRP vs SELLING vs BUY COST)
  // =========================================================================
  const totalRevenue = filteredInvoices.reduce((sum, i) => sum + (Number(i.grandTotal) || 0), 0);
  const totalGrossProfit = filteredInvoices.reduce((sum, i) => sum + (Number(i.totalProfit) || 0), 0);
  const netProfit = totalGrossProfit - totalExpensesAmt;

  // =========================================================================
  // INDIVIDUAL PRODUCT PROFIT ANALYSIS & CATEGORY AGGREGATION
  // =========================================================================
  const productAnalytics = useMemo(() => {
    const map = {};

    filteredInvoices.forEach(inv => {
      (inv.items || []).forEach(item => {
        const key = item.name?.trim() || 'Unknown Product';
        const qty = Number(item.qty) || 1;
        const sellTotal = Number(item.total) || (Number(item.rate) * qty) || 0;
        const unitSell = qty > 0 ? sellTotal / qty : Number(item.rate) || 0;
        
        // Find matching inventory item for MRP and Buy Price reference if not stored on item
        const invMatch = inventory.find(invIt => invIt.id === item.id || invIt.name?.toLowerCase() === item.name?.toLowerCase());
        const unitBuy = item.buyPrice !== undefined ? Number(item.buyPrice) : (invMatch?.buyPrice || Math.round(unitSell * 0.7));
        const unitMrp = invMatch?.mrp || item.mrp || Math.round(unitSell * 1.12);
        const category = item.category || invMatch?.category || (inv.isRepairInvoice ? 'Repair Services' : 'Mobile Accessories');
        const profit = item.profit !== undefined ? Number(item.profit) : (sellTotal - (unitBuy * qty));

        if (!map[key]) {
          map[key] = {
            name: key,
            category,
            brand: invMatch?.brand || 'ALZINO',
            unitsSold: 0,
            unitMrp,
            totalMrp: 0,
            unitBuy,
            totalBuyCost: 0,
            totalRevenue: 0,
            totalProfit: 0,
            avgSellPrice: 0,
          };
        }

        map[key].unitsSold += qty;
        map[key].totalMrp += (unitMrp * qty);
        map[key].totalBuyCost += (unitBuy * qty);
        map[key].totalRevenue += sellTotal;
        map[key].totalProfit += profit;
      });
    });

    return Object.values(map).map(p => {
      p.avgSellPrice = p.unitsSold > 0 ? Math.round(p.totalRevenue / p.unitsSold) : 0;
      p.marginPct = p.totalRevenue > 0 ? Math.round((p.totalProfit / p.totalRevenue) * 100) : 0;
      p.discountFromMrp = p.totalMrp > p.totalRevenue ? Math.round(((p.totalMrp - p.totalRevenue) / p.totalMrp) * 100) : 0;
      return p;
    });
  }, [filteredInvoices, inventory]);

  // Aggregate Category Level Stats
  const categoryStats = useMemo(() => {
    const cats = ['New Mobiles', 'Used Mobiles', 'Mobile Accessories', 'Home Appliances', 'Repair Services'];
    return cats.map(catName => {
      const itemsInCat = productAnalytics.filter(p => p.category === catName);
      const catRevenue = itemsInCat.reduce((s, p) => s + p.totalRevenue, 0);
      const catCost = itemsInCat.reduce((s, p) => s + p.totalBuyCost, 0);
      const catProfit = itemsInCat.reduce((s, p) => s + p.totalProfit, 0);
      const catUnits = itemsInCat.reduce((s, p) => s + p.unitsSold, 0);
      const margin = catRevenue > 0 ? Math.round((catProfit / catRevenue) * 100) : 0;

      return {
        category: catName,
        unitsSold: catUnits,
        revenue: catRevenue,
        cost: catCost,
        profit: catProfit,
        marginPct: margin,
        productCount: itemsInCat.length
      };
    });
  }, [productAnalytics]);

  // Total Catalog MRP of Sold items vs Realized Selling Price
  const totalMrpValue = productAnalytics.reduce((s, p) => s + p.totalMrp, 0);
  const totalCustomerSavings = Math.max(0, totalMrpValue - totalRevenue);
  const avgDiscountGivenPct = totalMrpValue > 0 ? Math.round((totalCustomerSavings / totalMrpValue) * 100) : 0;

  // Filter individual product table by selected category & search
  const filteredProductsTable = useMemo(() => {
    return productAnalytics.filter(p => {
      const matchesCat = selectedCategoryTab === 'All' || p.category === selectedCategoryTab;
      const q = productSearchTerm.toLowerCase().trim();
      if (!q) return matchesCat;
      return matchesCat && (
        p.name.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    });
  }, [productAnalytics, selectedCategoryTab, productSearchTerm]);

  // Export Complete Financial & Product Analytics to CSV
  const handleExportAnalyticsCSV = () => {
    let csv = "data:text/csv;charset=utf-8,";
    csv += "Product Name,Category,Brand,Units Sold,Unit MRP,Avg Selling Price,Buy Cost,Unit Profit,Total Profit,Margin %,MRP Discount %\n";

    productAnalytics.forEach(p => {
      const unitProfit = p.avgSellPrice - p.unitBuy;
      const row = [
        `"${p.name.replace(/"/g, '""')}"`,
        `"${p.category}"`,
        `"${p.brand}"`,
        p.unitsSold,
        p.unitMrp,
        p.avgSellPrice,
        p.unitBuy,
        unitProfit,
        p.totalProfit,
        `${p.marginPct}%`,
        `${p.discountFromMrp}%`
      ];
      csv += row.join(",") + "\n";
    });

    const encoded = encodeURI(csv);
    const link = document.createElement("a");
    link.setAttribute("href", encoded);
    link.setAttribute("download", `ALZINO_Product_Profit_Report_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
      
      {/* Top Header & Period Selector */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Financial Intelligence & Profit Analytics</h2>
          <span style={{ fontSize: '0.78rem', color: 'var(--status-green)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
            Net Store Profit: ₹{netProfit.toLocaleString()}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          {/* Period selector */}
          <div className="segmented-bar">
            {[
              { id: 'today', label: "Today" },
              { id: 'month', label: "This Month" },
              { id: 'all', label: "All Time" },
            ].map(p => (
              <button
                key={p.id}
                onClick={() => setDateFilter(p.id)}
                className={`segmented-item ${dateFilter === p.id ? 'active-blue' : ''}`}
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}
              >
                {p.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportAnalyticsCSV}
            className="btn-secondary"
            style={{ padding: '0.38rem 0.75rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            title="Download product-wise profit analysis in CSV"
          >
            <FileSpreadsheet size={14} color="#10B981" />
            <span>Export Product P&L</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. CASH INFLOW & CASH OUTFLOW DUAL REGISTER                                */}
      {/* ========================================================================= */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1rem'
      }}>
        {/* CASH INFLOW CARD */}
        <div className="illoca-card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--status-green)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <ArrowDownRight size={18} color="var(--status-green)" />
              <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: 'var(--status-green)' }}>
                Total Cash Inflow (Money Received)
              </h3>
            </div>
            <span style={{ fontSize: '1.45rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--status-green)' }}>
              ₹{totalCashInflow.toLocaleString()}
            </span>
          </div>

          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
            Realized cash, UPI, and card payments from product sales, refurbished phones, and repair counter services.
          </div>

          {/* Inflow Streams Breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.65rem', fontSize: '0.8rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)' }}>• POS Products & Accessories Bills:</span>
              <strong style={{ fontFamily: 'var(--font-mono)' }}>₹{posInflow.toLocaleString()}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)' }}>• Refurbished / Used Mobiles Resold:</span>
              <strong style={{ fontFamily: 'var(--font-mono)' }}>₹{refurbInflow.toLocaleString()}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)' }}>• Mobile Repairs & Bench Services:</span>
              <strong style={{ fontFamily: 'var(--font-mono)' }}>₹{repairInflow.toLocaleString()}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed var(--border-color)', paddingTop: '0.35rem', marginTop: '0.2rem' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.74rem' }}>Mode: Cash ₹{cashInflow.toLocaleString()} | UPI ₹{upiInflow.toLocaleString()} | Card ₹{cardInflow.toLocaleString()}</span>
              {totalKhataGiven > 0 && <span style={{ color: 'var(--status-red)', fontSize: '0.74rem', fontWeight: 600 }}>Due: ₹{totalKhataGiven.toLocaleString()}</span>}
            </div>
          </div>
        </div>

        {/* CASH OUTFLOW CARD */}
        <div className="illoca-card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--status-red)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <ArrowUpRight size={18} color="var(--status-red)" />
              <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: 'var(--status-red)' }}>
                Total Cash Outflow (Money Paid Out)
              </h3>
            </div>
            <span style={{ fontSize: '1.45rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--status-red)' }}>
              ₹{totalCashOutflow.toLocaleString()}
            </span>
          </div>

          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
            Operating expenses entered by admin plus buy payouts paid to customers for inward second-hand phones.
          </div>

          {/* Outflow Streams Breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.65rem', fontSize: '0.8rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)' }}>• Admin Shop Expenses (Rent, Bills, Staff):</span>
              <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--status-red)' }}>₹{totalExpensesAmt.toLocaleString()}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)' }}>• Used Phone Buy Payouts to Customers:</span>
              <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--status-red)' }}>₹{usedPhoneBuyPayouts.toLocaleString()}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed var(--border-color)', paddingTop: '0.35rem', marginTop: '0.2rem' }}>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 700 }}>NET CASH BALANCE (Inflow - Outflow):</span>
              <strong style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.95rem',
                color: netCashFlow >= 0 ? 'var(--status-green)' : 'var(--status-red)'
              }}>
                {netCashFlow >= 0 ? `+₹${netCashFlow.toLocaleString()}` : `-₹${Math.abs(netCashFlow).toLocaleString()}`}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MRP vs SELLING PRICE vs BUY COST PRICING INTELLIGENCE                   */}
      {/* ========================================================================= */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '0.75rem'
      }}>
        {/* Total Catalog MRP */}
        <div className="stat-card" style={{ padding: '0.85rem 1rem' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Total Printed MRP Value
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', marginTop: '0.2rem' }}>
            ₹{totalMrpValue.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Catalog box retail value
          </div>
        </div>

        {/* Realized Selling Price */}
        <div className="stat-card" style={{ padding: '0.85rem 1rem' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Realized Selling Revenue
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--accent-primary)', marginTop: '0.2rem' }}>
            ₹{totalRevenue.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--status-green)', fontWeight: 600, marginTop: '0.2rem' }}>
            Avg discount given: {avgDiscountGivenPct}% off MRP
          </div>
        </div>

        {/* Customer MRP Savings */}
        <div className="stat-card" style={{ padding: '0.85rem 1rem' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Customer Savings Below MRP
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#8B5CF6', marginTop: '0.2rem' }}>
            ₹{totalCustomerSavings.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Competitive edge over online
          </div>
        </div>

        {/* Total Realized Gross Profit */}
        <div className="stat-card" style={{ padding: '0.85rem 1rem' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Store Gross Profit (Sales - Cost)
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--status-green)', marginTop: '0.2rem' }}>
            ₹{totalGrossProfit.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--status-green)', fontWeight: 600, marginTop: '0.2rem' }}>
            {totalRevenue > 0 ? `${Math.round((totalGrossProfit / totalRevenue) * 100)}% Gross Margin` : 'On sales'}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. CATEGORY LEVEL PROFIT & VOLUME CARDS                                   */}
      {/* ========================================================================= */}
      <div className="illoca-card" style={{ padding: '1.25rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>
            Category-Wise Profit & Margin Breakdown
          </h3>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
            Financial contribution of each product category to total shop revenue and profit.
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '0.75rem' }}>
          {categoryStats.map(cat => (
            <div
              key={cat.category}
              onClick={() => setSelectedCategoryTab(cat.category === selectedCategoryTab ? 'All' : cat.category)}
              style={{
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-sm)',
                border: selectedCategoryTab === cat.category ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                background: selectedCategoryTab === cat.category ? 'var(--illoca-blue-subtle)' : 'var(--surface-primary)',
                cursor: 'pointer',
                transition: 'var(--transition-smooth)'
              }}
              title={`Click to filter individual products for ${cat.category}`}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--text-primary)' }}>
                  {cat.category}
                </span>
                <span className="mono-tag" style={{ fontSize: '0.66rem' }}>
                  {cat.unitsSold} sold
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '0.5rem' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Revenue:</div>
                <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: '0.88rem' }}>
                  ₹{cat.revenue.toLocaleString()}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '0.2rem' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Profit:</div>
                <div style={{ fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--status-green)', fontSize: '0.92rem' }}>
                  +₹{cat.profit.toLocaleString()}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.35rem', paddingTop: '0.35rem', borderTop: '1px dashed var(--border-color)' }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Margin %:</span>
                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>
                  {cat.marginPct}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. INDIVIDUAL PRODUCT PROFIT ANALYSIS TABLE                                */}
      {/* ========================================================================= */}
      <div className="illoca-card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Tag size={17} color="var(--accent-primary)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>
                Individual Product Profit & Margin Performance
              </h3>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
              Realized profit on each individual product model based on actual selling price, MRP, and buy cost.
            </div>
          </div>

          {/* Category Selector Tabs & Search */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="segmented-bar" style={{ overflowX: 'auto' }}>
              {['All', 'New Mobiles', 'Used Mobiles', 'Mobile Accessories', 'Home Appliances', 'Repair Services'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategoryTab(cat)}
                  className={`segmented-item ${selectedCategoryTab === cat ? 'active-blue' : ''}`}
                  style={{ fontSize: '0.74rem', padding: '0.2rem 0.55rem', whiteSpace: 'nowrap' }}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div style={{ width: '220px', position: 'relative' }}>
              <Search size={13} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search product..."
                value={productSearchTerm}
                onChange={(e) => setProductSearchTerm(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '1.75rem', fontSize: '0.78rem' }}
              />
            </div>
          </div>
        </div>

        {filteredProductsTable.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No sales recorded in this category or date range.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.65rem 0.5rem' }}>Product & Brand</th>
                  <th style={{ padding: '0.65rem 0.5rem' }}>Category</th>
                  <th style={{ padding: '0.65rem 0.5rem', textAlign: 'center' }}>Units Sold</th>
                  <th style={{ padding: '0.65rem 0.5rem', textAlign: 'right' }}>Unit MRP</th>
                  <th style={{ padding: '0.65rem 0.5rem', textAlign: 'right' }}>Avg Selling Price</th>
                  <th style={{ padding: '0.65rem 0.5rem', textAlign: 'right' }}>Buy / Cost Price</th>
                  <th style={{ padding: '0.65rem 0.5rem', textAlign: 'right' }}>Total Profit (₹)</th>
                  <th style={{ padding: '0.65rem 0.5rem', textAlign: 'right' }}>Margin %</th>
                  <th style={{ padding: '0.65rem 0.5rem', textAlign: 'center' }}>MRP Savings</th>
                </tr>
              </thead>
              <tbody>
                {filteredProductsTable.map((prod, idx) => {
                  const unitProfit = prod.avgSellPrice - prod.unitBuy;

                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                          {prod.name}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                          Brand: {prod.brand}
                        </div>
                      </td>

                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        <span className="mono-tag" style={{ fontSize: '0.68rem' }}>
                          {prod.category}
                        </span>
                      </td>

                      <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                        {prod.unitsSold}
                      </td>

                      <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: 'var(--text-muted)', textDecoration: prod.unitMrp > prod.avgSellPrice ? 'line-through' : 'none', fontFamily: 'var(--font-mono)' }}>
                        ₹{prod.unitMrp.toLocaleString()}
                      </td>

                      <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', fontWeight: 700, color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>
                        ₹{prod.avgSellPrice.toLocaleString()}
                      </td>

                      <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                        ₹{prod.unitBuy.toLocaleString()}
                      </td>

                      <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', fontWeight: 800, fontFamily: 'var(--font-mono)', color: prod.totalProfit >= 0 ? 'var(--status-green)' : 'var(--status-red)', fontSize: '0.92rem' }}>
                        {prod.totalProfit >= 0 ? `+₹${prod.totalProfit.toLocaleString()}` : `-₹${Math.abs(prod.totalProfit).toLocaleString()}`}
                      </td>

                      <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                        <span style={{
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          padding: '0.15rem 0.4rem',
                          borderRadius: '3px',
                          background: prod.marginPct >= 30 ? 'var(--status-green-bg)' : 'var(--illoca-blue-subtle)',
                          color: prod.marginPct >= 30 ? 'var(--status-green)' : 'var(--accent-primary)',
                          fontFamily: 'var(--font-mono)'
                        }}>
                          {prod.marginPct}%
                        </span>
                      </td>

                      <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>
                        {prod.discountFromMrp > 0 ? (
                          <span style={{ fontSize: '0.7rem', color: '#8B5CF6', fontWeight: 600 }}>
                            {prod.discountFromMrp}% off
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>At MRP</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
