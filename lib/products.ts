// DEPRECATED — storefront now fetches live from outsyde-backend.
// Do not remove until live fetch is verified working in production.
export type ProductType = "prerolls" | "herbs" | "tea";
export type BlendType = "morning" | "midday" | "night";

export interface Product {
  id: string;
  name: string;
  type: ProductType;
  blend: BlendType;
  price: number;
  bundleLabel: string;
  description: string;
  image: string;
  slug: string;
}

export const PRODUCTS: Product[] = [
  {
    id: "dt-cones",
    name: "Dream Temple Herbal Cones",
    type: "prerolls",
    blend: "night",
    price: 10.0,
    bundleLabel: "Bundle: 3 for $20",
    description:
      "4 herbal cones. Eases stress and tension, promotes deep sleep, supports dream clarity, relaxes the nervous system.",
    image: "/dream-temple-prerolls.jpg",
    slug: "dream-temple-pre-rolls",
  },
  {
    id: "dt-herbs",
    name: "Dream Temple Loose-Herbs",
    type: "herbs",
    blend: "night",
    price: 18.75,
    bundleLabel: "Bundle: 3 for $35",
    description:
      "Loose herbal blend. Eases stress and tension, promotes deep sleep, calms inflammation from stress.",
    image: "/dream-temple-loose-herbs.jpg",
    slug: "dream-temple-loose-herbs",
  },
  {
    id: "dt-tea",
    name: "Dream Temple Tea Box",
    type: "tea",
    blend: "night",
    price: 12.5,
    bundleLabel: "Bundle: 3 for $25",
    description:
      "5 tea bags. Promotes deep sleep, supports dream clarity, relaxes the nervous system, calms inflammation.",
    image: "/dream-temple-tea-box.jpg",
    slug: "dream-temple-tea-box",
  },
  {
    id: "hf-herbs",
    name: "Heart Flow Loose-Herbs",
    type: "herbs",
    blend: "midday",
    price: 18.75,
    bundleLabel: "Bundle: 3 for $35",
    description:
      "Balances mood, calms the nervous system, reduces hormonal inflammation, supports digestion and emotional clarity.",
    image: "/heart-flow-loose-herbs.jpg",
    slug: "heart-flow-loose-herbs",
  },
  {
    id: "hf-tea",
    name: "Heart Flow Tea Box",
    type: "tea",
    blend: "midday",
    price: 12.5,
    bundleLabel: "Bundle: 3 for $25",
    description:
      "5 tea bags. Keeps you balanced and grounded through midday. Promotes emotional clarity and supports digestion.",
    image: "/heart-flow-tea-box.jpg",
    slug: "heart-flow-tea-box",
  },
  {
    id: "hf-cones",
    name: "Heart Flow Herbal Cones",
    type: "prerolls",
    blend: "midday",
    price: 10.0,
    bundleLabel: "Bundle: 3 for $20",
    description:
      "4 herbal cones. Keeps you balanced and grounded. Reduces hormonal inflammation, promotes emotional clarity.",
    image: "/heart-flow-prerolls.jpg",
    slug: "heart-flow-pre-rolls",
  },
  {
    id: "rb-herbs",
    name: "Rise & Bloom Loose-Herbs",
    type: "herbs",
    blend: "morning",
    price: 18.75,
    bundleLabel: "Bundle: 3 for $35",
    description:
      "Clears brain fog, reduces inflammation, opens the lungs, supports focus and clarity. Gently boosts energy.",
    image: "/rise-bloom-loose-herbs.jpg",
    slug: "rise-bloom-loose-herbs",
  },
  {
    id: "rb-tea",
    name: "Rise & Bloom Tea Box",
    type: "tea",
    blend: "morning",
    price: 12.5,
    bundleLabel: "Bundle: 3 for $25",
    description:
      "5 tea bags. Clears brain fog, reduces inflammation, opens the lungs, supports focus and gently boosts energy.",
    image: "/rise-bloom-tea-box.jpg",
    slug: "rise-bloom-tea-box",
  },
  {
    id: "rb-cones",
    name: "Rise & Bloom Herbal Cones",
    type: "prerolls",
    blend: "morning",
    price: 10.0,
    bundleLabel: "Bundle: 3 for $20",
    description:
      "4 herbal cones. Clears brain fog, reduces inflammation, supports focus and clarity. Gets the day moving.",
    image: "/rise-bloom-prerolls.png",
    slug: "rise-bloom-pre-rolls",
  },
];

export const PRODUCT_MAP: Record<string, Product> = Object.fromEntries(
  PRODUCTS.map((p) => [p.slug, p])
);
