import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Components
import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";

// Pages
import { LandingPage } from "./pages/LandingPage";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { ForgotPassword } from "./pages/ForgotPassword";
import { Dashboard } from "./pages/Dashboard";
import { BusinessProfile } from "./pages/BusinessProfile";
import { DataIngestion } from "./pages/DataIngestion";
import { ChatAdvisor } from "./pages/ChatAdvisor";
import { MarketingCopy } from "./pages/MarketingCopy";
import { Competitors } from "./pages/Competitors";
import { Forecasting } from "./pages/Forecasting";
import { CustomerSegments } from "./pages/CustomerSegments";
import { Reports } from "./pages/Reports";
import { AdminDashboard } from "./pages/AdminDashboard";
import { Sentiment } from "./pages/Sentiment";

// Route Guard for Private Cockpit Pages
const ProtectedRoute: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <img src="/logo.jpeg" alt="Loading" className="h-12 w-12 rounded-xl object-cover animate-pulse" />
          <span className="text-xs text-brand-muted font-bold tracking-wider uppercase animate-pulse">
            Verifying AUCTUS session...
          </span>
        </div>
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

// Cockpit Shared Layout (Navbar + Sidebar + Main view)
const CockpitLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-brand-bg flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-brand-bg/95">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Secure Protected Cockpit Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<CockpitLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/business-profile" element={<BusinessProfile />} />
              <Route path="/ingestion" element={<DataIngestion />} />
              <Route path="/chat-advisor" element={<ChatAdvisor />} />
              <Route path="/marketing" element={<MarketingCopy />} />
              <Route path="/competitors" element={<Competitors />} />
              <Route path="/sentiment" element={<Sentiment />} />
              <Route path="/forecasting" element={<Forecasting />} />
              <Route path="/customer-segments" element={<CustomerSegments />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
