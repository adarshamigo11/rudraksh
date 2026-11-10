'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const Ctx = createContext(null);
export const useCart = () => useContext(Ctx);
const KEY = 'rk_cart_v1';

export function CartProvider({ settings, children }) {
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {}
  }, [items, ready]);

  const add = useCallback((line, openDrawer = true) => {
    setItems((prev) => {
      const key = `${line.productId}:${line.variantId || ''}`;
      const i = prev.findIndex((x) => x.key === key);
      if (i >= 0) {
        const next = [...prev];
        const cur = next[i];
        next[i] = { ...cur, ...line, key, qty: Math.min(cur.qty + line.qty, line.maxQty || 10), siddh: cur.siddh || line.siddh };
        return next;
      }
      return [...prev, { ...line, key, qty: Math.min(line.qty, line.maxQty || 10) }];
    });
    if (openDrawer) setOpen(true);
  }, []);

  const setQty = useCallback(
    (key, qty) =>
      setItems((p) =>
        qty < 1 ? p.filter((i) => i.key !== key) : p.map((i) => (i.key === key ? { ...i, qty: Math.min(qty, i.maxQty || 10) } : i))
      ),
    []
  );
  const remove = useCallback((key) => setItems((p) => p.filter((i) => i.key !== key)), []);
  const toggleSiddh = useCallback((key) => setItems((p) => p.map((i) => (i.key === key ? { ...i, siddh: !i.siddh } : i))), []);
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(() => {
    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
    const siddhTotal = settings.siddhPrice > 0 ? items.reduce((s, i) => s + (i.siddh ? settings.siddhPrice * i.qty : 0), 0) : 0;
    const count = items.reduce((s, i) => s + i.qty, 0);
    const freeLeft = settings.freeShippingMin > 0 ? Math.max(0, settings.freeShippingMin - subtotal) : 0;
    return { items, ready, count, subtotal, siddhTotal, freeLeft, add, setQty, remove, toggleSiddh, clear, open, setOpen, settings };
  }, [items, ready, open, settings, add, setQty, remove, toggleSiddh, clear]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
