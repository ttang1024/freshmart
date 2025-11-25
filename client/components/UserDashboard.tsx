import { useState, useEffect } from 'react';
import { User, Package, Heart, Settings, MapPin, CreditCard, Bell, Shield, ChevronRight, Edit, Trash2, Star, ShoppingBag, Calendar, Truck, CheckCircle, Clock } from 'lucide-react';
import { addressAPI } from '../lib/api';

interface WishlistItem {
  id?: number | string;
  product_id?: number | string;
  name?: string | React.ReactNode;
  price?: number;
  unit?: string;
  image?: string | React.ReactNode;
  rating?: number;
  stock?: number;
  [key: string]: unknown;
}

interface UserDashboardProps {
  user?: {
    id?: number;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    joinedDate?: string;
  } | null;
  orders?: Record<string, unknown>[];
  wishlist?: WishlistItem[];
  addresses?: Record<string, unknown>[];
  _onRefresh?: () => Promise<void>;
  onRemoveFromWishlist?: (productId: number) => Promise<void>;
  _onAddToCart?: (product: Record<string, unknown>) => void;
}

const defaultUser = {
  id: 1,
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '+1 234 567 8900',
  joinedDate: '2024-01-15'
};

const defaultOrders = [
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
];

const defaultAddresses = [
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
];

