'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { getCart, clearCart, CartItem } from '@/lib/cart';

// Initialize Stripe once outside component tree
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  parchment:   '#F2EBD9',
  cream:       '#EDE3CC',
  moss:        '#1E3020',
  brownDark:   '#2A1E0E',
  brownLight:  '#C8A882',
  textMid:     '#4A3820',
  textMuted:   '#7A6A50',
  sage:        '#4A6741',
  gold:        '#B8831A',
  border:      'rgba(90,62,30,.25)',
  borderFaint: 'rgba(90,62,30,.12)',
  borderMid:   'rgba(90,62,30,.15)',
};

const DISPLAY = "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif";
const BODY    = "var(--font-jost), 'Jost', sans-serif";

// ─── Shared style objects ─────────────────────────────────────────────────────
const labelSt: React.CSSProperties = {
  display: 'block',
  fontFamily: BODY,
  fontSize: '.72rem',
  letterSpacing: '.1em',
  textTransform: 'uppercase',
  color: T.textMuted,
  marginBottom: '.4rem',
};

const inputBase: React.CSSProperties = {
  width: '100%',
  padding: '.75rem 1rem',
  border: `1px solid ${T.border}`,
  background: T.parchment,
  fontFamily: BODY,
  fontSize: '.9rem',
  color: T.brownDark,
  outline: 'none',
  borderRadius: 0,
  boxSizing: 'border-box',
};

const sectionHead: React.CSSProperties = {
  fontFamily: DISPLAY,
  fontSize: '1.4rem',
  color: T.brownDark,
  fontWeight: 400,
  marginBottom: '1.25rem',
  paddingBottom: '.6rem',
  borderBottom: `1px solid ${T.borderMid}`,
  margin: '0 0 1.25rem',
};

const fieldWrap: React.CSSProperties = { marginBottom: '1rem' };

// ─── Input component ──────────────────────────────────────────────────────────
function Input({
  id, label, type = 'text', value, onChange,
  required, placeholder, autoComplete, maxLength,
}: {
  id: string; label: string; type?: string; value: string;
  onChange: (v: string) => void; required?: boolean;
  placeholder?: string; autoComplete?: string; maxLength?: number;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={fieldWrap}>
      <label htmlFor={id} style={labelSt}>{label}</label>
      <input
        id={id} type={type} value={value} required={required}
        placeholder={placeholder} autoComplete={autoComplete}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{ ...inputBase, borderColor: focused ? T.moss : T.border }}
      />
    </div>
  );
}

