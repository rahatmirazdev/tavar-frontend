import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getAllProducts, deleteProduct } from '../../services/productService';
import ProductForm from '../../components/ProductForm';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const formatPrice = (price) => {
  if (typeof price === 'string') return price.startsWith('৳') ? price : `৳${price}`;
  return `৳${Number(price).toLocaleString('en-IN')}`;
};

export default function AdminProductsPage() {
  const { user } = useSelector((state) => state.auth);
  const role = typeof user?.role === 'object' ? user?.role?.name : user?.role;
  const canManageProducts = role === 'admin' || role === 'staff';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getAllProducts({ limit: 100 });
      setProducts(Array.isArray(data) ? data : (data.products || []));
      setError(null);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setShowForm(true);
  };

  const handleDelete = async (productId, productName) => {
    if (!confirm(`Are you sure you want to delete "${productName}"?`)) {
      return;
    }

    setDeleting(productId);
    try {
      await deleteProduct(productId);
      setProducts(prev => prev.filter(p => p._id !== productId));
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete product');
    } finally {
      setDeleting(null);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setSelectedProduct(null);
    loadProducts();
  };

  const handleCreateNew = () => {
    setSelectedProduct(null);
    setShowForm(true);
  };

  return (
    <div>
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-gray-900">
            Product Management
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            Total products: {products.length}
          </p>
        </div>
        {canManageProducts && (
          <button
            onClick={handleCreateNew}
            className="px-6 py-3 bg-gray-900 text-white font-bold rounded-none hover:bg-gray-800 transition text-sm"
          >
            + Create Product
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm font-bold">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-400">Loading products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 mb-4">No products found</p>
          {canManageProducts && (
            <button
              onClick={handleCreateNew}
              className="px-6 py-3 bg-gray-900 text-white font-bold rounded-none hover:bg-gray-800 transition text-sm"
            >
              Create First Product
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-900">
                <th className="text-left px-4 py-3 text-xs font-black uppercase tracking-widest text-gray-900">Image</th>
                <th className="text-left px-4 py-3 text-xs font-black uppercase tracking-widest text-gray-900">Name</th>
                <th className="text-left px-4 py-3 text-xs font-black uppercase tracking-widest text-gray-900">Category</th>
                <th className="text-left px-4 py-3 text-xs font-black uppercase tracking-widest text-gray-900">Price</th>
                <th className="text-left px-4 py-3 text-xs font-black uppercase tracking-widest text-gray-900">Stock</th>
                <th className="text-left px-4 py-3 text-xs font-black uppercase tracking-widest text-gray-900">Rating</th>
                <th className="text-left px-4 py-3 text-xs font-black uppercase tracking-widest text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    {product.images?.[0] && (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-10 h-10 object-cover rounded"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/40?text=No+Image';
                        }}
                      />
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs font-bold text-gray-900 max-w-xs truncate">{product.name}</td>
                  <td className="px-4 py-3 text-xs text-gray-600 capitalize">
                    {typeof product.category === 'string' ? product.category : product.category?.name || '—'}
                  </td>
                  <td className="px-4 py-3 text-xs font-bold text-gray-900">{formatPrice(product.price)}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{product.stock ?? '0'}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">⭐ {product.rating ?? '0'}</td>
                  <td className="px-4 py-3 text-xs flex gap-2">
                    {canManageProducts && (
                      <>
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                          title="Edit"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product._id, product.name)}
                          disabled={deleting === product._id}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <ProductForm
          product={selectedProduct}
          onSuccess={handleFormSuccess}
          onClose={() => {
            setShowForm(false);
            setSelectedProduct(null);
          }}
        />
      )}
    </div>
  );
}