export default function UserDashboard({
  user: propUser,
  orders: propOrders,
  wishlist: propWishlist,
  addresses: propAddresses,
  _onRefresh,
  onRemoveFromWishlist,
  _onAddToCart
}: UserDashboardProps) {


  // Settings state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [user, setUser] = useState(propUser || defaultUser);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editProfileLoading, setEditProfileLoading] = useState(false);
  const [editProfileData, setEditProfileData] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email || '',
    phone: user.phone || ''
  });
  const [orders, setOrders] = useState<Record<string, unknown>[]>(propOrders || defaultOrders);
  const [wishlist, setWishlist] = useState<WishlistItem[]>(propWishlist || []);
  const [addresses, setAddresses] = useState<Record<string, unknown>[]>(propAddresses || defaultAddresses);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressFormLoading, setAddressFormLoading] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    type: 'Home',
    name: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    isDefault: false
  });

  // Payment methods state (declared after activeTab and user are initialized)
  const [paymentMethods, setPaymentMethods] = useState<Array<{ id: number; type: string; last4: string; name: string }>>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ type: 'Credit Card', name: '', number: '', expiry: '', cvc: '' });
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Fetch payment methods when settings tab is active
  useEffect(() => {
    if (activeTab === 'settings') {
      fetch(`/api/users/${user.id}/payment_methods`)
        .then(res => res.json())
        .then(data => setPaymentMethods(data.payment_methods || []));
    }
  }, [activeTab, user.id]);

  // Update state when props change
  useEffect(() => {
    if (propUser) setUser(propUser);
  }, [propUser]);

  useEffect(() => {
    if (propOrders) setOrders(propOrders);
  }, [propOrders]);

  useEffect(() => {
    if (propWishlist) setWishlist(propWishlist);
  }, [propWishlist]);

  useEffect(() => {
    if (propAddresses) setAddresses(propAddresses);
  }, [propAddresses]);

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'in-transit': return 'bg-blue-100 text-blue-700';
      case 'processing': return 'bg-yellow-100 text-yellow-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="w-5 h-5" />;
      case 'in-transit': return <Truck className="w-5 h-5" />;
      case 'processing': return <Clock className="w-5 h-5" />;
      default: return <Package className="w-5 h-5" />;
    }
  };

  const handleRemoveFromWishlist = async (productId: number) => {
    if (onRemoveFromWishlist) {
      await onRemoveFromWishlist(productId);
    }
    // Also update local state
    setWishlist(wishlist.filter(item => item.id !== productId && item.product_id !== productId));
  };

  const handleAddToCart = (product: WishlistItem) => {
    if (_onAddToCart) {
      _onAddToCart(product);
    } else {
      // Fallback behavior
      console.log(`Added ${product.name} to cart!`);
    }
  };

  const handleAddressFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!formData.name || !formData.street || !formData.city || !formData.state || !formData.zip || !formData.country) {
      alert('Please fill in all address fields');
      return;
    }

    setAddressFormLoading(true);
    try {
      if (editingAddressId) {
        // Update existing address
        await addressAPI.updateAddress(user.id || 1, editingAddressId, formData);

        // Update local state
        setAddresses(addresses.map(addr =>
          addr.id === editingAddressId ? { ...addr, ...formData } : addr
        ));

        alert('Address updated successfully!');
      } else {
        // Add new address
        await addressAPI.addAddress(user.id || 1, formData);
        // Add to local state
        setAddresses([...addresses, formData]);

        alert('Address added successfully!');
      }

      // Reset form
      setFormData({
        type: 'Home',
        name: '',
        street: '',
        city: '',
        state: '',
        zip: '',
        country: '',
        isDefault: false
      });

      setShowAddressForm(false);
      setEditingAddressId(null);
    } catch (error) {
      console.error('Error saving address:', error);
      alert('Failed to save address. Please try again.');
    } finally {
      setAddressFormLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId: unknown) => {
    if (!window.confirm('Are you sure you want to delete this address?')) {
      return;
    }

    try {
      await addressAPI.deleteAddress(user.id || 1, addressId as number);
      setAddresses(addresses.filter(addr => addr.id !== addressId));
      alert('Address deleted successfully!');
    } catch (error) {
      console.error('Error deleting address:', error);
      alert('Failed to delete address. Please try again.');
    }
  };

  const handleEditAddress = (address: Record<string, unknown>) => {
    setEditingAddressId(address.id as number);
    setFormData({
      type: (address.type as string) || 'Home',
      name: (address.name as string) || '',
      street: (address.street as string) || '',
      city: (address.city as string) || '',
      state: (address.state as string) || '',
      zip: (address.zip as string) || '',
      country: (address.country as string) || '',
      isDefault: (address.isDefault as boolean) || false
    });
    setShowAddressForm(true);
  };

  const handleCloseAddressForm = () => {
    setShowAddressForm(false);
    setEditingAddressId(null);
    setFormData({
      type: 'Home',
      name: '',
      street: '',
      city: '',
      state: '',
      zip: '',
      country: '',
      isDefault: false
    });
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
                  Profile
                </button>

                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'orders' ? 'bg-green-50 text-green-600 font-semibold' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <Package className="w-5 h-5" />
                  Orders
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
                    <button
                      className="flex items-center gap-2 text-green-600 hover:text-green-700 font-semibold"
                      onClick={() => {
                        setEditProfileData({
                          firstName: user.firstName || '',
                          lastName: user.lastName || '',
                          email: user.email || '',
                          phone: user.phone || ''
                        });
                        setShowEditProfile(true);
                      }}
                    >
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
                  <div
                    className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setActiveTab('orders')}
                  >
                    <Package className="w-12 h-12 mb-4 opacity-80" />
                    <h3 className="text-3xl font-bold mb-1">{orders.length}</h3>
                    <p className="opacity-90">Total Orders</p>
                  </div>
                  <div className="bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-xl p-6" onClick={() => setActiveTab('wishlist')}>
                    <Heart className="w-12 h-12 mb-4 opacity-80" />
                    <h3 className="text-3xl font-bold mb-1">{wishlist.length}</h3>
                    <p className="opacity-90">Wishlist Items</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6" onClick={() => setActiveTab('addresses')}>
                    <MapPin className="w-12 h-12 mb-4 opacity-80" />
                    <h3 className="text-3xl font-bold mb-1">{addresses.length}</h3>
                    <p className="opacity-90">Saved Addresses</p>
                  </div>
                </div>
                {/* Edit Profile Modal */}
                {showEditProfile && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-lg max-w-lg w-full">
                      <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <h3 className="text-2xl font-bold text-gray-900">Edit Personal Information</h3>
                        <button
                          onClick={() => setShowEditProfile(false)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <form
                        className="p-6 space-y-4"
                        onSubmit={async e => {
                          e.preventDefault();
                          setEditProfileLoading(true);
                          try {
                            // Simulate API call, replace with userAPI.updateProfile if available
                            await new Promise(res => setTimeout(res, 800));
                            setUser(prev => ({ ...prev, ...editProfileData }));
                            setShowEditProfile(false);
                            alert('Profile updated successfully!');
                          } catch (err) {
                            // Optionally log error
                            console.error('Settings save error:', err);
                            alert('Failed to update profile.');
                          } finally {
                            setEditProfileLoading(false);
                          }
                        }}
                      >
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                            <input
                              type="text"
                              value={editProfileData.firstName}
                              onChange={e => setEditProfileData(d => ({ ...d, firstName: e.target.value }))}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                            <input
                              type="text"
                              value={editProfileData.lastName}
                              onChange={e => setEditProfileData(d => ({ ...d, lastName: e.target.value }))}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                          <input
                            type="email"
                            value={editProfileData.email}
                            onChange={e => setEditProfileData(d => ({ ...d, email: e.target.value }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                          <input
                            type="tel"
                            value={editProfileData.phone}
                            onChange={e => setEditProfileData(d => ({ ...d, phone: e.target.value }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            required
                          />
                        </div>
                        <div className="flex gap-3 pt-4 border-t border-gray-200">
                          <button
                            type="button"
                            onClick={() => setShowEditProfile(false)}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={editProfileLoading}
                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:bg-gray-400"
                          >
                            {editProfileLoading ? 'Saving...' : 'Save Changes'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
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
                      {orders.map(order => {
                        const orderId = order.id as React.Key;
                        const orderStatus = order.status as string;
                        const orderDate = order.date as string;
                        const orderItems = order.items as number;
                        const orderTotal = order.total as number;
                        const orderProducts = order.products as Record<string, unknown>[];
                        return (
                          <div key={orderId} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="font-bold text-lg">Order #{orderId}</h3>
                                  <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${getStatusColor(orderStatus)}`}>
                                    {getStatusIcon(orderStatus)}
                                    {orderStatus.charAt(0).toUpperCase() + orderStatus.slice(1)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {new Date(orderDate).toLocaleDateString()}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <ShoppingBag className="w-4 h-4" />
                                    {orderItems} items
                                  </span>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-bold text-green-600">${(orderTotal as number).toFixed(2)}</p>
                              </div>
                            </div>

                            <div className="border-t pt-4 mt-4">
                              <div className="flex items-center gap-4 mb-4">
                                {orderProducts.slice(0, 3).map((product: Record<string, unknown>, idx: number) => (
                                  <div key={idx} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                                    <div className="text-3xl">{product.image as React.ReactNode}</div>
                                    <div>
                                      <p className="font-semibold text-sm">{product.name as React.ReactNode}</p>
                                      <p className="text-xs text-gray-600">Qty: {product.quantity as React.ReactNode}</p>
                                    </div>
                                  </div>
                                ))}
                                {orderItems > 3 && (
                                  <span className="text-sm text-gray-500">+{orderItems - 3} more</span>
                                )}
                              </div>

                              <div className="flex gap-3">
                                <button className="flex-1 border border-green-600 text-green-600 py-2 rounded-lg hover:bg-green-50 transition-colors font-semibold">
                                  View Details
                                </button>
                                {orderStatus === 'delivered' && (
                                  <button className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold">
                                    Reorder
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
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
                      {wishlist.map((product) => {
                        const productId = product.id || product.product_id;
                        return (
                          <div key={productId as React.Key} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                            <div className="flex gap-4">
                              <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center text-5xl flex-shrink-0">
                                {product.image as React.ReactNode}
                              </div>
                              <div className="flex-1">
                                <h3 className="font-bold text-lg mb-1">{product.name as React.ReactNode}</h3>
                                <div className="flex items-center gap-1 mb-2">
                                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                  <span className="text-sm text-gray-600">{product.rating as React.ReactNode}</span>
                                </div>
                                <div className="flex items-baseline gap-1 mb-3">
                                  <span className="text-2xl font-bold text-green-600">${product.price as React.ReactNode}</span>
                                  <span className="text-sm text-gray-500">/ {(product.unit as string) || 'item'}</span>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleAddToCart(product)}
                                    className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold"
                                  >
                                    Add to Cart
                                  </button>
                                  <button
                                    onClick={() => handleRemoveFromWishlist(productId as number)}
                                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                  >
                                    <Trash2 className="w-5 h-5 text-red-500" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
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
                    <button
                      onClick={() => setShowAddressForm(true)}
                      className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                    >
                      <MapPin className="w-5 h-5" />
                      Add New Address
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {addresses.map(address => (
                      <div key={address.id as React.Key} className="border border-gray-200 rounded-xl p-6 relative">
                        {(address.isDefault as boolean) && (
                          <span className="absolute top-4 right-4 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                            Default
                          </span>
                        )}
                        <div className="mb-4">
                          <h3 className="font-bold text-lg mb-1">{address.type as React.ReactNode}</h3>
                          <p className="text-gray-700">{address.name as React.ReactNode}</p>
                        </div>
                        <div className="text-gray-600 space-y-1 mb-4">
                          <p>{address.street as React.ReactNode}</p>
                          <p>{address.city as React.ReactNode}, {address.state as React.ReactNode} {address.zip as React.ReactNode}</p>
                          <p>{address.country as React.ReactNode}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditAddress(address)}
                            className="flex-1 border border-green-600 text-green-600 py-2 rounded-lg hover:bg-green-50 transition-colors font-semibold"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteAddress(address.id)}
                            className="px-4 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          >
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
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={emailNotifications}
                          onChange={async e => {
                            // Removed setSettingsLoading
                            setEmailNotifications(e.target.checked);
                            // Call backend API
                            await fetch(`/api/users/${user.id}/settings`, {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ email_notifications: e.target.checked })
                            });
                            // Removed setSettingsLoading
                          }}
                        />
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
                      <button
                        className={`text-green-600 font-semibold hover:text-green-700 ${twoFactorEnabled ? 'opacity-50' : ''}`}
                        disabled={twoFactorEnabled}
                        onClick={async () => {
                          // Removed setSettingsLoading
                          setTwoFactorEnabled(true);
                          await fetch(`/api/users/${user.id}/settings`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ two_factor_enabled: true })
                          });
                          // Removed setSettingsLoading
                        }}
                      >
                        {twoFactorEnabled ? 'Enabled' : 'Enable'}
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
                      <button
                        className="text-green-600 font-semibold hover:text-green-700"
                        onClick={() => setShowPaymentModal(true)}
                      >
                        Manage
                      </button>
                    </div>
                    {/* Payment Methods Modal */}
                    {showPaymentModal && (
                      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl shadow-lg max-w-lg w-full">
                          <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h3 className="text-2xl font-bold text-gray-900">Payment Methods</h3>
                            <button
                              onClick={() => setShowPaymentModal(false)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                          <div className="p-6 space-y-4">
                            {paymentMethods.length === 0 ? (
                              <div className="text-center py-6 text-gray-500">No payment methods saved.</div>
                            ) : (
                              <div className="space-y-3">
                                {paymentMethods.map(pm => (
                                  <div key={pm.id} className="flex items-center justify-between border border-gray-200 rounded-lg p-3">
                                    <div>
                                      <span className="font-semibold">{pm.type}</span> •••• {pm.last4} <span className="text-gray-500 ml-2">({pm.name})</span>
                                    </div>
                                    <button
                                      className="text-red-500 hover:text-red-700 px-2"
                                      onClick={async () => {
                                        setPaymentLoading(true);
                                        await fetch(`/api/users/${user.id}/payment_methods/${pm.id}`, { method: 'DELETE' });
                                        setPaymentMethods(methods => methods.filter(m => m.id !== pm.id));
                                        setPaymentLoading(false);
                                      }}
                                      disabled={paymentLoading}
                                    >
                                      Remove
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                            <form
                              className="space-y-3 pt-4 border-t border-gray-200"
                              onSubmit={async e => {
                                e.preventDefault();
                                setPaymentLoading(true);
                                const res = await fetch(`/api/users/${user.id}/payment_methods`, {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify(paymentForm)
                                });
                                const data = await res.json();
                                if (res.ok) {
                                  setPaymentMethods(methods => [...methods, data.payment_method]);
                                  setPaymentForm({ type: 'Credit Card', name: '', number: '', expiry: '', cvc: '' });
                                  alert('Payment method added!');
                                } else {
                                  alert(data.error || 'Failed to add payment method.');
                                }
                                setPaymentLoading(false);
                              }}
                            >
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                <select
                                  value={paymentForm.type}
                                  onChange={e => setPaymentForm(f => ({ ...f, type: e.target.value }))}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                  required
                                >
                                  <option>Credit Card</option>
                                  <option>Debit Card</option>
                                  <option>PayPal</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name on Card</label>
                                <input
                                  type="text"
                                  value={paymentForm.name}
                                  onChange={e => setPaymentForm(f => ({ ...f, name: e.target.value }))}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                                <input
                                  type="text"
                                  value={paymentForm.number}
                                  onChange={e => setPaymentForm(f => ({ ...f, number: e.target.value }))}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                  required
                                  maxLength={19}
                                  pattern="[0-9 ]{12,19}"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry</label>
                                  <input
                                    type="text"
                                    value={paymentForm.expiry}
                                    onChange={e => setPaymentForm(f => ({ ...f, expiry: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    required
                                    placeholder="MM/YY"
                                    maxLength={5}
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">CVC</label>
                                  <input
                                    type="text"
                                    value={paymentForm.cvc}
                                    onChange={e => setPaymentForm(f => ({ ...f, cvc: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    required
                                    maxLength={4}
                                  />
                                </div>
                              </div>
                              <button
                                type="submit"
                                className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 font-semibold"
                                disabled={paymentLoading}
                              >
                                {paymentLoading ? 'Adding...' : 'Add Payment Method'}
                              </button>
                            </form>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Change Password</h3>
                  <form
                    className="space-y-4"
                    onSubmit={async e => {
                      e.preventDefault();
                      setPasswordLoading(true);
                      const res = await fetch(`/api/users/${user.id}/password`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          current_password: passwordForm.current,
                          new_password: passwordForm.new,
                          confirm_password: passwordForm.confirm
                        })
                      });
                      const data = await res.json();
                      if (res.ok) {
                        alert('Password updated successfully!');
                        setPasswordForm({ current: '', new: '', confirm: '' });
                      } else {
                        alert(data.error || 'Failed to update password.');
                      }
                      setPasswordLoading(false);
                    }}
                  >
                    <input
                      type="password"
                      placeholder="Current Password"
                      value={passwordForm.current}
                      onChange={e => setPasswordForm(f => ({ ...f, current: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                    <input
                      type="password"
                      placeholder="New Password"
                      value={passwordForm.new}
                      onChange={e => setPasswordForm(f => ({ ...f, new: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                    <input
                      type="password"
                      placeholder="Confirm New Password"
                      value={passwordForm.confirm}
                      onChange={e => setPasswordForm(f => ({ ...f, confirm: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                    <button
                      type="submit"
                      className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-semibold"
                      disabled={passwordLoading}
                    >
                      {passwordLoading ? 'Updating...' : 'Update Password'}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Address Modal */}
      {showAddressForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900">
                {editingAddressId ? 'Edit Address' : 'Add New Address'}
              </h3>
              <button
                onClick={handleCloseAddressForm}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddressSubmit} className="p-6 space-y-4">
              {/* Address Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleAddressFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option>Home</option>
                  <option>Work</option>
                  <option>Other</option>
                </select>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleAddressFormChange}
                  placeholder="John Doe"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              {/* Street Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                <input
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleAddressFormChange}
                  placeholder="123 Main Street"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              {/* City and State */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleAddressFormChange}
                    placeholder="Hamilton"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State/Province</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleAddressFormChange}
                    placeholder="Waikato"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
              </div>

              {/* ZIP Code and Country */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ZIP/Postal Code</label>
                  <input
                    type="text"
                    name="zip"
                    value={formData.zip}
                    onChange={handleAddressFormChange}
                    placeholder="3200"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleAddressFormChange}
                    placeholder="New Zealand"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
              </div>

              {/* Set as Default */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  name="isDefault"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={handleAddressFormChange}
                  className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                />
                <label htmlFor="isDefault" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Set as default address
                </label>
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseAddressForm}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addressFormLoading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:bg-gray-400"
                >
                  {addressFormLoading ? 'Saving...' : (editingAddressId ? 'Update Address' : 'Add Address')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}