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

  // Auto-detect carrier as user types
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
      const res = await fetch(`/api/orders/${orderId}/fulfill`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingNumber: trackingNumber.trim(), carrier }),
      });
      const data = await res.json() as any;
      if (!res.ok) throw new Error(data.error ?? 'Failed to update order');
      onShipped({ trackingNumber: trackingNumber.trim(), carrier, trackingUrl: data.order?.tracking_url ?? null });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    }
  }

  const inputSt: React.CSSProperties = {
    width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.15)', color: '#f5f0e6',
    fontFamily: 'inherit', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box',
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.75)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', padding: '1rem',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: '#111', border: '1px solid rgba(255,255,255,0.12)',
        padding: '32px', width: '100%', maxWidth: 460,
      }}>
        <h2 style={{ fontFamily: 'Georgia,serif', fontSize: '1.3rem', fontWeight: 400, color: '#f5f0e6', margin: '0 0 6px' }}>
          Mark as Shipped
        </h2>
        <p style={{ color: 'rgba(245,240,230,0.5)', fontSize: '0.8rem', margin: '0 0 24px' }}>
          {customerName}
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.65rem', letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(245,240,230,0.5)', marginBottom: 6 }}>
              Tracking Number <span style={{ color: '#c0392b' }}>*</span>
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

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.65rem', letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(245,240,230,0.5)', marginBottom: 6 }}>
              Carrier
              {trackingNumber.trim() && carrier !== 'Other' && (
                <span style={{ color: '#6aaa64', marginLeft: 8, fontStyle: 'italic', textTransform: 'none', letterSpacing: 0 }}>
                  auto-detected
                </span>
              )}
            </label>
            <select
              value={carrier}
              onChange={(e) => setCarrier(e.target.value as Carrier)}
              style={{ ...inputSt, cursor: 'pointer' }}
            >
              {CARRIER_LIST.map(c => (
                <option key={c} value={c} style={{ background: '#111' }}>{c}</option>
              ))}
            </select>
          </div>

          {error && (
            <p style={{ color: '#c0392b', fontSize: '0.8rem', marginBottom: '1rem' }}>{error}</p>
          )}

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              type="submit"
              disabled={loading || !trackingNumber.trim()}
              style={{
                flex: 1, padding: '10px', background: loading ? '#2a4a2c' : '#1E3020',
                color: '#F2EBD9', border: 'none', fontFamily: 'inherit',
                fontSize: '0.75rem', letterSpacing: '.14em', textTransform: 'uppercase',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Saving…' : 'Confirm Shipment'}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 20px', background: 'transparent',
                border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(245,240,230,0.6)',
                fontFamily: 'inherit', fontSize: '0.75rem', letterSpacing: '.14em',
                textTransform: 'uppercase', cursor: 'pointer',
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
