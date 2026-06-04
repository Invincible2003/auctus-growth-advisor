import React from "react";

export const Footer: React.FC = () => {
  return (
    <footer className="py-6 border-t border-brand-border bg-brand-bg/50 mt-auto">
      <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Brand logo left */}
        <div className="flex items-center gap-2">
          <img src="/logo.jpeg" alt="Logo" className="h-6 w-6 rounded object-cover" />
          <span className="text-xs font-bold text-brand-text tracking-wider">AUCTUS</span>
          <span className="text-[10px] text-brand-muted">| AI Advisor Platform</span>
        </div>

        {/* Brand Owner Footer Text */}
        <p className="text-xs text-brand-muted text-center sm:text-right">
          © 2026 AUCTUS | <span className="text-brand-cyan hover:text-brand-cyanLight transition font-semibold">Made by Aryan Pandey</span>
        </p>
      </div>
    </footer>
  );
};
