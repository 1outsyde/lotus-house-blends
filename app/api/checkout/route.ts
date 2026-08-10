import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

interface LineItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  image: string;
}

export async function POST(req: NextRequest) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "Stripe secret key is not configured." },
      { status: 500 }
    );
  }

  const stripe = new Stripe(key, {
    apiVersion: "2026-07-29.dahlia",
  });

  try {
    const body = await req.json();
    const items: LineItem[] = body.items;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items in cart" }, { status: 400 });
    }

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "https://lotushouseblends.com";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: items.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
            images: item.image ? [siteUrl + item.image] : [],
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.qty,
      })),
      success_url: siteUrl + "/success",
      cancel_url: siteUrl + "/checkout",
      shipping_address_collection: {
        allowed_countries: ["US"],
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
