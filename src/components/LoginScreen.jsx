import { useState } from 'react';
import { Lock, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const DEFAULT_EMAIL = import.meta.env.VITE_USER_EMAIL || '';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState(DEFAULT_EMAIL);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showEmail, setShowEmail] = useState(!DEFAULT_EMAIL);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!password) return;
    setError('');
    setLoading(true);
    const { error: err } = await signIn(email, password);
    setLoading(false);
    if (err) setError(err.message === 'Invalid login credentials' ? 'Wrong password. Try again.' : err.message);
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-white">L</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Life Optimize</h1>
          <p className="text-gray-400 text-sm mt-1">Health & Wellness Tracker</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center">
              <Lock className="w-5 h-5 text-gray-300" />
            </div>
            <div>
              <h2 className="text-white font-semibold">Sign In</h2>
              <p className="text-gray-400 text-xs">Enter your password to continue</p>
            </div>
          </div>

          {error && (
            <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span className="text-sm text-red-400">{error}</span>
            </div>
          )}

          {showEmail && (
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-400 mb-1">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
          )}

          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-400 mb-1">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoFocus
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white rounded-lg px-4 py-2.5 font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          {!showEmail && (
            <button type="button" onClick={() => setShowEmail(true)}
              className="w-full mt-3 text-xs text-gray-500 hover:text-gray-400">
              Use a different email
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
