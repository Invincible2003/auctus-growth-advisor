import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  LayoutDashboard, 
  Upload, 
  MessageSquare, 
  Megaphone, 
  TrendingUp, 
  Users, 
  FileText, 
  ShieldAlert,
  HelpCircle,
  Building,
  Smile
} from "lucide-react";

export const Sidebar: React.FC = () => {
  const { user } = useAuth();

  const links = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/business-profile", label: "Business Profile", icon: Building },
    { to: "/ingestion", label: "Data Ingestion", icon: Upload },
    { to: "/chat-advisor", label: "AI Advisor", icon: MessageSquare },
    { to: "/marketing", label: "Copy Generators", icon: Megaphone },
    { to: "/competitors", label: "Competitor SWOT", icon: HelpCircle },
    { to: "/sentiment", label: "Customer Sentiment", icon: Smile },
    { to: "/forecasting", label: "Sales Forecast", icon: TrendingUp },
    { to: "/customer-segments", label: "Customer Segments", icon: Users },
    { to: "/reports", label: "Report Downloads", icon: FileText },
  ];

  return (
    <aside className="w-64 border-r border-brand-border bg-brand-card/30 backdrop-blur-md flex flex-col h-[calc(100vh-4rem)] sticky top-16">
      {/* Scrollable links list */}
      <div className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
        <span className="text-[10px] uppercase font-bold text-brand-muted tracking-wider px-3 block mb-2">
          Business Center
        </span>
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-brand-cyan/15 border border-brand-cyan/20 text-brand-cyan shadow-cyan-glow"
                    : "text-brand-muted hover:text-brand-text hover:bg-brand-border/30 border border-transparent"
                }`
              }
            >
              <Icon className="h-4.5 w-4.5" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}

        {/* Admin Link (Only for admins) */}
        {user?.role === "Admin" && (
          <div className="mt-8 pt-6 border-t border-brand-border/60">
            <span className="text-[10px] uppercase font-bold text-brand-danger tracking-wider px-3 block mb-2">
              System Admin
            </span>
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-brand-danger/15 border border-brand-danger/20 text-brand-danger"
                    : "text-brand-muted hover:text-brand-text hover:bg-brand-border/30 border border-transparent"
                }`
              }
            >
              <ShieldAlert className="h-4.5 w-4.5" />
              <span>Admin Console</span>
            </NavLink>
          </div>
        )}
      </div>

      {/* Developer Footer Branded box */}
      <div className="p-4 border-t border-brand-border bg-brand-card/50">
        <div className="flex items-center gap-2 mb-1.5">
          <img src="/logo.jpeg" alt="Logo" className="h-5 w-5 rounded object-cover" />
          <span className="text-xs font-bold text-brand-text">AUCTUS v1.0</span>
        </div>
        <p className="text-[9px] text-brand-muted leading-tight">
          Major Project Portfolio<br />
          <span className="text-brand-cyan font-medium">Made by Aryan Pandey</span>
        </p>
      </div>
    </aside>
  );
};
