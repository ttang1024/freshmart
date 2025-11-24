'use client';

import { useState } from 'react';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { wishlistAPI } from '@/lib/api';

export default function ProductCard({ product }: { product: any }) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [adding, setAdding] = useState(false);

  const handleAddToCart = async () => {
    setAdding(true);
    try {
      await addToCart(product);
      // Show success notification
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setAdding(false);
    }
  };

  const toggleWishlist = async () => {
    if (!user) {
      alert('Please login to add to wishlist');
      return;
    }

    try {
      if (isInWishlist) {
        await wishlistAPI.removeFromWishlist(user.id, product.id);
        setIsInWishlist(false);
      } else {
        await wishlistAPI.addToWishlist(user.id, product.id);
        setIsInWishlist(true);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow">
      <div className="relative">
        <div className="aspect-square flex items-center justify-center bg-gray-100 text-8xl">
          {product.image_url}
        </div>

        <button
          onClick={toggleWishlist}
          className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-md hover:scale-110 transition-transform"
        >
          <Heart
            className={`w-5 h-5 ${isInWishlist ? 'fill-pink-500 text-pink-500' : 'text-gray-600'}`}
          />
        </button>
      </div>

      <div className="p-4">
        <h3 className="font-bold text-lg mb-2">{product.name}</h3>

        <div className="flex items-center gap-1 mb-3">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm text-gray-600">{product.rating}</span>
        </div>

        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-2xl font-bold text-green-600">${product.price}</span>
          <span className="text-sm text-gray-500">/ {product.unit}</span>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={adding || product.stock === 0}
          className={`w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${product.stock === 0
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-green-600 text-white hover:bg-green-700'
            }`}
        >
          <ShoppingCart className="w-5 h-5" />
          {adding ? 'Adding...' : product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}