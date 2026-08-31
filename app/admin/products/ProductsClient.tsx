'use client';

import { useState } from 'react';
import AddEditModal from './AddEditModal';

export interface ProductRow {
  id: string;
  name: string;
  description: string | null;
  price: number;
  compareAtPrice?: number | null;
  imageUrl: string | null;
  images?: string[];
  isActive: boolean;
  status: 'live' | 'draft' | 'archived';
  stripeProductId?: string | null;
  isFeatured: boolean;
  category?: string | null;
  createdAt?: string;
}

type DisplayStatus = 'live' | 'paused' | 'draft' | 'archived';

const STATUS_BADGE: Record<DisplayStatus, { bg: string; color: string; label: string }> = {
  live:     { bg: '#1E3020',   color: '#F2EBD9', label: 'LIVE' },
  paused:   { bg: '#B8831A',   color: '#fff',     label: 'PAUSED' },
  draft:    { bg: '#9CA3AF',   color: '#fff',     label: 'DRAFT' },
  archived: { bg: '#7F1D1D',   color: '#fff',     label: 'ARCHIVED' },
};

function getDisplayStatus(product: ProductRow): DisplayStatus {
  if (product.status === 'live' && product.isActive) return 'live';
  if (product.status === 'live' && !product.isActive) return 'paused';
  if (product.status === 'archived') return 'archived';
  return 'draft';
}

async function refetch(): Promise<ProductRow[]> {
  const res = await fetch('/api/admin/products');
  if (!res.ok) throw new Error('Failed to refresh products');
  const data = await res.json() as { products?: ProductRow[] } | ProductRow[];
  return Array.isArray(data) ? data : (data as { products?: ProductRow[] }).products ?? [];
}

function Initials({ name }: { name: string }) {
  const text = name.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';
  return (
    <div style={{
      width: '100%', aspectRatio: '1/1',
      background: '#1E3020', display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#F2EBD9', fontFamily: 'Cormorant Garamond, Georgia, serif',
      fontSize: '2rem', fontWeight: 500,
    }}>
      {text}
    </div>
  );
}

function Spinner() {
  return (
    <div style={{
      width: 18, height: 18, border: '2px solid rgba(30,48,32,0.2)',
      borderTopColor: '#1E3020', borderRadius: '50%',
      animation: 'lhb-spin 0.7s linear infinite', display: 'inline-block',
    }} />
  );
}

