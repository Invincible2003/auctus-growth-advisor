import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../services/api";

interface User {
  id: string;
  email: string;
  role: string;
  business_name: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  updateBusinessName: (newName: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("auctus_token");
      const storedUser = localStorage.getItem("auctus_user");
      
      if (token && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          // Refresh user session profile from server
          const me = await api.auth.getMe();
          let bName = "My Business";
          try {
            const profile = await api.business.getProfile();
            bName = profile.name;
          } catch {
            // Ignore if profile fetch fails
          }
          
          const updatedUser = {
            id: me.id,
            email: me.email,
            role: me.role,
            business_name: bName
          };
          setUser(updatedUser);
          localStorage.setItem("auctus_user", JSON.stringify(updatedUser));
        } catch (e) {
          console.error("Token verification failed, logging out...", e);
          logout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem("auctus_token", token);
    localStorage.setItem("auctus_user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("auctus_token");
    localStorage.removeItem("auctus_user");
    setUser(null);
  };

  const updateBusinessName = (newName: string) => {
    if (user) {
      const updatedUser = { ...user, business_name: newName };
      setUser(updatedUser);
      localStorage.setItem("auctus_user", JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateBusinessName }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
