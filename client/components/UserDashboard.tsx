import { useState, useEffect } from 'react';
import { User, Package, Heart, Settings, MapPin, CreditCard, Bell, Shield, ChevronRight, Edit, Trash2, Star, ShoppingBag, Calendar, Truck, CheckCircle, Clock, X } from 'lucide-react';

export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState('profile');
  const [user, setUser] = useState({
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 234 567 8900',
    joinedDate: '2024-01-15'
  });

  const [orders, setOrders] = useState([
    {
      id: 1001,
      date: '2025-01-20',
      status: 'delivered',
      total: 89.97,
      items: 3,
      products: [
        { id: 1, name: 'Fresh Bananas', price: 3.99, quantity: 2, image: '🍌' },
        { id: 2, name: 'Organic Tomatoes', price: 5.99, quantity: 1, image: '🍅' }
      ]
    },
    {
      id: 1002,
      date: '2025-01-18',
      status: 'in-transit',
      total: 45.50,
      items: 2,
      products: [
        { id: 3, name: 'Greek Yogurt', price: 7.99, quantity: 1, image: '🥛' },
        { id: 4, name: 'Sourdough Bread', price: 4.50, quantity: 1, image: '🍞' }
      ]
    },
    {
      id: 1003,
      date: '2025-01-15',
      status: 'processing',
      total: 124.99,
      items: 5,
      products: [
        { id: 5, name: 'Fresh Salmon', price: 24.99, quantity: 1, image: '🐟' }
      ]
    }
  ]);

  const [wishlist, setWishlist] = useState([
    { id: 1, name: 'Fresh Strawberries', price: 7.99, unit: 'punnet', image: '🍓', rating: 4.8, stock: 25 },
    { id: 2, name: 'Avocados', price: 2.99, unit: 'each', image: '🥑', rating: 4.6, stock: 45 },
    { id: 3, name: 'Blueberries', price: 8.99, unit: 'punnet', image: '🫐', rating: 4.7, stock: 30 },
    { id: 4, name: 'Organic Honey', price: 12.99, unit: 'jar', image: '🍯', rating: 4.9, stock: 15 }
  ]);

  const [addresses, setAddresses] = useState([
    {
      id: 1,
      type: 'Home',
      name: 'John Doe',
      street: '123 Main Street',
      city: 'Hamilton',
      state: 'Waikato',
      zip: '3200',
      country: 'New Zealand',
      isDefault: true
    },
    {
      id: 2,
      type: 'Work',
      name: 'John Doe',
      street: '456 Office Ave',
      city: 'Auckland',
      state: 'Auckland',
      zip: '1010',
      country: 'New Zealand',
      isDefault: false
    }
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'in-transit': return 'bg-blue-100 text-blue-700';
      case 'processing': return 'bg-yellow-100 text-yellow-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="w-5 h-5" />;
      case 'in-transit': return <Truck className="w-5 h-5" />;
      case 'processing': return <Clock className="w-5 h-5" />;
      default: return <Package className="w-5 h-5" />;
    }
  };

  const removeFromWishlist = (productId) => {
    setWishlist(wishlist.filter(item => item.id !== productId));
  };

  const addToCart = (product) => {
    alert(`Added ${product.name} to cart!`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-green-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">My Account</h1>
          <p className="text-green-100 mt-1">Manage your profile, orders, and preferences</p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-8">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <User className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="font-bold text-lg text-gray-900">{user.firstName} {user.lastName}</h3>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>

              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'profile' ? 'bg-green-50 text-green-600 font-semibold' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <User className="w-5 h-5" />
                  My Profile
                </button>

                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'orders' ? 'bg-green-50 text-green-600 font-semibold' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <Package className="w-5 h-5" />
                  My Orders
                  <span className="ml-auto bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs font-bold">
                    {orders.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('wishlist')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'wishlist' ? 'bg-green-50 text-green-600 font-semibold' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <Heart className="w-5 h-5" />
                  Wishlist
                  <span className="ml-auto bg-pink-100 text-pink-600 px-2 py-1 rounded-full text-xs font-bold">
                    {wishlist.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('addresses')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'addresses' ? 'bg-green-50 text-green-600 font-semibold' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <MapPin className="w-5 h-5" />
                  Addresses
                </button>

                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'settings' ? 'bg-green-50 text-green-600 font-semibold' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <Settings className="w-5 h-5" />
                  Settings
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
                    <button className="flex items-center gap-2 text-green-600 hover:text-green-700 font-semibold">
                      <Edit className="w-5 h-5" />
                      Edit
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                      <input
                        type="text"
                        value={user.firstName}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                      <input
                        type="text"
                        value={user.lastName}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={user.email}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        value={user.phone}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6">
                    <Package className="w-12 h-12 mb-4 opacity-80" />
                    <h3 className="text-3xl font-bold mb-1">{orders.length}</h3>
                    <p className="opacity-90">Total Orders</p>
                  </div>
                  <div className="bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-xl p-6">
                    <Heart className="w-12 h-12 mb-4 opacity-80" />
                    <h3 className="text-3xl font-bold mb-1">{wishlist.length}</h3>
                    <p className="opacity-90">Wishlist Items</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6">
                    <MapPin className="w-12 h-12 mb-4 opacity-80" />
                    <h3 className="text-3xl font-bold mb-1">{addresses.length}</h3>
                    <p className="opacity-90">Saved Addresses</p>
                  </div>
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Order History</h2>

                  {orders.length === 0 ? (
                    <div className="text-center py-12">
                      <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">No orders yet</p>
                      <button className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
                        Start Shopping
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map(order => (
                        <div key={order.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-bold text-lg">Order #{order.id}</h3>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${getStatusColor(order.status)}`}>
                                  {getStatusIcon(order.status)}
                                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  {new Date(order.date).toLocaleDateString()}
                                </span>
                                <span className="flex items-center gap-1">
                                  <ShoppingBag className="w-4 h-4" />
                                  {order.items} items
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-green-600">${order.total.toFixed(2)}</p>
                            </div>
                          </div>

                          <div className="border-t pt-4 mt-4">
                            <div className="flex items-center gap-4 mb-4">
                              {order.products.slice(0, 3).map((product, idx) => (
                                <div key={idx} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                                  <div className="text-3xl">{product.image}</div>
                                  <div>
                                    <p className="font-semibold text-sm">{product.name}</p>
                                    <p className="text-xs text-gray-600">Qty: {product.quantity}</p>
                                  </div>
                                </div>
                              ))}
                              {order.items > 3 && (
                                <span className="text-sm text-gray-500">+{order.items - 3} more</span>
                              )}
                            </div>

                            <div className="flex gap-3">
                              <button className="flex-1 border border-green-600 text-green-600 py-2 rounded-lg hover:bg-green-50 transition-colors font-semibold">
                                View Details
                              </button>
                              {order.status === 'delivered' && (
                                <button className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold">
                                  Reorder
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Wishlist Tab */}
            {activeTab === 'wishlist' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">My Wishlist</h2>

                  {wishlist.length === 0 ? (
                    <div className="text-center py-12">
                      <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">Your wishlist is empty</p>
                      <button className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
                        Browse Products
                      </button>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-6">
                      {wishlist.map(product => (
                        <div key={product.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                          <div className="flex gap-4">
                            <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center text-5xl flex-shrink-0">
                              {product.image}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-bold text-lg mb-1">{product.name}</h3>
                              <div className="flex items-center gap-1 mb-2">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm text-gray-600">{product.rating}</span>
                              </div>
                              <div className="flex items-baseline gap-1 mb-3">
                                <span className="text-2xl font-bold text-green-600">${product.price}</span>
                                <span className="text-sm text-gray-500">/ {product.unit}</span>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => addToCart(product)}
                                  className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold"
                                >
                                  Add to Cart
                                </button>
                                <button
                                  onClick={() => removeFromWishlist(product.id)}
                                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                  <Trash2 className="w-5 h-5 text-red-500" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Saved Addresses</h2>
                    <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                      <MapPin className="w-5 h-5" />
                      Add New Address
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {addresses.map(address => (
                      <div key={address.id} className="border border-gray-200 rounded-xl p-6 relative">
                        {address.isDefault && (
                          <span className="absolute top-4 right-4 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                            Default
                          </span>
                        )}
                        <div className="mb-4">
                          <h3 className="font-bold text-lg mb-1">{address.type}</h3>
                          <p className="text-gray-700">{address.name}</p>
                        </div>
                        <div className="text-gray-600 space-y-1 mb-4">
                          <p>{address.street}</p>
                          <p>{address.city}, {address.state} {address.zip}</p>
                          <p>{address.country}</p>
                        </div>
                        <div className="flex gap-2">
                          <button className="flex-1 border border-green-600 text-green-600 py-2 rounded-lg hover:bg-green-50 transition-colors font-semibold">
                            Edit
                          </button>
                          <button className="px-4 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h2>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Bell className="w-6 h-6 text-gray-600" />
                        <div>
                          <h3 className="font-semibold">Email Notifications</h3>
                          <p className="text-sm text-gray-600">Receive order updates and promotions</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Shield className="w-6 h-6 text-gray-600" />
                        <div>
                          <h3 className="font-semibold">Two-Factor Authentication</h3>
                          <p className="text-sm text-gray-600">Add extra security to your account</p>
                        </div>
                      </div>
                      <button className="text-green-600 font-semibold hover:text-green-700">
                        Enable
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-6 h-6 text-gray-600" />
                        <div>
                          <h3 className="font-semibold">Payment Methods</h3>
                          <p className="text-sm text-gray-600">Manage your saved payment methods</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Change Password</h3>
                  <div className="space-y-4">
                    <input
                      type="password"
                      placeholder="Current Password"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <input
                      type="password"
                      placeholder="New Password"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <input
                      type="password"
                      placeholder="Confirm New Password"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <button className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-semibold">
                      Update Password
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}