// ─── Address block ────────────────────────────────────────────────────────────
function AddressFields({
  prefix, values, setters,
}: {
  prefix: string;
  values: { name: string; line1: string; line2: string; city: string; state: string; zip: string };
  setters: { setName: (v:string)=>void; setLine1: (v:string)=>void; setLine2: (v:string)=>void;
             setCity: (v:string)=>void; setState: (v:string)=>void; setZip: (v:string)=>void };
}) {
  const [fCity, setFCity] = useState(false);
  const [fState, setFState] = useState(false);
  const [fZip, setFZip] = useState(false);

  return (
    <>
      <Input id={`${prefix}Name`} label="Full Name on Package" value={values.name}
        onChange={setters.setName} required autoComplete={`${prefix} name`} />
      <Input id={`${prefix}Line1`} label="Address Line 1" value={values.line1}
        onChange={setters.setLine1} required autoComplete={`${prefix} address-line1`} />
      <Input id={`${prefix}Line2`} label="Address Line 2 (optional)" value={values.line2}
        onChange={setters.setLine2} autoComplete={`${prefix} address-line2`} />

      {/* City / State / ZIP row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 120px', gap: '1rem' }}>
        <div style={fieldWrap}>
          <label htmlFor={`${prefix}City`} style={labelSt}>City</label>
          <input id={`${prefix}City`} type="text" value={values.city} required
            autoComplete={`${prefix} address-level2`}
            onChange={(e) => setters.setCity(e.target.value)}
            onFocus={() => setFCity(true)} onBlur={() => setFCity(false)}
            style={{ ...inputBase, borderColor: fCity ? T.moss : T.border }}
          />
        </div>
        <div style={fieldWrap}>
          <label htmlFor={`${prefix}State`} style={labelSt}>State</label>
          <input id={`${prefix}State`} type="text" value={values.state} required
            maxLength={2} placeholder="CA" autoComplete={`${prefix} address-level1`}
            onChange={(e) => setters.setState(e.target.value.slice(0,2).toUpperCase())}
            onFocus={() => setFState(true)} onBlur={() => setFState(false)}
            style={{ ...inputBase, borderColor: fState ? T.moss : T.border }}
          />
        </div>
        <div style={fieldWrap}>
          <label htmlFor={`${prefix}Zip`} style={labelSt}>ZIP Code</label>
          <input id={`${prefix}Zip`} type="text" value={values.zip} required
            placeholder="90210" autoComplete={`${prefix} postal-code`}
            onChange={(e) => setters.setZip(e.target.value)}
            onFocus={() => setFZip(true)} onBlur={() => setFZip(false)}
            style={{ ...inputBase, borderColor: fZip ? T.moss : T.border }}
          />
        </div>
      </div>
    </>
  );
}

// ─── Order Summary ────────────────────────────────────────────────────────────
function OrderSummary({ items }: { items: CartItem[] }) {
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <div style={{ position: 'sticky', top: '2rem' }}>
      <h2 style={{ ...sectionHead, marginBottom: '1.5rem' }}>Your Order</h2>

      <div>
        {items.map((item) => (
          <div key={item.id} style={{
            display: 'flex', gap: '1rem', padding: '.85rem 0',
            borderBottom: `1px solid ${T.borderFaint}`, alignItems: 'center',
          }}>
            <div style={{
              width: 48, height: 48, flexShrink: 0, background: '#e8e0d0',
              border: `1px solid ${T.borderFaint}`, position: 'relative', overflow: 'hidden',
            }}>
              <Image src={item.image} alt={item.name} fill
                style={{ objectFit: 'contain' }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: DISPLAY, fontSize: '1rem', color: T.brownDark, lineHeight: 1.3 }}>
                {item.name}
              </div>
              <div style={{ fontFamily: BODY, fontSize: '.8rem', color: T.textMuted, marginTop: '.15rem' }}>
                Qty: {item.qty}
              </div>
            </div>
            <div style={{ fontFamily: BODY, fontSize: '.9rem', color: T.brownDark, flexShrink: 0 }}>
              ${(item.price * item.qty).toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.5rem',
          fontFamily: BODY, fontSize: '.85rem', color: T.textMid }}>
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem',
          fontFamily: BODY, fontSize: '.85rem', color: T.textMid }}>
          <span>Shipping</span>
          <span style={{ color: T.sage }}>Free</span>
        </div>

        <div style={{ borderTop: `1px solid ${T.borderMid}`, paddingTop: '.85rem',
          display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ fontFamily: DISPLAY, fontSize: '1.2rem', fontWeight: 400, color: T.brownDark }}>
            Total
          </span>
          <span style={{ fontFamily: DISPLAY, fontSize: '1.5rem', fontWeight: 600, color: T.brownDark }}>
            ${subtotal.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Secure badge */}
      <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center',
        justifyContent: 'center', gap: '.4rem' }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={T.textMuted}
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
        <span style={{ fontFamily: BODY, fontSize: '.72rem', color: T.textMuted, letterSpacing: '.04em' }}>
          Secure checkout powered by Stripe
        </span>
      </div>
    </div>
  );
}

