'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { wishlistAPI } from '@/lib/api';

interface WishlistItem {
  id?: number;
  product_id: number;
  name?: string;
  price?: number;
  unit?: string;
  image?: string;
  rating?: number;
  stock?: number;
  [key: string]: unknown;
}

interface Product {
  id: number;
  name: string;
  price: number;
  unit: string;
  image_url: string;
  rating?: number;
  stock?: number;
  [key: string]: unknown;
}

interface WishlistContextType {
  wishlist: WishlistItem[];
  wishlistCount: number;
  addToWishlist: (product: Product) => Promise<void>;
  removeFromWishlist: (productId: number) => Promise<void>;
  clearWishlist: () => Promise<void>;
  refreshWishlist: () => Promise<void>;
  isInWishlist: (productId: number) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

  const loadWishlist = async () => {
    if (!user?.id) return;
    try {
      const data = await wishlistAPI.getWishlist(user.id);
      setWishlist(data);
    } catch (error) {
      console.error('Error loading wishlist:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      loadWishlist();
    } else {
      // Load from localStorage for guests
      const localWishlist = localStorage.getItem('wishlist');
      if (localWishlist) {
        setWishlist(JSON.parse(localWishlist));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user]);

  // Save to localStorage for guests
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
    }
  }, [wishlist, isAuthenticated]);

  const addToWishlist = async (product: Product) => {
    if (!user?.id) {
      // For guests, just add to local state
      if (!wishlist.find(item => item.product_id === product.id)) {
        setWishlist([...wishlist, { product_id: product.id, ...product }] as WishlistItem[]);
      }
      return;
    }

    try {
      await wishlistAPI.addToWishlist(user.id, product.id);
      // Update local state
      if (!wishlist.find(item => item.product_id === product.id)) {
        setWishlist([...wishlist, {
          product_id: product.id,
          name: product.name,
          price: product.price,
          unit: product.unit,
          image: product.image_url,
          rating: product.rating,
          stock: product.stock,
        }] as WishlistItem[]);
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      throw error;
    }
  };

  const removeFromWishlist = async (productId: number) => {
    if (!user?.id) {
      // For guests, just remove from local state
      setWishlist(wishlist.filter(item => item.product_id !== productId));
      return;
    }

    try {
      await wishlistAPI.removeFromWishlist(user.id, productId);
      // Update local state
      setWishlist(wishlist.filter(item => item.product_id !== productId));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      throw error;
    }
  };

  const clearWishlist = async () => {
    if (!user?.id) {
      setWishlist([]);
      return;
    }

    try {
      await wishlistAPI.clearWishlist(user.id);
      setWishlist([]);
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      throw error;
    }
  };

  const refreshWishlist = async () => {
    await loadWishlist();
  };

  const isInWishlist = (productId: number): boolean => {
    return wishlist.some(item => item.product_id === productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount: wishlist.length,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
        refreshWishlist,
        isInWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
}
