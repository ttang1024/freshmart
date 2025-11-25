'use client';

import { useState, useEffect } from 'react';
import { Heart, X, Trash2, Star, ShoppingBag } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { wishlistAPI } from '@/lib/api';

export default function WishlistSidebar({
  isOpen,
  onClose,
  wishlistItems = [],
  onRemove,
  onAddToCart
}: {
  isOpen: boolean;
  onClose: () => void;
  wishlistItems?: any[];
  onRemove?: (productId: number) => void;
  onAddToCart?: (product: any) => void;
}) {
  const { user } = useAuth();
  const [localWishlist, setLocalWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Use provided wishlist items if available, otherwise fetch from API
  const displayWishlist = wishlistItems.length > 0 ? wishlistItems : localWishlist;

  useEffect(() => {
    // Only fetch from API if no wishlist items provided (API mode)
    if (wishlistItems.length === 0 && isOpen && user) {
      fetchWishlist();
    }
  }, [isOpen, user, wishlistItems.length]);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const data = await wishlistAPI.getWishlist(user?.id);
      setLocalWishlist(data);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (productId: number) => {
    if (onRemove) {
      // Use provided handler for local state management
      onRemove(productId);
    } else if (user) {
      // Use API if no handler provided
      try {
        await wishlistAPI.removeFromWishlist(user.id, productId);
        setLocalWishlist(localWishlist.filter(item => item.product_id !== productId));
      } catch (error) {
        console.error('Error removing from wishlist:', error);
      }
    }
  };

  const handleAddToCart = (product: any) => {
    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose}>
      <div
        className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Heart className="w-6 h-6 text-pink-500" />
              <h2 className="text-2xl font-bold text-gray-800">My Wishlist</h2>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
          ) : displayWishlist.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Your wishlist is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {displayWishlist.map((item: any) => (
                <div key={item.id || item.product_id} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-20 h-20 bg-white rounded-lg flex items-center justify-center text-4xl flex-shrink-0">
                    {item.product?.image_url || item.image_url}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 mb-1">{item.product?.name || item.name}</h4>
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs text-gray-600">{item.product?.rating || item.rating}</span>
                    </div>
                    <p className="text-lg font-bold text-green-600 mb-2">${item.product?.price || item.price}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => onAddToCart && onAddToCart(item.product || item)}
                        className="flex-1 bg-green-600 text-white py-1 rounded text-sm hover:bg-green-700"
                      >
                        Add to Cart
                      </button>
                      <button
                        onClick={() => handleRemoveFromWishlist(item.product_id || item.id)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}