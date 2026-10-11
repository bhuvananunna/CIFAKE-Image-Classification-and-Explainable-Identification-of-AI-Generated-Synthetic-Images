import React, { useState } from 'react';
import {
  History,
  ShieldCheck,
  Upload,
  Download,
  Filter,
  Calendar,
  Layers,
  ArrowRight,
  Eye,
  Trash2,
  Search,
  User as UserIcon,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { PredictionRecord, User } from '../types';
import { getUserPredictions, getUserStats, deletePredictionRecord } from '../services/db';

interface HistoryDashboardProps {
  currentUser: User | null;
  onNavigateToUpload: () => void;
  onOpenAuth: () => void;
}

export const HistoryDashboard: React.FC<HistoryDashboardProps> = ({
  currentUser,
  onNavigateToUpload,
  onOpenAuth,
}) => {
  const [filterType, setFilterType] = useState<'ALL' | 'REAL' | 'FAKE'>('ALL');
  const [filterModel, setFilterModel] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [selectedRecord, setSelectedRecord] = useState<PredictionRecord | null>(null);
  const [showProfileCard, setShowProfileCard] = useState<boolean>(false);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto">
          <History className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-white">Authentication Required</h3>
        <p className="text-xs text-slate-400">
          In accordance with Section 13 security rules, prediction histories are strictly isolated per registered user. Please sign in to view your logged inferences.
        </p>
        <button
          onClick={onOpenAuth}
          className="px-5 py-2.5 rounded-lg font-semibold text-xs bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer"
        >
          Sign In / Create Account
        </button>
      </div>
    );
  }

  const allRecords = getUserPredictions(currentUser.id);
  const stats = getUserStats(currentUser.id);

  // Filter and sort
  const filteredRecords = allRecords
    .filter((r) => {
      const matchesType = filterType === 'ALL' || r.prediction === filterType;
      const matchesModel = filterModel === 'ALL' || r.modelType === filterModel;
      const matchesQuery = r.imageName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesModel && matchesQuery;
    })
    .sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
    });

  const handleDelete = (e: React.MouseEvent, recordId: string) => {
    e.stopPropagation();
    if (confirm('Delete this historical inference record?')) {
      deletePredictionRecord(recordId, currentUser.id);
      setRefreshTrigger(prev => prev + 1);
      if (selectedRecord?.id === recordId) {
        setSelectedRecord(null);
      }
    }
  };

  const exportToJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(allRecords, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `cifake_history_${currentUser.name.replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1c2638] pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
            <span>08. Per-User Prediction History & Audit Logs</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Research Dashboard & Inference History
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Logged in as <strong className="text-white">{currentUser.name}</strong> ({currentUser.email})
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setShowProfileCard(!showProfileCard)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
          >
            <UserIcon className="w-3.5 h-3.5 text-blue-400" />
            {showProfileCard ? 'Hide Profile' : 'Profile'}
          </button>
          <button
            onClick={exportToJson}
            disabled={allRecords.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors disabled:opacity-40 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export JSON
          </button>
          <button
            onClick={onNavigateToUpload}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            Analyze New Image
          </button>
        </div>
      </div>

      {/* Profile Card Section */}
      {showProfileCard && (
        <div className="p-5 rounded-xl bg-[#0e131f] border border-blue-500/30 space-y-3 animate-in fade-in duration-200">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <h4 className="text-xs font-bold text-white uppercase font-mono">User Profile & Research Metadata</h4>
            <span className="text-xs font-mono text-emerald-400">
              · Session Authenticated
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div>
              <span className="text-slate-400 text-[10px] block">Full Name:</span>
              <span className="text-white font-semibold">{currentUser.name}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">Registered Email:</span>
              <span className="text-slate-300">{currentUser.email}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">Account Created:</span>
              <span className="text-slate-300">{new Date(currentUser.createdAt).toLocaleDateString()}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">Total Analyses Logged:</span>
              <span className="text-cyan-400 font-bold">{stats.total} Inferences</span>
            </div>
          </div>
        </div>
      )}

      {/* Summary Scorecards (Section 12) */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#0e131f] border border-[#1c2638] space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase block">Total Analyses</span>
          <p className="text-2xl font-bold font-mono text-white">{stats.total}</p>
          <span className="text-[10px] text-slate-500 font-mono">Isolated in personal DB</span>
        </div>

        <div className="p-4 rounded-xl bg-[#0e131f] border border-emerald-500/30 space-y-1">
          <span className="text-[10px] font-mono text-emerald-400 uppercase block">REAL Results</span>
          <p className="text-2xl font-bold font-mono text-emerald-400">{stats.realCount}</p>
          <span className="text-[10px] text-slate-500 font-mono">
            {stats.total > 0 ? Math.round((stats.realCount / stats.total) * 100) : 0}% of personal total
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#0e131f] border border-rose-500/30 space-y-1">
          <span className="text-[10px] font-mono text-rose-400 uppercase block">FAKE / AI Results</span>
          <p className="text-2xl font-bold font-mono text-rose-400">{stats.fakeCount}</p>
          <span className="text-[10px] text-slate-500 font-mono">
            {stats.total > 0 ? Math.round((stats.fakeCount / stats.total) * 100) : 0}% synthetic detections
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#0e131f] border border-[#1c2638] space-y-1">
          <span className="text-[10px] font-mono text-cyan-400 uppercase block">Mean Confidence</span>
          <p className="text-2xl font-bold font-mono text-cyan-300">
            {stats.avgConfidence ? `${stats.avgConfidence.toFixed(2)}%` : 'N/A'}
          </p>
          <span className="text-[10px] text-slate-500 font-mono">Prediction certainty mean</span>
        </div>
      </div>

      {/* History Controls Bar (Search, Filter by Real/Fake, Filter by Model, Sort) */}
      <div className="bg-[#0e131f] border border-[#1c2638] rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
            Inference History Records
          </h3>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search file name..."
                className="pl-8 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 w-36"
              />
            </div>

            {/* Filter by Real / Fake */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="py-1.5 px-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono focus:outline-none"
            >
              <option value="ALL">All Classes</option>
              <option value="REAL">REAL Only</option>
              <option value="FAKE">FAKE Only</option>
            </select>

            {/* Filter by Model */}
            <select
              value={filterModel}
              onChange={(e) => setFilterModel(e.target.value)}
              className="py-1.5 px-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono focus:outline-none"
            >
              <option value="ALL">All Models</option>
              <option value="modified_cnn2d">Modified CNN2D</option>
              <option value="cnn2d">Standard CNN2D</option>
            </select>

            {/* Sort Order */}
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="py-1.5 px-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono focus:outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="py-12 text-center text-slate-500 space-y-2">
            <p className="text-xs">No records match your query.</p>
            <button
              onClick={onNavigateToUpload}
              className="text-xs text-blue-400 hover:underline"
            >
              Analyze an image to create a record →
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 font-mono text-[10px] text-slate-400 uppercase border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Input</th>
                  <th className="py-2.5 px-3">Grad-CAM</th>
                  <th className="py-2.5 px-3">File Name</th>
                  <th className="py-2.5 px-3">Model</th>
                  <th className="py-2.5 px-3">Prediction</th>
                  <th className="py-2.5 px-3">Confidence</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredRecords.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => setSelectedRecord(r)}
                    className="hover:bg-slate-900/60 cursor-pointer transition-colors"
                  >
                    <td className="py-2 px-3">
                      <img
                        src={r.originalImage}
                        alt="Input"
                        className="w-9 h-9 object-cover rounded border border-slate-700 bg-slate-950"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <img
                        src={r.gradcamOverlay}
                        alt="Overlay"
                        className="w-9 h-9 object-cover rounded border border-slate-700 bg-slate-950"
                      />
                    </td>
                    <td className="py-2 px-3 font-medium text-white max-w-[130px] truncate">
                      {r.imageName}
                    </td>
                    <td className="py-2 px-3 text-slate-300 font-mono text-[11px]">
                      {r.modelType === 'modified_cnn2d' ? 'Modified (GAP)' : 'Standard'}
                    </td>
                    <td className="py-2 px-3 font-mono font-bold">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] ${
                          r.prediction === 'REAL'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {r.prediction}
                      </span>
                    </td>
                    <td className="py-2 px-3 font-mono font-bold text-slate-200">
                      {r.confidence.toFixed(2)}%
                    </td>
                    <td className="py-2 px-3 text-slate-400 font-mono text-[11px]">
                      {new Date(r.timestamp).toLocaleDateString()} {new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-2 px-3 text-right">
                      <button
                        onClick={(e) => handleDelete(e, r.id)}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                        title="Delete Record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0e131f] border border-[#1c2638] rounded-xl p-6 max-w-lg w-full space-y-4 text-slate-100 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h4 className="font-bold text-sm text-white">Historical Inference Diagnostic</h4>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-slate-800"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div>
                <span className="text-[10px] font-mono text-slate-400 block mb-1">Original Input</span>
                <img
                  src={selectedRecord.originalImage}
                  alt="Original"
                  className="w-full aspect-square object-contain rounded-lg border border-slate-800 bg-slate-950"
                />
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-400 block mb-1">Grad-CAM Overlay</span>
                <img
                  src={selectedRecord.gradcamOverlay}
                  alt="Overlay"
                  className="w-full aspect-square object-contain rounded-lg border border-slate-800 bg-slate-950"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Class:</span>
                <span className={`font-bold ${selectedRecord.prediction === 'REAL' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {selectedRecord.prediction}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Confidence:</span>
                <span className="font-bold text-white">{selectedRecord.confidence}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Model:</span>
                <span className="text-cyan-400">{selectedRecord.modelType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Inference Latency:</span>
                <span className="text-slate-300">{selectedRecord.inferenceTimeMs}ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Timestamp:</span>
                <span className="text-slate-300">{selectedRecord.timestamp}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
