import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, X, Loader2 } from 'lucide-react';
import { api } from '../../services/api';

export default function UploadModal({ isOpen, onClose, onUploadSuccess }) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    setResult(null);

    try {
      const res = await api.uploadBankStatement(file);
      setResult(res);
      if (onUploadSuccess) onUploadSuccess();
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to parse bank statement. Please try a valid CSV or PDF.');
    } finally {
      setUploading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-lg rounded-2xl shadow-2xl p-6 relative border border-white/10">
        <button
          onClick={() => {
            reset();
            onClose();
          }}
          className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-5">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-cyan-400" />
            Upload Bank Statement
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            FinParse engine automatically normalizes narrations, identifies merchants, categorizes transactions, and evaluates risk.
          </p>
        </div>

        {!result ? (
          <div>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                dragActive
                  ? 'border-cyan-400 bg-cyan-500/10'
                  : 'border-slate-700 hover:border-slate-500 bg-slate-900/50'
              }`}
            >
              <input
                id="file-upload"
                type="file"
                accept=".csv, .pdf"
                onChange={handleChange}
                className="hidden"
              />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                <FileText className="w-10 h-10 text-slate-400 mb-3" />
                <span className="text-sm font-semibold text-white">
                  {file ? file.name : 'Click to select or drag and drop statement'}
                </span>
                <span className="text-xs text-slate-400 mt-1">
                  Supports bank statements in CSV and PDF formats (up to 15MB)
                </span>
              </label>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 mt-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex items-center justify-between mt-6">
              <span className="text-[11px] text-slate-500">
                End-to-end encrypted · Auto-confidence scoring
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    reset();
                    onClose();
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!file || uploading}
                  onClick={handleSubmit}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white disabled:opacity-50 transition-all flex items-center gap-2 shadow-glow-primary"
                >
                  {uploading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {uploading ? 'Parsing Statement...' : 'Process Statement'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-white">Extraction Successful!</h4>
            <p className="text-xs text-slate-300 mt-1.5 max-w-sm mx-auto">
              {result.message}
            </p>
            <div className="mt-5 flex justify-center">
              <button
                onClick={() => {
                  reset();
                  onClose();
                }}
                className="px-6 py-2 rounded-xl text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all shadow-glow-primary"
              >
                View Cleaned Transactions
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
