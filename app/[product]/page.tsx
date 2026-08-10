"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PRODUCT_MAP, PRODUCTS, Product } from "@/lib/products";
import { addToCart, getCart, subscribe, CartItem } from "@/lib/cart";

// ─── CSS ─────────────────────────────────────────────────────────────────────
const CSS = `
  :root {
    --lhb-parchment: #e8e0cc;
    --lhb-parchment-dark: #ddd5bb;
    --lhb-moss: #2d4a3e;
    --lhb-moss-light: #3d5a3e;
    --lhb-gold: #c8a035;
    --lhb-black: #1a1a18;
    --lhb-night: #7b5ea7;
    --lhb-night-muted: #ede8f8;
    --lhb-midday: #2d4a3e;
    --lhb-midday-muted: #e4ebe4;
    --lhb-morning: #8b4513;
    --lhb-morning-muted: #f3e2cb;
    --font-display: var(--font-cormorant), 'Cormorant Garamond', Georgia, serif;
    --font-body: var(--font-jost), 'Jost', sans-serif;
  }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { background: var(--lhb-parchment); color: var(--lhb-black); font-family: var(--font-body); }
`;

// ─── Blend meta ───────────────────────────────────────────────────────────────
const BLEND_META: Record<string, {
  label: string;
  badgeBg: string;
  badgeColor: string;
  note: string;
}> = {
  night: {
    label: "Night Blend",
    badgeBg: "var(--lhb-night-muted)",
    badgeColor: "#3a3168",
    note: "Ease into rest · Calm the nervous system",
  },
  midday: {
    label: "Midday Blend",
    badgeBg: "var(--lhb-midday-muted)",
    badgeColor: "#2d4a3e",
    note: "Stay balanced & grounded · Supports digestion",
  },
  morning: {
    label: "Morning Blend",
    badgeBg: "var(--lhb-morning-muted)",
    badgeColor: "#6b3010",
    note: "Clear the mind · Get the day moving",
  },
};

const TYPE_LABEL: Record<string, string> = {
  prerolls: "Herbal Cones",
  herbs: "Loose Herbs",
  tea: "Tea Box",
};

const BLEND_NAME: Record<string, string> = {
  night: "Dream Temple",
  midday: "Heart Flow",
  morning: "Rise & Bloom",
};

