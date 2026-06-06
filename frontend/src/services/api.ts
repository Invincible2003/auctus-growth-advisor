// AUCTUS Client API Services
// Brand Owner: Made by Aryan Pandey

let base_url = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";
if (base_url && !base_url.endsWith("/api/v1")) {
  if (base_url.endsWith("/")) {
    base_url = base_url.slice(0, -1);
  }
  base_url = `${base_url}/api/v1`;
}
const API_BASE_URL = base_url;

// Helper to retrieve token
const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem("auctus_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Generic Fetch Wrapper
const request = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
  const headers = {
    ...getAuthHeaders(),
    ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
    ...((options.headers as any) || {}),
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = "API request failed";
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errorDetail;
    } catch {
      // Ignore if parsing fails
    }
    throw new Error(errorDetail);
  }

  // File download support
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/") && !contentType.includes("json")) {
    return response.blob();
  }

  return response.json();
};

export const api = {
  // 1. Authentication System
  auth: {
    signup: (data: any) => request("/auth/signup", { method: "POST", body: JSON.stringify(data) }),
    login: (data: any) => request("/auth/login", { method: "POST", body: JSON.stringify(data) }),
    getMe: () => request("/auth/me", { method: "GET" }),
    forgotPassword: (email: string) => request("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) }),
  },

  // 2. Business Profile Creation
  business: {
    getProfile: () => request("/business/profile", { method: "GET" }),
    updateProfile: (data: any) => request("/business/profile", { method: "PUT", body: JSON.stringify(data) }),
  },

  // 3. Data Ingestion
  ingestion: {
    upload: (file: File, fileType: "sales" | "reviews") => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("file_type", fileType);
      return request("/ingestion/upload", { method: "POST", body: formData });
    },
    getHistory: () => request("/ingestion/history", { method: "GET" }),
    deleteDataset: (id: string) => request(`/ingestion/dataset/${id}`, { method: "DELETE" }),
  },

  // 4. Analytics Modules
  analytics: {
    getDashboard: () => request("/analytics/dashboard", { method: "GET" }),
    getSentiment: () => request("/analytics/sentiment", { method: "GET" }),
    getForecasting: (days: number) => request(`/analytics/forecasting?days=${days}`, { method: "GET" }),
    getCustomers: () => request("/analytics/customers", { method: "GET" }),
  },

  // 5. AI advisor / Growth consultant
  advisor: {
    getChatHistory: () => request("/advisor/chat/history", { method: "GET" }),
    postMessage: (message: string) => request("/advisor/chat", { method: "POST", body: JSON.stringify({ role: "user", message }) }),
    clearChatHistory: () => request("/advisor/chat/history", { method: "DELETE" }),
    
    // Competitors SWOT
    getCompetitors: () => request("/advisor/competitors", { method: "GET" }),
    generateSwot: (competitorName: string) => request("/advisor/competitor/swot", { method: "POST", body: JSON.stringify({ competitor_name: competitorName }) }),
    deleteCompetitor: (id: string) => request(`/advisor/competitor/${id}`, { method: "DELETE" }),
    
    // Marketing Recommendation Engine
    getMarketingRecommendations: () => request("/advisor/marketing/recommendations", { method: "POST" }),
    
    // Social / Ad Copywriter generators
    generateSocial: (postType: string, context: string) => request("/advisor/generator/social", { method: "POST", body: JSON.stringify({ post_type: postType, context }) }),
    generateAd: (adType: string, context: string) => request("/advisor/generator/ads", { method: "POST", body: JSON.stringify({ ad_type: adType, context }) }),
  },

  // 6. Reports Module
  reports: {
    getHistory: () => request("/reports/history", { method: "GET" }),
    generate: (format: "pdf" | "docx" | "pptx") => request("/reports/generate", { method: "POST", body: JSON.stringify({ format }) }),
    download: async (id: string, title: string, format: string) => {
      const blob = await request(`/reports/download/${id}`, { method: "GET" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title.replace(/\s+/g, "_")}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    },
  },

  // 7. Notification System
  notifications: {
    get: () => request("/notifications", { method: "GET" }),
    markAsRead: (id: string) => request(`/notifications/${id}/read`, { method: "PUT" }),
    markAllAsRead: () => request("/notifications/read-all", { method: "PUT" }),
  },

  // 8. Admin Control Dashboard
  admin: {
    getStats: () => request("/admin/stats", { method: "GET" }),
  },
};
