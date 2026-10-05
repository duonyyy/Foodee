// context/cart-drawer-context.tsx
"use client";
import { createContext, useContext, useState } from "react";

interface CartDrawerContextType {
  isOpen: boolean;
  openCartDrawer: () => void;
  toggleCartDrawer: () => void;
  closeCartDrawer: () => void;
}

const CartDrawerContext = createContext<CartDrawerContextType>({
  isOpen: false,
  openCartDrawer: () => {},
  toggleCartDrawer: () => {},
  closeCartDrawer: () => {},
});

export const CartDrawerProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setOpen] = useState(false);
  const openCartDrawer = () => setOpen(true);
  const toggleCartDrawer = () => setOpen((prev) => !prev);
  const closeCartDrawer = () => setOpen(false);

  return (
    <CartDrawerContext.Provider
      value={{ isOpen, openCartDrawer, toggleCartDrawer, closeCartDrawer }}
    >
      {children}
    </CartDrawerContext.Provider>
  );
};

export const useCartDrawer = () => useContext(CartDrawerContext);
