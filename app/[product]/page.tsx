import { notFound } from "next/navigation";
import { PRODUCTS, PRODUCT_MAP } from "@/lib/products";
import ProductPageClient from "./ProductPageClient";

export async function generateStaticParams() {
  return PRODUCTS.map((p) => ({ product: p.slug }));
}

export default function ProductPage({
  params,
}: {
  params: { product: string };
}) {
  const product = PRODUCT_MAP[params.product];
  if (!product) notFound();
  return <ProductPageClient product={product} />;
}