// ─── Main checkout form ───────────────────────────────────────────────────────
function CheckoutForm() {
  const router  = useRouter();
  const stripe  = useStripe();
  const elements = useElements();

  const [items, setItems] = useState<CartItem[]>([]);

  // Contact
  const [customerName,  setCustomerName]  = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  // Shipping
  const [shipName,  setShipName]  = useState('');
  const [shipLine1, setShipLine1] = useState('');
  const [shipLine2, setShipLine2] = useState('');
  const [shipCity,  setShipCity]  = useState('');
  const [shipState, setShipState] = useState('');
  const [shipZip,   setShipZip]   = useState('');

  // Billing
  const [billingSame, setBillingSame] = useState(true);
  const [billName,  setBillName]  = useState('');
  const [billLine1, setBillLine1] = useState('');
  const [billLine2, setBillLine2] = useState('');
  const [billCity,  setBillCity]  = useState('');
  const [billState, setBillState] = useState('');
  const [billZip,   setBillZip]   = useState('');

  // Payment
  const [cardholderName, setCardholderName] = useState('');
  const [cardFocused, setCardFocused] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [btnHover, setBtnHover] = useState(false);

  useEffect(() => {
    const cart = getCart();
    if (cart.length === 0) { router.push('/'); return; }
    setItems(cart);
  }, [router]);

  const subtotal     = items.reduce((s, i) => s + i.price * i.qty, 0);
  const subtotalCents = Math.round(subtotal * 100);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError('');

    try {
      // Step 1 — create PaymentIntent
      const coRes  = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: getCart(), customerEmail }),
      });
      const coData = await coRes.json() as { clientSecret?: string; paymentIntentId?: string; error?: string };
      if (!coRes.ok || !coData.clientSecret) throw new Error(coData.error ?? 'Failed to create payment.');

      // Step 2 — confirm card
      const card = elements.getElement(CardElement);
      if (!card) throw new Error('Card element not found.');
      const result = await stripe.confirmCardPayment(coData.clientSecret, {
        payment_method: {
          card,
          billing_details: { name: cardholderName, email: customerEmail },
        },
      });
      if (result.error) { setError(result.error.message ?? 'Payment failed.'); setLoading(false); return; }

      // Step 3 — save order
      const orRes  = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentIntentId: coData.paymentIntentId,
          customerName, customerEmail,
          shippingName: shipName,   shippingLine1: shipLine1,
          shippingLine2: shipLine2, shippingCity: shipCity,
          shippingState: shipState, shippingZip: shipZip,
          billingSameAsShipping: billingSame,
          billingName:  billingSame ? shipName  : billName,
          billingLine1: billingSame ? shipLine1 : billLine1,
          billingLine2: billingSame ? shipLine2 : billLine2,
          billingCity:  billingSame ? shipCity  : billCity,
          billingState: billingSame ? shipState : billState,
          billingZip:   billingSame ? shipZip   : billZip,
          items: getCart(), subtotalCents, totalCents: subtotalCents,
        }),
      });
      const orData = await orRes.json() as { orderId?: string; error?: string };
      if (!orRes.ok) throw new Error(orData.error ?? 'Failed to save order.');

      // Step 4 — clear and redirect
      clearCart();
      router.push(`/success?orderId=${orData.orderId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '6rem 2rem', fontFamily: BODY, color: T.textMuted }}>
        <p style={{ marginBottom: '1.5rem', fontSize: '1rem' }}>Your cart is empty.</p>
        <Link href="/#shop" style={{
          display: 'inline-block', padding: '.75rem 2rem', background: T.moss,
          color: T.parchment, textDecoration: 'none', fontFamily: BODY,
          fontSize: '.75rem', letterSpacing: '.12em', textTransform: 'uppercase',
        }}>Shop the Collection</Link>
      </div>
    );
  }

  return (
    <>
      {/* Mobile responsive */}
      <style>{`
        @media (max-width: 768px) {
          .co-grid { grid-template-columns: 1fr !important; }
          .co-summary { order: -1; }
        }
        * { box-sizing: border-box; }
      `}</style>

      <form onSubmit={handleSubmit}>
        <div className="co-grid" style={{
          display: 'grid', gridTemplateColumns: '60% 40%',
          gap: '4rem', alignItems: 'start',
        }}>
          {/* ── LEFT: Form ─────────────────────────────────────────── */}
          <div>
            {/* 1. Contact */}
            <section style={{ marginBottom: '2.5rem' }}>
              <h2 style={sectionHead}>Contact Information</h2>
              <Input id="customerName" label="Full Name" value={customerName}
                onChange={setCustomerName} required autoComplete="name" />
              <Input id="customerEmail" label="Email Address" type="email"
                value={customerEmail} onChange={setCustomerEmail} required autoComplete="email" />
            </section>

            {/* 2. Shipping */}
            <section style={{ marginBottom: '2.5rem' }}>
              <h2 style={sectionHead}>Shipping Address</h2>
              <AddressFields prefix="shipping"
                values={{ name: shipName, line1: shipLine1, line2: shipLine2,
                          city: shipCity, state: shipState, zip: shipZip }}
                setters={{ setName: setShipName, setLine1: setShipLine1, setLine2: setShipLine2,
                           setCity: setShipCity, setState: setShipState, setZip: setShipZip }}
              />
              <div style={{ marginTop: '.75rem', fontFamily: BODY, fontSize: '.85rem', color: T.textMuted }}>
                🇺🇸 United States
              </div>
            </section>

            {/* 3. Billing */}
            <section style={{ marginBottom: '2.5rem' }}>
              <h2 style={sectionHead}>Billing Address</h2>
              <label style={{ display: 'flex', alignItems: 'center', gap: '.6rem',
                fontFamily: BODY, fontSize: '.85rem', color: T.textMid, cursor: 'pointer',
                marginBottom: billingSame ? 0 : '1.25rem' }}>
                <input type="checkbox" checked={billingSame}
                  onChange={(e) => setBillingSame(e.target.checked)}
                  style={{ width: 16, height: 16, accentColor: T.moss, cursor: 'pointer' }}
                />
                Same as shipping address
              </label>

              {!billingSame && (
                <div style={{ marginTop: '1.25rem' }}>
                  <AddressFields prefix="billing"
                    values={{ name: billName, line1: billLine1, line2: billLine2,
                              city: billCity, state: billState, zip: billZip }}
                    setters={{ setName: setBillName, setLine1: setBillLine1, setLine2: setBillLine2,
                               setCity: setBillCity, setState: setBillState, setZip: setBillZip }}
                  />
                </div>
              )}
            </section>

            {/* 4. Payment */}
            <section style={{ marginBottom: '2rem' }}>
              <h2 style={sectionHead}>Payment Information</h2>

              <Input id="cardholderName" label="Cardholder Name"
                value={cardholderName} onChange={setCardholderName}
                required autoComplete="cc-name" />

              <div style={fieldWrap}>
                <label style={labelSt}>Card Details</label>
                <div style={{
                  padding: '.75rem 1rem',
                  border: `1px solid ${cardFocused ? T.moss : T.border}`,
                  background: T.parchment,
                  cursor: 'text',
                  transition: 'border-color .2s',
                }}>
                  <CardElement
                    onFocus={() => setCardFocused(true)}
                    onBlur={() => setCardFocused(false)}
                    options={{
                      style: {
                        base: {
                          fontSize: '16px',
                          color: T.brownDark,
                          fontFamily: BODY,
                          '::placeholder': { color: '#9A8070' },
                          iconColor: T.sage,
                        },
                        invalid: { color: '#c0392b' },
                      },
                    }}
                  />
                </div>
              </div>
            </section>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !stripe}
              onMouseEnter={() => setBtnHover(true)}
              onMouseLeave={() => setBtnHover(false)}
              style={{
                width: '100%',
                padding: '1.1rem',
                background: loading ? '#3a5a3c' : btnHover ? '#2E4A2A' : T.moss,
                color: T.parchment,
                border: 'none',
                fontFamily: BODY,
                fontSize: '.8rem',
                letterSpacing: '.18em',
                textTransform: 'uppercase',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background .2s',
              }}
            >
              {loading ? 'Processing...' : `Place Order — $${subtotal.toFixed(2)}`}
            </button>

            {error && (
              <p style={{ color: '#c0392b', fontFamily: BODY, fontSize: '.85rem',
                marginTop: '.75rem', lineHeight: 1.5 }}>
                {error}
              </p>
            )}
          </div>

          {/* ── RIGHT: Summary ──────────────────────────────────────── */}
          <div className="co-summary">
            <OrderSummary items={items} />
          </div>
        </div>
      </form>
    </>
  );
}

// ─── Page shell ───────────────────────────────────────────────────────────────
export default function CheckoutPage() {
  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; background: #EDE3CC; }
      `}</style>

      {/* NAV */}
      <nav style={{
        background: '#1a1a18',
        borderBottom: '1px solid rgba(200,168,130,.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 2rem', height: 64, position: 'sticky', top: 0, zIndex: 100,
      }}>
        <Link href="/">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-dark.png" alt="Lotus House Blends"
            style={{ height: 48, display: 'block' }} />
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem' }}>
          {[
            { label: 'Shop',      href: '/#shop' },
            { label: 'Our Story', href: '/about' },
            { label: 'Wholesale', href: '/wholesale' },
          ].map((l) => (
            <Link key={l.href} href={l.href} style={{
              color: 'rgba(255,255,255,.75)', textDecoration: 'none',
              fontFamily: BODY, fontSize: '.8rem', letterSpacing: '.1em',
              textTransform: 'uppercase',
            }}>{l.label}</Link>
          ))}
        </div>
      </nav>

      {/* MAIN */}
      <main style={{ background: '#EDE3CC', minHeight: 'calc(100vh - 64px)', padding: '3rem 2rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h1 style={{
            fontFamily: DISPLAY, fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            fontWeight: 400, color: '#2A1E0E',
            marginBottom: '2.5rem', margin: '0 0 2.5rem',
          }}>
            Checkout
          </h1>
          <Elements stripe={stripePromise}>
            <CheckoutForm />
          </Elements>
        </div>
      </main>

      {/* FOOTER */}
      <footer style={{
        background: '#1a1a18', borderTop: '1px solid rgba(200,168,130,.15)',
        padding: '1.5rem 2rem', textAlign: 'center',
      }}>
        <p style={{ color: 'rgba(255,255,255,.35)', fontFamily: BODY,
          fontSize: '.75rem', marginBottom: '.35rem' }}>
          © 2026 Lotus House Blends
        </p>
        <span style={{ fontSize: '.6rem', color: 'rgba(200,168,130,.3)', letterSpacing: '.08em' }}>
          Powered by Outsyde
        </span>
      </footer>
    </>
  );
}
