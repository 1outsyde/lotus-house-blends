"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { isAdminEmail } from "@/lib/auth-utils";
import { PRODUCTS, Product } from "@/lib/products";
import {
  addToCart,
  getCart,
  setQty,
  removeFromCart,
  subscribe,
  CartItem,
} from "@/lib/cart";

const CSS_VARS = `
  :root {
    --lhb-parchment: #e8e0cc;
    --lhb-parchment-dark: #ddd5bb;
    --lhb-moss: #2d4a3e;
    --lhb-moss-light: #3d5a3e;
    --lhb-gold: #c8a035;
    --lhb-gold-light: #d4b050;
    --lhb-black: #1a1a18;
    --lhb-night: #7b5ea7;
    --lhb-midday: #2d4a3e;
    --lhb-morning: #8b4513;
    --lhb-brown-dark: #3A2208;
    --lhb-text-mid: #7A6350;
    --lhb-text-muted: #9A8070;
    --lhb-sage: #4A6B5A;
    --lhb-sage-dark: #1F3830;
    --lhb-lavender: #7b5ea7;
    --font-display: var(--font-cormorant), 'Cormorant Garamond', Georgia, serif;
    --font-body: var(--font-jost), 'Jost', sans-serif;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { background: var(--lhb-parchment); color: var(--lhb-black); font-family: var(--font-body); }

  .hero-logo-wrap { margin-bottom: 2rem; }
  .hero-logo-wrap img { width: 480px; max-width: 90%; height: auto; mix-blend-mode: screen; }

  .product-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1.5rem; }

  .pcard { background: var(--lhb-parchment); display: block; text-decoration: none; cursor: pointer; transition: transform .25s, box-shadow .25s; position: relative; overflow: hidden; }
  .pcard:hover { transform: translateY(-5px); box-shadow: 0 24px 60px rgba(26,18,8,.13); }
  .pcard-img { height: 280px; overflow: hidden; position: relative; background: #e8e0d0; display: flex; align-items: center; justify-content: center; }
  .pcard-img img { width: 100%; height: 100%; object-fit: contain; object-position: center; padding: 1.5rem; transition: transform .4s; }
  .pcard:hover .pcard-img img { transform: scale(1.06); }
  .ptype-tag { position: absolute; top: .9rem; left: .9rem; font-size: .58rem; letter-spacing: .18em; text-transform: uppercase; padding: .28rem .7rem; background: rgba(242,235,217,.93); color: var(--lhb-text-mid); font-weight: 400; }
  .pcard-body { padding: 1.4rem 1.4rem 1.6rem; }
  .pcard-name { font-family: 'Cormorant Garamond', serif; font-size: 1.2rem; font-weight: 500; color: var(--lhb-brown-dark); line-height: 1.25; margin-bottom: .45rem; }
  .pcard-desc { font-size: .76rem; color: var(--lhb-text-muted); line-height: 1.75; font-weight: 300; margin-bottom: 1.15rem; }
  .pcard-footer { display: flex; align-items: center; justify-content: space-between; padding-top: .9rem; border-top: 1px solid rgba(90,62,30,.1); }
  .pcard-price { font-family: 'Cormorant Garamond', serif; font-size: 1.35rem; font-weight: 500; color: var(--lhb-brown-dark); display: block; line-height: 1; }
  .pcard-bundle { font-size: .66rem; color: var(--lhb-sage); font-weight: 400; margin-top: .15rem; display: block; letter-spacing: .03em; }
  .pcard-add { background: var(--lhb-moss); border: none; color: #F2EBD9; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 1.3rem; font-weight: 300; transition: background .18s, transform .12s; flex-shrink: 0; }
  .pcard-add:hover { background: var(--lhb-sage-dark); transform: scale(1.08); }
  .pcard::after { content: 'View Product'; position: absolute; bottom: 0; left: 0; right: 0; background: var(--lhb-lavender); color: #fff; text-align: center; padding: .7rem; font-size: .66rem; letter-spacing: .18em; text-transform: uppercase; transform: translateY(100%); transition: transform .22s; }
  .pcard:hover::after { transform: translateY(0); }

  .blend-group-hdr { display: flex; align-items: baseline; gap: 1.25rem; margin-bottom: 2rem; padding-bottom: .9rem; border-bottom: 1px solid rgba(90,62,30,.12); }
  .time-badge { font-size: .58rem; letter-spacing: .22em; text-transform: uppercase; font-weight: 400; padding: .28rem .8rem; }
  .badge-morning { background: #FFF3E0; color: #8A5010; }
  .badge-midday { background: #EAF2E8; color: #2A5C28; }
  .badge-night { background: #EDE7F6; color: #4A2E8A; }
  .blend-group-title { font-family: 'Cormorant Garamond', serif; font-size: 1.7rem; font-weight: 400; color: var(--lhb-brown-dark); }
  .blend-group-sub { font-size: .75rem; color: var(--lhb-text-muted); font-weight: 300; margin-left: auto; font-style: italic; }

  .filter-row { display: flex; gap: .5rem; flex-wrap: wrap; margin-bottom: 3.5rem; }
  .ftab { background: transparent; border: 1px solid rgba(90,62,30,.2); color: var(--lhb-text-muted); padding: .55rem 1.25rem; font-family: 'Jost', sans-serif; font-size: .68rem; letter-spacing: .14em; text-transform: uppercase; font-weight: 400; cursor: pointer; transition: all .18s; }
  .ftab:hover { border-color: var(--lhb-lavender); color: var(--lhb-lavender); }
  .ftab.active { background: var(--lhb-moss); border-color: var(--lhb-moss); color: #F2EBD9; }
`;

