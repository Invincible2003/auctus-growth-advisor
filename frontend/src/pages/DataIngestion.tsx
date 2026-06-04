import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { 
  Upload, 
  FileText, 
  Trash2, 
  AlertCircle, 
  CheckCircle,
  HelpCircle,
  Clock,
  Sparkles
} from "lucide-react";

export const DataIngestion: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<"sales" | "reviews">("sales");
  const [uploading, setUploading] = useState(false);
  
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const data = await api.ingestion.getHistory();
      setHistory(data);
    } catch (e: any) {
      console.error("Failed to load upload history:", e);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
      setSuccess(false);
      setUploadResult(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file to ingest.");
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(false);
    setUploadResult(null);

    try {
      const res = await api.ingestion.upload(file, fileType);
      setUploadResult(res);
      setSuccess(true);
      setFile(null);
      // Reset input element
      const fileInput = document.getElementById("file-input") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
      
      fetchHistory();
    } catch (e: any) {
      setError(e.message || "Failed to process the uploaded dataset. Ensure column formatting matches guidelines.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this dataset? This will remove all associated analytics and records.")) {
      return;
    }

    try {
      await api.ingestion.deleteDataset(id);
      setHistory((prev) => prev.filter((d) => d.id !== id));
    } catch (e: any) {
      alert(e.message || "Failed to delete dataset.");
    }
  };

  return (
    <div className="p-6 text-left max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-brand-text">Data Ingestion Center</h1>
        <p className="text-xs text-brand-muted mt-1 font-medium">
          Upload spreadsheets to clean and ingest into your analytics models.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Upload Form (Left 1 Span) */}
        <div className="lg:col-span-1 space-y-6">
          <form onSubmit={handleUpload} className="glass-panel p-6 border-brand-border space-y-4">
            <h3 className="text-sm font-extrabold text-brand-text">Upload Spreadsheet</h3>
            
            {error && (
              <div className="p-3 rounded bg-brand-danger/10 border border-brand-danger/25 text-brand-danger text-[11px] flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* File Type Select */}
            <div>
              <label className="text-xs font-semibold text-brand-muted block mb-1">Dataset Category</label>
              <select
                value={fileType}
                onChange={(e) => setFileType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg bg-brand-bg border border-brand-border text-xs text-brand-text focus:outline-none focus:border-brand-cyan transition appearance-none"
              >
                <option value="sales">Sales & Financial Transactions</option>
                <option value="reviews">Reviews & Customer Feedback</option>
              </select>
            </div>

            {/* File Input box */}
            <div className="border border-dashed border-brand-border rounded-lg p-6 text-center hover:border-brand-cyan/40 transition relative">
              <input
                type="file"
                id="file-input"
                onChange={handleFileChange}
                accept=".csv,.xlsx,.xls,.json"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload className="h-8 w-8 text-brand-cyan mx-auto mb-2" />
              <span className="text-xs text-brand-text block font-bold">
                {file ? file.name : "Select File"}
              </span>
              <span className="text-[10px] text-brand-muted block mt-1">
                CSV, Excel, or JSON (max 10MB)
              </span>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={uploading || !file}
              className="w-full py-2 rounded-lg bg-brand-cyan hover:bg-brand-cyanLight text-brand-bg font-bold text-xs shadow-cyan-glow disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {uploading ? "Ingesting and Cleaning..." : "Process Dataset"}
            </button>
          </form>

          {/* Ingestion Specs */}
          <div className="glass-panel p-6 border-brand-border text-xs space-y-3">
            <h4 className="font-bold text-brand-text uppercase tracking-wide text-[10px]">Expected Columns</h4>
            <div className="space-y-2 text-brand-muted">
              <div>
                <span className="font-bold text-brand-cyan block">Sales Data:</span>
                <span>date, amount, product_name, category (optional), customer_id (optional), region (optional)</span>
              </div>
              <div className="pt-2 border-t border-brand-border/60">
                <span className="font-bold text-brand-cyan block">Customer Reviews:</span>
                <span>review_text, rating (optional), reviewer_name (optional)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cleaning Audit Report (Right 2 Spans) */}
        <div className="lg:col-span-2 space-y-6">
          {success && uploadResult && (
            <div className="glass-panel p-6 border-brand-cyan/20 shadow-cyan-glow space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-brand-border pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-brand-success" />
                  <span className="text-sm font-bold text-brand-text">Automated Data Cleaning Audit</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20">
                  {uploadResult.row_count} Clean Rows Ingested
                </span>
              </div>

              {/* AI Explanation bubble */}
              <div className="p-4 rounded-lg bg-brand-cyan/5 border border-brand-cyan/15 flex gap-3 text-left">
                <Sparkles className="h-5 w-5 text-brand-cyan shrink-0" />
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-cyan">AI Data Quality Summary</span>
                  <p className="text-xs text-brand-text leading-relaxed">{uploadResult.ai_explanation}</p>
                </div>
              </div>

              {/* Technical Change Logs */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-brand-muted tracking-wide block">Data Adjustments Operations Log</span>
                {uploadResult.cleaning_logs.length === 0 ? (
                  <p className="text-xs text-brand-muted">No alterations required. Dataset was fully validated on first pass.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {uploadResult.cleaning_logs.map((log: any, idx: number) => (
                      <div key={idx} className="p-3 rounded-lg bg-brand-bg/50 border border-brand-border text-xs">
                        <span className="font-bold text-brand-text block">{log.issue}</span>
                        <span className="text-brand-muted mt-0.5 block">{log.action}</span>
                        {log.count > 0 && (
                          <span className="text-[10px] text-brand-cyan font-semibold block mt-1">Impacted rows: {log.count}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Upload History Table */}
          <div className="glass-panel p-6 border-brand-border space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-brand-cyan" />
              <h3 className="text-sm font-extrabold text-brand-text">Dataset Ingestion History</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-brand-border text-brand-muted font-bold">
                    <th className="py-2">Filename</th>
                    <th className="py-2">Type</th>
                    <th className="py-2">Rows Count</th>
                    <th className="py-2">Upload Date</th>
                    <th className="py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/60">
                  {history.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-brand-muted">
                        No datasets ingested yet.
                      </td>
                    </tr>
                  ) : (
                    history.map((item) => (
                      <tr key={item.id} className="text-brand-text hover:bg-brand-border/20 transition">
                        <td className="py-2.5 font-bold flex items-center gap-2">
                          <FileText className="h-4 w-4 text-brand-cyan" />
                          <span className="truncate max-w-[150px]">{item.filename}</span>
                        </td>
                        <td className="py-2.5 capitalize">{item.file_type}</td>
                        <td className="py-2.5">{item.row_count}</td>
                        <td className="py-2.5">
                          {new Date(item.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-2.5 text-right">
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 rounded hover:bg-brand-danger/10 text-brand-muted hover:text-brand-danger transition"
                            title="Delete Dataset"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
