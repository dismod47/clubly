import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

const ADMIN_SESSION_KEY = 'clubly_admin_session';

interface AdminUser {
  id: string;
  email: string;
  organizationName: string;
  isAdmin: boolean;
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export function AdminLoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const email = `${username}@admin.edu`;
      console.log('Looking for email:', email.toLowerCase());
      
      const { data, error: dbError } = await supabase
        .from('users')
        .select('id, email, password_hash, organization_name, is_admin')
        .eq('email', email.toLowerCase())
        .eq('is_admin', true)
        .single();

      console.log('Query result:', { data, error: dbError });

      if (dbError || !data) {
        setError('Invalid credentials');
        setIsLoading(false);
        return;
      }

      console.log('Password being hashed:', JSON.stringify(password), 'Length:', password.length);
      const inputHash = await hashPassword(password);
      console.log('Input hash:', inputHash);
      console.log('Stored hash:', data.password_hash);
      console.log('Match:', inputHash === data.password_hash);
      
      const isValid = inputHash === data.password_hash;

      if (!isValid) {
        setError('Invalid credentials');
        setIsLoading(false);
        return;
      }

      const adminUser: AdminUser = {
        id: data.id,
        email: data.email,
        organizationName: data.organization_name,
        isAdmin: true,
      };

      localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(adminUser));
      navigate('/admin/dashboard');
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF8C42] to-[#FF6B35] flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 4C7.58 4 4 7.58 4 12C4 16.42 7.58 20 12 20C13.85 20 15.55 19.4 16.9 18.4"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="18" cy="8" r="2.5" fill="white" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#111]">Admin Login</h1>
          <p className="text-[#6F6F6F] mt-1">Sign in to the Clubly admin panel</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-[#111] mb-1.5">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/20 outline-none transition-all"
              placeholder="admin"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#111] mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/20 outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-[#FF6B35] text-white font-medium rounded-xl hover:bg-[#E55A2B] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-sm text-[#6F6F6F] hover:text-[#FF6B35] transition-colors"
          >
            ← Back to Clubly
          </Link>
        </div>
      </div>
    </div>
  );
}
