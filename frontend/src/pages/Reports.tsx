import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { 
  FileText, 
  Download, 
  AlertCircle, 
  Clock, 
  Sparkles,
  FileCheck,
  CheckCircle
} from "lucide-react";

export const Reports: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [generating, setGenerating] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await api.reports.getHistory();
      setReports(data);
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (format: "pdf" | "docx" | "pptx") => {
    setGenerating(format);
    setError(null);
    setSuccess(false);

    try {
      await api.reports.generate(format);
      setSuccess(true);
      fetchReports();
    } catch (e: any) {
      setError(e.message || `Failed to compile ${format.toUpperCase()} report.`);
    } finally {
      setGenerating(null);
    }
  };

  const handleDownload = async (id: string, title: string, format: string) => {
    try {
      await api.reports.download(id, title, format);
    } catch (e: any) {
      alert(e.message || "Failed to download report file.");
    }
  };

  return (
    <div className="p-6 text-left max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-brand-text">Performance Report Downloads</h1>
        <p className="text-xs text-brand-muted mt-1 font-medium">
          Compile sales projections, customer sentiment reviews, and SWOT audits into PDF/Word/PPT slides.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-lg bg-brand-danger/10 border border-brand-danger/25 text-brand-danger text-xs flex items-center gap-2.5">
          <AlertCircle className="h-4.5 w-4.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3.5 rounded-lg bg-brand-success/10 border border-brand-success/25 text-brand-success text-xs flex items-center gap-2.5">
          <CheckCircle className="h-4.5 w-4.5 shrink-0" />
          <span>Report compiled successfully. Check history log to download.</span>
        </div>
      )}

      {/* Grid boxes to trigger compile */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* PDF Card */}
        <div className="glass-panel p-6 border-brand-border space-y-4 flex flex-col justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] font-black uppercase text-brand-cyan tracking-wider block">Executive Summary</span>
            <h3 className="text-sm font-bold text-brand-text">PDF Performance Audit</h3>
            <p className="text-[11px] text-brand-muted leading-relaxed">
              Beautiful executive summary compiling KPIs, SWOT quadrants, and priority marketing ideas in print-ready layout.
            </p>
          </div>
          <button
            onClick={() => handleGenerate("pdf")}
            disabled={generating !== null}
            className="w-full py-2 rounded-lg bg-brand-cyan hover:bg-brand-cyanLight text-brand-bg text-xs font-bold shadow-cyan-glow transition disabled:opacity-50"
          >
            {generating === "pdf" ? "Compiling PDF..." : "Generate PDF Report"}
          </button>
        </div>

        {/* DOCX Card */}
        <div className="glass-panel p-6 border-brand-border space-y-4 flex flex-col justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] font-black uppercase text-brand-blue tracking-wider block">Business Review</span>
            <h3 className="text-sm font-bold text-brand-text">Word Document (DOCX)</h3>
            <p className="text-[11px] text-brand-muted leading-relaxed">
              Full text-based business operations review. Ideal for editing copy, sharing logs, or importing to company docs.
            </p>
          </div>
          <button
            onClick={() => handleGenerate("docx")}
            disabled={generating !== null}
            className="w-full py-2 rounded-lg bg-brand-cyan hover:bg-brand-cyanLight text-brand-bg text-xs font-bold shadow-cyan-glow transition disabled:opacity-50"
          >
            {generating === "docx" ? "Compiling Word..." : "Generate Word DOCX"}
          </button>
        </div>

        {/* PPTX Card */}
        <div className="glass-panel p-6 border-brand-border space-y-4 flex flex-col justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] font-black uppercase text-brand-warning tracking-wider block">Pitch Deck</span>
            <h3 className="text-sm font-bold text-brand-text">PowerPoint Slides (PPTX)</h3>
            <p className="text-[11px] text-brand-muted leading-relaxed">
              Stakeholder slideshow deck presenting KPI tables and advisor recommendations. Branded by AUCTUS.
            </p>
          </div>
          <button
            onClick={() => handleGenerate("pptx")}
            disabled={generating !== null}
            className="w-full py-2 rounded-lg bg-brand-cyan hover:bg-brand-cyanLight text-brand-bg text-xs font-bold shadow-cyan-glow transition disabled:opacity-50"
          >
            {generating === "pptx" ? "Compiling Slides..." : "Generate PowerPoint"}
          </button>
        </div>
      </div>

      {/* History log */}
      <div className="glass-panel p-6 border-brand-border space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-brand-cyan" />
          <h3 className="text-sm font-extrabold text-brand-text">Compiled Reports History</h3>
        </div>

        {loading ? (
          <div className="text-xs text-brand-muted py-6 text-center animate-pulse">Loading files history...</div>
        ) : reports.length === 0 ? (
          <div className="text-xs text-brand-muted py-6 text-center">No reports compiled yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-brand-border text-brand-muted font-bold">
                  <th className="py-2">Report Document Title</th>
                  <th className="py-2">Format</th>
                  <th className="py-2">Date Generated</th>
                  <th className="py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60">
                {reports.map((item) => (
                  <tr key={item.id} className="text-brand-text hover:bg-brand-border/20 transition">
                    <td className="py-2.5 font-bold flex items-center gap-2">
                      <FileCheck className="h-4 w-4 text-brand-cyan" />
                      <span>{item.title}</span>
                    </td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                        item.format === "pdf" ? "bg-brand-danger/10 border border-brand-danger/20 text-brand-danger" : (
                          item.format === "docx" ? "bg-brand-blue/10 border border-brand-blue/20 text-brand-blue" : "bg-brand-warning/10 border border-brand-warning/20 text-brand-warning"
                        )
                      }`}>
                        {item.format}
                      </span>
                    </td>
                    <td className="py-2.5">
                      {new Date(item.generated_at).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                    </td>
                    <td className="py-2.5 text-right">
                      <button
                        onClick={() => handleDownload(item.id, item.title, item.format)}
                        className="px-3 py-1 rounded bg-brand-cyan hover:bg-brand-cyanLight text-brand-bg text-[10px] font-bold transition flex items-center gap-1 ml-auto"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Download</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
