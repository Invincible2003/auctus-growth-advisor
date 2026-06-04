import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Building, Save, AlertCircle, CheckCircle } from "lucide-react";

export const BusinessProfile: React.FC = () => {
  const { updateBusinessName } = useAuth();
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("Retail");
  const [location, setLocation] = useState("");
  const [employees, setEmployees] = useState(1);
  const [revenue, setRevenue] = useState(0);
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await api.business.getProfile();
      setName(data.name);
      setIndustry(data.industry);
      setLocation(data.location);
      setEmployees(data.employees);
      setRevenue(data.revenue);
      setContactEmail(data.contact_email || "");
      setContactPhone(data.contact_phone || "");
    } catch (e: any) {
      setError(e.message || "Failed to load business profile details.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const updated = await api.business.updateProfile({
        name,
        industry,
        location,
        employees: Number(employees),
        revenue: Number(revenue),
        contact_email: contactEmail,
        contact_phone: contactPhone,
      });

      // Update Auth context for Navbar sync
      updateBusinessName(updated.name);
      setSuccess(true);
    } catch (e: any) {
      setError(e.message || "Failed to save profile changes.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-left animate-pulse">
        <div className="h-6 w-48 bg-brand-border rounded mb-4" />
        <div className="h-80 bg-brand-card border border-brand-border rounded-xl" />
      </div>
    );
  }

  return (
    <div className="p-6 text-left max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-brand-text">Business Profile Details</h1>
        <p className="text-xs text-brand-muted mt-1 font-medium">
          Manage your organizational settings, employees tier, and contact coordinates.
        </p>
      </div>

      <form onSubmit={handleSave} className="glass-panel p-8 border-brand-border space-y-6">
        {error && (
          <div className="p-3.5 rounded-lg bg-brand-danger/10 border border-brand-danger/25 text-brand-danger text-xs flex items-center gap-2.5">
            <AlertCircle className="h-4.5 w-4.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 rounded-lg bg-brand-success/10 border border-brand-success/25 text-brand-success text-xs flex items-center gap-2.5">
            <CheckCircle className="h-4.5 w-4.5 shrink-0" />
            <span>Business profile details saved and synced successfully.</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Business Name */}
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-brand-muted block mb-1.5">Business Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-brand-bg border border-brand-border text-sm text-brand-text focus:outline-none focus:border-brand-cyan transition"
              required
            />
          </div>

          {/* Industry Selection */}
          <div>
            <label className="text-xs font-semibold text-brand-muted block mb-1.5">Industry Segment</label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-brand-bg border border-brand-border text-sm text-brand-text focus:outline-none focus:border-brand-cyan transition appearance-none"
            >
              <option value="Retail">Retail Store</option>
              <option value="Restaurant & Cafe">Restaurant & Café</option>
              <option value="Professional Services">Professional Services</option>
              <option value="Healthcare">Healthcare Clinic</option>
              <option value="Fitness & Leisure">Fitness & Leisure Center</option>
              <option value="Manufacturing">Manufacturing</option>
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="text-xs font-semibold text-brand-muted block mb-1.5">Location / Zip Code</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-brand-bg border border-brand-border text-sm text-brand-text focus:outline-none focus:border-brand-cyan transition"
              placeholder="e.g. New York, NY 10001"
              required
            />
          </div>

          {/* Employees count */}
          <div>
            <label className="text-xs font-semibold text-brand-muted block mb-1.5">Employees Headcount</label>
            <input
              type="number"
              value={employees}
              onChange={(e) => setEmployees(Number(e.target.value))}
              min="1"
              className="w-full px-4 py-2.5 rounded-lg bg-brand-bg border border-brand-border text-sm text-brand-text focus:outline-none focus:border-brand-cyan transition"
              required
            />
          </div>

          {/* Annual Revenue */}
          <div>
            <label className="text-xs font-semibold text-brand-muted block mb-1.5">Annual Revenue ($ USD)</label>
            <input
              type="number"
              value={revenue}
              onChange={(e) => setRevenue(Number(e.target.value))}
              min="0"
              className="w-full px-4 py-2.5 rounded-lg bg-brand-bg border border-brand-border text-sm text-brand-text focus:outline-none focus:border-brand-cyan transition"
              required
            />
          </div>

          {/* Contact Email */}
          <div>
            <label className="text-xs font-semibold text-brand-muted block mb-1.5">Contact Email Address</label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-brand-bg border border-brand-border text-sm text-brand-text focus:outline-none focus:border-brand-cyan transition"
              placeholder="billing@business.com"
            />
          </div>

          {/* Contact Phone */}
          <div>
            <label className="text-xs font-semibold text-brand-muted block mb-1.5">Contact Phone Number</label>
            <input
              type="text"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-brand-bg border border-brand-border text-sm text-brand-text focus:outline-none focus:border-brand-cyan transition"
              placeholder="+1 (555) 019-2834"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 rounded-lg bg-brand-cyan hover:bg-brand-cyanLight text-brand-bg font-extrabold text-sm flex items-center gap-2 shadow-cyan-glow disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          <Save className="h-4 w-4" />
          <span>{saving ? "Saving Business Profile..." : "Save Settings"}</span>
        </button>

      </form>
    </div>
  );
};