const typeLabels: Record<string, string> = {
  prerolls: "Herbal Cones",
  herbs: "Loose Herbs",
  tea: "Tea Box",
};

const blendGroups = [
  { key: "night", title: "Dream Temple", badgeClass: "badge-night", badgeLabel: "Night", sub: "Ritual for rest & dream clarity" },
  { key: "midday", title: "Heart Flow", badgeClass: "badge-midday", badgeLabel: "Midday", sub: "Ritual for balance & clarity" },
  { key: "morning", title: "Rise & Bloom", badgeClass: "badge-morning", badgeLabel: "Morning", sub: "Ritual for focus & vitality" },
];

function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [items, setItems] = useState<CartItem[]>([]);
  useEffect(() => {
    setItems(getCart());
    return subscribe(() => setItems(getCart()));
  }, []);
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <>
      {open && <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 998 }} />}
      <div style={{ position: "fixed", top: 0, right: 0, height: "100vh", width: "min(420px, 100vw)", background: "var(--lhb-parchment)", zIndex: 999, transform: open ? "translateX(0)" : "translateX(100%)", transition: "transform .35s cubic-bezier(.4,0,.2,1)", display: "flex", flexDirection: "column", boxShadow: "-4px 0 24px rgba(0,0,0,.15)" }}>
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--lhb-gold)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--lhb-black)" }}>
          <span style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", color: "#fff", fontWeight: 500, letterSpacing: ".04em" }}>Your Cart</span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--lhb-gold)", fontSize: "1.5rem", cursor: "pointer", lineHeight: 1 }} aria-label="Close cart">×</button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "1rem 1.5rem" }}>
          {items.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem 1rem", color: "#888", fontFamily: "var(--font-body)" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: ".75rem" }}>🌿</div>
              <p>Your cart is empty</p>
              <button onClick={onClose} style={{ marginTop: "1.5rem", padding: ".6rem 1.5rem", background: "var(--lhb-moss)", color: "#fff", border: "none", borderRadius: "2px", cursor: "pointer", fontFamily: "var(--font-body)", letterSpacing: ".06em", textTransform: "uppercase", fontSize: ".75rem" }}>Continue Shopping</button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} style={{ display: "flex", gap: "1rem", padding: "1rem 0", borderBottom: "1px solid rgba(200,168,130,.25)" }}>
                <div style={{ width: 72, height: 72, flexShrink: 0, background: "var(--lhb-parchment-dark)", borderRadius: "2px", overflow: "hidden", position: "relative" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "1.05rem", fontWeight: 500, marginBottom: ".2rem" }}>{item.name}</div>
                  <div style={{ fontSize: ".8rem", color: "var(--lhb-moss)", marginBottom: ".5rem" }}>${item.price.toFixed(2)}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
                    <button onClick={() => setQty(item.id, item.qty - 1)} style={{ width: 26, height: 26, background: "var(--lhb-parchment-dark)", border: "1px solid var(--lhb-gold)", borderRadius: "2px", cursor: "pointer", fontSize: "1rem", lineHeight: 1 }}>−</button>
                    <span style={{ fontSize: ".9rem", minWidth: 20, textAlign: "center" }}>{item.qty}</span>
                    <button onClick={() => setQty(item.id, item.qty + 1)} style={{ width: 26, height: 26, background: "var(--lhb-parchment-dark)", border: "1px solid var(--lhb-gold)", borderRadius: "2px", cursor: "pointer", fontSize: "1rem", lineHeight: 1 }}>+</button>
                    <button onClick={() => removeFromCart(item.id)} style={{ marginLeft: ".5rem", background: "none", border: "none", color: "#aaa", cursor: "pointer", fontSize: ".75rem", textDecoration: "underline" }}>Remove</button>
                  </div>
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "1.05rem", fontWeight: 600, alignSelf: "flex-start", paddingTop: "2px" }}>${(item.price * item.qty).toFixed(2)}</div>
              </div>
            ))
          )}
        </div>
        {items.length > 0 && (
          <div style={{ padding: "1.25rem 1.5rem", borderTop: "1px solid var(--lhb-gold)", background: "#fff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem", fontFamily: "var(--font-display)", fontSize: "1.1rem" }}>
              <span>Subtotal</span>
              <span style={{ fontWeight: 600 }}>${subtotal.toFixed(2)}</span>
            </div>
            <Link href="/checkout" onClick={onClose} style={{ display: "block", textAlign: "center", padding: ".85rem", background: "var(--lhb-moss)", color: "#fff", textDecoration: "none", borderRadius: "2px", fontFamily: "var(--font-body)", letterSpacing: ".1em", textTransform: "uppercase", fontSize: ".8rem", fontWeight: 500 }}>Checkout</Link>
          </div>
        )}
      </div>
    </>
  );
}

