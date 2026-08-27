'use client';

import { useState, useEffect } from 'react';
import { CARRIER_LIST, detectCarrier, type Carrier } from '@/lib/lhb-config';

interface FulfillModalProps {
  orderId: string;
  customerName: string;
  onClose: () => void;
  onShipped: (data: { trackingNumber: string; carrier: Carrier; trackingUrl: string | null }) => void;
}

export default function FulfillModal({ orderId, customerName, onClose, onShipped }: FulfillModalProps) {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier] = useState<Carrier>('Other');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (trackingNumber.trim()) {
      setCarrier(detectCarrier(trackingNumber));
    }
  }, [trackingNumber]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!trackingNumber.trim()) return;
    setLoading(true);
    setError('');

    try {
      const token = document.cookie.split(';').find(c => c.trim().startsWith('outsyde_access_token='))?.split('=')[1];
      const res = await fetch(`/api/orders/${orderId}/fulfill`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ trackingNumber: trackingNumber.trim(), carrier }),
      });
      const data = await res.json() as { error?: string; order?: { tracking_url?: string | null } };
      if (!res.ok) throw new Error(data.error ?? 'Failed to update order');
      onShipped({ trackingNumber: trackingNumber.trim(), carrier, trackingUrl: data.order?.tracking_url ?? null });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    }
  }

  const inputSt: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    background: '#fff',
    border: '1px solid rgba(30,48,32,0.2)',
    color: '#1E3020',
    fontFamily: 'Jost, sans-serif',
    fontSize: '0.9rem',
    outline: 'none',
    boxSizing: 'border-box',
    borderRadius: 2,
  };

  const labelSt: React.CSSProperties = {
    display: 'block',
    fontSize: '0.6rem',
    letterSpacing: '.12em',
    textTransform: 'uppercase',
    color: 'rgba(30,48,32,0.5)',
    marginBottom: 6,
    fontFamily: 'Jost, sans-serif',
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(30,48,32,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: '#F9F6EF',
        border: '1px solid rgba(30,48,32,0.12)',
        borderRadius: 8,
        padding: '36px 32px',
        width: '100%',
        maxWidth: 460,
        boxShadow: '0 8px 32px rgba(30,48,32,0.15)',
      }}>
        <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.4rem', fontWeight: 500, color: '#1E3020', margin: '0 0 6px' }}>
          Mark as Shipped
        </h2>
        <p style={{ color: 'rgba(30,48,32,0.5)', fontSize: '0.82rem', margin: '0 0 28px', fontFamily: 'Jost, sans-serif' }}>
          {customerName}
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={labelSt}>
              Tracking Number <span style={{ color: '#C0392B' }}>*</span>
            </label>
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="1Z999AA10123456784"
              required
              style={inputSt}
            />
          </div>

          <div style={{ marginBottom: '1.75rem' }}>
            <label style={labelSt}>
              Carrier
              {trackingNumber.trim() && carrier !== 'Other' && (
                <span style={{ color: '#2D7A47', marginLeft: 8, fontStyle: 'italic', textTransform: 'none', letterSpacing: 0, fontSize: '0.75rem' }}>
                  auto-detected
                </span>
              )}
            </label>
            <select
              value={carrier}
              onChange={(e) => setCarrier(e.target.value as Carrier)}
              style={{ ...inputSt, cursor: 'pointer', background: '#fff' }}
            >
              {CARRIER_LIST.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {error && (
            <p style={{ color: '#C0392B', fontSize: '0.82rem', marginBottom: '1rem', fontFamily: 'Jost, sans-serif' }}>{error}</p>
          )}

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              type="submit"
              disabled={loading || !trackingNumber.trim()}
              style={{
                flex: 1, padding: '10px', background: loading ? 'rgba(30,48,32,0.6)' : '#1E3020',
                color: '#F2EBD9', border: 'none', fontFamily: 'Jost, sans-serif',
                fontSize: '0.72rem', letterSpacing: '.14em', textTransform: 'uppercase',
                cursor: loading ? 'not-allowed' : 'pointer', borderRadius: 2,
              }}
            >
              {loading ? 'Saving…' : 'Confirm Shipment'}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 20px', background: 'transparent',
                border: '1px solid rgba(30,48,32,0.2)', color: 'rgba(30,48,32,0.6)',
                fontFamily: 'Jost, sans-serif', fontSize: '0.72rem', letterSpacing: '.14em',
                textTransform: 'uppercase', cursor: 'pointer', borderRadius: 2,
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
