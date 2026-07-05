import { useEffect, useState } from 'react';
import { getAllUsers, deleteUser } from '../../services/adminService';
import StaffForm from '../../components/StaffForm';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function AdminStaffPage() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers();
      // Filter to only show admin and staff users
      const staffMembers = Array.isArray(data)
        ? data.filter((user) => user.role === 'admin' || user.role === 'staff')
        : [];
      setStaff(staffMembers);
      setError(null);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to fetch staff members');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleEdit = (staffMember) => {
    setSelectedStaff(staffMember);
    setShowForm(true);
  };

  const handleDelete = async (staffId, staffName) => {
    if (!confirm(`Are you sure you want to delete "${staffName}"?`)) {
      return;
    }

    setDeleting(staffId);
    try {
      await deleteUser(staffId);
      setStaff((prev) => prev.filter((s) => s._id !== staffId));
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete staff member');
    } finally {
      setDeleting(null);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setSelectedStaff(null);
    loadStaff();
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-gray-900">
            Staff Management
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            Total staff members: {staff.length}
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedStaff(null);
            setShowForm(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white font-bold rounded-none hover:bg-blue-700 transition"
        >
          + Add Staff
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm font-bold">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-400">Loading staff members...</p>
        </div>
      ) : staff.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400">No staff members found. Create one to get started!</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-900">
                <th className="text-left px-4 py-3 text-xs font-black uppercase tracking-widest text-gray-900">
                  Name
                </th>
                <th className="text-left px-4 py-3 text-xs font-black uppercase tracking-widest text-gray-900">
                  Email
                </th>
                <th className="text-left px-4 py-3 text-xs font-black uppercase tracking-widest text-gray-900">
                  Phone
                </th>
                <th className="text-left px-4 py-3 text-xs font-black uppercase tracking-widest text-gray-900">
                  Role
                </th>
                <th className="text-left px-4 py-3 text-xs font-black uppercase tracking-widest text-gray-900">
                  Joined
                </th>
                <th className="text-center px-4 py-3 text-xs font-black uppercase tracking-widest text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {staff.map((member) => (
                <tr key={member._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 text-xs font-bold text-gray-900">{member.name}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{member.email}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{member.phone || '—'}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-bold uppercase tracking-widest px-2 py-1 rounded inline-block ${
                        member.role === 'admin'
                          ? 'bg-purple-50 text-purple-700'
                          : 'bg-blue-50 text-blue-700'
                      }`}
                    >
                      {member.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">{formatDate(member.createdAt)}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEdit(member)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-none transition"
                        title="Edit staff member"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(member._id, member.name)}
                        disabled={deleting === member._id}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-none transition disabled:opacity-50"
                        title="Delete staff member"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Staff Form Modal */}
      {showForm && (
        <StaffForm staff={selectedStaff} onClose={() => setShowForm(false)} onSuccess={handleFormSuccess} />
      )}
    </div>
  );
}
