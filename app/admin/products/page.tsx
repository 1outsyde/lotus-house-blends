import { cookies } from 'next/headers';
import ProductsClient, { type ProductRow } from './ProductsClient';

export default async function AdminProductsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('outsyde_access_token')?.value ?? '';

  const apiUrl = process.env.OUTSYDE_API_URL;
  const bizId = process.env.OUTSYDE_BUSINESS_ID ?? '';

  let products: ProductRow[] = [];
  let fetchError = '';

  try {
    const res = await fetch(`${apiUrl}/api/vendor/products`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'x-business-id': bizId,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json() as { products?: ProductRow[] } | ProductRow[];
      products = Array.isArray(data)
        ? data
        : (data as { products?: ProductRow[] }).products ?? [];
    } else {
      fetchError = `Failed to load products (${res.status}).`;
    }
  } catch {
    fetchError = 'Could not reach data service.';
  }

  return (
    <div>
      <h1 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '2.2rem', fontWeight: 500, color: '#1E3020', margin: '0 0 8px' }}>
        Products
      </h1>
      <p style={{ color: 'rgba(30,48,32,0.5)', fontSize: '0.85rem', marginBottom: 32, fontFamily: 'Jost, sans-serif' }}>
        {fetchError ? '' : `${products.length} product${products.length !== 1 ? 's' : ''}`}
      </p>
      {fetchError && (
        <p style={{ color: '#C0392B', fontSize: '0.85rem', marginBottom: 24, fontFamily: 'Jost, sans-serif' }}>{fetchError}</p>
      )}
      <ProductsClient initialProducts={products} />
    </div>
  );
}
