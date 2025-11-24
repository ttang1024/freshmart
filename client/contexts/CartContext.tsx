'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { cartAPI } from '@/lib/api';

interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  product: any;
}

interface CartContextType {
  cart: CartItem[];
  cartCount: number;
  cartTotal: number;
  addToCart: (product: any, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadCart();
    } else {
      // Load from localStorage for guests
      const localCart = localStorage.getItem('cart');
      if (localCart) {
        setCart(JSON.parse(localCart));
      }
    }
  }, [isAuthenticated, user]);

  // Save to localStorage for guests
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart, isAuthenticated]);

  const loadCart = async () => {
    if (!user) return;

    try {
      const data = await cartAPI.getCart(user.id);
      setCart(data.items || []);
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  const addToCart = async (product: any, quantity = 1) => {
    if (isAuthenticated && user) {
      try {
        await cartAPI.addToCart(user.id, product.id, quantity);
        await loadCart();
      } catch (error) {
        console.error('Error adding to cart:', error);
      }
    } else {
      // Guest cart (localStorage)
      const existing = cart.find(item => item.product_id === product.id);
      if (existing) {
        setCart(cart.map(item =>
          item.product_id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        ));
      } else {
        setCart([...cart, {
          id: Date.now(),
          product_id: product.id,
          quantity,
          product
        }]);
      }
    }
  };

  const updateQuantity = async (itemId: number, quantity: number) => {
    if (isAuthenticated && user) {
      try {
        await cartAPI.updateCartItem(user.id, itemId, quantity);
        await loadCart();
      } catch (error) {
        console.error('Error updating cart:', error);
      }
    } else {
      if (quantity === 0) {
        setCart(cart.filter(item => item.id !== itemId));
      } else {
        setCart(cart.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        ));
      }
    }
  };

  const removeFromCart = async (itemId: number) => {
    if (isAuthenticated && user) {
      try {
        await cartAPI.removeFromCart(user.id, itemId);
        await loadCart();
      } catch (error) {
        console.error('Error removing from cart:', error);
      }
    } else {
      setCart(cart.filter(item => item.id !== itemId));
    }
  };

  const clearCart = async () => {
    if (isAuthenticated && user) {
      try {
        await cartAPI.clearCart(user.id);
        setCart([]);
      } catch (error) {
        console.error('Error clearing cart:', error);
      }
    } else {
      setCart([]);
    }
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{
      cart,
      cartCount,
      cartTotal,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      refreshCart: loadCart
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}