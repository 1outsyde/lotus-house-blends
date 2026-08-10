"use client";

import { useState, useEffect, useCallback } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { PRODUCTS, PRODUCT_MAP, Product } from "@/lib/products";
import {
  addToCart,
  getCart,
  setQty,
  removeFromCart,
  subscribe,
  CartItem,
} from "@/lib/cart";

// ─── Static Params ───────────────────────────────────────────────────────────
export async function generateStaticParams() {
  return PRODUCTS.map((p) => ({ product: p.slug }));
}

// ─── CSS Vars ────────────────────────────────────────────────────────────────
const CSS_VARS = `
  :root {
    --lhb-parchment: #f5f0e8;
    --lhb-parchment-dark: #ede5d0;
    --lhb-moss: #3d5a3e;
    --lhb-moss-light: #4e7350;
    --lhb-gold: #c8a882;
    --lhb-black: #1a1a18;
    --lhb-night: #2a2250;
    --lhb-midday: #3d5a3e;
    --lhb-morning: #8b4513;
    --font-display: var(--font-cormorant), 'Cormorant Garamond', Georgia, serif;
    --font-body: var(--font-jost), 'Jost', sans-serif;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: var(--lhb-parchment); color: #1a1a18; font-family: var(--font-body); }
`;

// ─── Blend Config ─────────────────────────────────────────────────────────────
const blendColors: Record<string, { bg: string; label: string }> = {
  night: { bg: "var(--lhb-night)", label: "Night Ritual" },
  midday: { bg: "var(--lhb-midday)", label: "Midday Ritual" },
  morning: { bg: "var(--lhb-morning)", label: "Morning Ritual" },
};

const typeLabels: Record<string, string> = {
  prerolls: "Herbal Cones",
  herbs: "Loose Herbs",
  tea: "Tea Box",
};

// ─── Bullet Points per Product ───────────────────────────────────────────────
const BULLETS: Record<string, string[]> = {
  "dt-cones": [
    "Eases stress and tension",
    "Promotes deep, restful sleep",
    "Supports dream clarity",
    "Relaxes the nervous system",
    "4 herbal cones per pack",
  ],
  "dt-herbs": [
    "Eases stress and tension",
    "Promotes deep sleep",
    "Calms inflammation from stress",
    "Loose blend for pipe or rolling",
  ],
  "dt-tea": [
    "Promotes deep, restful sleep",
    "Supports dream clarity",
    "Relaxes the nervous system",
    "Calms inflammation",
    "5 tea bags per box",
  ],
  "hf-herbs": [
    "Balances mood throughout the day",
    "Calms the nervous system",
    "Reduces hormonal inflammation",
    "Supports digestion",
    "Promotes emotional clarity",
  ],
  "hf-tea": [
    "Keeps you balanced and grounded",
    "Promotes emotional clarity",
    "Supports digestion",
    "Gentle midday blend",
    "5 tea bags per box",
  ],
  "hf-cones": [
    "Keeps you balanced and grounded",
    "Reduces hormonal inflammation",
    "Promotes emotional clarity",
    "4 herbal cones per pack",
  ],
  "rb-herbs": [
    "Clears brain fog",
    "Reduces inflammation",
    "Opens the lungs",
    "Supports focus and clarity",
    "Gently boosts energy",
  ],
  "rb-tea": [
    "Clears brain fog",
    "Reduces inflammation",
    "Opens the lungs",
    "Supports focus",
    "5 tea bags per box",
  ],
  "rb-cones": [
    "Clears brain fog",
    "Reduces inflammation",
    "Supports focus and clarity",
    "Gets the day moving",
    "4 herbal cones per pack",
  ],
};

