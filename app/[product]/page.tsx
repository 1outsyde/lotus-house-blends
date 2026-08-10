import { notFound } from "next/navigation";
import { PRODUCTS, PRODUCT_MAP } from "@/lib/products";
import ProductPageClient from "./ProductPageClient";

export async function generateStaticParams() {
  return PRODUCTS.map((p) => ({ product: p.slug }));
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ product: string }>;
}) {
  const { product: slug } = await params;
  const product = PRODUCT_MAP[slug];
  if (!product) notFound();
  return <ProductPageClient product={product} />;
}
