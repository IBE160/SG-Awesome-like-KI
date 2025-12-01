'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    
    // Client-side validation for email format is handled by input type="email"
    // Additional validation can be added here if needed

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.includes('Invalid login credentials') || error.message.includes('Email not confirmed')) {
        setMessage('Invalid email or password.');
      } else if (error.message.includes('temporarily locked')) {
        setMessage('Account temporarily locked. Please try again later or use the "Forgot Password" link.');
      } else {
        setMessage(`Error: ${error.message}`);
      }
    } else {
      setMessage('Successfully logged in!');
      router.refresh(); // Refresh session and redirect
      router.push('/'); // Redirect to dashboard or home page
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Login</h1>
        <form onSubmit={handleSignIn}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
              Email:
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
              Password:
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          {message && (
            <p className={`text-sm mb-4 ${message.includes('Error') || message.includes('Invalid') || message.includes('locked') ? 'text-red-500' : 'text-green-500'}`}>
              {message}
            </p>
          )}
          <div className="flex items-center justify-between mb-4">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Sign In
            </button>
            <Link href="/login/forgot-password" className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800">
              Forgot Password?
            </Link>
          </div>
          <p className="text-center text-gray-500 text-xs">
            Don't have an account?{' '}
            <Link href="/register" className="font-bold text-blue-500 hover:text-blue-800">
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
