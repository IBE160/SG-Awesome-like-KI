"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [sessionExchanged, setSessionExchanged] = useState(false);

  useEffect(() => {
    const exchangeCodeForSession = async (code: string) => {
      const response = await fetch(`/api/auth/callback?code=${code}`);
      if (response.ok) {
        setSessionExchanged(true);
      } else {
        setError("Invalid or expired password reset link.");
      }
    };

    const code = searchParams.get("code");
    if (code) {
      exchangeCodeForSession(code);
    } else {
      setError("Password reset token is missing or invalid.");
    }
  }, [searchParams]);

  const validatePassword = (password: string) => {
    // Requirements: 5 letters, 1 number, 1 special symbol
    const hasMinLength = password.length >= 5;
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasMinLength) {
      return "Password must be at least 5 characters long.";
    }
    if (!hasLetter) {
      return "Password must contain at least one letter.";
    }
    if (!hasNumber) {
      return "Password must contain at least one number.";
    }
    if (!hasSpecialChar) {
      return "Password must contain at least one special character.";
    }
    return null; // Password is valid
  };

  const handleUpdatePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    if (!sessionExchanged) {
      setError("Password reset token is missing or invalid.");
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    const passwordValidationError = validatePassword(newPassword);
    if (passwordValidationError) {
      setError(passwordValidationError);
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('password', newPassword);

    const response = await fetch('/api/auth/reset-password/confirm', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.message);
    } else {
      setMessage("Your password has been reset successfully. Redirecting to login...");
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    }

    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center">Reset Password</h1>
        {error && <p className="text-red-500">{error}</p>}
        {message && <p className="text-green-500">{message}</p>}

        {!sessionExchanged && !error && <p className="text-red-500">Loading...</p>}

        {sessionExchanged && (
          <form onSubmit={handleUpdatePassword} className="space-y-6" data-testid="reset-password-form">
            <div>
              <label
                htmlFor="new-password"
                className="block text-sm font-medium text-gray-700"
              >
                New Password
              </label>
              <input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="block w-full px-3 py-2 mt-1 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">
                (Min 5 characters, at least one letter, one number, one special
                character)
              </p>
            </div>
            <div>
              <label
                htmlFor="confirm-password"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm New Password
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="block w-full px-3 py-2 mt-1 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                data-testid="reset-password-button"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </div>
          </form>
        )}
        <div className="text-sm text-center">
          <a href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Back to Login
          </a>
        </div>
      </div>
    </div>
  );
}