// ─── Related products (same blend, different type) ────────────────────────────
function getRelated(current: Product): Product[] {
  return PRODUCTS.filter(
    (p) => p.blend === current.blend && p.id !== current.id
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ProductPage() {
  const params = useParams();
  const slug = Array.isArray(params.product) ? params.product[0] : params.product as string;
  const product = PRODUCT_MAP[slug];

  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const refreshCount = useCallback(() => {
    setCartCount(getCart().reduce((s: number, i: CartItem) => s + i.qty, 0));
  }, []);

  useEffect(() => {
    refreshCount();
    return subscribe(refreshCount);
  }, [refreshCount]);

  // Reset added state when product changes
  useEffect(() => {
    setAdded(false);
    setQty(1);
  }, [slug]);

  if (!product) {
    return (
      <>
        <style>{CSS}</style>
        <nav style={{
          background: "var(--lhb-black)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 2rem", height: 64,
        }}>
          <Link href="/">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-dark.png" alt="Lotus House Blends" width={140} style={{ display: "block" }} />
          </Link>
        </nav>
        <div style={{ maxWidth: 600, margin: "6rem auto", textAlign: "center", padding: "0 1.5rem" }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2.4rem", fontWeight: 400, marginBottom: "1rem" }}>
            Blend not found
          </h1>
          <p style={{ color: "#777", marginBottom: "1.5rem", fontFamily: "var(--font-body)" }}>
            We couldn&rsquo;t find that product.
          </p>
          <Link href="/#shop" style={{
            display: "inline-block", padding: ".75rem 2rem",
            background: "var(--lhb-moss)", color: "#fff", textDecoration: "none",
            borderRadius: "2px", fontFamily: "var(--font-body)",
            fontSize: ".8rem", letterSpacing: ".1em", textTransform: "uppercase",
          }}>
            Browse All Blends
          </Link>
        </div>
      </>
    );
  }

  const blend = BLEND_META[product.blend];
  const related = getRelated(product);

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        qty: 1,
      });
    }
    setAdded(true);
  };

  return (
    <>
      <style>{CSS}</style>

      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "var(--lhb-black)",
        borderBottom: "1px solid rgba(200,168,130,.2)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 2rem", height: 64,
      }}>
        <Link href="/">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-dark.png" alt="Lotus House Blends" width={140} style={{ display: "block" }} />
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <Link href="/#shop" style={{
            color: "rgba(255,255,255,.7)", textDecoration: "none",
            fontFamily: "var(--font-body)", fontSize: ".75rem",
            letterSpacing: ".1em", textTransform: "uppercase",
          }}>
            ← All Blends
          </Link>
          <Link href="/checkout" style={{
            color: "var(--lhb-gold)", textDecoration: "none",
            fontFamily: "var(--font-body)", fontSize: ".75rem",
            letterSpacing: ".1em", textTransform: "uppercase",
            display: "flex", alignItems: "center", gap: ".4rem",
          }}>
            Cart
            {cartCount > 0 && (
              <span style={{
                background: "var(--lhb-moss)", color: "#fff",
                borderRadius: "999px", width: 18, height: 18,
                fontSize: ".62rem", display: "inline-flex",
                alignItems: "center", justifyContent: "center", fontWeight: 600,
              }}>
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </nav>

      {/* ── BREADCRUMB ──────────────────────────────────────────────────── */}
      <div style={{
        maxWidth: 1100, margin: "0 auto", padding: "1.25rem 1.5rem 0",
        fontFamily: "var(--font-body)", fontSize: ".72rem",
        color: "#999", letterSpacing: ".06em",
      }}>
        <Link href="/" style={{ color: "#999", textDecoration: "none" }}>Home</Link>
        {" / "}
        <Link href="/#shop" style={{ color: "#999", textDecoration: "none" }}>Shop</Link>
        {" / "}
        <Link href="/#shop" style={{ color: "#999", textDecoration: "none" }}>
          {BLEND_NAME[product.blend]}
        </Link>
        {" / "}
        <span style={{ color: "var(--lhb-black)" }}>{TYPE_LABEL[product.type]}</span>
      </div>

      {/* ── PRODUCT DETAIL ──────────────────────────────────────────────── */}
      <div style={{
        maxWidth: 1100, margin: "2rem auto",
        padding: "0 1.5rem 4rem",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "3.5rem",
        alignItems: "start",
      }}>
        {/* Left — image */}
        <div style={{
          position: "relative",
          background: "var(--lhb-parchment-dark)",
          border: "1px solid rgba(90,62,30,.12)",
        }}>
          {/* Blend time badge */}
          <div style={{
            position: "absolute", top: "1rem", left: "1rem", zIndex: 2,
            fontSize: ".58rem", letterSpacing: ".18em", textTransform: "uppercase",
            padding: ".4rem .75rem",
            background: blend.badgeBg,
            color: blend.badgeColor,
            fontFamily: "var(--font-body)", fontWeight: 500,
          }}>
            {blend.label}
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.image}
            alt={product.name}
            style={{
              display: "block", width: "100%",
              aspectRatio: "1/1", objectFit: "contain", padding: "2.5rem",
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.opacity = "0.3";
            }}
          />
        </div>

        {/* Right — info */}
        <div style={{ paddingTop: ".5rem" }}>
          {/* Eyebrow */}
          <div style={{
            fontSize: ".68rem", letterSpacing: ".22em", textTransform: "uppercase",
            color: "var(--lhb-moss)", fontFamily: "var(--font-body)",
            fontWeight: 500, marginBottom: ".85rem",
          }}>
            {BLEND_NAME[product.blend]} · {blend.note}
          </div>

          {/* Title */}
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2rem, 4vw, 2.8rem)",
            fontWeight: 500, lineHeight: 1.05, marginBottom: ".4rem",
          }}>
            {product.name}
          </h1>

          {/* Format */}
          <div style={{
            fontSize: ".8rem", color: "#888",
            fontFamily: "var(--font-body)", fontStyle: "italic", marginBottom: "1.5rem",
          }}>
            {TYPE_LABEL[product.type]}
          </div>

          {/* Price row */}
          <div style={{ display: "flex", alignItems: "baseline", gap: "1rem", marginBottom: ".5rem" }}>
            <span style={{
              fontFamily: "var(--font-display)",
              fontSize: "2rem", fontWeight: 600,
            }}>
              ${product.price.toFixed(2)}
            </span>
            <span style={{
              fontSize: ".74rem", letterSpacing: ".05em",
              color: "var(--lhb-moss)", background: "rgba(45,74,62,.1)",
              padding: ".3rem .7rem", fontFamily: "var(--font-body)",
            }}>
              {product.bundleLabel}
            </span>
          </div>

          {/* Description */}
          <p style={{
            fontSize: ".95rem", lineHeight: 1.8,
            color: "#555", fontFamily: "var(--font-body)",
            fontWeight: 300, margin: "1.5rem 0",
            maxWidth: "46ch",
          }}>
            {product.description}
          </p>

          {/* Divider */}
          <div style={{ height: 1, background: "rgba(90,62,30,.15)", margin: "1.75rem 0" }} />

          {/* Details */}
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: ".55rem", marginBottom: "2rem" }}>
            {[
              product.type === "prerolls" ? "4 herbal cones per pack" :
              product.type === "tea" ? "5 tea bags per box" : "Loose botanical blend",
              `${BLEND_NAME[product.blend]} — ${blend.label}`,
              "No tobacco · No nicotine · No cannabis",
              "100% herbal · Ethically sourced",
            ].map((detail) => (
              <li key={detail} style={{
                fontSize: ".82rem", color: "#555",
                fontFamily: "var(--font-body)", fontWeight: 300,
                display: "flex", alignItems: "center", gap: ".6rem",
              }}>
                <span style={{
                  width: 5, height: 5, borderRadius: "50%",
                  background: "var(--lhb-moss)", flexShrink: 0, display: "inline-block",
                }} />
                {detail}
              </li>
            ))}
          </ul>

          {/* Buy controls */}
          <div style={{ display: "flex", alignItems: "stretch", gap: ".85rem", flexWrap: "wrap" }}>
            {/* Qty stepper */}
            <div style={{
              display: "flex", alignItems: "center",
              border: "1px solid rgba(90,62,30,.3)", background: "#fff",
            }}>
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                style={{
                  width: 44, height: 48, border: "none", background: "none",
                  cursor: "pointer", fontSize: "1.1rem", color: "var(--lhb-black)",
                  lineHeight: 1,
                }}
              >
                −
              </button>
              <span style={{
                minWidth: 38, textAlign: "center",
                fontFamily: "var(--font-display)", fontSize: "1rem",
              }}>
                {qty}
              </span>
              <button
                onClick={() => setQty((q) => q + 1)}
                aria-label="Increase quantity"
                style={{
                  width: 44, height: 48, border: "none", background: "none",
                  cursor: "pointer", fontSize: "1.1rem", color: "var(--lhb-black)",
                  lineHeight: 1,
                }}
              >
                +
              </button>
            </div>

            {/* Add to cart */}
            <button
              onClick={handleAdd}
              style={{
                flex: 1, minWidth: 200,
                background: "var(--lhb-moss)", color: "var(--lhb-parchment)",
                border: "none", padding: "0 2rem", height: 48,
                fontFamily: "var(--font-body)", fontSize: ".78rem",
                letterSpacing: ".16em", textTransform: "uppercase",
                fontWeight: 500, cursor: "pointer", transition: "background .2s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "var(--lhb-black)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "var(--lhb-moss)";
              }}
            >
              Add to Cart — ${(product.price * qty).toFixed(2)}
            </button>
          </div>

          {/* Added confirmation */}
          {added && (
            <div style={{
              background: "#fff", border: "1px solid var(--lhb-moss)",
              padding: "1.1rem 1.25rem", marginTop: "1.25rem",
              display: "flex", alignItems: "center",
              justifyContent: "space-between", gap: "1rem", flexWrap: "wrap",
            }}>
              <span style={{
                fontSize: ".86rem", color: "var(--lhb-moss)",
                fontWeight: 500, fontFamily: "var(--font-body)",
                display: "flex", alignItems: "center", gap: ".5rem",
              }}>
                ✓ Added to your cart
              </span>
              <div style={{ display: "flex", gap: ".6rem" }}>
                <Link href="/" style={{
                  fontSize: ".72rem", letterSpacing: ".1em", textTransform: "uppercase",
                  textDecoration: "none", padding: ".55rem 1rem",
                  color: "#555", border: "1px solid rgba(90,62,30,.3)",
                  fontFamily: "var(--font-body)",
                }}>
                  Keep Shopping
                </Link>
                <Link href="/checkout" style={{
                  fontSize: ".72rem", letterSpacing: ".1em", textTransform: "uppercase",
                  textDecoration: "none", padding: ".55rem 1rem",
                  background: "var(--lhb-moss)", color: "var(--lhb-parchment)",
                  fontFamily: "var(--font-body)",
                }}>
                  Checkout
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── RELATED / COMPLETE THE RITUAL ───────────────────────────────── */}
      {related.length > 0 && (
        <section style={{
          maxWidth: 1100, margin: "0 auto", padding: "0 1.5rem 5rem",
        }}>
          <div style={{ borderTop: "1px solid rgba(90,62,30,.15)", paddingTop: "3rem", marginBottom: "1.5rem" }}>
            <h2 style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.8rem", fontWeight: 500,
              marginBottom: ".4rem",
            }}>
              Complete the{" "}
              <em style={{ color: "var(--lhb-moss)", fontStyle: "italic" }}>
                {BLEND_NAME[product.blend]}
              </em>{" "}ritual
            </h2>
            <p style={{
              fontSize: ".78rem", color: "#888",
              fontFamily: "var(--font-body)", letterSpacing: ".04em",
            }}>
              More from the {blend.label.toLowerCase()}.
            </p>
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "1.25rem",
          }}>
            {related.map((r) => (
              <Link
                key={r.id}
                href={`/${r.slug}`}
                style={{
                  display: "flex", gap: "1rem", alignItems: "center",
                  background: "var(--lhb-parchment-dark)",
                  border: "1px solid rgba(90,62,30,.12)",
                  padding: "1rem", textDecoration: "none",
                  transition: "border-color .2s, transform .15s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--lhb-moss)";
                  (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(90,62,30,.12)";
                  (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={r.image}
                  alt={r.name}
                  style={{ width: 72, height: 72, objectFit: "contain", background: "#fff", flexShrink: 0 }}
                  onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0.3"; }}
                />
                <div>
                  <div style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.1rem", color: "var(--lhb-black)", lineHeight: 1.2,
                  }}>
                    {r.name}
                  </div>
                  <div style={{
                    fontSize: ".74rem", color: "#888",
                    fontFamily: "var(--font-body)", marginTop: ".3rem",
                  }}>
                    {TYPE_LABEL[r.type]} · ${r.price.toFixed(2)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer style={{
        background: "var(--lhb-black)",
        borderTop: "1px solid rgba(200,168,130,.15)",
        padding: "1.5rem 2rem", textAlign: "center",
      }}>
        <p style={{
          color: "rgba(255,255,255,.35)",
          fontFamily: "var(--font-body)", fontSize: ".75rem", marginBottom: ".35rem",
        }}>
          © 2026 Lotus House Blends
        </p>
        <span style={{
          fontSize: ".6rem", color: "rgba(200,168,130,.3)", letterSpacing: ".08em",
        }}>
          Powered by Outsyde
        </span>
      </footer>
    </>
  );
}