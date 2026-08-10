import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wholesale | Lotus House Blends",
  description:
    "Partner with Lotus House Blends. We work with spas, wellness centers, yoga studios, and boutique retailers.",
};

const CSS_VARS = `
  :root {
    --lhb-parchment: #f5f0e8;
    --lhb-parchment-dark: #ede5d0;
    --lhb-moss: #3d5a3e;
    --lhb-moss-light: #4e7350;
    --lhb-gold: #c8a882;
    --lhb-black: #1a1a18;
    --font-display: var(--font-cormorant), 'Cormorant Garamond', Georgia, serif;
    --font-body: var(--font-jost), 'Jost', sans-serif;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: var(--lhb-parchment); color: #1a1a18; font-family: var(--font-body); }
  input, select, textarea {
    width: 100%;
    padding: .75rem 1rem;
    border: 1px solid rgba(200,168,130,.4);
    border-radius: 2px;
    background: #fff;
    font-family: var(--font-body);
    font-size: .9rem;
    color: #1a1a18;
    outline: none;
    transition: border-color .2s;
  }
  input:focus, select:focus, textarea:focus {
    border-color: var(--lhb-moss);
  }
  label {
    display: block;
    font-family: var(--font-body);
    font-size: .7rem;
    letter-spacing: .1em;
    text-transform: uppercase;
    color: #666;
    margin-bottom: .4rem;
  }
`;

export default function WholesalePage() {
  return (
    <>
      <style>{CSS_VARS}</style>

      {/* NAV */}
      <nav
        style={{
          background: "var(--lhb-black)",
          borderBottom: "1px solid rgba(200,168,130,.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 2rem",
          height: 64,
          position: "sticky",
          top: 0,
          zIndex: 100,
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
        </div>
      </nav>

      {/* HEADER */}
      <div
        style={{
          background: "var(--lhb-parchment-dark)",
          padding: "4rem 2rem 3rem",
          textAlign: "center",
          borderBottom: "1px solid rgba(200,168,130,.25)",
        }}
      >
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
          For Retailers &amp; Wellness Partners
        </div>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            fontWeight: 400,
            marginBottom: "1rem",
            lineHeight: 1.2,
          }}
        >
          Carry Lotus House Blends
          <br />
          <em style={{ color: "var(--lhb-moss)" }}>in your space</em>
        </h1>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: ".9rem",
            color: "#666",
            maxWidth: 520,
            margin: "0 auto",
            lineHeight: 1.75,
          }}
        >
          We partner with spas, yoga studios, wellness centers, boutique
          retailers, and holistic practitioners who share our commitment to
          intentional, plant-based living.
        </p>
      </div>

      {/* BENEFITS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "0",
          borderBottom: "1px solid rgba(200,168,130,.2)",
        }}
      >
        {[
          { icon: "📦", title: "Minimum Order", desc: "Low MOQs to get started. Flexible reorder terms." },
          { icon: "🌿", title: "Private Label", desc: "White-label options available for established partners." },
          { icon: "💬", title: "Dedicated Support", desc: "Direct line to our team for restocking and education." },
          { icon: "✦", title: "Margin Friendly", desc: "Wholesale pricing that lets your business thrive." },
        ].map((b, i) => (
          <div
            key={b.title}
            style={{
              padding: "2.5rem 2rem",
              textAlign: "center",
              borderRight: i < 3 ? "1px solid rgba(200,168,130,.2)" : "none",
              background: "var(--lhb-parchment)",
            }}
          >
            <div style={{ fontSize: "2rem", marginBottom: ".75rem" }}>
              {b.icon}
            </div>
            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.25rem",
                fontWeight: 500,
                marginBottom: ".4rem",
              }}
            >
              {b.title}
            </h3>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: ".8rem",
                color: "#777",
                lineHeight: 1.65,
              }}
            >
              {b.desc}
            </p>
          </div>
        ))}
      </div>

      {/* FORM */}
      <div
        style={{
          maxWidth: 660,
          margin: "4rem auto",
          padding: "0 1.5rem 4rem",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "2rem",
            fontWeight: 400,
            textAlign: "center",
            marginBottom: ".5rem",
          }}
        >
          Submit an Inquiry
        </h2>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: ".85rem",
            color: "#888",
            textAlign: "center",
            marginBottom: "2.5rem",
          }}
        >
          We review all inquiries and respond within 2–3 business days.
        </p>

        <form
          action="mailto:hello@lotushouseblends.com"
          method="get"
          encType="text/plain"
          style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label htmlFor="businessName">Business Name *</label>
              <input
                id="businessName"
                name="Business Name"
                type="text"
                required
                placeholder="Your Business"
              />
            </div>
            <div>
              <label htmlFor="contactName">Contact Name *</label>
              <input
                id="contactName"
                name="Contact Name"
                type="text"
                required
                placeholder="Your Name"
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label htmlFor="email">Email *</label>
              <input
                id="email"
                name="Email"
                type="email"
                required
                placeholder="you@yourbusiness.com"
              />
            </div>
            <div>
              <label htmlFor="phone">Phone</label>
              <input
                id="phone"
                name="Phone"
                type="tel"
                placeholder="(555) 000-0000"
              />
            </div>
          </div>

          <div>
            <label htmlFor="businessType">Business Type *</label>
            <select id="businessType" name="Business Type" required>
              <option value="">Select a type…</option>
              <option value="Retailer">Retailer</option>
              <option value="Spa">Spa</option>
              <option value="Wellness Center">Wellness Center</option>
              <option value="Yoga Studio">Yoga Studio</option>
              <option value="Holistic Practitioner">Holistic Practitioner</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              name="Message"
              rows={5}
              placeholder="Tell us about your business, what products interest you, and how many locations you operate…"
              style={{ resize: "vertical" }}
            />
          </div>

          <button
            type="submit"
            style={{
              padding: ".9rem",
              background: "var(--lhb-moss)",
              color: "#fff",
              border: "none",
              borderRadius: "2px",
              cursor: "pointer",
              fontFamily: "var(--font-body)",
              fontSize: ".8rem",
              letterSpacing: ".12em",
              textTransform: "uppercase",
              fontWeight: 500,
            }}
          >
            Send Inquiry →
          </button>

          <p
            style={{
              textAlign: "center",
              fontFamily: "var(--font-body)",
              fontSize: ".75rem",
              color: "#aaa",
            }}
          >
            Or email us directly at{" "}
            <a
              href="mailto:hello@lotushouseblends.com"
              style={{ color: "var(--lhb-moss)", textDecoration: "none" }}
            >
              hello@lotushouseblends.com
            </a>
          </p>
        </form>
      </div>

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
            style={{ color: "var(--lhb-gold)", textDecoration: "none", opacity: 0.7 }}
          >
            Home
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
    </>
  );
}
