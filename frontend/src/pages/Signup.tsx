import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { Lock, Mail, Eye, EyeOff, AlertCircle, Shield } from "lucide-react";
import { Footer } from "../components/Footer";

export const Signup: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("Business Owner");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword) {
      setError("Please fill in all inputs.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // 1. Signup
      await api.auth.signup({ email, password, role });
      
      // 2. Auto-login immediately
      const tokenData = await api.auth.login({ email, password });
      login(tokenData.access_token, tokenData.user);
      
      navigate("/dashboard");
    } catch (e: any) {
      setError(e.message || "Failed to create account. Please try again.");
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
            <h1 className="text-2xl font-extrabold text-brand-text tracking-wide">Create Account</h1>
            <p className="text-xs text-brand-muted mt-1.5 font-medium">
              Start growth diagnostics in seconds.
            </p>
          </div>

          {/* Form */}
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

            {/* Role input */}
            <div>
              <label className="text-xs font-semibold text-brand-muted block mb-1.5">User Role</label>
              <div className="relative">
                <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-muted" />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-brand-bg border border-brand-border text-sm text-brand-text focus:outline-none focus:border-brand-cyan focus:shadow-cyan-glow transition-all appearance-none"
                  required
                >
                  <option value="Business Owner">Business Owner (Standard Dashboard)</option>
                  <option value="Admin">System Administrator (Global Platform Metrics)</option>
                </select>
              </div>
            </div>

            {/* Password input */}
            <div>
              <label className="text-xs font-semibold text-brand-muted block mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-muted" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-brand-bg border border-brand-border text-sm text-brand-text focus:outline-none focus:border-brand-cyan focus:shadow-cyan-glow transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-text transition"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password input */}
            <div>
              <label className="text-xs font-semibold text-brand-muted block mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-muted" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-brand-bg border border-brand-border text-sm text-brand-text focus:outline-none focus:border-brand-cyan focus:shadow-cyan-glow transition-all"
                  placeholder="••••••••"
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
              {loading ? "Creating User Profile..." : "Register Profile"}
            </button>
          </form>

          {/* Footer of card */}
          <div className="text-center mt-6 pt-6 border-t border-brand-border/60">
            <span className="text-xs text-brand-muted">
              Already have an account?{" "}
              <Link to="/login" className="text-brand-cyan hover:underline font-bold">
                Log In
              </Link>
            </span>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
};
