"use client";

import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    if (!email) {
      setError("Email is required.");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('email', email);

    const response = await fetch('/api/auth/reset-password/request', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.message);
    } else {
      setMessage(data.message);
    }

    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center">Forgot Password</h1>
        {error && <p className="text-red-500">{error}</p>}
        {message && <p className="text-green-500">{message}</p>}
        <form onSubmit={handleResetPassword} className="space-y-6" data-testid="forgot-password-form">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="block w-full px-3 py-2 mt-1 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </div>
        </form>
        <div className="text-sm text-center">
          <a href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Back to Login
          </a>
        </div>
      </div>
    </div>
  );
}