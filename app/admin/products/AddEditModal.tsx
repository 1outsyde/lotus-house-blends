'use client';

import { useState, useRef, useEffect } from 'react';
import type { ProductRow } from './ProductsClient';

interface AddEditModalProps {
  product: ProductRow | null;
  onClose: () => void;
  onSaved: () => void;
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

const fieldWrap: React.CSSProperties = { marginBottom: '1.25rem' };

export default function AddEditModal({ product, onClose, onSaved }: AddEditModalProps) {
  const isEdit = !!product;
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(product?.name ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [price, setPrice] = useState(product ? (product.price / 100).toFixed(2) : '');
  const [compareAtPrice, setCompareAtPrice] = useState(
    product?.compareAtPrice ? (product.compareAtPrice / 100).toFixed(2) : ''
  );
  const [category, setCategory] = useState(product?.category ?? '');
  const [isActive, setIsActive] = useState(product ? product.isActive : true);
  const [isFeatured, setIsFeatured] = useState(product?.isFeatured ?? false);
  const [imageUrl, setImageUrl] = useState(product?.imageUrl ?? '');

  const [uploading, setUploading] = useState(false);
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadError, setUploadError] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [nameError, setNameError] = useState('');
  const [priceError, setPriceError] = useState('');

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadFileName(file.name);
    setUploadError('');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/admin/products/upload-image', { method: 'POST', body: fd });
      const data = await res.json() as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error ?? 'Upload failed');
      setImageUrl(data.url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed, try again');
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setNameError('');
    setPriceError('');
    setSubmitError('');

    let valid = true;
    if (!name.trim()) { setNameError('Product name is required'); valid = false; }
    const parsedPrice = parseFloat(price);
    if (!price || isNaN(parsedPrice) || parsedPrice <= 0) { setPriceError('Price is required'); valid = false; }
    if (!valid) return;

    setSubmitting(true);
    const body: Record<string, unknown> = {
      name: name.trim(),
      description: description.trim() || null,
      price: Math.round(parsedPrice * 100),
      imageUrl: imageUrl || null,
      images: [],
      isActive,
      isFeatured,
      category: category.trim() || null,
    };
    if (compareAtPrice) {
      const cap = parseFloat(compareAtPrice);
      if (!isNaN(cap) && cap > 0) body.compareAtPrice = Math.round(cap * 100);
    }

    try {
      const url = isEdit ? `/api/admin/products/${product!.id}` : '/api/admin/products';
      const method = isEdit ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) throw new Error(data.error ?? 'Failed to save product');
      onSaved();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong');
      setSubmitting(false);
    }
  }

  const initials = name.trim()
    ? name.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(30,48,32,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
        overflowY: 'auto',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: '#F9F6EF',
        border: '1px solid rgba(30,48,32,0.12)',
        borderRadius: 8,
        padding: '36px 32px',
        width: '100%',
        maxWidth: 520,
        boxShadow: '0 8px 32px rgba(30,48,32,0.15)',
        position: 'relative',
        margin: 'auto',
      }}>
        <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.4rem', fontWeight: 500, color: '#1E3020', margin: '0 0 28px' }}>
          {isEdit ? 'Edit Product' : 'Add Product'}
        </h2>

        <form onSubmit={handleSubmit}>
          {/* 1. Image */}
          <div style={fieldWrap}>
            <label style={labelSt}>Product Image</label>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt="Product preview"
                  style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 4, border: '1px solid rgba(30,48,32,0.15)', flexShrink: 0 }}
                />
              ) : (
                <div style={{
                  width: 80, height: 80, borderRadius: 4, flexShrink: 0,
                  background: '#1E3020', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#F2EBD9', fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem', fontWeight: 500,
                  border: '1px solid rgba(30,48,32,0.15)',
                }}>
                  {initials}
                </div>
              )}
              <div style={{ flex: 1 }}>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  style={{
                    padding: '8px 16px', background: 'transparent', border: '1px solid rgba(30,48,32,0.3)',
                    color: '#1E3020', fontFamily: 'Jost, sans-serif', fontSize: '0.72rem',
                    letterSpacing: '.1em', textTransform: 'uppercase', cursor: uploading ? 'not-allowed' : 'pointer',
                    borderRadius: 2, opacity: uploading ? 0.6 : 1,
                  }}
                >
                  {uploading ? 'Uploading…' : imageUrl ? 'Change Image' : 'Upload Image'}
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
                {uploadFileName && !uploadError && (
                  <p style={{ fontSize: '0.75rem', color: 'rgba(30,48,32,0.5)', marginTop: 6, fontFamily: 'Jost, sans-serif' }}>
                    {uploading ? `Uploading ${uploadFileName}…` : uploadFileName}
                  </p>
                )}
                {uploadError && (
                  <p style={{ fontSize: '0.75rem', color: '#C0392B', marginTop: 6, fontFamily: 'Jost, sans-serif' }}>{uploadError}</p>
                )}
              </div>
            </div>
          </div>

          {/* 2. Name */}
          <div style={fieldWrap}>
            <label style={labelSt}>Product Name <span style={{ color: '#C0392B' }}>*</span></label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputSt}
              required
            />
            {nameError && <p style={{ fontSize: '0.75rem', color: '#C0392B', marginTop: 4, fontFamily: 'Jost, sans-serif' }}>{nameError}</p>}
          </div>

          {/* 3. Description */}
          <div style={fieldWrap}>
            <label style={labelSt}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              style={{ ...inputSt, resize: 'vertical', lineHeight: 1.6 }}
            />
          </div>

          {/* 4. Price */}
          <div style={fieldWrap}>
            <label style={labelSt}>Price ($) <span style={{ color: '#C0392B' }}>*</span></label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              step="0.01"
              min="0"
              placeholder="0.00"
              style={inputSt}
            />
            {priceError && <p style={{ fontSize: '0.75rem', color: '#C0392B', marginTop: 4, fontFamily: 'Jost, sans-serif' }}>{priceError}</p>}
          </div>

          {/* 5. Compare At Price */}
          <div style={fieldWrap}>
            <label style={labelSt}>Compare At Price ($)</label>
            <input
              type="number"
              value={compareAtPrice}
              onChange={(e) => setCompareAtPrice(e.target.value)}
              step="0.01"
              min="0"
              placeholder="0.00"
              style={inputSt}
            />
            <p style={{ fontSize: '0.72rem', color: 'rgba(30,48,32,0.45)', marginTop: 4, fontFamily: 'Jost, sans-serif' }}>
              Show a strikethrough original price
            </p>
          </div>

          {/* 6. Category */}
          <div style={fieldWrap}>
            <label style={labelSt}>Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={inputSt}
            />
          </div>

          {/* 7. Active */}
          <div style={{ marginBottom: '0.9rem', display: 'flex', alignItems: 'center', gap: 10 }}>
            <input
              id="active-check"
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              style={{ width: 16, height: 16, accentColor: '#1E3020', cursor: 'pointer' }}
            />
            <label htmlFor="active-check" style={{ ...labelSt, marginBottom: 0, cursor: 'pointer', textTransform: 'none', fontSize: '0.82rem', letterSpacing: '.01em' }}>
              Active (visible to customers)
            </label>
          </div>

          {!isEdit && (
            <p style={{
              fontFamily: 'Jost, sans-serif',
              fontSize: '12px',
              color: '#6B7280',
              marginTop: 0,
              marginBottom: '1rem',
              lineHeight: '1.5',
            }}>
              New products are saved as <strong>Draft</strong>. Use the Publish button
              on the product card to make it visible to customers.
            </p>
          )}

          {/* 8. Featured */}
          <div style={{ marginBottom: '1.75rem', display: 'flex', alignItems: 'center', gap: 10 }}>
            <input
              id="featured-check"
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              style={{ width: 16, height: 16, accentColor: '#1E3020', cursor: 'pointer' }}
            />
            <label htmlFor="featured-check" style={{ ...labelSt, marginBottom: 0, cursor: 'pointer', textTransform: 'none', fontSize: '0.82rem', letterSpacing: '.01em' }}>
              Featured product
            </label>
          </div>

          {submitError && (
            <p style={{ color: '#C0392B', fontSize: '0.82rem', marginBottom: '1rem', fontFamily: 'Jost, sans-serif' }}>{submitError}</p>
          )}

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              type="submit"
              disabled={submitting || uploading}
              style={{
                flex: 1, padding: '10px',
                background: submitting ? 'rgba(30,48,32,0.6)' : '#1E3020',
                color: '#F2EBD9', border: 'none', fontFamily: 'Jost, sans-serif',
                fontSize: '0.72rem', letterSpacing: '.14em', textTransform: 'uppercase',
                cursor: submitting ? 'not-allowed' : 'pointer', borderRadius: 2,
              }}
            >
              {submitting ? 'Saving…' : 'Save Product'}
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
