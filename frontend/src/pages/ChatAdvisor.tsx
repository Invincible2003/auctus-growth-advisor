import React, { useState, useEffect, useRef } from "react";
import { api } from "../services/api";
import { 
  MessageSquare, 
  Send, 
  Trash2, 
  Sparkles, 
  AlertCircle, 
  CornerDownLeft,
  BookOpen
} from "lucide-react";

export const ChatAdvisor: React.FC = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    // Scroll to bottom on new messages
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchHistory = async () => {
    try {
      const data = await api.advisor.getChatHistory();
      // Format backend response to match chat format
      const formatted = data.map((h: any) => ({
        sender: h.role === "user" ? "user" : "advisor",
        text: h.message,
        time: new Date(h.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }));
      setMessages(formatted);
    } catch (e: any) {
      console.error(e);
    }
  };

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    setLoading(true);
    setError(null);
    setInput("");
    
    // Add user message to UI immediately
    const userMsg = {
      sender: "user",
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const data = await api.advisor.postMessage(textToSend);
      
      const advisorMsg = {
        sender: "advisor",
        text: data.reply,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages((prev) => [...prev, advisorMsg]);
    } catch (e: any) {
      setError(e.message || "Failed to contact the AI growth advisor.");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    if (!confirm("Are you sure you want to clear the entire chat history?")) return;
    try {
      await api.advisor.clearChatHistory();
      setMessages([]);
    } catch (e: any) {
      setError(e.message || "Failed to clear history.");
    }
  };

  // Pre-baked templates
  const templates = [
    "Why are sales decreasing?",
    "Which product performs best?",
    "Suggest growth opportunities."
  ];

  return (
    <div className="p-6 text-left max-w-4xl mx-auto h-[calc(100vh-7rem)] flex flex-col justify-between space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-brand-border pb-3 shrink-0">
        <div>
          <h1 className="text-2xl font-black text-brand-text flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-brand-cyan" />
            <span>AI Business Growth Consultant</span>
          </h1>
          <p className="text-xs text-brand-muted mt-0.5 font-medium">
            Virtual growth advisor with direct memory and awareness of your sales logs.
          </p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={handleClear}
            className="flex items-center gap-1 text-xs text-brand-muted hover:text-brand-danger transition px-2.5 py-1 rounded hover:bg-brand-danger/10 border border-transparent hover:border-brand-danger/25"
          >
            <Trash2 className="h-4 w-4" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* Main chat box */}
      <div className="flex-1 glass-panel border-brand-border p-6 overflow-y-auto flex flex-col space-y-4 min-h-0 relative">
        {error && (
          <div className="p-3.5 rounded-lg bg-brand-danger/10 border border-brand-danger/25 text-brand-danger text-xs flex items-center gap-2 shrink-0">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 max-w-md mx-auto">
            <div className="h-14 w-14 rounded-2xl bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center text-brand-cyan shadow-cyan-glow">
              <MessageSquare className="h-7 w-7" />
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-brand-text">Ask AUCTUS Growth advisor</h3>
              <p className="text-xs text-brand-muted leading-relaxed">
                Consult with your AI model. Ask about cash flow trends, marketing directions, or segment retention tactics.
              </p>
            </div>
            {/* Quick Templates */}
            <div className="w-full space-y-2 pt-2">
              {templates.map((tpl) => (
                <button
                  key={tpl}
                  onClick={() => handleSend(tpl)}
                  className="w-full text-left px-4 py-2.5 rounded-lg bg-brand-bg hover:bg-brand-border/40 border border-brand-border text-xs text-brand-text hover:text-brand-cyan transition font-semibold"
                >
                  {tpl}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 text-sm ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {/* Advisor Avatar */}
                {msg.sender === "advisor" && (
                  <div className="h-8 w-8 rounded-lg bg-brand-cyan/15 border border-brand-cyan/20 flex items-center justify-center text-brand-cyan shadow-sm shrink-0">
                    <Sparkles className="h-4.5 w-4.5" />
                  </div>
                )}
                
                {/* Message body bubble */}
                <div
                  className={`max-w-[75%] p-3.5 rounded-xl border text-left leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-brand-cyan/10 border-brand-cyan/20 text-brand-text rounded-tr-none"
                      : "bg-brand-card/90 border-brand-border text-brand-text rounded-tl-none"
                  }`}
                >
                  <p className="whitespace-pre-line text-xs">{msg.text}</p>
                  
                  {/* Citation block if advisor mentions source */}
                  {msg.sender === "advisor" && msg.text.includes("[Source:") && (
                    <div className="mt-3 pt-2 border-t border-brand-border/60 flex items-center gap-1.5 text-[9px] text-brand-cyan font-bold">
                      <BookOpen className="h-3 w-3" />
                      <span>Data-driven evidence attached</span>
                    </div>
                  )}

                  <span className="text-[8px] text-brand-muted block mt-1.5 text-right">{msg.time}</span>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 text-sm justify-start">
                <div className="h-8 w-8 rounded-lg bg-brand-cyan/15 border border-brand-cyan/20 flex items-center justify-center text-brand-cyan shadow-sm shrink-0 animate-pulse">
                  <Sparkles className="h-4.5 w-4.5" />
                </div>
                <div className="bg-brand-card/60 border border-brand-border p-3.5 rounded-xl rounded-tl-none text-left w-32 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-cyan animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-cyan animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-cyan animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>
        )}
      </div>

      {/* Input bar */}
      <div className="shrink-0">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
            placeholder="Ask AUCTUS advisor..."
            disabled={loading}
            className="w-full pl-4 pr-24 py-3 rounded-xl bg-brand-card border border-brand-border text-xs text-brand-text focus:outline-none focus:border-brand-cyan focus:shadow-cyan-glow transition-all"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <span className="hidden md:inline text-[9px] text-brand-muted px-1.5 py-0.5 rounded bg-brand-border border border-brand-border font-mono flex items-center gap-0.5">
              <CornerDownLeft className="h-2 w-2" /> Enter
            </span>
            <button
              onClick={() => handleSend(input)}
              disabled={loading || !input.trim()}
              className="p-1.5 rounded-lg bg-brand-cyan hover:bg-brand-cyanLight text-brand-bg transition disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
