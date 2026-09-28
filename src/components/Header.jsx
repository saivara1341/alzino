import React, { useState, useEffect } from 'react';
import { 
  Menu,
  X,
  ShoppingCart, 
  Smartphone, 
  Wrench, 
  Package, 
  Barcode, 
  Users, 
  Receipt, 
  TrendingUp, 
  Settings, 
  Search, 
  SlidersHorizontal,
  Sun, 
  Moon,
  FileText,
  ChevronRight
} from 'lucide-react';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  theme, 
  toggleTheme, 
  openSearch, 
  openPullout,
  lowStockCount,
  pendingRepairsCount,
  invoicesCount,
  shopConfig
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  // Close menu on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && menuOpen) {
        setMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [menuOpen]);

  const navItems = [
    { id: 'pos', label: 'POS Billing', icon: ShoppingCart, hotkey: 'F2' },
    { id: 'inventory', label: 'Stock & IMEIs', icon: Package, count: lowStockCount || 5, alert: lowStockCount > 0 },
    { id: 'used-phones', label: 'Used KYC', icon: Smartphone, badge: 'Aadhaar' },
    { id: 'repairs', label: 'Repairs', icon: Wrench, count: pendingRepairsCount !== undefined && pendingRepairsCount !== null ? pendingRepairsCount : 2 },
    { id: 'invoices', label: 'Invoices', icon: FileText, count: invoicesCount !== undefined && invoicesCount !== null ? invoicesCount : 4 },
    { id: 'barcodes', label: 'Barcodes', icon: Barcode },
    { id: 'khata', label: 'Khata', icon: Users },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'reports', label: 'Analytics', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleSelectTab = (id) => {
    setActiveTab(id);
    setMenuOpen(false);
  };

  return (
    <>
      <header className="no-print" style={{
        background: 'var(--surface-primary)',
        borderBottom: '1px solid var(--border-color)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backdropFilter: 'blur(16px)',
      }}>
        <div style={{
          padding: '0.45rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}>
          {/* Left: 3 Lines Menu Button + Brand + Active Screen Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* 3 Lines Hamburger Menu Button (Mobile Only - Hidden on Desktop) */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="btn-secondary mobile-only-menu-btn"
              style={{
                padding: '0.4rem 0.55rem',
                alignItems: 'center',
                gap: '0.4rem',
                border: '1px solid var(--border-color)',
                background: menuOpen ? 'var(--illoca-blue-subtle)' : 'var(--surface-card)',
                color: menuOpen ? 'var(--accent-primary)' : 'var(--text-primary)',
              }}
              title="Open Main Menu"
            >
              <Menu size={18} />
              <span style={{ fontSize: '0.78rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
                Menu
              </span>
            </button>

            {/* Minimal Brand Mark */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: '26px',
                height: '26px',
                background: 'var(--accent-primary)',
                color: '#FFFFFF',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontFamily: 'var(--font-heading)',
                fontSize: '0.92rem',
                letterSpacing: '-0.04em'
              }}>
                A
              </div>
              <span style={{ 
                fontFamily: 'var(--font-heading)', 
                fontWeight: 800, 
                fontSize: '1.15rem', 
                letterSpacing: '-0.03em',
                color: 'var(--text-primary)'
              }}>
                {shopConfig.name}
              </span>
            </div>

            {/* End of Left Brand Mark */}
          </div>

          {/* Right Actions: Minimalist & Clean */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            {/* Quick Search */}
            <button 
              onClick={openSearch}
              className="btn-secondary"
              title="Global Search (Press ⌘K or F8)"
              style={{ 
                padding: '0.35rem 0.65rem', 
                fontSize: '0.78rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <Search size={13} color="var(--accent-primary)" />
              <span style={{ color: 'var(--text-secondary)' }}>Search</span>
              <kbd style={{ 
                background: 'var(--surface-card)', 
                padding: '0.05rem 0.3rem', 
                borderRadius: '3px', 
                fontSize: '0.68rem',
                fontFamily: 'var(--font-mono)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-muted)'
              }}>⌘K</kbd>
            </button>

            {/* Quick Tools & Bench Drawer in Header */}
            <button 
              onClick={openPullout}
              className="btn-secondary"
              style={{ padding: '0.35rem 0.55rem' }}
              title="Quick Tools & Bench Drawer"
            >
              <SlidersHorizontal size={14} color="var(--accent-primary)" />
            </button>

            {/* Theme Switcher */}
            <button 
              onClick={toggleTheme}
              className="btn-secondary"
              style={{ padding: '0.35rem 0.55rem' }}
              title={theme === 'cream' ? 'Switch to Dark Mode' : 'Switch to Warm Mode'}
            >
              {theme === 'cream' ? <Moon size={14} /> : <Sun size={14} color="#F59E0B" />}
            </button>

            {/* Settings Icon Only in Header */}
            <button 
              onClick={() => setActiveTab('settings')}
              className="btn-secondary"
              style={{ 
                padding: '0.35rem 0.55rem',
                border: activeTab === 'settings' ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                background: activeTab === 'settings' ? 'var(--illoca-blue-subtle)' : 'var(--surface-card)',
                color: activeTab === 'settings' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                cursor: 'pointer'
              }}
              title="Shop Settings & Backup"
            >
              <Settings size={14} color={activeTab === 'settings' ? 'var(--accent-primary)' : 'var(--text-secondary)'} />
            </button>
          </div>
        </div>

        {/* Desktop View Navigation Buttons Bar Below Header */}
        <div className="desktop-nav-bar" style={{
          borderTop: '1px solid #1E2330',
          borderBottom: '1px solid #1E2330',
          background: '#000000',
          padding: '0.45rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.55rem',
          overflowX: 'auto',
        }}>
          {navItems.filter(item => item.id !== 'settings').map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`desktop-nav-btn ${isActive ? 'active' : ''}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.38rem 0.8rem',
                  fontSize: '0.8rem',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: isActive ? 700 : 500,
                  whiteSpace: 'nowrap',
                  borderRadius: 'var(--radius-sm)',
                  border: isActive ? '1px solid var(--accent-primary)' : '1px solid #232A3B',
                  background: isActive ? 'var(--accent-primary)' : '#111622',
                  color: isActive ? '#FFFFFF' : '#F1F5F9',
                  cursor: 'pointer',
                  boxShadow: isActive ? '0 2px 10px rgba(59, 96, 197, 0.45)' : 'none',
                  transition: 'var(--transition-smooth)'
                }}
              >
                <Icon size={14} color={isActive ? '#FFFFFF' : '#94A3B8'} />
                <span>{item.label}</span>
                {item.count && (
                  <span style={{
                    fontSize: '0.65rem',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    padding: '0.05rem 0.4rem',
                    borderRadius: '999px',
                    background: isActive ? 'rgba(255,255,255,0.25)' : 'var(--accent-primary)',
                    color: '#FFFFFF'
                  }}>
                    {item.count}
                  </span>
                )}
                {item.id === 'used-phones' && (
                  <span style={{
                    fontSize: '0.62rem',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 600,
                    padding: '0.05rem 0.35rem',
                    borderRadius: '3px',
                    background: isActive ? 'rgba(255,255,255,0.2)' : 'rgba(59, 130, 246, 0.22)',
                    color: isActive ? '#FFFFFF' : '#93C5FD',
                    border: '1px solid rgba(59, 130, 246, 0.35)'
                  }}>
                    Aadhaar
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Menu Slide-Over Drawer (3 Lines Menu) */}
      {menuOpen && (
        <div 
          className="drawer-overlay no-print" 
          onClick={() => setMenuOpen(false)}
          style={{ zIndex: 1100 }}
        >
          <div 
            className="animate-fade-in"
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '310px',
              maxWidth: '85vw',
              height: '100vh',
              background: 'var(--surface-primary)',
              borderRight: '1px solid var(--border-color)',
              boxShadow: '10px 0 40px rgba(0,0,0,0.25)',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 1200,
            }}
          >
            {/* Menu Header */}
            <div style={{
              padding: '1rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid var(--border-color)',
              background: 'var(--surface-card)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{
                  width: '30px',
                  height: '30px',
                  background: 'var(--accent-primary)',
                  color: '#FFFFFF',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.05rem',
                }}>
                  A
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontFamily: 'var(--font-heading)', fontSize: '1.05rem', lineHeight: 1.1 }}>
                    {shopConfig.name}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    Retail ERP · Admin Portal · Bodhan
                  </div>
                </div>
              </div>

              <button
                onClick={() => setMenuOpen(false)}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  border: '1px solid var(--border-color)',
                  background: 'var(--surface-primary)'
                }}
                title="Close Menu (Esc)"
              >
                <X size={15} />
              </button>
            </div>

            {/* Menu Items List */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '0.85rem 0.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.3rem',
            }}>
              <div style={{
                fontSize: '0.68rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-muted)',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                padding: '0.35rem 0.6rem',
                fontWeight: 700,
              }}>
                Main Modules
              </div>

              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      background: isActive ? 'var(--accent-primary)' : 'transparent',
                      color: isActive ? '#FFFFFF' : 'var(--text-primary)',
                      border: `1px solid ${isActive ? 'var(--accent-primary)' : 'transparent'}`,
                      transition: 'var(--transition-smooth)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      width: '100%',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                      <Icon size={17} color={isActive ? '#FFFFFF' : 'var(--accent-primary)'} />
                      <span style={{ 
                        fontFamily: 'var(--font-heading)', 
                        fontWeight: isActive ? 700 : 500, 
                        fontSize: '0.88rem' 
                      }}>
                        {item.label}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      {item.count && (
                        <span style={{
                          fontSize: '0.68rem',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                          padding: '0.12rem 0.45rem',
                          borderRadius: '999px',
                          background: isActive 
                            ? 'rgba(255,255,255,0.3)' 
                            : item.alert 
                              ? 'var(--status-amber)' 
                              : 'var(--accent-primary)',
                          color: item.alert && !isActive ? '#000' : '#FFF',
                        }}>
                          {item.count}
                        </span>
                      )}

                      {item.badge && (
                        <span style={{
                          fontSize: '0.62rem',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 600,
                          padding: '0.1rem 0.35rem',
                          borderRadius: '3px',
                          background: isActive ? 'rgba(255,255,255,0.2)' : 'var(--badge-bg)',
                          color: isActive ? '#FFF' : 'var(--badge-text)',
                        }}>
                          {item.badge}
                        </span>
                      )}

                      <ChevronRight size={13} opacity={isActive ? 0.9 : 0.3} />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Menu Footer */}
            <div style={{
              padding: '0.85rem 1rem',
              borderTop: '1px solid var(--border-color)',
              background: 'var(--surface-card)',
              fontSize: '0.72rem',
              color: 'var(--text-secondary)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                <span style={{ fontWeight: 600 }}>ALZINO Retail ERP</span>
                <span className="mono-tag" style={{ fontSize: '0.65rem' }}>OFFLINE</span>
              </div>
              <div style={{ color: 'var(--text-muted)' }}>
                GSTIN: {shopConfig.gstin}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
