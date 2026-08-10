import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Story | Lotus House Blends",
  description:
    "Lotus House Blends was founded on the belief that plants hold the wisdom of healing. Learn about our philosophy and commitment to botanical wellness.",
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
`;

export default function AboutPage() {
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

      {/* HERO */}
      <section
        style={{
          position: "relative",
          height: "60vh",
          minHeight: 380,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--lhb-black)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/lifestyle-ritual.jpg"
          alt="Ritual"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: 0.4,
          }}
        />
        <div
          style={{
            position: "relative",
            textAlign: "center",
            padding: "2rem",
          }}
        >
          <div
            style={{
              fontSize: ".65rem",
              letterSpacing: ".25em",
              textTransform: "uppercase",
              color: "var(--lhb-gold)",
              fontFamily: "var(--font-body)",
              marginBottom: "1rem",
            }}
          >
            Lotus House Blends
          </div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2.5rem, 7vw, 5rem)",
              fontWeight: 300,
              color: "#fff",
              lineHeight: 1.1,
              letterSpacing: ".02em",
            }}
          >
            Our <em style={{ fontStyle: "italic" }}>Story</em>
          </h1>
        </div>
      </section>

      {/* STORY SECTION */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          minHeight: 520,
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
            alt="Lifestyle"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
        <div
          style={{
            padding: "4rem 3.5rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
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
              fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
              fontWeight: 400,
              lineHeight: 1.25,
              marginBottom: "1.5rem",
            }}
          >
            Plants hold wisdom.
            <br />
            <em style={{ color: "var(--lhb-moss)" }}>
              We listen to them.
            </em>
          </h2>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: ".9rem",
              lineHeight: 1.85,
              color: "#555",
              marginBottom: "1.25rem",
            }}
          >
            Lotus House Blends was born from a deep personal reverence for the
            healing intelligence of plants. Founded in 2024, our small-batch
            herbal studio was created to offer an alternative to synthetic
            wellness products — one rooted in ancient botanical tradition and
            modern intentionality.
          </p>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: ".9rem",
              lineHeight: 1.85,
              color: "#555",
              marginBottom: "1.25rem",
            }}
          >
            Every blend we craft is designed around a specific time of day and
            a specific state of being. Rise & Bloom supports the clarity and
            focus of morning. Heart Flow holds you balanced and present through
            midday. Dream Temple guides you gently into the restorative depths
            of night.
          </p>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: ".9rem",
              lineHeight: 1.85,
              color: "#555",
            }}
          >
            We work exclusively with organic, ethically wildcrafted and
            sustainably sourced botanicals. No fillers. No synthetics. No
            compromises. Just the pure, quiet intelligence of the plant world,
            offered to you as a daily act of care.
          </p>
        </div>
      </section>

      {/* VALUES */}
      <section
        style={{
          background: "var(--lhb-black)",
          padding: "5rem 2rem",
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div
            style={{ textAlign: "center", marginBottom: "3.5rem" }}
          >
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
                fontWeight: 400,
                color: "#fff",
              }}
            >
              What we stand for
            </h2>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "2.5rem",
              textAlign: "center",
            }}
          >
            {[
              {
                icon: "🌿",
                title: "Natural",
                desc: "We use only organic, ethically sourced botanicals. Every ingredient earns its place in our blends.",
              },
              {
                icon: "🧘",
                title: "Mindful",
                desc: "Each blend is formulated with a specific intention — not just a flavor profile, but a whole state of being.",
              },
              {
                icon: "🌸",
                title: "Ritual",
                desc: "We believe that how you begin and end your day matters. Our blends are designed to anchor those sacred moments.",
              },
              {
                icon: "✦",
                title: "Transparent",
                desc: "Full ingredient disclosure. Small batches. No greenwashing. We say what we mean and mean what we say.",
              },
            ].map((v) => (
              <div key={v.title} style={{ padding: "1rem" }}>
                <div
                  style={{ fontSize: "2.25rem", marginBottom: "1rem" }}
                >
                  {v.icon}
                </div>
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.5rem",
                    color: "#fff",
                    fontWeight: 400,
                    marginBottom: ".6rem",
                  }}
                >
                  {v.title}
                </h3>
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: ".85rem",
                    color: "rgba(255,255,255,.6)",
                    lineHeight: 1.75,
                  }}
                >
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        style={{
          background: "var(--lhb-parchment-dark)",
          padding: "4rem 2rem",
          textAlign: "center",
          borderTop: "1px solid rgba(200,168,130,.3)",
          borderBottom: "1px solid rgba(200,168,130,.3)",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
            fontWeight: 400,
            marginBottom: "1rem",
          }}
        >
          Ready to begin your ritual?
        </h2>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: ".9rem",
            color: "#666",
            marginBottom: "2rem",
            maxWidth: 480,
            margin: "0 auto 2rem",
            lineHeight: 1.7,
          }}
        >
          Explore the full collection and find the blend that calls to you.
        </p>
        <Link
          href="/#shop"
          style={{
            display: "inline-block",
            padding: ".85rem 2.5rem",
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
          Shop the Collection
        </Link>
      </section>

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
