import { useEffect, useState } from 'react';
import { getAllUsers } from '../../services/adminService';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const data = await getAllUsers();
        setCustomers(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to fetch customers');
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black uppercase tracking-tight text-gray-900">
          Customer Management
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          Total customers: {customers.length}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm font-bold">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-400">Loading customers...</p>
        </div>
      ) : customers.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400">No customers found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-900">
                <th className="text-left px-4 py-3 text-xs font-black uppercase tracking-widest text-gray-900">Name</th>
                <th className="text-left px-4 py-3 text-xs font-black uppercase tracking-widest text-gray-900">Email</th>
                <th className="text-left px-4 py-3 text-xs font-black uppercase tracking-widest text-gray-900">Phone</th>
                <th className="text-left px-4 py-3 text-xs font-black uppercase tracking-widest text-gray-900">Role</th>
                <th className="text-left px-4 py-3 text-xs font-black uppercase tracking-widest text-gray-900">Joined</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 text-xs font-bold text-gray-900">{customer.name}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{customer.email}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{customer.phone || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold uppercase tracking-widest px-2 py-1 rounded ${
                      customer.role === 'admin' ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-700'
                    }`}>
                      {customer.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">{formatDate(customer.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
