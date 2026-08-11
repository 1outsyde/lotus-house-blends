'use client';

import { useState, useEffect } from 'react';
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

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

// ─── Styles ──────────────────────────────────────────────────────────────────
const FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Jost:wght@300;400;500&display=swap');
`;

const C = {
  parchment: '#F2EBD9',
  cream: '#EDE3CC',
  moss: '#1E3020',
  brownDark: '#2A1E0E',
  brownLight: '#C8A882',
  lavender: '#7B6BAF',
  textMid: '#4A3820',
  textMuted: '#7A6A50',
  sage: '#4A6741',
  gold: '#B8831A',
} as const;

const FONT_DISPLAY = "'Cormorant Garamond', Georgia, serif";
const FONT_BODY = "'Jost', sans-serif";

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '.75rem 1rem',
  border: `1px solid rgba(90,62,30,.25)`,
  background: C.parchment,
  fontFamily: FONT_BODY,
  fontSize: '.9rem',
  color: C.brownDark,
  outline: 'none',
  borderRadius: 0,
  transition: 'border-color .2s',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: FONT_BODY,
  fontSize: '.7rem',
  letterSpacing: '.1em',
  textTransform: 'uppercase',
  color: C.textMuted,
  marginBottom: '.4rem',
};

const sectionHeadingStyle: React.CSSProperties = {
  fontFamily: FONT_DISPLAY,
  fontSize: '1.4rem',
  color: C.brownDark,
  fontWeight: 400,
  marginBottom: '1.25rem',
  paddingBottom: '.6rem',
  borderBottom: `1px solid rgba(90,62,30,.15)`,
};

// ─── Field helpers ────────────────────────────────────────────────────────────
function Field({
  id,
  label,
  type = 'text',
  value,
  onChange,
  required,
  placeholder,
  autoComplete,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  placeholder?: string;
  autoComplete?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label htmlFor={id} style={labelStyle}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          ...inputStyle,
          borderColor: focused ? C.moss : 'rgba(90,62,30,.25)',
        }}
      />
    </div>
  );
}

// ─── Order Summary ────────────────────────────────────────────────────────────
function OrderSummary({ items }: { items: CartItem[] }) {
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <div
      style={{
        position: 'sticky',
        top: '2rem',
        background: C.parchment,
        padding: '2rem',
        border: `1px solid rgba(90,62,30,.12)`,
      }}
    >
      <h2
        style={{
          fontFamily: FONT_DISPLAY,
          fontSize: '1.5rem',
          color: C.brownDark,
          fontWeight: 400,
          marginBottom: '1.25rem',
          margin: '0 0 1.25rem',
        }}
      >
        Your Order
      </h2>

      <div>
        {items.map((item) => (
          <div
            key={item.id}
            style={{
              display: 'flex',
              gap: '1rem',
              padding: '.85rem 0',
              borderBottom: `1px solid rgba(90,62,30,.08)`,
              alignItems: 'center',
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                flexShrink: 0,
                background: '#e8e0d0',
                border: `1px solid rgba(90,62,30,.1)`,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Image
                src={item.image}
                alt={item.name}
                fill
                style={{ objectFit: 'contain' }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontSize: '1rem',
                  color: C.brownDark,
                  lineHeight: 1.3,
                  marginBottom: '.2rem',
                }}
              >
                {item.name}
              </div>
              <div
                style={{
                  fontFamily: FONT_BODY,
                  fontSize: '.75rem',
                  color: C.textMuted,
                }}
              >
                Qty: {item.qty}
              </div>
            </div>
            <div
              style={{
                fontFamily: FONT_BODY,
                fontSize: '.9rem',
                color: C.brownDark,
                marginLeft: 'auto',
                flexShrink: 0,
              }}
            >
              ${(item.price * item.qty).toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '1.25rem' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '.6rem',
            fontFamily: FONT_BODY,
            fontSize: '.8rem',
            color: C.textMid,
          }}
        >
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '1rem',
            fontFamily: FONT_BODY,
            fontSize: '.8rem',
            color: C.textMid,
          }}
        >
          <span>Shipping</span>
          <span style={{ color: C.sage }}>Free</span>
        </div>

        <div
          style={{
            borderTop: `1px solid rgba(90,62,30,.15)`,
            paddingTop: '.85rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
          }}
        >
          <span
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: '1.2rem',
              color: C.brownDark,
            }}
          >
            Total
          </span>
          <span
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: '1.4rem',
              fontWeight: 600,
              color: C.brownDark,
            }}
          >
            ${subtotal.toFixed(2)}
          </span>
        </div>
      </div>

      <div
        style={{
          marginTop: '1.5rem',
          textAlign: 'center',
          fontFamily: FONT_BODY,
          fontSize: '.7rem',
          color: C.textMuted,
        }}
      >
        🔒 Secure checkout powered by Stripe
      </div>
    </div>
  );
}

// ─── Checkout Form ────────────────────────────────────────────────────────────
function CheckoutForm() {
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();

  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cardFocused, setCardFocused] = useState(false);

  // Contact
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  // Shipping
  const [shippingName, setShippingName] = useState('');
  const [shippingLine1, setShippingLine1] = useState('');
  const [shippingLine2, setShippingLine2] = useState('');
  const [shippingCity, setShippingCity] = useState('');
  const [shippingState, setShippingState] = useState('');
  const [shippingZip, setShippingZip] = useState('');

  // Billing
  const [billingSame, setBillingSame] = useState(true);
  const [billingName, setBillingName] = useState('');
  const [billingLine1, setBillingLine1] = useState('');
  const [billingLine2, setBillingLine2] = useState('');
  const [billingCity, setBillingCity] = useState('');
  const [billingState, setBillingState] = useState('');
  const [billingZip, setBillingZip] = useState('');

  // Payment
  const [cardholderName, setCardholderName] = useState('');

  useEffect(() => {
    const cart = getCart();
    if (cart.length === 0) {
      router.push('/');
      return;
    }
    setItems(cart);
  }, [router]);

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const subtotalCents = Math.round(subtotal * 100);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError('');

    try {
      // 1. Create PaymentIntent
      const checkoutRes = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: getCart(), customerEmail }),
      });
      const checkoutData = await checkoutRes.json();
      if (!checkoutRes.ok || !checkoutData.clientSecret) {
        throw new Error(checkoutData.error ?? 'Failed to initialize payment.');
      }
      const { clientSecret, paymentIntentId } = checkoutData as {
        clientSecret: string;
        paymentIntentId: string;
      };

      // 2. Confirm card payment
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error('Card element not found.');

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: { name: cardholderName, email: customerEmail },
        },
      });

      if (result.error) {
        setError(result.error.message ?? 'Payment failed.');
        setLoading(false);
        return;
      }

      // 3. Save order
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentIntentId,
          customerName,
          customerEmail,
          shippingName,
          shippingLine1,
          shippingLine2,
          shippingCity,
          shippingState,
          shippingZip,
          shippingCountry: 'US',
          billingSameAsShipping: billingSame,
          billingName: billingSame ? shippingName : billingName,
          billingLine1: billingSame ? shippingLine1 : billingLine1,
          billingLine2: billingSame ? shippingLine2 : billingLine2,
          billingCity: billingSame ? shippingCity : billingCity,
          billingState: billingSame ? shippingState : billingState,
          billingZip: billingSame ? shippingZip : billingZip,
          billingCountry: 'US',
          items: getCart(),
          subtotalCents,
          totalCents: subtotalCents,
        }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderData.error ?? 'Failed to save order.');
      }
      const { orderId } = orderData as { orderId: string };

      // 4. Clear cart and redirect
      clearCart();
      router.push(`/success?orderId=${orderId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
      setLoading(false);
    }
  };

  if (items.length === 0) return null;

  return (
    <>
      <style>{FONTS}</style>
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; background: ${C.cream}; }
        @media (max-width: 860px) {
          .checkout-grid { grid-template-columns: 1fr !important; }
          .checkout-summary { order: -1; }
        }
      `}</style>

      {/* NAV */}
      <nav
        style={{
          background: '#1a1a18',
          borderBottom: '1px solid rgba(200,168,130,.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 2rem',
          height: 80,
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <Link href="/">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-dark.png" alt="Lotus House Blends" style={{ height: 64, display: 'block' }} />
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem' }}>
          {[
            { label: 'Shop', href: '/#shop' },
            { label: 'Our Story', href: '/about' },
            { label: 'Wholesale', href: '/wholesale' },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                color: 'rgba(255,255,255,.75)',
                textDecoration: 'none',
                fontFamily: FONT_BODY,
                fontSize: '.8rem',
                letterSpacing: '.1em',
                textTransform: 'uppercase',
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* PAGE */}
      <div
        style={{
          background: C.cream,
          minHeight: '100vh',
          padding: '4rem 2rem',
        }}
      >
        <div
          style={{
            maxWidth: 1140,
            margin: '0 auto',
          }}
        >
          <form onSubmit={handleSubmit}>
            <div
              className="checkout-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 420px',
                gap: '4rem',
                alignItems: 'start',
              }}
            >
              {/* ── LEFT COLUMN ──────────────────────────────────────── */}
              <div>
                {/* Section 1 — Contact */}
                <div style={{ marginBottom: '2.5rem' }}>
                  <h2 style={sectionHeadingStyle}>Contact Information</h2>
                  <Field
                    id="customerName"
                    label="Full Name"
                    value={customerName}
                    onChange={setCustomerName}
                    required
                    autoComplete="name"
                  />
                  <Field
                    id="customerEmail"
                    label="Email Address"
                    type="email"
                    value={customerEmail}
                    onChange={setCustomerEmail}
                    required
                    autoComplete="email"
                  />
                </div>

                {/* Section 2 — Shipping */}
                <div style={{ marginBottom: '2.5rem' }}>
                  <h2 style={sectionHeadingStyle}>Shipping Address</h2>
                  <Field
                    id="shippingName"
                    label="Full Name on Package"
                    value={shippingName}
                    onChange={setShippingName}
                    required
                    autoComplete="shipping name"
                  />
                  <Field
                    id="shippingLine1"
                    label="Address Line 1"
                    value={shippingLine1}
                    onChange={setShippingLine1}
                    required
                    autoComplete="shipping address-line1"
                  />
                  <Field
                    id="shippingLine2"
                    label="Apt, Suite, etc. (optional)"
                    value={shippingLine2}
                    onChange={setShippingLine2}
                    autoComplete="shipping address-line2"
                  />
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 80px 120px',
                      gap: '1rem',
                    }}
                  >
                    <div>
                      <label htmlFor="shippingCity" style={labelStyle}>City</label>
                      <input
                        id="shippingCity"
                        type="text"
                        value={shippingCity}
                        onChange={(e) => setShippingCity(e.target.value)}
                        required
                        autoComplete="shipping address-level2"
                        style={inputStyle}
                        onFocus={(e) => (e.currentTarget.style.borderColor = C.moss)}
                        onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(90,62,30,.25)')}
                      />
                    </div>
                    <div>
                      <label htmlFor="shippingState" style={labelStyle}>State</label>
                      <input
                        id="shippingState"
                        type="text"
                        value={shippingState}
                        onChange={(e) => setShippingState(e.target.value.slice(0, 2).toUpperCase())}
                        required
                        maxLength={2}
                        placeholder="CA"
                        autoComplete="shipping address-level1"
                        style={inputStyle}
                        onFocus={(e) => (e.currentTarget.style.borderColor = C.moss)}
                        onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(90,62,30,.25)')}
                      />
                    </div>
                    <div>
                      <label htmlFor="shippingZip" style={labelStyle}>ZIP</label>
                      <input
                        id="shippingZip"
                        type="text"
                        value={shippingZip}
                        onChange={(e) => setShippingZip(e.target.value)}
                        required
                        placeholder="90210"
                        autoComplete="shipping postal-code"
                        style={inputStyle}
                        onFocus={(e) => (e.currentTarget.style.borderColor = C.moss)}
                        onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(90,62,30,.25)')}
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3 — Billing */}
                <div style={{ marginBottom: '2.5rem' }}>
                  <h2 style={sectionHeadingStyle}>Billing Address</h2>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '.65rem',
                      marginBottom: billingSame ? 0 : '1.25rem',
                    }}
                  >
                    <input
                      type="checkbox"
                      id="billingSame"
                      checked={billingSame}
                      onChange={(e) => setBillingSame(e.target.checked)}
                      style={{ width: 16, height: 16, cursor: 'pointer', accentColor: C.moss }}
                    />
                    <label
                      htmlFor="billingSame"
                      style={{
                        fontFamily: FONT_BODY,
                        fontSize: '.85rem',
                        color: C.textMid,
                        cursor: 'pointer',
                        userSelect: 'none',
                      }}
                    >
                      Same as shipping address
                    </label>
                  </div>

                  {!billingSame && (
                    <div style={{ marginTop: '1.25rem' }}>
                      <Field
                        id="billingName"
                        label="Full Name"
                        value={billingName}
                        onChange={setBillingName}
                        required
                        autoComplete="billing name"
                      />
                      <Field
                        id="billingLine1"
                        label="Address Line 1"
                        value={billingLine1}
                        onChange={setBillingLine1}
                        required
                        autoComplete="billing address-line1"
                      />
                      <Field
                        id="billingLine2"
                        label="Apt, Suite, etc. (optional)"
                        value={billingLine2}
                        onChange={setBillingLine2}
                        autoComplete="billing address-line2"
                      />
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 80px 120px',
                          gap: '1rem',
                        }}
                      >
                        <div>
                          <label htmlFor="billingCity" style={labelStyle}>City</label>
                          <input
                            id="billingCity"
                            type="text"
                            value={billingCity}
                            onChange={(e) => setBillingCity(e.target.value)}
                            required
                            autoComplete="billing address-level2"
                            style={inputStyle}
                            onFocus={(e) => (e.currentTarget.style.borderColor = C.moss)}
                            onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(90,62,30,.25)')}
                          />
                        </div>
                        <div>
                          <label htmlFor="billingState" style={labelStyle}>State</label>
                          <input
                            id="billingState"
                            type="text"
                            value={billingState}
                            onChange={(e) => setBillingState(e.target.value.slice(0, 2).toUpperCase())}
                            required
                            maxLength={2}
                            placeholder="CA"
                            autoComplete="billing address-level1"
                            style={inputStyle}
                            onFocus={(e) => (e.currentTarget.style.borderColor = C.moss)}
                            onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(90,62,30,.25)')}
                          />
                        </div>
                        <div>
                          <label htmlFor="billingZip" style={labelStyle}>ZIP</label>
                          <input
                            id="billingZip"
                            type="text"
                            value={billingZip}
                            onChange={(e) => setBillingZip(e.target.value)}
                            required
                            placeholder="90210"
                            autoComplete="billing postal-code"
                            style={inputStyle}
                            onFocus={(e) => (e.currentTarget.style.borderColor = C.moss)}
                            onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(90,62,30,.25)')}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Section 4 — Payment */}
                <div style={{ marginBottom: '2.5rem' }}>
                  <h2 style={sectionHeadingStyle}>Payment</h2>
                  <Field
                    id="cardholderName"
                    label="Cardholder Name"
                    value={cardholderName}
                    onChange={setCardholderName}
                    required
                    autoComplete="cc-name"
                  />
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={labelStyle}>Card Details</label>
                    <div
                      style={{
                        padding: '.75rem 1rem',
                        border: `1px solid ${cardFocused ? C.moss : 'rgba(90,62,30,.25)'}`,
                        background: C.parchment,
                        cursor: 'text',
                        transition: 'border-color .2s',
                      }}
                    >
                      <CardElement
                        onFocus={() => setCardFocused(true)}
                        onBlur={() => setCardFocused(false)}
                        options={{
                          style: {
                            base: {
                              fontSize: '16px',
                              color: C.brownDark,
                              fontFamily: FONT_BODY,
                              '::placeholder': { color: '#9A8070' },
                              iconColor: C.sage,
                            },
                            invalid: { color: '#c0392b' },
                          },
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading || !stripe}
                  style={{
                    width: '100%',
                    padding: '1.1rem',
                    background: loading ? '#4a7050' : C.moss,
                    color: C.parchment,
                    border: 'none',
                    fontFamily: FONT_BODY,
                    fontSize: '.8rem',
                    letterSpacing: '.18em',
                    textTransform: 'uppercase',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    marginTop: '1.5rem',
                    transition: 'background .2s',
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) (e.currentTarget as HTMLButtonElement).style.background = '#2E4A2A';
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) (e.currentTarget as HTMLButtonElement).style.background = C.moss;
                  }}
                >
                  {loading
                    ? 'Processing...'
                    : `Place Order — $${subtotal.toFixed(2)}`}
                </button>

                {error && (
                  <p
                    style={{
                      color: '#c0392b',
                      fontFamily: FONT_BODY,
                      fontSize: '.85rem',
                      marginTop: '1rem',
                      lineHeight: 1.5,
                    }}
                  >
                    {error}
                  </p>
                )}
              </div>

              {/* ── RIGHT COLUMN ─────────────────────────────────────── */}
              <div className="checkout-summary">
                <OrderSummary items={items} />
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* FOOTER */}
      <footer
        style={{
          background: '#1a1a18',
          borderTop: '1px solid rgba(200,168,130,.15)',
          padding: '1.5rem 2rem',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            color: 'rgba(255,255,255,.35)',
            fontFamily: FONT_BODY,
            fontSize: '.75rem',
            marginBottom: '.35rem',
          }}
        >
          © 2026 Lotus House Blends
        </p>
        <span
          style={{
            fontSize: '.6rem',
            color: 'rgba(200,168,130,.3)',
            letterSpacing: '.08em',
          }}
        >
          Powered by Outsyde
        </span>
      </footer>
    </>
  );
}

// ─── Page Export ─────────────────────────────────────────────────────────────
export default function CheckoutPage() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
}