export default function ProductsClient({ initialProducts }: { initialProducts: ProductRow[] }) {
  const [products, setProducts] = useState<ProductRow[]>(initialProducts);
  const [modalProduct, setModalProduct] = useState<ProductRow | null | 'new'>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [error, setError] = useState('');

  async function reload() {
    try {
      const fresh = await refetch();
      setProducts(fresh);
    } catch {
      setError('Could not refresh product list.');
    }
  }

  async function toggleActive(product: ProductRow) {
    setLoadingId(product.id);
    setError('');
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !product.isActive }),
      });
      if (!res.ok) {
        const d = await res.json() as { error?: string };
        throw new Error(d.error ?? 'Failed to update');
      }
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoadingId(null);
    }
  }

  async function deleteProduct(id: string) {
    setLoadingId(id);
    setDeleteConfirmId(null);
    setError('');
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const d = await res.json() as { error?: string };
        throw new Error(d.error ?? 'Failed to delete');
      }
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoadingId(null);
    }
  }

  async function handlePublish(product: ProductRow) {
    setLoadingId(product.id);
    setError('');
    try {
      const isFirstPublish = !product.stripeProductId;
      if (isFirstPublish) {
        const res = await fetch(`/api/admin/products/${product.id}/go-live`, { method: 'POST' });
        if (!res.ok) {
          const err = await res.json() as { message?: string; error?: string };
          throw new Error(err.message ?? err.error ?? 'Could not publish product. Make sure Stripe is connected.');
        }
      } else {
        const res = await fetch(`/api/admin/products/${product.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'live', isActive: true }),
        });
        if (!res.ok) {
          const err = await res.json() as { error?: string };
          throw new Error(err.error ?? 'Could not publish product. Please try again.');
        }
      }
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoadingId(null);
    }
  }

  async function handleUnpublish(product: ProductRow) {
    setLoadingId(product.id);
    setError('');
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'draft', isActive: false }),
      });
      if (!res.ok) {
        const err = await res.json() as { error?: string };
        throw new Error(err.error ?? 'Could not unpublish product. Please try again.');
      }
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoadingId(null);
    }
  }

  const openAdd = () => setModalProduct('new');
  const openEdit = (p: ProductRow) => setModalProduct(p);
  const closeModal = () => setModalProduct(null);
  const onSaved = async () => { closeModal(); await reload(); };

  return (
    <>
      <style>{`
        @keyframes lhb-spin { to { transform: rotate(360deg); } }
        .lhb-pcard { background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(30,48,32,0.08); overflow: hidden; display: flex; flex-direction: column; }
        .lhb-pcard-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        @media (max-width: 900px) { .lhb-pcard-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 560px) { .lhb-pcard-grid { grid-template-columns: 1fr; } }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div />
        <button
          onClick={openAdd}
          style={{
            padding: '9px 22px', background: '#1E3020', color: '#F2EBD9',
            border: 'none', fontFamily: 'Jost, sans-serif', fontSize: '0.7rem',
            letterSpacing: '.14em', textTransform: 'uppercase', cursor: 'pointer',
            borderRadius: 2,
          }}
        >
          Add Product
        </button>
      </div>

      {error && (
        <p style={{ color: '#C0392B', fontSize: '0.82rem', marginBottom: 16, fontFamily: 'Jost, sans-serif' }}>{error}</p>
      )}

      {/* Grid */}
      {products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 0', color: 'rgba(30,48,32,0.38)', fontSize: '0.9rem', fontFamily: 'Jost, sans-serif' }}>
          No products yet. Click Add Product to get started.
        </div>
      ) : (
        <div className="lhb-pcard-grid">
          {products.map((product) => {
            const isLoading = loadingId === product.id;
            const displayStatus = getDisplayStatus(product);
            const badge = STATUS_BADGE[displayStatus];

            return (
              <div key={product.id} className="lhb-pcard" style={{ opacity: isLoading ? 0.7 : 1 }}>
                {/* Image area */}
                <div style={{ position: 'relative', aspectRatio: '1/1', width: '100%' }}>
                  {product.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  ) : (
                    <Initials name={product.name} />
                  )}
                  {/* Status badge */}
                  <span style={{
                    position: 'absolute', top: 10, right: 10,
                    background: badge.bg, color: badge.color,
                    fontSize: '0.58rem', fontWeight: 700, letterSpacing: '.1em',
                    padding: '3px 8px', borderRadius: 2, fontFamily: 'Jost, sans-serif',
                  }}>
                    {badge.label}
                  </span>
                  {isLoading && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.6)' }}>
                      <Spinner />
                    </div>
                  )}
                </div>

                {/* Card body */}
                <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <p style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.1rem', fontWeight: 500, color: '#1E3020', margin: 0, lineHeight: 1.25 }}>
                    {product.name}
                  </p>
                  <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '1rem', color: '#B8831A', margin: 0, fontWeight: 500 }}>
                    ${(product.price / 100).toFixed(2)}
                  </p>

                  {/* Active/Inactive pill */}
                  <button
                    onClick={() => toggleActive(product)}
                    disabled={isLoading}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      background: 'transparent', border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer',
                      padding: 0, fontFamily: 'Jost, sans-serif', fontSize: '0.75rem',
                      color: product.isActive ? '#16a34a' : 'rgba(30,48,32,0.45)',
                      alignSelf: 'flex-start',
                    }}
                    title={product.isActive ? 'Click to deactivate' : 'Click to activate'}
                  >
                    <span style={{
                      width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                      background: product.isActive ? '#16a34a' : '#9CA3AF',
                    }} />
                    {product.isActive ? 'Active' : 'Inactive'}
                  </button>
                </div>

                {/* Actions */}
                <div style={{ padding: '10px 16px', borderTop: '1px solid rgba(30,48,32,0.08)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => openEdit(product)}
                      disabled={isLoading}
                      style={{
                        flex: 1, padding: '7px 0', background: 'transparent',
                        border: '1px solid rgba(30,48,32,0.25)', color: '#1E3020',
                        fontFamily: 'Jost, sans-serif', fontSize: '0.68rem', letterSpacing: '.1em',
                        textTransform: 'uppercase', cursor: 'pointer', borderRadius: 2,
                      }}
                    >
                      Edit
                    </button>
                    {deleteConfirmId === product.id ? (
                      <div style={{ flex: 1, display: 'flex', gap: 4 }}>
                        <button
                          onClick={() => deleteProduct(product.id)}
                          style={{
                            flex: 1, padding: '7px 0', background: '#C0392B', border: 'none',
                            color: '#fff', fontFamily: 'Jost, sans-serif', fontSize: '0.62rem',
                            letterSpacing: '.08em', textTransform: 'uppercase', cursor: 'pointer', borderRadius: 2,
                          }}
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          style={{
                            flex: 1, padding: '7px 0', background: 'transparent',
                            border: '1px solid rgba(30,48,32,0.2)', color: 'rgba(30,48,32,0.5)',
                            fontFamily: 'Jost, sans-serif', fontSize: '0.62rem', cursor: 'pointer', borderRadius: 2,
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(product.id)}
                        disabled={isLoading}
                        style={{
                          flex: 1, padding: '7px 0', background: 'transparent',
                          border: '1px solid rgba(192,57,43,0.35)', color: '#C0392B',
                          fontFamily: 'Jost, sans-serif', fontSize: '0.68rem', letterSpacing: '.1em',
                          textTransform: 'uppercase', cursor: 'pointer', borderRadius: 2,
                        }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                  {/* Publish / Unpublish */}
                  {(displayStatus === 'draft' || displayStatus === 'archived') ? (
                    <button
                      onClick={() => handlePublish(product)}
                      disabled={isLoading}
                      style={{
                        width: '100%', padding: '8px 0',
                        background: isLoading ? 'rgba(30,48,32,0.5)' : '#1E3020',
                        color: '#F2EBD9', border: 'none',
                        fontFamily: 'Jost, sans-serif', fontSize: '0.68rem',
                        letterSpacing: '.12em', textTransform: 'uppercase',
                        cursor: isLoading ? 'not-allowed' : 'pointer', borderRadius: 2,
                      }}
                    >
                      Publish
                    </button>
                  ) : (displayStatus === 'live' || displayStatus === 'paused') ? (
                    <button
                      onClick={() => handleUnpublish(product)}
                      disabled={isLoading}
                      style={{
                        width: '100%', padding: '8px 0',
                        background: 'transparent',
                        color: '#1E3020', border: '1px solid #1E3020',
                        fontFamily: 'Jost, sans-serif', fontSize: '0.68rem',
                        letterSpacing: '.12em', textTransform: 'uppercase',
                        cursor: isLoading ? 'not-allowed' : 'pointer', borderRadius: 2,
                      }}
                    >
                      Unpublish
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalProduct !== null && (
        <AddEditModal
          product={modalProduct === 'new' ? null : modalProduct}
          onClose={closeModal}
          onSaved={onSaved}
        />
      )}
    </>
  );
}
