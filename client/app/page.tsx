'use client';
import { useState, useEffect } from 'react';
import { ShoppingCart, Search, User, Menu, Heart, ChevronRight, Star, Plus, Minus } from 'lucide-react';

export default function EcommerceApp() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCart, setShowCart] = useState(false);

  const categories = [
    { id: 'all', name: 'All Products' },
    { id: 'fruit-veg', name: 'Fruit & Veg' },
    { id: 'meat-seafood', name: 'Meat & Seafood' },
    { id: 'bakery', name: 'Bakery' },
    { id: 'dairy', name: 'Dairy & Eggs' },
    { id: 'pantry', name: 'Pantry' }
  ];

  // Mock products data
  useEffect(() => {
    const mockProducts = [
      { id: 1, name: 'Fresh Bananas', category: 'fruit-veg', price: 3.99, unit: 'kg', image: '🍌', rating: 4.5, stock: 50 },
      { id: 2, name: 'Organic Tomatoes', category: 'fruit-veg', price: 5.99, unit: 'kg', image: '🍅', rating: 4.7, stock: 30 },
      { id: 3, name: 'Chicken Breast', category: 'meat-seafood', price: 12.99, unit: 'kg', image: '🍗', rating: 4.6, stock: 25 },
      { id: 4, name: 'Fresh Salmon', category: 'meat-seafood', price: 24.99, unit: 'kg', image: '🐟', rating: 4.8, stock: 15 },
      { id: 5, name: 'Sourdough Bread', category: 'bakery', price: 4.50, unit: 'each', image: '🍞', rating: 4.9, stock: 20 },
      { id: 6, name: 'Croissants 6pk', category: 'bakery', price: 6.99, unit: 'pack', image: '🥐', rating: 4.4, stock: 18 },
      { id: 7, name: 'Full Cream Milk 2L', category: 'dairy', price: 3.80, unit: 'each', image: '🥛', rating: 4.5, stock: 40 },
      { id: 8, name: 'Greek Yogurt 1kg', category: 'dairy', price: 7.99, unit: 'each', image: '🥛', rating: 4.6, stock: 22 },
      { id: 9, name: 'Pasta 500g', category: 'pantry', price: 2.50, unit: 'pack', image: '🍝', rating: 4.3, stock: 60 },
      { id: 10, name: 'Olive Oil 1L', category: 'pantry', price: 12.99, unit: 'bottle', image: '🫒', rating: 4.7, stock: 35 }
    ];
    setProducts(mockProducts);
  }, []);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (id, delta) => {
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
              <User className="w-6 h-6 cursor-pointer hover:opacity-80" />
              <Heart className="w-6 h-6 cursor-pointer hover:opacity-80" />
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
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`whitespace-nowrap px-3 py-1 rounded-full transition-colors ${selectedCategory === cat.id
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

        {/* Products Grid */}
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            {selectedCategory === 'all' ? 'All Products' : categories.find(c => c.id === selectedCategory)?.name}
          </h3>
          <p className="text-gray-600">{filteredProducts.length} products found</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredProducts.map(product => (
            <div key={product.id} className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden">
              <div className="relative">
                <div className="aspect-square flex items-center justify-center bg-gray-100 text-8xl">
                  {product.image}
                </div>
                <button className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100">
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
                  <span className="text-2xl font-bold text-green-600">${product.price}</span>
                  <span className="text-sm text-gray-500">/ {product.unit}</span>
                </div>

                <button
                  onClick={() => addToCart(product)}
                  className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Shopping Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setShowCart(false)}>
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
                        <div className="text-4xl">{item.image}</div>
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