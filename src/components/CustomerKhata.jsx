import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  IndianRupee, 
  Share2, 
  CreditCard, 
  FileText, 
  AlertCircle,
  CheckCircle2,
  Phone
} from 'lucide-react';

export default function CustomerKhata({ 
  customers, 
  setCustomers, 
  invoices, 
  shopConfig 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNote, setPaymentNote] = useState('');

  // New customer form
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newGstin, setNewGstin] = useState('');

  // Totals
  const totalReceivables = customers.reduce((sum, c) => sum + (c.balanceDue || 0), 0);
  const customersWithDue = customers.filter(c => c.balanceDue > 0);

  const filteredCustomers = customers.filter(c => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      (c.address && c.address.toLowerCase().includes(q))
    );
  });

  const handleAddCustomer = (e) => {
    e.preventDefault();
    if (!newName || !newPhone) {
      alert("Please provide customer name and phone number.");
      return;
    }

    const newCust = {
      id: `CUST-${String(customers.length + 1).padStart(3, '0')}`,
      name: newName.trim(),
      phone: newPhone.trim(),
      address: newAddress.trim() || 'Bodhan',
      gstin: newGstin.trim(),
      totalSpent: 0,
      balanceDue: 0,
    };

    setCustomers(prev => [newCust, ...prev]);
    setShowAddModal(false);
    setNewName('');
    setNewPhone('');
    setNewAddress('');
    setNewGstin('');
  };

  const handleReceiveKhataPayment = (e) => {
    e.preventDefault();
    const amt = parseFloat(paymentAmount);
    if (!amt || amt <= 0) {
      alert("Please enter a valid payment amount.");
      return;
    }

    setCustomers(prev => prev.map(c => {
      if (c.id === selectedCustomer.id) {
        return {
          ...c,
          balanceDue: Math.max(0, c.balanceDue - amt)
        };
      }
      return c;
    }));

    alert(`Received ₹${amt} from ${selectedCustomer.name}. Balance updated.`);
    setSelectedCustomer(null);
    setPaymentAmount('');
    setPaymentNote('');
  };

  return (
    <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
      
      {/* Sleek Minimalist Title Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Customer Khata Ledger</h2>
          <span style={{ fontSize: '0.78rem', color: totalReceivables > 0 ? 'var(--status-red)' : 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
            {totalReceivables > 0 ? `Pending Due: ₹${totalReceivables.toLocaleString()} (${customersWithDue.length} accounts)` : 'All accounts settled'}
          </span>
        </div>

        <button 
          onClick={() => setShowAddModal(true)}
          className="btn-primary"
          style={{ padding: '0.45rem 0.9rem', fontSize: '0.82rem' }}
        >
          <Plus size={15} />
          <span>New Customer</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="illoca-card" style={{ padding: '0.85rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span className="mono-tag">{customers.length} Total Customers</span>
          <span className="mono-tag" style={{ background: 'var(--status-amber-bg)', color: 'var(--status-amber)' }}>
            {customersWithDue.length} with Pending Due
          </span>
        </div>

        <div style={{ width: '320px' }}>
          <input
            type="text"
            placeholder="Search by Customer Name or Phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field"
            style={{ fontSize: '0.85rem' }}
          />
        </div>
      </div>

      {/* Customer Ledger Table */}
      <div className="illoca-card" style={{ padding: '1rem', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '0.65rem 0.5rem' }}>Customer Details</th>
              <th style={{ padding: '0.65rem 0.5rem' }}>Phone & WhatsApp</th>
              <th style={{ padding: '0.65rem 0.5rem' }}>Town / Location</th>
              <th style={{ padding: '0.65rem 0.5rem' }}>GSTIN</th>
              <th style={{ padding: '0.65rem 0.5rem' }}>Lifetime Purchases</th>
              <th style={{ padding: '0.65rem 0.5rem' }}>Pending Udhaari</th>
              <th style={{ padding: '0.65rem 0.5rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map(cust => {
              const hasDue = cust.balanceDue > 0;
              return (
                <tr key={cust.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.75rem 0.5rem' }}>
                    <div style={{ fontWeight: 600 }}>{cust.name}</div>
                    <span className="mono-tag" style={{ fontSize: '0.7rem' }}>{cust.id}</span>
                  </td>

                  <td style={{ padding: '0.75rem 0.5rem', fontFamily: 'var(--font-mono)' }}>
                    {cust.phone}
                  </td>

                  <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-secondary)' }}>
                    {cust.address || 'Bodhan'}
                  </td>

                  <td style={{ padding: '0.75rem 0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
                    {cust.gstin || '—'}
                  </td>

                  <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>
                    ₹{cust.totalSpent.toLocaleString()}
                  </td>

                  <td style={{ padding: '0.75rem 0.5rem' }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      color: hasDue ? 'var(--status-red)' : 'var(--status-green)'
                    }}>
                      ₹{cust.balanceDue.toLocaleString()}
                    </span>
                    {hasDue && (
                      <div style={{ fontSize: '0.7rem', color: 'var(--status-red)', fontWeight: 600 }}>
                        DUE PENDING
                      </div>
                    )}
                  </td>

                  <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                      {hasDue && (
                        <>
                          <button
                            onClick={() => setSelectedCustomer(cust)}
                            className="btn-primary"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
                          >
                            <IndianRupee size={13} />
                            <span>Collect</span>
                          </button>

                          <a
                            href={`https://wa.me/91${cust.phone}?text=${encodeURIComponent(
                              `Namaste ${cust.name} ji, ALZINO Bodhan se gentle reminder hai ki aapke account mein Rs.${cust.balanceDue} ka balance pending hai. Aap shop par ya GooglePay/PhonePe UPI (${shopConfig.upiId}) par pay kar sakte hain. Dhanyawaad!`
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-outline"
                            style={{ padding: '0.35rem 0.6rem', color: '#10B981', display: 'flex', alignItems: 'center' }}
                            title="Send WhatsApp Reminder"
                          >
                            <Share2 size={14} />
                          </a>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Collect Payment Modal */}
      {selectedCustomer && (
        <div className="drawer-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <form onSubmit={handleReceiveKhataPayment} className="illoca-card animate-fade-in" style={{ maxWidth: '440px', width: '100%', padding: '1.5rem', background: 'var(--surface-primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.2rem' }}>Receive Khata Payment</h3>
              <button type="button" onClick={() => setSelectedCustomer(null)} className="btn-outline" style={{ padding: '0.2rem 0.5rem' }}>✕</button>
            </div>

            <div style={{ marginBottom: '1rem', background: 'var(--surface-card)', padding: '0.85rem', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Customer:</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700 }}>{selectedCustomer.name} ({selectedCustomer.phone})</div>
              <div style={{ marginTop: '0.4rem', fontSize: '0.85rem', color: 'var(--status-red)', fontWeight: 700 }}>
                Total Due: ₹{selectedCustomer.balanceDue.toLocaleString()}
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                Payment Amount Received (₹) *
              </label>
              <input
                type="number"
                placeholder={`Max ₹${selectedCustomer.balanceDue}`}
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                required
                className="input-field"
                style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-primary)' }}
                autoFocus
              />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                Payment Note / Mode:
              </label>
              <input
                type="text"
                placeholder="e.g. Received via PhonePe / Cash"
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
                className="input-field"
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button type="button" onClick={() => setSelectedCustomer(null)} className="btn-outline">Cancel</button>
              <button type="submit" className="btn-primary" style={{ padding: '0.65rem 1.4rem' }}>
                Save Payment & Update Ledger
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="drawer-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <form onSubmit={handleAddCustomer} className="illoca-card animate-fade-in" style={{ maxWidth: '480px', width: '100%', padding: '1.5rem', background: 'var(--surface-primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.2rem' }}>Add New Customer</h3>
              <button type="button" onClick={() => setShowAddModal(false)} className="btn-outline" style={{ padding: '0.2rem 0.5rem' }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Customer Name *</label>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                  className="input-field"
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Mobile Number *</label>
                <input
                  type="text"
                  placeholder="10-digit Phone"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  required
                  className="input-field"
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Address / Area</label>
                <input
                  type="text"
                  placeholder="Street / Colony, Bodhan"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>GSTIN (Optional)</label>
                <input
                  type="text"
                  placeholder="GST Number"
                  value={newGstin}
                  onChange={(e) => setNewGstin(e.target.value.toUpperCase())}
                  className="input-field"
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button type="button" onClick={() => setShowAddModal(false)} className="btn-outline">Cancel</button>
              <button type="submit" className="btn-primary" style={{ padding: '0.65rem 1.4rem' }}>
                Save Customer
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
