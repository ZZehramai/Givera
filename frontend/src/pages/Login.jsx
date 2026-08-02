import { GoogleLogin } from "@react-oauth/google";
import { LockKeyhole, Mail } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import AuthShell from "../components/AuthShell";
import { login, loginWithGoogle } from "../services/authService";

const inputClass =
  "w-full rounded-2xl border border-outline-variant bg-white py-3.5 pl-12 pr-4 text-on-surface outline-none transition placeholder:text-on-surface-variant/55 focus:border-primary focus:ring-4 focus:ring-primary/10";

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (requestError) {
      const data = requestError.response?.data;
      if (data?.non_field_errors) {
        setError(data.non_field_errors[0]);
      } else if (typeof data === "string") {
        setError(data);
      } else {
        setError("We couldn’t sign you in. Check your email and password.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError("");

    try {
      await loginWithGoogle(credentialResponse.credential);
      navigate("/dashboard");
    } catch (requestError) {
      setError(
        requestError.response?.data?.detail ||
          "Google sign-in didn’t work. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell mode="login">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">Welcome back</p>
        <h2 className="mt-2 text-4xl font-extrabold">Sign in to Givera</h2>
        <p className="mt-3 leading-7 text-on-surface-variant">
          Pick up where you left off and keep making a difference.
        </p>
      </div>

      {location.state?.message && (
        <div className="mt-6 rounded-2xl bg-tertiary-container px-4 py-3 text-sm font-semibold text-tertiary">
          {location.state.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <label className="block">
          <span className="mb-2 block text-sm font-bold">Email address</span>
          <span className="relative block">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={19} aria-hidden="true" />
            <input
              required
              autoComplete="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={inputClass}
            />
          </span>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-bold">Password</span>
          <span className="relative block">
            <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={19} aria-hidden="true" />
            <input
              required
              autoComplete="current-password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={inputClass}
            />
          </span>
        </label>

        {error && (
          <div role="alert" className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-primary px-6 py-4 font-bold text-white shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-55"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <div className="my-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-outline-variant" />
        <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">or continue with</span>
        <div className="h-px flex-1 bg-outline-variant" />
      </div>

      <div className="flex min-h-11 justify-center overflow-hidden rounded-full">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => setError("Google sign-in was cancelled or failed.")}
          useOneTap={false}
          shape="pill"
          size="large"
          width="320"
        />
      </div>

      <p className="mt-8 text-center text-sm text-on-surface-variant">
        New to Givera?{" "}
        <Link to="/register" className="font-bold text-primary hover:underline">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}