function ProductCard({ product }: { product: Product }) {
  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart({ id: product.id, name: product.name, price: product.price, image: product.image, qty: 1 });
  };
  return (
    <Link href={`/${product.slug}`} className="pcard">
      <div className="pcard-img">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={product.image} alt={product.name} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
        <span className="ptype-tag">{typeLabels[product.type] ?? product.type}</span>
      </div>
      <div className="pcard-body">
        <div className="pcard-name">{product.name}</div>
        <div className="pcard-desc">{product.description}</div>
        <div className="pcard-footer">
          <div>
            <span className="pcard-price">${product.price.toFixed(2)}</span>
            <span className="pcard-bundle">{product.bundleLabel}</span>
          </div>
          <button className="pcard-add" onClick={handleAdd} aria-label="Add to cart">+</button>
        </div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const { user, logout } = useAuth();
  const isAdmin = user && (user.role === 'vendor' || user.role === 'admin' || isAdminEmail(user.email));

  const [cartOpen, setCartOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const refreshCount = useCallback(() => {
    setCartCount(getCart().reduce((s, i) => s + i.qty, 0));
  }, []);

  useEffect(() => {
    refreshCount();
    return subscribe(refreshCount);
  }, [refreshCount]);

  const groupHidden = (blendKey: string) =>
    ["morning", "midday", "night"].includes(activeFilter) && activeFilter !== blendKey;

  const cardHidden = (type: string) =>
    ["tea", "herbs", "prerolls"].includes(activeFilter) && activeFilter !== type;

  return (
    <>
      <style>{CSS_VARS}</style>

      {/* NAV */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "var(--lhb-black)", borderBottom: "1px solid rgba(200,168,130,.2)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 2rem", height: 80 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", height: "100%", padding: "8px 0" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-dark.png" alt="Lotus House Blends" style={{ height: "64px", width: "auto", display: "block", objectFit: "contain" }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "1.75rem" }}>
          {[["#shop","Shop"],["about","Our Story"],["wholesale","Wholesale"]].map(([href, label]) => (
            <Link key={label} href={href.startsWith("#") ? href : `/${href}`} style={{ color: "rgba(255,255,255,.8)", textDecoration: "none", fontFamily: "var(--font-body)", fontSize: ".8rem", letterSpacing: ".1em", textTransform: "uppercase" }}>{label}</Link>
          ))}

          {user ? (
            <>
              {isAdmin && (
                <Link href="/admin/dashboard" style={{ color: "var(--lhb-gold)", textDecoration: "none", fontFamily: "var(--font-body)", fontSize: ".8rem", letterSpacing: ".1em", textTransform: "uppercase" }}>
                  Admin
                </Link>
              )}
              <button
                onClick={logout}
                style={{ background: "none", border: "none", color: "rgba(255,255,255,.8)", cursor: "pointer", fontFamily: "var(--font-body)", fontSize: ".8rem", letterSpacing: ".1em", textTransform: "uppercase" }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link href="/login" style={{ color: "rgba(255,255,255,.8)", textDecoration: "none", fontFamily: "var(--font-body)", fontSize: ".8rem", letterSpacing: ".1em", textTransform: "uppercase" }}>
              Login
            </Link>
          )}

          <button onClick={() => setCartOpen(true)} style={{ background: "none", border: "1px solid rgba(200,168,130,.5)", borderRadius: "2px", color: "var(--lhb-gold)", cursor: "pointer", padding: ".45rem 1rem", fontFamily: "var(--font-body)", fontSize: ".75rem", letterSpacing: ".1em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: ".4rem" }} aria-label="Open cart">
            <span>Cart</span>
            {cartCount > 0 && <span style={{ background: "var(--lhb-moss)", color: "#fff", borderRadius: "999px", width: 18, height: 18, fontSize: ".65rem", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600 }}>{cartCount}</span>}
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ position: "relative", minHeight: "90vh", display: "grid", gridTemplateColumns: "1fr 1fr", overflow: "hidden" }}>
        <div style={{ position: "relative", overflow: "hidden", background: "var(--lhb-black)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/lifestyle-ritual.jpg" alt="Lotus ritual" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.75 }} />
        </div>
        <div style={{ background: "#2d4a3e", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "4rem 3rem", textAlign: "center" }}>
          <div className="hero-logo-wrap">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-dark.png" alt="Lotus House Blends logo" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          </div>
          <div style={{ fontSize: ".65rem", letterSpacing: ".22em", textTransform: "uppercase", color: "rgba(255,255,255,.55)", fontFamily: "var(--font-body)", marginBottom: "1.5rem" }}>
            Herbal &nbsp;·&nbsp; Botanical &nbsp;·&nbsp; Intentional
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.5rem, 5vw, 4.5rem)", fontWeight: 300, color: "#fff", lineHeight: 1.15, marginBottom: "2rem", letterSpacing: ".01em" }}>
            Crafted for<br />
            <em style={{ fontStyle: "italic", color: "#c8b8e8" }}>every ritual</em><br />
            of your day
          </h1>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="#shop" style={{ padding: ".85rem 2.25rem", background: "var(--lhb-gold)", color: "var(--lhb-black)", textDecoration: "none", borderRadius: "2px", fontFamily: "var(--font-body)", fontSize: ".8rem", letterSpacing: ".12em", textTransform: "uppercase", fontWeight: 600 }}>Shop the Collection</Link>
            <Link href="/about" style={{ padding: ".85rem 2.25rem", background: "transparent", color: "#fff", textDecoration: "none", borderRadius: "2px", border: "1px solid rgba(255,255,255,.35)", fontFamily: "var(--font-body)", fontSize: ".8rem", letterSpacing: ".12em", textTransform: "uppercase" }}>Our Story</Link>
          </div>
        </div>
      </section>

      {/* BRAND BAR */}
      <div style={{ background: "var(--lhb-parchment-dark)", borderTop: "1px solid rgba(200,168,130,.3)", borderBottom: "1px solid rgba(200,168,130,.3)", padding: ".75rem 2rem", display: "flex", justifyContent: "center", gap: "3rem", flexWrap: "wrap" }}>
        {["100% Herbal","Small Batch","Est. 2024 · Wellness","No Additives"].map((badge) => (
          <span key={badge} style={{ fontFamily: "var(--font-body)", fontSize: ".7rem", letterSpacing: ".15em", textTransform: "uppercase", color: "var(--lhb-moss)", fontWeight: 500 }}>{badge}</span>
        ))}
      </div>

      {/* ABOUT STRIP */}
      <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: 480 }}>
        <div style={{ position: "relative", overflow: "hidden", background: "var(--lhb-parchment-dark)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/lifestyle-model.jpg" alt="Ritual lifestyle" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
        <div style={{ padding: "4rem 3rem", display: "flex", flexDirection: "column", justifyContent: "center", background: "var(--lhb-parchment)" }}>
          <div style={{ fontSize: ".65rem", letterSpacing: ".2em", textTransform: "uppercase", color: "var(--lhb-gold)", fontFamily: "var(--font-body)", marginBottom: "1rem" }}>Founded on Ritual</div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 400, lineHeight: 1.2, marginBottom: "1.25rem" }}>
            Blended with intention.<br />
            <em style={{ color: "var(--lhb-moss)" }}>Crafted with care.</em>
          </h2>
          <p style={{ fontFamily: "var(--font-body)", fontSize: ".9rem", lineHeight: 1.8, color: "#555", marginBottom: "1rem" }}>Lotus House Blends was born from a deep reverence for the healing power of plants. Every blend is crafted to support you through the natural rhythms of your day — from the first breath of morning to the quiet surrender of night.</p>
          <p style={{ fontFamily: "var(--font-body)", fontSize: ".9rem", lineHeight: 1.8, color: "#555", marginBottom: "2rem" }}>We work exclusively with organic, ethically sourced herbs — no fillers, no synthetics, no shortcuts. Just pure botanical intention in every cone, sachet, and tea bag.</p>
          <Link href="/about" style={{ display: "inline-block", padding: ".75rem 1.75rem", border: "1px solid var(--lhb-moss)", color: "var(--lhb-moss)", textDecoration: "none", fontFamily: "var(--font-body)", fontSize: ".75rem", letterSpacing: ".12em", textTransform: "uppercase", borderRadius: "2px", alignSelf: "flex-start" }}>Read Our Story</Link>
        </div>
      </section>

      {/* VALUES PILLARS */}
      <section style={{ background: "#2A1E0E", padding: "4rem 2rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "2rem", textAlign: "center" }}>
        {[
          { icon: "🌿", title: "Natural", desc: "Organic, ethically sourced herbs. Nothing artificial. Ever." },
          { icon: "🧘", title: "Mindful", desc: "Each blend supports a specific state of being — not just a flavor." },
          { icon: "🌸", title: "Ritual", desc: "Designed to be woven into the sacred rhythms of your daily life." },
        ].map((v) => (
          <div key={v.title} style={{ padding: "1rem" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>{v.icon}</div>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", color: "#fff", fontWeight: 400, marginBottom: ".6rem", letterSpacing: ".04em" }}>{v.title}</h3>
            <p style={{ fontFamily: "var(--font-body)", fontSize: ".85rem", color: "rgba(255,255,255,.6)", lineHeight: 1.7 }}>{v.desc}</p>
          </div>
        ))}
      </section>

      {/* SHOP */}
      <section id="shop" style={{ padding: "5rem 2rem", background: "var(--lhb-parchment)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ marginBottom: "2.5rem" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 400 }}>
              Shop the <em style={{ color: "var(--lhb-moss)", fontStyle: "italic" }}>Blends</em>
            </h2>
          </div>
          <div style={{ borderTop: "1px solid rgba(0,0,0,.12)", marginBottom: "3rem" }} />

          <div className="filter-row">
            {([["all","All Blends"],["morning","Rise & Bloom — Morning"],["midday","Heart Flow — Midday"],["night","Dream Temple — Night"],["tea","Tea Boxes"],["herbs","Loose Herbs"],["prerolls","Herbal Blends"]] as [string,string][]).map(([key, label]) => (
              <button key={key} className={`ftab${activeFilter === key ? " active" : ""}`} onClick={() => setActiveFilter(key)}>{label}</button>
            ))}
          </div>

          {blendGroups.map((group) => {
            const groupProducts = PRODUCTS.filter((p) => p.blend === group.key);
            return (
              <div key={group.key} style={{ marginBottom: "4rem", display: groupHidden(group.key) ? "none" : "block" }}>
                <div className="blend-group-hdr">
                  <span className={`time-badge ${group.badgeClass}`}>{group.badgeLabel}</span>
                  <span className="blend-group-title">{group.title}</span>
                  <span className="blend-group-sub">{group.sub}</span>
                </div>
                <div className="product-grid">
                  {groupProducts.map((p) => (
                    <div key={p.id} style={{ display: cardHidden(p.type) ? "none" : "block" }}>
                      <ProductCard product={p} />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* LIFESTYLE */}
      <section style={{ position: "relative", overflow: "hidden", background: "var(--lhb-black)", minHeight: 400, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/lifestyle-tea.jpg" alt="Tea ritual" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.35 }} />
        <div style={{ position: "relative", textAlign: "center", padding: "4rem 2rem" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 5vw, 3.5rem)", color: "#fff", fontWeight: 300, marginBottom: "1rem" }}>
            Every blend has a purpose.<br />
            <em style={{ color: "var(--lhb-gold)" }}>Every sip, a ritual.</em>
          </h2>
          <Link href="#shop" style={{ display: "inline-block", marginTop: "1.5rem", padding: ".85rem 2.25rem", background: "var(--lhb-moss)", color: "#fff", textDecoration: "none", borderRadius: "2px", fontFamily: "var(--font-body)", fontSize: ".8rem", letterSpacing: ".12em", textTransform: "uppercase" }}>Shop Now</Link>
        </div>
      </section>

      {/* WHOLESALE CTA */}
      <section style={{ background: "var(--lhb-parchment-dark)", borderTop: "1px solid rgba(200,168,130,.3)", padding: "3rem 2rem", textAlign: "center" }}>
        <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.75rem", fontWeight: 400, marginBottom: ".75rem" }}>Carry Lotus House Blends in your store</h3>
        <p style={{ fontFamily: "var(--font-body)", fontSize: ".85rem", color: "#666", marginBottom: "1.5rem" }}>We partner with spas, wellness centers, and boutique retailers.</p>
        <Link href="/wholesale" style={{ display: "inline-block", padding: ".75rem 2rem", border: "1px solid var(--lhb-moss)", color: "var(--lhb-moss)", textDecoration: "none", borderRadius: "2px", fontFamily: "var(--font-body)", fontSize: ".75rem", letterSpacing: ".12em", textTransform: "uppercase" }}>Wholesale Inquiry</Link>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "var(--lhb-black)", borderTop: "1px solid rgba(200,168,130,.15)", padding: "2rem", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: "1.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
          {[["terms","Terms"],["wholesale","Wholesale"],["about","About"]].map(([href, label]) => (
            <Link key={label} href={`/${href}`} style={{ color: "rgba(255,255,255,.5)", textDecoration: "none", fontFamily: "var(--font-body)", fontSize: ".7rem", letterSpacing: ".1em", textTransform: "uppercase" }}>{label}</Link>
          ))}
        </div>
        <p style={{ color: "rgba(255,255,255,.35)", fontFamily: "var(--font-body)", fontSize: ".75rem", marginBottom: ".5rem" }}>© 2026 Lotus House Blends</p>
        <span style={{ fontSize: ".6rem", color: "rgba(200,168,130,.3)", letterSpacing: ".08em" }}>Powered by Outsyde</span>
      </footer>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
