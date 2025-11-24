'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart, Search, User, Menu, Heart, ChevronRight, Star, Plus, Minus } from 'lucide-react';
import { productsAPI, categoriesAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import WishlistSidebar from '@/components/WishlistSidebar';

interface Product {
  id: number;
  name: string;
  category: string;
  category_id: number;
  price: number;
  unit: string;
  image_url: string;
  rating: number;
  stock: number;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCart, setShowCart] = useState(false);
  const [showWishlist, setShowWishlist] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoriesAPI.getAll();
        setCategories([{ id: 0, name: 'All Products', slug: 'all' }, ...data]);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const params: any = {};
        if (selectedCategory !== 'all') {
          params.category = selectedCategory;
        }
        if (searchQuery) {
          params.search = searchQuery;
        }

        const data = await productsAPI.getAll(params);
        setProducts(data);
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [selectedCategory, searchQuery]);

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const addToWishlist = (product: Product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + delta);
        return newQty === 0 ? null : { ...item, quantity: newQty };
      }
      return item;
    }).filter(Boolean));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-green-600 text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Menu className="w-6 h-6 cursor-pointer hover:opacity-80" />
              <h1 className="text-2xl font-bold">FreshMart</h1>
            </div>

            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 pl-10 rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-300"
                />
                <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-500" />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <User className="w-6 h-6 cursor-pointer hover:opacity-80" onClick={() => router.push('/profile')} />
              <Heart className="w-6 h-6 cursor-pointer hover:opacity-80" onClick={() => setShowWishlist(!showWishlist)} />
              <div className="relative cursor-pointer" onClick={() => setShowCart(!showCart)}>
                <ShoppingCart className="w-6 h-6 hover:opacity-80" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Category Navigation */}
          <nav className="border-t border-green-500">
            <div className="flex gap-6 py-3 overflow-x-auto">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id === 0 ? 'all' : cat.id.toString())}
                  className={`whitespace-nowrap px-3 py-1 rounded-full transition-colors ${(selectedCategory === 'all' && cat.id === 0) || selectedCategory === cat.id.toString()
                    ? 'bg-white text-green-600 font-semibold'
                    : 'hover:bg-green-500'
                    }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Banner */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-8 mb-8 text-white">
          <h2 className="text-3xl font-bold mb-2">Fresh Deals This Week!</h2>
          <p className="text-lg mb-4">Save up to 30% on selected fresh produce</p>
          <button className="bg-white text-green-600 px-6 py-2 rounded-full font-semibold hover:bg-gray-100 transition-colors">
            Shop Now
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            <p className="text-gray-600 mt-4">Loading products...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">Error loading products: {error}</p>
            <p className="text-sm text-red-600 mt-2">Make sure the Flask backend is running on http://localhost:5000</p>
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && (
          <>
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                {selectedCategory === 'all' ? 'All Products' : categories.find(c => c.id.toString() === selectedCategory)?.name}
              </h3>
              <p className="text-gray-600">{products.length} products found</p>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No products found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {products.map(product => (
                  <div key={product.id} className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden">
                    <div className="relative">
                      <div className="aspect-square flex items-center justify-center bg-gray-100 text-8xl">
                        {product.image_url}
                      </div>
                      <button className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100" onClick={() => addToWishlist(product)}>
                        <Heart className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>

                    <div className="p-4">
                      <h4 className="font-semibold text-gray-800 mb-1">{product.name}</h4>
                      <div className="flex items-center gap-1 mb-2">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-gray-600">{product.rating}</span>
                      </div>

                      <div className="flex items-baseline gap-1 mb-3">
                        <span className="text-2xl font-bold text-green-600">${product.price.toFixed(2)}</span>
                        <span className="text-sm text-gray-500">/ {product.unit}</span>
                      </div>

                      <button
                        onClick={() => addToCart(product)}
                        disabled={product.stock === 0}
                        className={`w-full py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${product.stock === 0
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-green-600 text-white hover:bg-green-700'
                          }`}
                      >
                        <Plus className="w-4 h-4" />
                        {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
      <WishlistSidebar isOpen={showWishlist} onClose={() => setShowWishlist(false)} />

      {/* Shopping Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowCart(false)}>
          <div
            className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Shopping Cart</h2>
                <button onClick={() => setShowCart(false)} className="text-gray-500 hover:text-gray-700">
                  ✕
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Your cart is empty</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {cart.map(item => (
                      <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="text-4xl">{item.image_url}</div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800">{item.name}</h4>
                          <p className="text-sm text-gray-600">${item.price} / {item.unit}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-8 h-8 rounded-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="font-bold text-green-600">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-lg font-semibold">Subtotal:</span>
                      <span className="text-2xl font-bold text-green-600">${cartTotal.toFixed(2)}</span>
                    </div>
                    <button className="w-full bg-green-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                      Proceed to Checkout
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}