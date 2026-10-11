import React, { useState } from 'react';
import { X, Settings, Save, CheckCircle2, RotateCcw, FolderOpen } from 'lucide-react';
import { ProjectConfig } from '../types';
import { getProjectConfig, saveProjectConfig, DEFAULT_CONFIG } from '../services/db';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (config: ProjectConfig) => void;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({ isOpen, onClose, onSave }) => {
  const [config, setConfig] = useState<ProjectConfig>(() => getProjectConfig());
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveProjectConfig(config);
    if (onSave) onSave(config);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  const handleReset = () => {
    setConfig({ ...DEFAULT_CONFIG });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0e131f] border border-[#1c2638] rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-[#07090e]/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Project Configuration</h3>
              <p className="text-[11px] text-slate-400">
                Adjust CIFAKE hyperparameters & dataset directory (Section 2)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
          {savedSuccess && (
            <div className="flex items-center gap-2 p-3 text-xs rounded-xl bg-emerald-950/50 border border-emerald-800/60 text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Configuration successfully saved to local persistent storage.</span>
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              DATASET_PATH (CIFAKE Directory)
            </label>
            <div className="relative">
              <FolderOpen className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                required
                value={config.datasetPath}
                onChange={(e) => setConfig({ ...config, datasetPath: e.target.value })}
                placeholder="./dataset/cifake"
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">
              Expected layout: DATASET_PATH/train/REAL, DATASET_PATH/train/FAKE
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                IMAGE_SIZE (H, W)
              </label>
              <input
                type="text"
                readOnly
                value={`${config.imageSize[0]} × ${config.imageSize[1]} (3 channels)`}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-400 font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">CIFAKE standard dimensions</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                BATCH_SIZE
              </label>
              <select
                value={config.batchSize}
                onChange={(e) => setConfig({ ...config, batchSize: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-blue-500"
              >
                <option value={32}>32</option>
                <option value={64}>64 (Recommended)</option>
                <option value={128}>128</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                EPOCHS
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={config.epochs}
                onChange={(e) => setConfig({ ...config, epochs: parseInt(e.target.value) || 10 })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                LEARNING_RATE
              </label>
              <input
                type="number"
                step="0.0001"
                min="0.00001"
                max="0.1"
                value={config.learningRate}
                onChange={(e) => setConfig({ ...config, learningRate: parseFloat(e.target.value) || 0.001 })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              MODEL_PATH (Serialized Weights Target)
            </label>
            <input
              type="text"
              value={config.modelPath}
              onChange={(e) => setConfig({ ...config, modelPath: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Defaults
            </button>

            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              Save Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
