"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { PRODUCTS, Product } from "@/lib/products";
import {
  addToCart,
  getCart,
  setQty,
  removeFromCart,
  subscribe,
  CartItem,
} from "@/lib/cart";

// ─── CSS Variables ──────────────────────────────────────────────────────────
const CSS_VARS = `
  :root {
    --lhb-parchment: #f5f0e8;
    --lhb-parchment-dark: #ede5d0;
    --lhb-moss: #3d5a3e;
    --lhb-moss-light: #4e7350;
    --lhb-gold: #c8a882;
    --lhb-gold-light: #d4b896;
    --lhb-black: #1a1a18;
    --lhb-night: #2a2250;
    --lhb-midday: #3d5a3e;
    --lhb-morning: #8b4513;
    --font-display: var(--font-cormorant), 'Cormorant Garamond', Georgia, serif;
    --font-body: var(--font-jost), 'Jost', sans-serif;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { background: var(--lhb-parchment); color: var(--lhb-black); font-family: var(--font-body); }
`;

// ─── Blend Colors ────────────────────────────────────────────────────────────
const blendColors: Record<string, { bg: string; label: string }> = {
  night: { bg: "var(--lhb-night)", label: "Night" },
  midday: { bg: "var(--lhb-midday)", label: "Midday" },
  morning: { bg: "var(--lhb-morning)", label: "Morning" },
};

// ─── Type Labels ─────────────────────────────────────────────────────────────
const typeLabels: Record<string, string> = {
  prerolls: "Herbal Cones",
  herbs: "Loose Herbs",
  tea: "Tea Box",
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
        {/* Header */}
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
              letterSpacing: ".04em",
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
              lineHeight: 1,
            }}
            aria-label="Close cart"
          >
            ×
          </button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1rem 1.5rem" }}>
          {items.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "3rem 1rem",
                color: "#888",
                fontFamily: "var(--font-body)",
              }}
            >
              <div style={{ fontSize: "2.5rem", marginBottom: ".75rem" }}>
                🌿
              </div>
              <p>Your cart is empty</p>
              <button
                onClick={onClose}
                style={{
                  marginTop: "1.5rem",
                  padding: ".6rem 1.5rem",
                  background: "var(--lhb-moss)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "2px",
                  cursor: "pointer",
                  fontFamily: "var(--font-body)",
                  letterSpacing: ".06em",
                  textTransform: "uppercase",
                  fontSize: ".75rem",
                }}
              >
                Continue Shopping
              </button>
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
                    width: 72,
                    height: 72,
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
                      fontSize: "1.05rem",
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
                        width: 26,
                        height: 26,
                        background: "var(--lhb-parchment-dark)",
                        border: "1px solid var(--lhb-gold)",
                        borderRadius: "2px",
                        cursor: "pointer",
                        fontSize: "1rem",
                        lineHeight: 1,
                      }}
                    >
                      −
                    </button>
                    <span style={{ fontSize: ".9rem", minWidth: 20, textAlign: "center" }}>
                      {item.qty}
                    </span>
                    <button
                      onClick={() => setQty(item.id, item.qty + 1)}
                      style={{
                        width: 26,
                        height: 26,
                        background: "var(--lhb-parchment-dark)",
                        border: "1px solid var(--lhb-gold)",
                        borderRadius: "2px",
                        cursor: "pointer",
                        fontSize: "1rem",
                        lineHeight: 1,
                      }}
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      style={{
                        marginLeft: ".5rem",
                        background: "none",
                        border: "none",
                        color: "#aaa",
                        cursor: "pointer",
                        fontSize: ".75rem",
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
                    fontSize: "1.05rem",
                    fontWeight: 600,
                    alignSelf: "flex-start",
                    paddingTop: "2px",
                  }}
                >
                  ${(item.price * item.qty).toFixed(2)}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
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
                fontWeight: 500,
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

