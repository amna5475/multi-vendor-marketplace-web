"use client";

import { createContext, useCallback, useContext, useMemo } from "react";
import { useBrowserStore } from "./browser-store";
import type { CartItem } from "./types";

const STORAGE_KEY = "souk.cart";
const EMPTY_CART: CartItem[] = [];

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  setQuantity: (variantId: string, quantity: number) => void;
  removeItem: (variantId: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useBrowserStore<CartItem[]>(STORAGE_KEY, EMPTY_CART);

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity">, quantity = 1) => {
      const existing = items.find((row) => row.variantId === item.variantId);
      if (!existing) {
        setItems([...items, { ...item, quantity: Math.min(quantity, item.stockQty) }]);
        return;
      }
      setItems(
        items.map((row) =>
          row.variantId === item.variantId
            ? { ...row, quantity: Math.min(row.quantity + quantity, row.stockQty) }
            : row,
        ),
      );
    },
    [items, setItems],
  );

  const setQuantity = useCallback(
    (variantId: string, quantity: number) => {
      setItems(
        items
          .map((row) =>
            row.variantId === variantId
              ? { ...row, quantity: Math.max(1, Math.min(quantity, row.stockQty)) }
              : row,
          )
          .filter((row) => row.quantity > 0),
      );
    },
    [items, setItems],
  );

  const removeItem = useCallback(
    (variantId: string) => setItems(items.filter((row) => row.variantId !== variantId)),
    [items, setItems],
  );

  const clear = useCallback(() => setItems([]), [setItems]);

  const value = useMemo<CartContextValue>(() => {
    const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    return { items, count, subtotal, addItem, setQuantity, removeItem, clear };
  }, [items, addItem, setQuantity, removeItem, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