// ─── Cart Drawer ─────────────────────────────────────────────────────────────
function CartDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setItems(getCart());
    return subscribe(() => setItems(getCart()));
  }, []);

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <>
      {open && (
        <div
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.45)",
            zIndex: 998,
          }}
        />
      )}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          height: "100vh",
          width: "min(420px, 100vw)",
          background: "var(--lhb-parchment)",
          zIndex: 999,
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform .35s cubic-bezier(.4,0,.2,1)",
          display: "flex",
          flexDirection: "column",
          boxShadow: "-4px 0 24px rgba(0,0,0,.15)",
        }}
      >
        <div
          style={{
            padding: "1.25rem 1.5rem",
            borderBottom: "1px solid var(--lhb-gold)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "var(--lhb-black)",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.4rem",
              color: "#fff",
              fontWeight: 500,
            }}
          >
            Your Cart
          </span>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "var(--lhb-gold)",
              fontSize: "1.5rem",
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "1rem 1.5rem" }}>
          {items.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "3rem 1rem",
                color: "#888",
              }}
            >
              <div style={{ fontSize: "2.5rem", marginBottom: ".75rem" }}>
                🌿
              </div>
              <p>Your cart is empty</p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  gap: "1rem",
                  padding: "1rem 0",
                  borderBottom: "1px solid rgba(200,168,130,.25)",
                }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    flexShrink: 0,
                    background: "var(--lhb-parchment-dark)",
                    borderRadius: "2px",
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    style={{ objectFit: "cover" }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "1rem",
                      fontWeight: 500,
                      marginBottom: ".2rem",
                    }}
                  >
                    {item.name}
                  </div>
                  <div
                    style={{
                      fontSize: ".8rem",
                      color: "var(--lhb-moss)",
                      marginBottom: ".5rem",
                    }}
                  >
                    ${item.price.toFixed(2)}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: ".5rem",
                    }}
                  >
                    <button
                      onClick={() => setQty(item.id, item.qty - 1)}
                      style={{
                        width: 24,
                        height: 24,
                        background: "var(--lhb-parchment-dark)",
                        border: "1px solid var(--lhb-gold)",
                        borderRadius: "2px",
                        cursor: "pointer",
                      }}
                    >
                      −
                    </button>
                    <span style={{ fontSize: ".9rem" }}>{item.qty}</span>
                    <button
                      onClick={() => setQty(item.id, item.qty + 1)}
                      style={{
                        width: 24,
                        height: 24,
                        background: "var(--lhb-parchment-dark)",
                        border: "1px solid var(--lhb-gold)",
                        borderRadius: "2px",
                        cursor: "pointer",
                      }}
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      style={{
                        marginLeft: ".25rem",
                        background: "none",
                        border: "none",
                        color: "#aaa",
                        cursor: "pointer",
                        fontSize: ".7rem",
                        textDecoration: "underline",
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1rem",
                    fontWeight: 600,
                    alignSelf: "flex-start",
                  }}
                >
                  ${(item.price * item.qty).toFixed(2)}
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div
            style={{
              padding: "1.25rem 1.5rem",
              borderTop: "1px solid var(--lhb-gold)",
              background: "#fff",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "1rem",
                fontFamily: "var(--font-display)",
                fontSize: "1.1rem",
              }}
            >
              <span>Subtotal</span>
              <span style={{ fontWeight: 600 }}>${subtotal.toFixed(2)}</span>
            </div>
            <Link
              href="/checkout"
              onClick={onClose}
              style={{
                display: "block",
                textAlign: "center",
                padding: ".85rem",
                background: "var(--lhb-moss)",
                color: "#fff",
                textDecoration: "none",
                borderRadius: "2px",
                fontFamily: "var(--font-body)",
                letterSpacing: ".1em",
                textTransform: "uppercase",
                fontSize: ".8rem",
              }}
            >
              Checkout
            </Link>
          </div>
        )}
      </div>
    </>
  );
}