// ─── Product Card ────────────────────────────────────────────────────────────
function ProductCard({ product }: { product: Product }) {
  const blend = blendColors[product.blend];

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      qty: 1,
    });
  };

  return (
    <Link
      href={`/${product.slug}`}
      style={{ textDecoration: "none", color: "inherit", display: "block" }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "3px",
          overflow: "hidden",
          transition: "transform .2s, box-shadow .2s",
          cursor: "pointer",
          border: "1px solid rgba(200,168,130,.2)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.transform =
            "translateY(-4px)";
          (e.currentTarget as HTMLDivElement).style.boxShadow =
            "0 12px 32px rgba(0,0,0,.1)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
          (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
        }}
      >
        {/* Image */}
        <div
          style={{
            position: "relative",
            paddingBottom: "100%",
            background: "var(--lhb-parchment-dark)",
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
          {/* Blend badge */}
          <div
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              padding: ".2rem .65rem",
              borderRadius: "999px",
              background: blend.bg,
              color: "#fff",
              fontSize: ".65rem",
              fontFamily: "var(--font-body)",
              fontWeight: 500,
              letterSpacing: ".1em",
              textTransform: "uppercase",
            }}
          >
            {blend.label}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: "1.1rem" }}>
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
            {typeLabels[product.type]}
          </div>
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.15rem",
              fontWeight: 500,
              marginBottom: ".4rem",
              lineHeight: 1.3,
            }}
          >
            {product.name}
          </h3>
          <p
            style={{
              fontSize: ".8rem",
              color: "#666",
              lineHeight: 1.55,
              marginBottom: ".9rem",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {product.description}
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.25rem",
                  fontWeight: 600,
                  color: "var(--lhb-black)",
                }}
              >
                ${product.price.toFixed(2)}
              </div>
              <div
                style={{
                  fontSize: ".6rem",
                  color: "var(--lhb-moss)",
                  letterSpacing: ".06em",
                  fontFamily: "var(--font-body)",
                }}
              >
                {product.bundleLabel}
              </div>
            </div>
            <button
              onClick={handleAdd}
              style={{
                padding: ".5rem 1rem",
                background: "var(--lhb-moss)",
                color: "#fff",
                border: "none",
                borderRadius: "2px",
                cursor: "pointer",
                fontFamily: "var(--font-body)",
                fontSize: ".7rem",
                letterSpacing: ".08em",
                textTransform: "uppercase",
                fontWeight: 500,
                transition: "background .2s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "var(--lhb-moss-light)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "var(--lhb-moss)";
              }}
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function HomePage() {
  const [cartOpen, setCartOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [activeBlend, setActiveBlend] = useState<string>("all");
  const [activeType, setActiveType] = useState<string>("all");

  const refreshCount = useCallback(() => {
    setCartCount(getCart().reduce((s, i) => s + i.qty, 0));
  }, []);

  useEffect(() => {
    refreshCount();
    return subscribe(refreshCount);
  }, [refreshCount]);

  const blends = ["all", "morning", "midday", "night"];
  const types = ["all", "prerolls", "herbs", "tea"];

  const filtered = PRODUCTS.filter((p) => {
    if (activeBlend !== "all" && p.blend !== activeBlend) return false;
    if (activeType !== "all" && p.type !== activeType) return false;
    return true;
  });

  return (
    <>
      <style>{CSS_VARS}</style>

      {/* ── NAV ─────────────────────────────────────────────────────────── */}
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
          <img
            src="/logo-dark.png"
            alt="Lotus House Blends"
            width={140}
            style={{ display: "block" }}
          />
        </Link>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1.75rem",
          }}
        >
          <Link
            href="#shop"
            style={{
              color: "rgba(255,255,255,.8)",
              textDecoration: "none",
              fontFamily: "var(--font-body)",
              fontSize: ".8rem",
              letterSpacing: ".1em",
              textTransform: "uppercase",
              transition: "color .2s",
            }}
            onMouseEnter={(e) =>
              ((e.target as HTMLAnchorElement).style.color = "#fff")
            }
            onMouseLeave={(e) =>
              ((e.target as HTMLAnchorElement).style.color = "rgba(255,255,255,.8)")
            }
          >
            Shop
          </Link>
          <Link
            href="/about"
            style={{
              color: "rgba(255,255,255,.8)",
              textDecoration: "none",
              fontFamily: "var(--font-body)",
              fontSize: ".8rem",
              letterSpacing: ".1em",
              textTransform: "uppercase",
              transition: "color .2s",
            }}
            onMouseEnter={(e) =>
              ((e.target as HTMLAnchorElement).style.color = "#fff")
            }
            onMouseLeave={(e) =>
              ((e.target as HTMLAnchorElement).style.color = "rgba(255,255,255,.8)")
            }
          >
            Our Story
          </Link>
          <Link
            href="/wholesale"
            style={{
              color: "rgba(255,255,255,.8)",
              textDecoration: "none",
              fontFamily: "var(--font-body)",
              fontSize: ".8rem",
              letterSpacing: ".1em",
              textTransform: "uppercase",
              transition: "color .2s",
            }}
            onMouseEnter={(e) =>
              ((e.target as HTMLAnchorElement).style.color = "#fff")
            }
            onMouseLeave={(e) =>
              ((e.target as HTMLAnchorElement).style.color = "rgba(255,255,255,.8)")
            }
          >
            Wholesale
          </Link>
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
              transition: "border-color .2s, color .2s",
            }}
            aria-label="Open cart"
          >
            <span>Cart</span>
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

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section
        style={{
          position: "relative",
          minHeight: "90vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          background: "var(--lhb-black)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            overflow: "hidden",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/lifestyle-ritual.jpg"
            alt="Lotus ritual"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 0.45,
            }}
          />
        </div>
        <div
          style={{
            position: "relative",
            textAlign: "center",
            padding: "3rem 2rem",
            maxWidth: 680,
          }}
        >
          {/* Eyebrow */}
          <div
            style={{
              display: "inline-block",
              border: "1px solid rgba(200,168,130,.5)",
              padding: ".3rem 1.2rem",
              marginBottom: "1.5rem",
              fontFamily: "var(--font-body)",
              fontSize: ".7rem",
              letterSpacing: ".2em",
              textTransform: "uppercase",
              color: "var(--lhb-gold)",
            }}
          >
            Herbal · Botanical · Intentional
          </div>

          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(3rem, 8vw, 6rem)",
              fontWeight: 300,
              color: "#fff",
              lineHeight: 1.1,
              marginBottom: "1.25rem",
              letterSpacing: ".02em",
            }}
          >
            Lotus House
            <br />
            <em style={{ fontStyle: "italic" }}>Blends</em>
          </h1>

          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "1rem",
              color: "rgba(255,255,255,.75)",
              lineHeight: 1.7,
              marginBottom: "2.25rem",
              fontWeight: 300,
            }}
          >
            Handcrafted herbal blends for every ritual of your day.
            <br />
            Morning clarity. Midday balance. Night restoration.
          </p>

          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              href="#shop"
              style={{
                padding: ".85rem 2.25rem",
                background: "var(--lhb-moss)",
                color: "#fff",
                textDecoration: "none",
                borderRadius: "2px",
                fontFamily: "var(--font-body)",
                fontSize: ".8rem",
                letterSpacing: ".12em",
                textTransform: "uppercase",
                fontWeight: 500,
                transition: "background .2s",
              }}
            >
              Shop the Collection
            </Link>
            <Link
              href="/about"
              style={{
                padding: ".85rem 2.25rem",
                background: "transparent",
                color: "#fff",
                textDecoration: "none",
                borderRadius: "2px",
                border: "1px solid rgba(255,255,255,.4)",
                fontFamily: "var(--font-body)",
                fontSize: ".8rem",
                letterSpacing: ".12em",
                textTransform: "uppercase",
                transition: "border-color .2s",
              }}
            >
              Our Story
            </Link>
          </div>
        </div>
      </section>

      {/* ── BRAND BAR ───────────────────────────────────────────────────── */}
      <div
        style={{
          background: "var(--lhb-parchment-dark)",
          borderTop: "1px solid rgba(200,168,130,.3)",
          borderBottom: "1px solid rgba(200,168,130,.3)",
          padding: ".75rem 2rem",
          display: "flex",
          justifyContent: "center",
          gap: "3rem",
          flexWrap: "wrap",
        }}
      >
        {["100% Herbal", "Small Batch", "Est. 2024 · Wellness", "No Additives"].map(
          (badge) => (
            <span
              key={badge}
              style={{
                fontFamily: "var(--font-body)",
                fontSize: ".7rem",
                letterSpacing: ".15em",
                textTransform: "uppercase",
                color: "var(--lhb-moss)",
                fontWeight: 500,
              }}
            >
              {badge}
            </span>
          )
        )}
      </div>

      {/* ── ABOUT STRIP ─────────────────────────────────────────────────── */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          minHeight: 480,
        }}
      >
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            background: "var(--lhb-parchment-dark)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/lifestyle-model.jpg"
            alt="Ritual lifestyle"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
        <div
          style={{
            padding: "4rem 3rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            background: "var(--lhb-parchment)",
          }}
        >
          <div
            style={{
              fontSize: ".65rem",
              letterSpacing: ".2em",
              textTransform: "uppercase",
              color: "var(--lhb-gold)",
              fontFamily: "var(--font-body)",
              marginBottom: "1rem",
            }}
          >
            Founded on Ritual
          </div>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 400,
              lineHeight: 1.2,
              marginBottom: "1.25rem",
            }}
          >
            Blended with intention.
            <br />
            <em style={{ color: "var(--lhb-moss)" }}>Crafted with care.</em>
          </h2>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: ".9rem",
              lineHeight: 1.8,
              color: "#555",
              marginBottom: "1rem",
            }}
          >
            Lotus House Blends was born from a deep reverence for the healing
            power of plants. Every blend is crafted to support you through the
            natural rhythms of your day — from the first breath of morning to
            the quiet surrender of night.
          </p>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: ".9rem",
              lineHeight: 1.8,
              color: "#555",
              marginBottom: "2rem",
            }}
          >
            We work exclusively with organic, ethically sourced herbs — no
            fillers, no synthetics, no shortcuts. Just pure botanical intention
            in every cone, sachet, and tea bag.
          </p>
          <Link
            href="/about"
            style={{
              display: "inline-block",
              padding: ".75rem 1.75rem",
              border: "1px solid var(--lhb-moss)",
              color: "var(--lhb-moss)",
              textDecoration: "none",
              fontFamily: "var(--font-body)",
              fontSize: ".75rem",
              letterSpacing: ".12em",
              textTransform: "uppercase",
              borderRadius: "2px",
              alignSelf: "flex-start",
              transition: "background .2s, color .2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background =
                "var(--lhb-moss)";
              (e.currentTarget as HTMLAnchorElement).style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background =
                "transparent";
              (e.currentTarget as HTMLAnchorElement).style.color =
                "var(--lhb-moss)";
            }}
          >
            Read Our Story
          </Link>
        </div>
      </section>

      {/* ── VALUES PILLARS ──────────────────────────────────────────────── */}
      <section
        style={{
          background: "var(--lhb-black)",
          padding: "4rem 2rem",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "2rem",
          textAlign: "center",
        }}
      >
        {[
          {
            icon: "🌿",
            title: "Natural",
            desc: "Organic, ethically sourced herbs. Nothing artificial. Ever.",
          },
          {
            icon: "🧘",
            title: "Mindful",
            desc: "Each blend supports a specific state of being — not just a flavor.",
          },
          {
            icon: "🌸",
            title: "Ritual",
            desc: "Designed to be woven into the sacred rhythms of your daily life.",
          },
        ].map((v) => (
          <div key={v.title} style={{ padding: "1rem" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>
              {v.icon}
            </div>
            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.5rem",
                color: "#fff",
                fontWeight: 400,
                marginBottom: ".6rem",
                letterSpacing: ".04em",
              }}
            >
              {v.title}
            </h3>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: ".85rem",
                color: "rgba(255,255,255,.6)",
                lineHeight: 1.7,
              }}
            >
              {v.desc}
            </p>
          </div>
        ))}
      </section>

      {/* ── SHOP SECTION ────────────────────────────────────────────────── */}
      <section id="shop" style={{ padding: "5rem 2rem" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          {/* Section header */}
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <div
              style={{
                fontSize: ".65rem",
                letterSpacing: ".2em",
                textTransform: "uppercase",
                color: "var(--lhb-gold)",
                fontFamily: "var(--font-body)",
                marginBottom: ".75rem",
              }}
            >
              The Collection
            </div>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2rem, 5vw, 3.5rem)",
                fontWeight: 400,
                marginBottom: "1rem",
              }}
            >
              Shop by Ritual
            </h2>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: ".9rem",
                color: "#666",
                maxWidth: 500,
                margin: "0 auto",
                lineHeight: 1.7,
              }}
            >
              Three blends. Three times of day. Every format you need — loose
              herbs, herbal cones, and tea boxes.
            </p>
          </div>

          {/* Filters */}
          <div
            style={{
              display: "flex",
              gap: "1rem",
              justifyContent: "center",
              flexWrap: "wrap",
              marginBottom: "2.5rem",
            }}
          >
            {/* Blend filter */}
            <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
              {blends.map((b) => (
                <button
                  key={b}
                  onClick={() => setActiveBlend(b)}
                  style={{
                    padding: ".4rem 1rem",
                    border: "1px solid",
                    borderColor:
                      activeBlend === b ? "var(--lhb-moss)" : "rgba(200,168,130,.4)",
                    borderRadius: "2px",
                    background: activeBlend === b ? "var(--lhb-moss)" : "transparent",
                    color: activeBlend === b ? "#fff" : "var(--lhb-black)",
                    fontFamily: "var(--font-body)",
                    fontSize: ".7rem",
                    letterSpacing: ".1em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    transition: "all .2s",
                  }}
                >
                  {b === "all" ? "All Blends" : b.charAt(0).toUpperCase() + b.slice(1)}
                </button>
              ))}
            </div>
            <div
              style={{
                width: 1,
                background: "rgba(200,168,130,.4)",
                margin: "0 .5rem",
              }}
            />
            {/* Type filter */}
            <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
              {types.map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveType(t)}
                  style={{
                    padding: ".4rem 1rem",
                    border: "1px solid",
                    borderColor:
                      activeType === t ? "var(--lhb-gold)" : "rgba(200,168,130,.4)",
                    borderRadius: "2px",
                    background: activeType === t ? "var(--lhb-gold)" : "transparent",
                    color: activeType === t ? "var(--lhb-black)" : "var(--lhb-black)",
                    fontFamily: "var(--font-body)",
                    fontSize: ".7rem",
                    letterSpacing: ".1em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    transition: "all .2s",
                  }}
                >
                  {t === "all"
                    ? "All Types"
                    : t === "prerolls"
                    ? "Herbal Cones"
                    : t === "herbs"
                    ? "Loose Herbs"
                    : "Tea Boxes"}
                </button>
              ))}
            </div>
          </div>

          {/* Product grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "3rem",
                color: "#888",
                fontFamily: "var(--font-body)",
              }}
            >
              No products match that filter combination.
            </div>
          )}
        </div>
      </section>

      {/* ── LIFESTYLE SECTION ───────────────────────────────────────────── */}
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          background: "var(--lhb-black)",
          minHeight: 400,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/lifestyle-tea.jpg"
          alt="Tea ritual"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: 0.35,
          }}
        />
        <div
          style={{
            position: "relative",
            textAlign: "center",
            padding: "4rem 2rem",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              color: "#fff",
              fontWeight: 300,
              marginBottom: "1rem",
            }}
          >
            Every blend has a purpose.
            <br />
            <em style={{ color: "var(--lhb-gold)" }}>Every sip, a ritual.</em>
          </h2>
          <Link
            href="#shop"
            style={{
              display: "inline-block",
              marginTop: "1.5rem",
              padding: ".85rem 2.25rem",
              background: "var(--lhb-moss)",
              color: "#fff",
              textDecoration: "none",
              borderRadius: "2px",
              fontFamily: "var(--font-body)",
              fontSize: ".8rem",
              letterSpacing: ".12em",
              textTransform: "uppercase",
            }}
          >
            Shop Now
          </Link>
        </div>
      </section>

      {/* ── WHOLESALE CTA ───────────────────────────────────────────────── */}
      <section
        style={{
          background: "var(--lhb-parchment-dark)",
          borderTop: "1px solid rgba(200,168,130,.3)",
          padding: "3rem 2rem",
          textAlign: "center",
        }}
      >
        <h3
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.75rem",
            fontWeight: 400,
            marginBottom: ".75rem",
          }}
        >
          Carry Lotus House Blends in your store
        </h3>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: ".85rem",
            color: "#666",
            marginBottom: "1.5rem",
          }}
        >
          We partner with spas, wellness centers, and boutique retailers.
        </p>
        <Link
          href="/wholesale"
          style={{
            display: "inline-block",
            padding: ".75rem 2rem",
            border: "1px solid var(--lhb-moss)",
            color: "var(--lhb-moss)",
            textDecoration: "none",
            borderRadius: "2px",
            fontFamily: "var(--font-body)",
            fontSize: ".75rem",
            letterSpacing: ".12em",
            textTransform: "uppercase",
          }}
        >
          Wholesale Inquiry
        </Link>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer
        style={{
          background: "var(--lhb-black)",
          borderTop: "1px solid rgba(200,168,130,.15)",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "1.5rem",
            marginBottom: "1rem",
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/terms"
            style={{
              color: "rgba(255,255,255,.5)",
              textDecoration: "none",
              fontFamily: "var(--font-body)",
              fontSize: ".7rem",
              letterSpacing: ".1em",
              textTransform: "uppercase",
            }}
          >
            Terms
          </Link>
          <Link
            href="/wholesale"
            style={{
              color: "rgba(255,255,255,.5)",
              textDecoration: "none",
              fontFamily: "var(--font-body)",
              fontSize: ".7rem",
              letterSpacing: ".1em",
              textTransform: "uppercase",
            }}
          >
            Wholesale
          </Link>
          <Link
            href="/about"
            style={{
              color: "rgba(255,255,255,.5)",
              textDecoration: "none",
              fontFamily: "var(--font-body)",
              fontSize: ".7rem",
              letterSpacing: ".1em",
              textTransform: "uppercase",
            }}
          >
            About
          </Link>
        </div>
        <p
          style={{
            color: "rgba(255,255,255,.35)",
            fontFamily: "var(--font-body)",
            fontSize: ".75rem",
            marginBottom: ".5rem",
          }}
        >
          © 2026 Lotus House Blends
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

      {/* Cart Drawer */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
