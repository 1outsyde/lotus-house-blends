import { LHB_CONFIG } from './lhb-config';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  qty: number;
}

const CART_KEY = LHB_CONFIG.cartKey;
type Listener = () => void;
const listeners: Set<Listener> = new Set();

function notify() {
  listeners.forEach((l) => l());
}

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]") as CartItem[];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  notify();
}

export function addToCart(item: Omit<CartItem, "qty"> & { qty?: number }) {
  const cart = getCart();
  const existing = cart.find((i) => i.id === item.id);
  if (existing) {
    existing.qty += item.qty ?? 1;
    saveCart(cart);
  } else {
    saveCart([...cart, { ...item, qty: item.qty ?? 1 }]);
  }
}

export function setQty(id: string, qty: number) {
  const cart = getCart();
  const item = cart.find((i) => i.id === id);
  if (!item) return;
  if (qty <= 0) {
    saveCart(cart.filter((i) => i.id !== id));
  } else {
    item.qty = qty;
    saveCart(cart);
  }
}

export function removeFromCart(id: string) {
  saveCart(getCart().filter((i) => i.id !== id));
}

export function clearCart() {
  saveCart([]);
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
