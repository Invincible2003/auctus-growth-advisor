import React, { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import { Mail, CheckCircle, ArrowLeft, AlertCircle } from "lucide-react";
import { Footer } from "../components/Footer";

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please fill in your email address.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await api.auth.forgotPassword(email);
      setSuccess(true);
    } catch (e: any) {
      setError(e.message || "Failed to trigger recovery. Check connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-brand-bg relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-brand-cyan/5 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-80 h-80 rounded-full bg-brand-blue/5 blur-3xl" />

      {/* Main card */}
      <div className="flex-1 flex items-center justify-center p-6 z-10">
        <div className="w-full max-w-md glass-panel p-8 border border-brand-border hover:border-brand-cyan/20 transition-all duration-300">
          
          {/* Logo */}
          <div className="text-center mb-8">
            <img src="/logo.jpeg" alt="AUCTUS" className="h-16 w-16 mx-auto rounded-xl object-cover shadow-cyan-glow mb-3" />
            <h1 className="text-2xl font-extrabold text-brand-text tracking-wide">Recover Password</h1>
            <p className="text-xs text-brand-muted mt-1.5 font-medium">
              We'll send recovery links to reset your password credentials.
            </p>
          </div>

          {success ? (
            <div className="space-y-6 text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-brand-success/15 border border-brand-success/20 flex items-center justify-center text-brand-success shadow-sm">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-brand-text">Recovery Request Dispatched</h3>
                <p className="text-xs text-brand-muted leading-relaxed">
                  If `{email}` matches an active AUCTUS profile, we've dispatched a recovery code to your inbox.
                </p>
              </div>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 text-xs font-bold text-brand-cyan hover:text-brand-cyanLight transition mt-2 hover:underline"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Return to secure login</span>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3.5 rounded-lg bg-brand-danger/10 border border-brand-danger/25 text-brand-danger text-xs flex items-center gap-2.5">
                  <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Email input */}
              <div>
                <label className="text-xs font-semibold text-brand-muted block mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-muted" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-brand-bg border border-brand-border text-sm text-brand-text focus:outline-none focus:border-brand-cyan focus:shadow-cyan-glow transition-all"
                    placeholder="name@business.com"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg bg-brand-cyan hover:bg-brand-cyanLight text-brand-bg font-bold text-sm transition-all shadow-cyan-glow disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {loading ? "Generating Recovery Link..." : "Request Reset Link"}
              </button>

              <div className="text-center mt-4">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 text-xs font-bold text-brand-muted hover:text-brand-cyan transition mt-2"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Cancel and go back</span>
                </Link>
              </div>
            </form>
          )}

        </div>
      </div>

      <Footer />
    </div>
  );
};
