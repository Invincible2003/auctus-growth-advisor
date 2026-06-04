import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { 
  Megaphone, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  RefreshCw,
  Copy,
  PenTool,
  Coins
} from "lucide-react";

export const MarketingCopy: React.FC = () => {
  const [tab, setTab] = useState<"campaigns" | "copywriter">("campaigns");
  
  // Campaigns state
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);

  // Copywriter state
  const [category, setCategory] = useState<"social" | "ad">("social");
  const [platform, setPlatform] = useState("Instagram");
  const [context, setContext] = useState("");
  const [generating, setGenerating] = useState(false);
  const [copyResult, setCopyResult] = useState<any>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (tab === "campaigns") {
      fetchCampaigns();
    }
  }, [tab]);

  const fetchCampaigns = async () => {
    try {
      setLoadingCampaigns(true);
      const data = await api.advisor.getMarketingRecommendations();
      setCampaigns(data);
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoadingCampaigns(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!context.trim()) return;

    setGenerating(true);
    setCopyResult(null);
    setCopySuccess(false);

    try {
      if (category === "social") {
        const res = await api.advisor.generateSocial(platform, context);
        setCopyResult(res);
      } else {
        const res = await api.advisor.generateAd(platform, context);
        setCopyResult(res);
      }
    } catch (e: any) {
      alert(e.message || "Failed to generate copywriting.");
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleCategoryChange = (cat: "social" | "ad") => {
    setCategory(cat);
    setCopyResult(null);
    if (cat === "social") {
      setPlatform("Instagram");
    } else {
      setPlatform("Google Ads");
    }
  };

  return (
    <div className="p-6 text-left max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-brand-text">AI Marketing Engine</h1>
        <p className="text-xs text-brand-muted mt-1 font-medium">
          Generate campaign priorities, social descriptions, and keyword targeting.
        </p>
      </div>

      {/* Tab select bar */}
      <div className="flex border-b border-brand-border pb-px">
        <button
          onClick={() => setTab("campaigns")}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition ${
            tab === "campaigns"
              ? "border-brand-cyan text-brand-cyan"
              : "border-transparent text-brand-muted hover:text-brand-text"
          }`}
        >
          Growth Recommendations
        </button>
        <button
          onClick={() => setTab("copywriter")}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition ${
            tab === "copywriter"
              ? "border-brand-cyan text-brand-cyan"
              : "border-transparent text-brand-muted hover:text-brand-text"
          }`}
        >
          AI Copywriter Generator
        </button>
      </div>

      {/* Tab 1: Campaigns */}
      {tab === "campaigns" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <span className="text-xs text-brand-muted font-semibold">Priority roadmap based on industry sector:</span>
            <button
              onClick={fetchCampaigns}
              disabled={loadingCampaigns}
              className="p-2 rounded bg-brand-border/40 border border-brand-border text-brand-muted hover:text-brand-cyan transition"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loadingCampaigns ? "animate-spin" : ""}`} />
            </button>
          </div>

          {loadingCampaigns ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-44 bg-brand-card border border-brand-border rounded-xl" />
              ))}
            </div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-12 text-xs text-brand-muted">No campaigns generated.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {campaigns.map((camp, idx) => (
                <div key={idx} className="glass-panel p-6 border-brand-border flex flex-col justify-between space-y-4 hover:border-brand-cyan/25 transition">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-brand-cyan/15 border border-brand-cyan/20 text-brand-cyan">
                        Priority: {camp.priority_score}/100
                      </span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                        camp.expected_impact === "High" ? "bg-brand-success/15 border border-brand-success/20 text-brand-success" : "bg-brand-blue/15 border border-brand-blue/20 text-brand-blue"
                      }`}>
                        {camp.expected_impact} Impact
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-brand-text leading-tight">{camp.title}</h3>
                    <p className="text-[11px] text-brand-muted leading-relaxed">{camp.description}</p>
                  </div>
                  <div className="border-t border-brand-border/60 pt-3 flex items-center justify-between text-[10px] text-brand-muted">
                    <span>Ease: <strong className="text-brand-text font-bold">{camp.implementation_difficulty}</strong></span>
                    <span className="text-brand-cyan flex items-center gap-1">Take action <ArrowRight className="h-3 w-3" /></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Copywriter */}
      {tab === "copywriter" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Inputs (Left 5 Cols) */}
          <form onSubmit={handleGenerate} className="lg:col-span-5 glass-panel p-6 border-brand-border space-y-4">
            <h3 className="text-sm font-extrabold text-brand-text flex items-center gap-2">
              <PenTool className="h-4.5 w-4.5 text-brand-cyan" />
              <span>Copywriter Cockpit</span>
            </h3>

            {/* Category Select */}
            <div>
              <label className="text-[10px] font-bold text-brand-muted uppercase tracking-wider block mb-1.5">Asset Category</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleCategoryChange("social")}
                  className={`py-2 rounded-lg text-xs font-bold border transition ${
                    category === "social"
                      ? "bg-brand-cyan/15 border-brand-cyan/20 text-brand-cyan shadow-cyan-glow"
                      : "bg-brand-bg border-brand-border text-brand-muted"
                  }`}
                >
                  Social Post Copy
                </button>
                <button
                  type="button"
                  onClick={() => handleCategoryChange("ad")}
                  className={`py-2 rounded-lg text-xs font-bold border transition ${
                    category === "ad"
                      ? "bg-brand-cyan/15 border-brand-cyan/20 text-brand-cyan shadow-cyan-glow"
                      : "bg-brand-bg border-brand-border text-brand-muted"
                  }`}
                >
                  Search / Ads Script
                </button>
              </div>
            </div>

            {/* Platform Select */}
            <div>
              <label className="text-[10px] font-bold text-brand-muted uppercase tracking-wider block mb-1.5">Platform Channel</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-brand-bg border border-brand-border text-xs text-brand-text focus:outline-none focus:border-brand-cyan transition"
              >
                {category === "social" ? (
                  <>
                    <option value="Instagram">Instagram Post</option>
                    <option value="Facebook">Facebook Campaign</option>
                    <option value="LinkedIn">LinkedIn Business</option>
                    <option value="WhatsApp">WhatsApp Blast</option>
                  </>
                ) : (
                  <>
                    <option value="Google Ads">Google Search Ad</option>
                    <option value="Facebook Ads">Facebook Carousel Ad</option>
                    <option value="YouTube Script">YouTube Shorts Script</option>
                  </>
                )}
              </select>
            </div>

            {/* Context Input */}
            <div>
              <label className="text-[10px] font-bold text-brand-muted uppercase tracking-wider block mb-1.5">Promotion Context</label>
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-brand-bg border border-brand-border text-xs text-brand-text focus:outline-none focus:border-brand-cyan transition h-28"
                placeholder="e.g. 15% discount on whole coffee beans bags this weekend only for local customers."
                required
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={generating || !context.trim()}
              className="w-full py-2.5 rounded-lg bg-brand-cyan hover:bg-brand-cyanLight text-brand-bg font-bold text-xs shadow-cyan-glow disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-1.5"
            >
              <Sparkles className="h-4 w-4" />
              <span>{generating ? "Crafting Copy..." : "Generate AI Copy"}</span>
            </button>
          </form>

          {/* Output Display (Right 7 Cols) */}
          <div className="lg:col-span-7">
            {generating && (
              <div className="glass-panel p-6 border-brand-border h-80 flex flex-col items-center justify-center text-center space-y-3 animate-pulse">
                <Sparkles className="h-8 w-8 text-brand-cyan animate-spin" />
                <span className="text-xs text-brand-muted font-semibold">Gemini is copywriting...</span>
              </div>
            )}

            {!generating && !copyResult && (
              <div className="glass-panel p-6 border-brand-border h-80 flex flex-col items-center justify-center text-center space-y-2.5 text-brand-muted">
                <Megaphone className="h-10 w-10 text-brand-border" />
                <span className="text-xs font-bold text-brand-text">Awaiting Ingest Inputs</span>
                <p className="text-[10px] max-w-[250px] leading-relaxed">
                  Fill in the details on the left panel to generate ad titles and post briefs.
                </p>
              </div>
            )}

            {!generating && copyResult && (
              <div className="glass-panel p-6 border-brand-cyan/15 shadow-cyan-glow space-y-5 animate-fade-in text-xs">
                
                {/* Header */}
                <div className="flex items-center justify-between border-b border-brand-border pb-3">
                  <span className="font-bold text-brand-text uppercase tracking-wider text-[10px]">
                    Generated {platform} Copy
                  </span>
                  <button
                    onClick={() => copyToClipboard(category === "social" ? copyResult.caption : copyResult.description)}
                    className="p-1.5 rounded bg-brand-border hover:bg-brand-cyan/10 border border-brand-border text-brand-cyan hover:text-brand-cyanLight transition flex items-center gap-1 text-[9px] font-bold"
                  >
                    <Copy className="h-3 w-3" />
                    <span>{copySuccess ? "Copied!" : "Copy"}</span>
                  </button>
                </div>

                {/* Primary Copy Box */}
                <div className="p-4 rounded-lg bg-brand-bg/50 border border-brand-border text-left leading-relaxed">
                  {category === "social" ? (
                    <>
                      <p className="font-bold text-brand-text">{copyResult.caption}</p>
                      {copyResult.hashtags && (
                        <p className="text-brand-cyan mt-3 font-semibold">
                          {copyResult.hashtags.map((h: string) => `#${h}`).join(" ")}
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      <p className="font-bold text-brand-cyan text-sm">{copyResult.headline}</p>
                      <p className="text-brand-text mt-2 font-medium">{copyResult.description}</p>
                    </>
                  )}
                </div>

                {/* Auxiliary Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                  {category === "social" ? (
                    <>
                      <div className="space-y-1.5">
                        <span className="text-[9px] uppercase font-bold text-brand-muted block">Call To Action</span>
                        <span className="font-semibold text-brand-text block">{copyResult.call_to_action}</span>
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-[9px] uppercase font-bold text-brand-muted block">AI Image Prompt</span>
                        <span className="text-[10px] text-brand-muted leading-snug block italic">"{copyResult.image_prompt}"</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-1.5">
                        <span className="text-[9px] uppercase font-bold text-brand-muted block">Target Audience</span>
                        <span className="text-[10px] text-brand-text font-medium block">{copyResult.target_audience}</span>
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-[9px] uppercase font-bold text-brand-muted block">Recommended Keywords</span>
                        <span className="text-[10px] text-brand-cyan font-bold block">
                          {copyResult.keywords?.join(", ")}
                        </span>
                      </div>
                      <div className="sm:col-span-2 pt-2 border-t border-brand-border/60 flex items-center gap-2 text-brand-warning">
                        <Coins className="h-4 w-4 shrink-0" />
                        <span className="text-[10px] font-semibold">{copyResult.budget_recommendation}</span>
                      </div>
                    </>
                  )}
                </div>

              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
