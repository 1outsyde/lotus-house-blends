'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

const DISPLAY = "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif";
const BODY    = "var(--font-jost), 'Jost', sans-serif";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId      = searchParams.get('orderId');
  const orderNumber  = searchParams.get('order');

  return (
    <>
      <style>{`* { box-sizing: border-box; } body { margin: 0; background: #EDE3CC; }`}</style>

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

      {/* CONTENT */}
      <main style={{
        background: '#EDE3CC', minHeight: 'calc(100vh - 64px)',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{
          flex: 1, maxWidth: 560, margin: '0 auto', width: '100%',
          padding: '6rem 2rem', textAlign: 'center',
        }}>
          {/* Logo */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-dark.png" alt="Lotus House Blends"
            style={{ height: 80, display: 'block', margin: '0 auto 2rem' }} />

          {/* Check circle */}
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: '#4A6741', color: '#fff',
            fontSize: '1.75rem', lineHeight: 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 2rem',
          }}>
            ✓
          </div>

          <h1 style={{
            fontFamily: DISPLAY, fontSize: '2.5rem', fontWeight: 400,
            color: '#2A1E0E', margin: '0 0 .75rem', lineHeight: 1.2,
          }}>
            Order Confirmed
          </h1>

          {orderId && (
            <p style={{
              fontFamily: BODY, fontSize: '.8rem', color: '#7A6A50',
              letterSpacing: '.06em', margin: '.5rem 0 1rem',
            }}>
              Order #{orderNumber ? String(orderNumber).padStart(4, '0') : orderId.slice(0, 8).toUpperCase()}
            </p>
          )}

          <p style={{
            fontFamily: BODY, fontSize: '.9rem', color: '#4A3820',
            lineHeight: 1.7, margin: '0 0 2.5rem',
          }}>
            Thank you for your order. Lotus House Blends will be in touch
            to update you about your order shortly.
          </p>

          <Link href="/" style={{
            display: 'inline-block',
            background: '#1E3020', color: '#F2EBD9',
            padding: '.9rem 2.5rem', textDecoration: 'none',
            fontFamily: BODY, fontSize: '.75rem',
            letterSpacing: '.15em', textTransform: 'uppercase',
          }}>
            Continue Shopping
          </Link>
        </div>

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
      </main>
    </>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh', background: '#EDE3CC',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Jost', sans-serif", color: '#7A6A50',
      }}>
        Loading…
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
