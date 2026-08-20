import { notFound } from 'next/navigation';
import Link from 'next/link';
import sql from '@/lib/db';
import { buildTrackingUrl, type Carrier } from '@/lib/lhb-config';

const DISPLAY = "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif";
const BODY    = "var(--font-jost), 'Jost', sans-serif";

const STATUS_LABELS: Record<string, string> = {
  paid:       'Order Received',
  pending:    'Order Received',
  processing: 'Processing',
  shipped:    'Shipped',
  delivered:  'Delivered',
  cancelled:  'Cancelled',
};

const STATUS_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  paid:       { bg: 'rgba(200,168,130,0.12)', border: 'rgba(200,168,130,0.35)', text: '#C8A882' },
  pending:    { bg: 'rgba(200,168,130,0.12)', border: 'rgba(200,168,130,0.35)', text: '#C8A882' },
  processing: { bg: 'rgba(100,140,200,0.12)', border: 'rgba(100,140,200,0.35)', text: '#8aaad8' },
  shipped:    { bg: 'rgba(80,180,120,0.12)',  border: 'rgba(80,180,120,0.35)',  text: '#50b478' },
  delivered:  { bg: 'rgba(80,180,120,0.18)',  border: 'rgba(80,180,120,0.45)',  text: '#50b478' },
  cancelled:  { bg: 'rgba(200,80,80,0.12)',   border: 'rgba(200,80,80,0.35)',   text: '#c05050' },
};

export default async function OrderStatusPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;

  const rows = await sql`
    SELECT
      id, order_num,
      customer_name,
      status,
      tracking_number, tracking_carrier, tracking_url, shipped_at,
      total_cents, items,
      created_at
    FROM orders
    WHERE id = ${orderId}
  `;

  if (!rows[0]) notFound();

  const o = rows[0] as any;
  const items: Array<{ name: string; qty: number; price: number }> =
    typeof o.items === 'string' ? JSON.parse(o.items) : (o.items ?? []);

  const trackUrl: string | null =
    o.tracking_url ??
    (o.tracking_number && o.tracking_carrier
      ? buildTrackingUrl(o.tracking_carrier as Carrier, o.tracking_number)
      : null);

  const color = STATUS_COLORS[o.status] ?? STATUS_COLORS.pending;
  const label = STATUS_LABELS[o.status] ?? o.status;
  const ref   = `#${(o.order_num ?? o.id).toString().toUpperCase()}`;

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
          <img src="/logo-dark.png" alt="Lotus House Blends" style={{ height: 48, display: 'block' }} />
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem' }}>
          {[
            { label: 'Shop',      href: '/#shop' },
            { label: 'Our Story', href: '/about' },
            { label: 'Wholesale', href: '/wholesale' },
          ].map((l) => (
            <Link key={l.href} href={l.href} style={{
              color: 'rgba(255,255,255,.75)', textDecoration: 'none',
              fontFamily: BODY, fontSize: '.8rem', letterSpacing: '.1em', textTransform: 'uppercase',
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
          flex: 1, maxWidth: 600, margin: '0 auto', width: '100%',
          padding: '4rem 2rem',
        }}>
          <h1 style={{
            fontFamily: DISPLAY, fontSize: '2rem', fontWeight: 400,
            color: '#2A1E0E', margin: '0 0 .5rem',
          }}>
            Order Status
          </h1>
          <p style={{
            fontFamily: BODY, fontSize: '.8rem', color: '#7A6A50',
            letterSpacing: '.06em', margin: '0 0 2.5rem',
          }}>
            {ref}
          </p>

          {/* Status badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            background: color.bg, border: `1px solid ${color.border}`,
            padding: '10px 20px', marginBottom: '2rem',
          }}>
            {(o.status === 'shipped' || o.status === 'delivered') && (
              <span style={{ color: color.text, fontSize: '1rem' }}>✓</span>
            )}
            <span style={{
              fontFamily: BODY, fontSize: '.8rem', letterSpacing: '.1em',
              textTransform: 'uppercase', color: color.text,
            }}>
              {label}
            </span>
          </div>

          {/* Tracking section */}
          {(o.status === 'shipped' || o.status === 'delivered') && o.tracking_number && (
            <div style={{
              background: '#fff', border: '1px solid rgba(74,55,32,0.12)',
              padding: '24px', marginBottom: '2rem',
            }}>
              <p style={{
                fontFamily: BODY, fontSize: '.65rem', letterSpacing: '.14em',
                textTransform: 'uppercase', color: '#7A6A50', marginBottom: 12,
              }}>
                Shipment Details
              </p>
              <p style={{ fontFamily: BODY, fontSize: '.9rem', color: '#2A1E0E', marginBottom: 4 }}>
                <strong>{o.tracking_carrier}</strong>
                {' — '}
                <span style={{ fontFamily: 'monospace' }}>{o.tracking_number}</span>
              </p>
              {o.shipped_at && (
                <p style={{ fontFamily: BODY, fontSize: '.78rem', color: '#7A6A50', marginBottom: 16 }}>
                  Shipped {new Date(o.shipped_at as string).toLocaleDateString('en-US', {
                    month: 'long', day: 'numeric', year: 'numeric',
                  })}
                </p>
              )}
              {trackUrl && (
                <a
                  href={trackUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-block',
                    background: '#1E3020', color: '#F2EBD9',
                    padding: '.75rem 1.75rem', textDecoration: 'none',
                    fontFamily: BODY, fontSize: '.75rem',
                    letterSpacing: '.15em', textTransform: 'uppercase',
                  }}
                >
                  Track My Package →
                </a>
              )}
            </div>
          )}

          {/* Items */}
          <div style={{
            background: '#fff', border: '1px solid rgba(74,55,32,0.12)',
            padding: '24px', marginBottom: '2rem',
          }}>
            <p style={{
              fontFamily: BODY, fontSize: '.65rem', letterSpacing: '.14em',
              textTransform: 'uppercase', color: '#7A6A50', marginBottom: 16,
            }}>
              Items Ordered
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {items.map((item, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between',
                  fontFamily: BODY, fontSize: '.88rem',
                }}>
                  <span style={{ color: '#2A1E0E' }}>{item.name}</span>
                  <span style={{ color: '#7A6A50' }}>
                    x{item.qty} — ${(item.price * item.qty).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div style={{
              borderTop: '1px solid rgba(74,55,32,0.1)',
              marginTop: 16, paddingTop: 16,
              display: 'flex', justifyContent: 'space-between',
              fontFamily: BODY, fontSize: '.9rem',
            }}>
              <span style={{ color: '#2A1E0E', fontWeight: 500 }}>Total</span>
              <span style={{ color: '#2A1E0E', fontWeight: 500 }}>
                ${(o.total_cents / 100).toFixed(2)}
              </span>
            </div>
          </div>

          <Link href="/" style={{
            display: 'inline-block',
            background: 'transparent', color: '#4A3820',
            border: '1px solid rgba(74,55,32,0.3)',
            padding: '.75rem 1.75rem', textDecoration: 'none',
            fontFamily: BODY, fontSize: '.75rem',
            letterSpacing: '.12em', textTransform: 'uppercase',
          }}>
            ← Continue Shopping
          </Link>
        </div>

        {/* FOOTER */}
        <footer style={{
          background: '#1a1a18', borderTop: '1px solid rgba(200,168,130,.15)',
          padding: '1.5rem 2rem', textAlign: 'center',
        }}>
          <p style={{
            color: 'rgba(255,255,255,.35)', fontFamily: BODY,
            fontSize: '.75rem', marginBottom: '.35rem',
          }}>
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