// ─── Product Page Component ───────────────────────────────────────────────────
function ProductPageContent({ product }: { product: Product }) {
  const [qty, setQtyState] = useState(1);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [added, setAdded] = useState(false);

  const refreshCount = useCallback(() => {
    setCartCount(getCart().reduce((s, i) => s + i.qty, 0));
  }, []);

  useEffect(() => {
    refreshCount();
    return subscribe(refreshCount);
  }, [refreshCount]);

  const blend = blendColors[product.blend];
  const bullets = BULLETS[product.id] || [];

  const crossSell = PRODUCTS.filter(
    (p) => p.blend === product.blend && p.id !== product.id
  );

  const handleAdd = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      qty,
    });
    setAdded(true);
    setCartOpen(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <>
      <style>{CSS_VARS}</style>

      {/* NAV */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "var(--lhb-black)",
          borderBottom: "1px solid rgba(200,168,130,.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 2rem",
          height: 64,
        }}
      >
        <Link href="/">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-dark.png" alt="Lotus House Blends" width={140} />
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "1.75rem" }}>
          {[
            { label: "Shop", href: "/#shop" },
            { label: "Our Story", href: "/about" },
            { label: "Wholesale", href: "/wholesale" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                color: "rgba(255,255,255,.8)",
                textDecoration: "none",
                fontFamily: "var(--font-body)",
                fontSize: ".8rem",
                letterSpacing: ".1em",
                textTransform: "uppercase",
              }}
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={() => setCartOpen(true)}
            style={{
              background: "none",
              border: "1px solid rgba(200,168,130,.5)",
              borderRadius: "2px",
              color: "var(--lhb-gold)",
              cursor: "pointer",
              padding: ".45rem 1rem",
              fontFamily: "var(--font-body)",
              fontSize: ".75rem",
              letterSpacing: ".1em",
              textTransform: "uppercase",
              display: "flex",
              alignItems: "center",
              gap: ".4rem",
            }}
          >
            Cart
            {cartCount > 0 && (
              <span
                style={{
                  background: "var(--lhb-moss)",
                  color: "#fff",
                  borderRadius: "999px",
                  width: 18,
                  height: 18,
                  fontSize: ".65rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 600,
                }}
              >
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* BREADCRUMB */}
      <div
        style={{
          padding: ".75rem 2rem",
          background: "var(--lhb-parchment-dark)",
          borderBottom: "1px solid rgba(200,168,130,.2)",
          fontFamily: "var(--font-body)",
          fontSize: ".7rem",
          color: "#888",
          display: "flex",
          gap: ".5rem",
          alignItems: "center",
        }}
      >
        <Link href="/" style={{ color: "var(--lhb-moss)", textDecoration: "none" }}>
          Lotus House Blends
        </Link>
        <span>/</span>
        <span style={{ textTransform: "capitalize" }}>
          {product.blend.charAt(0).toUpperCase() + product.blend.slice(1)} Ritual
        </span>
        <span>/</span>
        <span>{typeLabels[product.type]}</span>
      </div>

      {/* PRODUCT DETAIL */}
      <div
        style={{
          maxWidth: 1100,
          margin: "3rem auto",
          padding: "0 2rem",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "4rem",
          alignItems: "start",
        }}
      >
        {/* Image */}
        <div
          style={{
            position: "relative",
            paddingBottom: "100%",
            background: "var(--lhb-parchment-dark)",
            borderRadius: "3px",
            overflow: "hidden",
          }}
        >
          <Image
            src={product.image}
            alt={product.name}
            fill
            style={{ objectFit: "cover" }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 16,
              left: 16,
              padding: ".3rem .85rem",
              borderRadius: "999px",
              background: blend.bg,
              color: "#fff",
              fontSize: ".7rem",
              fontFamily: "var(--font-body)",
              fontWeight: 500,
              letterSpacing: ".1em",
              textTransform: "uppercase",
            }}
          >
            {blend.label}
          </div>
        </div>

        {/* Details */}
        <div>
          <div
            style={{
              fontSize: ".65rem",
              color: "var(--lhb-gold)",
              fontFamily: "var(--font-body)",
              letterSpacing: ".15em",
              textTransform: "uppercase",
              marginBottom: ".6rem",
            }}
          >
            {typeLabels[product.type]}
          </div>

          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2rem, 4vw, 2.75rem)",
              fontWeight: 400,
              lineHeight: 1.2,
              marginBottom: ".75rem",
            }}
          >
            {product.name}
          </h1>

          <div
            style={{
              marginBottom: "1.5rem",
              display: "flex",
              alignItems: "baseline",
              gap: "1rem",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "2rem",
                fontWeight: 600,
              }}
            >
              ${product.price.toFixed(2)}
            </span>
            <span
              style={{
                fontSize: ".75rem",
                color: "var(--lhb-moss)",
                fontFamily: "var(--font-body)",
                letterSpacing: ".06em",
                padding: ".2rem .65rem",
                border: "1px solid rgba(61,90,62,.3)",
                borderRadius: "2px",
              }}
            >
              {product.bundleLabel}
            </span>
          </div>

          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: ".9rem",
              lineHeight: 1.8,
              color: "#555",
              marginBottom: "1.5rem",
            }}
          >
            {product.description}
          </p>

          {/* Bullets */}
          {bullets.length > 0 && (
            <ul
              style={{
                listStyle: "none",
                marginBottom: "2rem",
                padding: 0,
              }}
            >
              {bullets.map((b) => (
                <li
                  key={b}
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: ".85rem",
                    color: "#444",
                    padding: ".4rem 0",
                    borderBottom: "1px solid rgba(200,168,130,.15)",
                    display: "flex",
                    alignItems: "center",
                    gap: ".75rem",
                  }}
                >
                  <span style={{ color: "var(--lhb-moss)", fontSize: ".8rem" }}>
                    ✦
                  </span>
                  {b}
                </li>
              ))}
            </ul>
          )}

          {/* Quantity + Add to Cart */}
          <div
            style={{ display: "flex", gap: "1rem", alignItems: "center", marginBottom: "1rem" }}
          >
            <div
              style={{
                display: "flex",
                border: "1px solid rgba(200,168,130,.5)",
                borderRadius: "2px",
                overflow: "hidden",
              }}
            >
              <button
                onClick={() => setQtyState(Math.max(1, qty - 1))}
                style={{
                  width: 40,
                  height: 48,
                  background: "var(--lhb-parchment-dark)",
                  border: "none",
                  borderRight: "1px solid rgba(200,168,130,.5)",
                  cursor: "pointer",
                  fontSize: "1.1rem",
                }}
              >
                −
              </button>
              <div
                style={{
                  width: 50,
                  height: 48,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "var(--font-display)",
                  fontSize: "1.1rem",
                }}
              >
                {qty}
              </div>
              <button
                onClick={() => setQtyState(qty + 1)}
                style={{
                  width: 40,
                  height: 48,
                  background: "var(--lhb-parchment-dark)",
                  border: "none",
                  borderLeft: "1px solid rgba(200,168,130,.5)",
                  cursor: "pointer",
                  fontSize: "1.1rem",
                }}
              >
                +
              </button>
            </div>
            <button
              onClick={handleAdd}
              style={{
                flex: 1,
                height: 48,
                background: added ? "var(--lhb-moss-light)" : "var(--lhb-moss)",
                color: "#fff",
                border: "none",
                borderRadius: "2px",
                cursor: "pointer",
                fontFamily: "var(--font-body)",
                fontSize: ".8rem",
                letterSpacing: ".1em",
                textTransform: "uppercase",
                fontWeight: 500,
                transition: "background .2s",
              }}
            >
              {added
                ? "Added ✓"
                : `Add to Cart — $${(product.price * qty).toFixed(2)}`}
            </button>
          </div>
        </div>
      </div>

      {/* CROSS-SELL */}
      {crossSell.length > 0 && (
        <section
          style={{
            background: "var(--lhb-parchment-dark)",
            padding: "3rem 2rem",
            borderTop: "1px solid rgba(200,168,130,.25)",
          }}
        >
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.75rem",
                fontWeight: 400,
                textAlign: "center",
                marginBottom: "2rem",
              }}
            >
              Complete the{" "}
              <em style={{ color: "var(--lhb-moss)" }}>
                {product.blend.charAt(0).toUpperCase() + product.blend.slice(1)}
              </em>{" "}
              ritual
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: "1.5rem",
              }}
            >
              {crossSell.map((p) => (
                <Link
                  key={p.id}
                  href={`/${p.slug}`}
                  style={{
                    textDecoration: "none",
                    color: "inherit",
                    display: "block",
                    background: "#fff",
                    borderRadius: "3px",
                    overflow: "hidden",
                    border: "1px solid rgba(200,168,130,.2)",
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      paddingBottom: "70%",
                      background: "var(--lhb-parchment-dark)",
                      overflow: "hidden",
                    }}
                  >
                    <Image
                      src={p.image}
                      alt={p.name}
                      fill
                      style={{ objectFit: "cover" }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                  <div style={{ padding: "1rem" }}>
                    <div
                      style={{
                        fontSize: ".65rem",
                        color: "var(--lhb-gold)",
                        fontFamily: "var(--font-body)",
                        letterSpacing: ".1em",
                        textTransform: "uppercase",
                        marginBottom: ".3rem",
                      }}
                    >
                      {typeLabels[p.type]}
                    </div>
                    <h3
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "1.1rem",
                        fontWeight: 500,
                        marginBottom: ".4rem",
                      }}
                    >
                      {p.name}
                    </h3>
                    <div
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "1.15rem",
                        fontWeight: 600,
                      }}
                    >
                      ${p.price.toFixed(2)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer
        style={{
          background: "var(--lhb-black)",
          borderTop: "1px solid rgba(200,168,130,.15)",
          padding: "1.5rem 2rem",
          textAlign: "center",
        }}
      >
        <p
          style={{
            color: "rgba(255,255,255,.35)",
            fontFamily: "var(--font-body)",
            fontSize: ".75rem",
            marginBottom: ".35rem",
          }}
        >
          © 2026 Lotus House Blends ·{" "}
          <Link
            href="/"
            style={{
              color: "var(--lhb-gold)",
              textDecoration: "none",
              opacity: 0.7,
            }}
          >
            Back to Shop
          </Link>
        </p>
        <span
          style={{
            fontSize: ".6rem",
            color: "rgba(200,168,130,.3)",
            letterSpacing: ".08em",
          }}
        >
          Powered by Outsyde
        </span>
      </footer>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}

// ─── Page Export ─────────────────────────────────────────────────────────────
export default function ProductPage({
  params,
}: {
  params: { product: string };
}) {
  const product = PRODUCT_MAP[params.product];
  if (!product) notFound();
  return <ProductPageContent product={product} />;
}
