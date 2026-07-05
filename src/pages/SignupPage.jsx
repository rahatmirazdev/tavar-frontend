import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerStart, registerSuccess, registerFailure } from '../redux/authSlice';
import { register } from '../services/authService';

export default function SignupPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(registerStart());
    try {
      const data = await register(form);
      dispatch(registerSuccess(data));
      navigate('/');
    } catch (err) {
      const errorMsg = err?.response?.data?.message || 
                       (err?.response?.data?.errors?.[0]?.message) ||
                       'Registration failed. Please check your information.';
      dispatch(registerFailure(errorMsg));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-24">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="text-3xl font-black tracking-tighter text-gray-900 uppercase italic">
            Tavar<span className="text-red-600 not-italic">.</span>
          </Link>
          <h1 className="mt-6 text-2xl font-black uppercase tracking-widest text-gray-900">
            Create Account
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Join us and start shopping
          </p>
        </div>

        <div className="bg-white border border-gray-100 shadow-sm p-8">
          {error && (
            <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="John Doe"
                className="w-full px-4 py-3 border border-gray-200 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-black transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                className="w-full px-4 py-3 border border-gray-200 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-black transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+1 (555) 000-0000"
                className="w-full px-4 py-3 border border-gray-200 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-black transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-gray-200 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-black transition-colors"
              />
              <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded text-xs text-blue-800">
                <p className="font-bold mb-2">Password must contain:</p>
                <ul className="space-y-1 text-xs">
                  <li className={form.password.length >= 8 ? 'text-green-700' : 'text-red-600'}>
                    ✓ At least 8 characters
                  </li>
                  <li className={/[A-Z]/.test(form.password) ? 'text-green-700' : 'text-red-600'}>
                    ✓ One uppercase letter (A-Z)
                  </li>
                  <li className={/[a-z]/.test(form.password) ? 'text-green-700' : 'text-red-600'}>
                    ✓ One lowercase letter (a-z)
                  </li>
                  <li className={/\d/.test(form.password) ? 'text-green-700' : 'text-red-600'}>
                    ✓ One number (0-9)
                  </li>
                  <li className={/[@$!%*?&]/.test(form.password) ? 'text-green-700' : 'text-red-600'}>
                    ✓ One special character (@$!%*?&)
                  </li>
                </ul>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white text-xs font-bold uppercase tracking-widest py-4 hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account…' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-gray-900 hover:text-red-600 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
