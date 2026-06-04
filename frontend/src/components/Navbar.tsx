import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Bell, LogOut, User as UserIcon, Check } from "lucide-react";
import { api } from "../services/api";

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifPanel, setShowNotifPanel] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Poll every 30 seconds for alerts
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const data = await api.notifications.get();
      setNotifications(data);
    } catch (e) {
      console.error("Failed to load notifications", e);
    }
  };

  const markRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.notifications.markAsRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    } catch (e) {
      console.error(e);
    }
  };

  const markAllRead = async () => {
    try {
      await api.notifications.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <nav className="h-16 border-b border-brand-border bg-brand-card/60 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between">
      {/* Brand logo left */}
      <div className="flex items-center gap-3">
        <img src="/logo.jpeg" alt="AUCTUS" className="h-9 w-9 rounded-lg object-cover shadow-cyan-glow" />
        <div>
          <span className="font-bold text-lg text-brand-text tracking-wide block leading-none">AUCTUS</span>
          <span className="text-[10px] text-brand-cyan tracking-wider font-semibold block uppercase">Growth Advisor</span>
        </div>
      </div>

      {/* Middle Business Info */}
      <div className="hidden md:flex items-center gap-2">
        <span className="text-xs text-brand-muted">Active Profile:</span>
        <span className="text-xs font-semibold px-2.5 py-1 rounded bg-brand-cyan/10 border border-brand-cyan/20 text-brand-text">
          {user?.business_name || "Sandbox Business"}
        </span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4 relative">
        {/* Notification Bell */}
        <button
          onClick={() => setShowNotifPanel(!showNotifPanel)}
          className="p-2 rounded-lg bg-brand-border/40 border border-brand-border hover:bg-brand-border/60 hover:text-brand-cyan transition relative"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-brand-danger text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Notifications Panel */}
        {showNotifPanel && (
          <div className="absolute right-0 top-12 w-80 bg-brand-card border border-brand-border shadow-heavy rounded-xl p-3 z-50 animate-fade-in glass-panel">
            <div className="flex items-center justify-between border-b border-brand-border pb-2 mb-2">
              <span className="text-xs font-bold text-brand-text">Recent Alerts</span>
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-[10px] text-brand-cyan hover:underline flex items-center gap-1">
                  Mark all read
                </button>
              )}
            </div>
            
            <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
              {notifications.length === 0 ? (
                <div className="text-center py-6 text-xs text-brand-muted">No notifications at this time.</div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-2 rounded-lg text-left transition-all ${
                      notif.is_read ? "bg-brand-bg/30 text-brand-muted" : "bg-brand-cyan/5 border-l-2 border-brand-cyan text-brand-text"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold block">{notif.title}</span>
                      {!notif.is_read && (
                        <button
                          onClick={(e) => markRead(notif.id, e)}
                          className="p-0.5 rounded bg-brand-border hover:bg-brand-cyan/20 text-brand-cyan hover:text-brand-cyanLight transition"
                        >
                          <Check className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] mt-0.5 leading-snug">{notif.message}</p>
                    <span className="text-[8px] text-brand-muted block mt-1">
                      {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* User profile details */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <span className="text-xs font-bold block text-brand-text">{user?.email.split("@")[0]}</span>
            <span className="text-[9px] text-brand-muted block capitalize">{user?.role}</span>
          </div>
          <div className="h-8 w-8 rounded-full bg-brand-border flex items-center justify-center text-brand-cyan font-bold border border-brand-cyan/20 shadow-cyan-glow">
            <UserIcon className="h-4 w-4" />
          </div>
          
          <button
            onClick={logout}
            className="p-2 rounded-lg text-brand-muted hover:text-brand-danger hover:bg-brand-danger/10 transition"
            title="Log Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </nav>
  );
};
