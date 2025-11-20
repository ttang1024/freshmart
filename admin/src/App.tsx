import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, X, Save, Package, DollarSign, Tag, Layers, AlertCircle, CheckCircle } from 'lucide-react';

// Types for products and categories to avoid `never` inference from useState([])
type Category = {
  id: number;
  name: string;
  slug?: string;
};

type Product = {
  id: number;
  name: string;
  description?: string;
  price: number;
  unit: string;
  stock: number;
  category: string;
  category_id: number;
  image_url?: string;
  rating: number;
};

export default function AdminProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  // selectedCategory stores the select value (string) or 'all'
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    price: string;
    unit: string;
    stock: string;
    category_id: string;
    image_url: string;
    rating: string;
  }>({
    name: '',
    description: '',
    price: '',
    unit: 'kg',
    stock: '',
    category_id: '',
    image_url: '',
    rating: '0'
  });

  // Mock categories data
  useEffect(() => {
    const mockCategories = [
      { id: 1, name: 'Fruit & Veg', slug: 'fruit-veg' },
      { id: 2, name: 'Meat & Seafood', slug: 'meat-seafood' },
      { id: 3, name: 'Bakery', slug: 'bakery' },
      { id: 4, name: 'Dairy & Eggs', slug: 'dairy' },
      { id: 5, name: 'Pantry', slug: 'pantry' },
      { id: 6, name: 'Beverages', slug: 'beverages' },
      { id: 7, name: 'Frozen', slug: 'frozen' }
    ];
    setCategories(mockCategories);

    // Mock products data
    const mockProducts = [
      { id: 1, name: 'Fresh Bananas', category: 'Fruit & Veg', category_id: 1, price: 3.99, unit: 'kg', stock: 50, image_url: '🍌', rating: 4.5 },
      { id: 2, name: 'Organic Tomatoes', category: 'Fruit & Veg', category_id: 1, price: 5.99, unit: 'kg', stock: 30, image_url: '🍅', rating: 4.7 },
      { id: 3, name: 'Chicken Breast', category: 'Meat & Seafood', category_id: 2, price: 12.99, unit: 'kg', stock: 25, image_url: '🍗', rating: 4.6 },
      { id: 4, name: 'Fresh Salmon', category: 'Meat & Seafood', category_id: 2, price: 24.99, unit: 'kg', stock: 15, image_url: '🐟', rating: 4.8 },
      { id: 5, name: 'Sourdough Bread', category: 'Bakery', category_id: 3, price: 4.50, unit: 'each', stock: 20, image_url: '🍞', rating: 4.9 },
      { id: 6, name: 'Greek Yogurt 1kg', category: 'Dairy & Eggs', category_id: 4, price: 7.99, unit: 'each', stock: 22, image_url: '🥛', rating: 4.6 },
      { id: 7, name: 'Pasta 500g', category: 'Pantry', category_id: 5, price: 2.50, unit: 'pack', stock: 60, image_url: '🍝', rating: 4.3 },
      { id: 8, name: 'Orange Juice 2L', category: 'Beverages', category_id: 6, price: 5.99, unit: 'bottle', stock: 35, image_url: '🧃', rating: 4.4 }
    ];
    setProducts(mockProducts);
  }, []);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.category_id === parseInt(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3001);
  };

  const handleOpenModal = (product: Product | null = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price.toString(),
        unit: product.unit,
        stock: product.stock.toString(),
        category_id: product.category_id.toString(),
        image_url: product.image_url || '',
        rating: product.rating?.toString() || '0'
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        unit: 'kg',
        stock: '',
        category_id: '',
        image_url: '',
        rating: '0'
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      unit: 'kg',
      stock: '',
      category_id: '',
      image_url: '',
      rating: '0'
    });
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.price || !formData.stock || !formData.category_id) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }

    const category = categories.find(c => c.id === parseInt(formData.category_id)) ?? { id: 0, name: 'Uncategorized' };

    if (editingProduct) {
      // Update existing product
      setProducts(products.map(p =>
        p.id === editingProduct.id
          ? {
            ...p,
            ...formData,
            price: parseFloat(formData.price),
            stock: parseInt(formData.stock),
            category_id: parseInt(formData.category_id),
            category: category.name,
            rating: parseFloat(formData.rating)
          }
          : p
      ));
      showNotification('Product updated successfully!');
    } else {
      // Add new product
      const newProduct = {
        id: products.length + 1,
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        category_id: parseInt(formData.category_id),
        category: category.name,
        rating: parseFloat(formData.rating)
      };
      setProducts([...products, newProduct]);
      showNotification('Product added successfully!');
    }

    handleCloseModal();
  };

  const handleDelete = (productId: number) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setProducts(products.filter(p => p.id !== productId));
      showNotification('Product deleted successfully!', 'error');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target as HTMLInputElement & { name: string; value: string };
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-green-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">Product Management</h1>
          <p className="text-green-100 mt-1">Manage your store inventory and pricing</p>
        </div>
      </header>

      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          } text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3`}>
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span className="font-medium">{notification.message}</span>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Products</p>
                <p className="text-3xl font-bold text-gray-900">{products.length}</p>
              </div>
              <Package className="w-12 h-12 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Categories</p>
                <p className="text-3xl font-bold text-gray-900">{categories.length}</p>
              </div>
              <Layers className="w-12 h-12 text-purple-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Low Stock Items</p>
                <p className="text-3xl font-bold text-gray-900">{products.filter(p => p.stock < 20).length}</p>
              </div>
              <AlertCircle className="w-12 h-12 text-orange-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Value</p>
                <p className="text-3xl font-bold text-gray-900">
                  ${products.reduce((sum, p) => sum + (p.price * p.stock), 0).toFixed(0)}
                </p>
              </div>
              <DollarSign className="w-12 h-12 text-green-500" />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex-1 w-full md:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="flex gap-4 w-full md:w-auto">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="flex-1 md:flex-none px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat?.id} value={cat?.id}>{cat?.name}</option>
                ))}
              </select>

              <button
                onClick={() => handleOpenModal()}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Product
              </button>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Product</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Price</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Stock</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Rating</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProducts.map(product => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                          {product.image_url}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">ID: {product.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">${product.price.toFixed(2)}</div>
                      <div className="text-sm text-gray-500">per {product.unit}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${product.stock < 20
                        ? 'bg-red-100 text-red-700'
                        : product.stock < 50
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-green-100 text-green-700'
                        }`}>
                        {product.stock} units
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">★</span>
                        <span className="font-medium text-gray-900">{product.rating}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(product)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No products found</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Product Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., Fresh Organic Bananas"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Product description..."
                />
              </div>

              {/* Price and Unit */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Price ($) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Unit *
                  </label>
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="each">each</option>
                    <option value="pack">pack</option>
                    <option value="bottle">bottle</option>
                    <option value="punnet">punnet</option>
                    <option value="bunch">bunch</option>
                    <option value="L">L</option>
                    <option value="mL">mL</option>
                  </select>
                </div>
              </div>

              {/* Stock and Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat?.id} value={cat?.id}>{cat?.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Image (Emoji or URL)
                </label>
                <input
                  type="text"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="🍌 or https://..."
                />
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Initial Rating (0-5)
                </label>
                <input
                  type="number"
                  name="rating"
                  value={formData.rating}
                  onChange={handleInputChange}
                  step="0.1"
                  min="0"
                  max="5"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="0.0"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleCloseModal}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}