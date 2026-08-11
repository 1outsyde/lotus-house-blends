'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

const FONT_DISPLAY = "'Cormorant Garamond', Georgia, serif";
const FONT_BODY = "'Jost', sans-serif";

const FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Jost:wght@300;400;500&display=swap');
`;

const C = {
  cream: '#EDE3CC',
  parchment: '#F2EBD9',
  moss: '#1E3020',
  brownDark: '#2A1E0E',
  textMid: '#4A3820',
  textMuted: '#7A6A50',
  sage: '#4A6741',
} as const;

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <>
      <style>{FONTS}</style>
      <style>{`* { box-sizing: border-box; } body { margin: 0; background: ${C.cream}; }`}</style>

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
          <img
            src="/logo-dark.png"
            alt="Lotus House Blends"
            style={{ height: 64, display: 'block' }}
          />
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

      {/* CONTENT */}
      <div
        style={{
          background: C.cream,
          minHeight: 'calc(100vh - 80px)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            flex: 1,
            maxWidth: 560,
            margin: '0 auto',
            padding: '6rem 2rem',
            textAlign: 'center',
            width: '100%',
          }}
        >
          {/* Logo */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-dark.png"
            alt="Lotus House Blends"
            style={{ height: 80, display: 'block', margin: '0 auto 2rem' }}
          />

          {/* Checkmark */}
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: C.sage,
              color: '#fff',
              fontSize: '2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 2rem',
            }}
          >
            ✓
          </div>

          {/* Heading */}
          <h1
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: '2.5rem',
              color: C.brownDark,
              fontWeight: 400,
              margin: '0 0 .75rem',
              lineHeight: 1.2,
            }}
          >
            Order Confirmed
          </h1>

          {/* Order ID */}
          {orderId && (
            <p
              style={{
                fontFamily: FONT_BODY,
                fontSize: '.8rem',
                color: C.textMuted,
                margin: '.75rem 0',
                letterSpacing: '.05em',
              }}
            >
              Order #{orderId.slice(0, 8).toUpperCase()}
            </p>
          )}

          {/* Body */}
          <p
            style={{
              fontFamily: FONT_BODY,
              fontSize: '.9rem',
              color: C.textMid,
              lineHeight: 1.7,
              margin: '1rem 0 2.5rem',
            }}
          >
            Thank you for your order. You will receive a confirmation email
            shortly.
          </p>

          {/* CTA */}
          <Link
            href="/"
            style={{
              display: 'inline-block',
              background: C.moss,
              color: C.parchment,
              padding: '.9rem 2.5rem',
              textDecoration: 'none',
              fontFamily: FONT_BODY,
              fontSize: '.75rem',
              letterSpacing: '.15em',
              textTransform: 'uppercase',
            }}
          >
            Continue Shopping
          </Link>
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
      </div>
    </>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: '100vh',
            background: '#EDE3CC',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Jost', sans-serif",
            color: '#7A6A50',
          }}
        >
          Loading…
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
