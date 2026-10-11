import React, { useState } from 'react';
import {
  BookOpen,
  ChevronRight,
  Download,
  Printer,
  Copy,
  Check,
  Search,
  Maximize2,
  Minimize2,
  FileText,
  Bookmark
} from 'lucide-react';
import { ACADEMIC_REPORT, ReportChapter } from '../data/academicReport';

export const ProjectReport: React.FC = () => {
  const [selectedChapterId, setSelectedChapterId] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedSectionIndex, setCopiedSectionIndex] = useState<number | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({});

  const activeChapter = ACADEMIC_REPORT.find((c) => c.id === selectedChapterId) || ACADEMIC_REPORT[0];

  const handlePrint = () => {
    window.print();
  };

  const handleCopySection = (textToCopy: string, index: number) => {
    navigator.clipboard.writeText(textToCopy);
    setCopiedSectionIndex(index);
    setTimeout(() => setCopiedSectionIndex(null), 2000);
  };

  const toggleSection = (index: number) => {
    setExpandedSections((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // Search logic across all chapters
  const filteredChapters = ACADEMIC_REPORT.filter((ch) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const inTitle = ch.title.toLowerCase().includes(q);
    const inContent = ch.sections.some(
      (s) => s.heading.toLowerCase().includes(q) || s.content.some((c) => c.toLowerCase().includes(q))
    );
    return inTitle || inContent;
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto academic-report-container">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1c2638] pb-4 no-print">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
            <span>06. Academic Dissertation & Comprehensive Report (Chapters 1–10)</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Academic Project Report (Chapters 1–10)
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Formal documentation conforming to academic computer science curriculum guidelines (Section 24).
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-purple-400" />
            Print / PDF Layout
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Navigation: Chapter Sidebar (4 cols) */}
        <div className="lg:col-span-4 bg-[#0e131f] border border-[#1c2638] rounded-xl p-4 space-y-3 sticky top-20 no-print">
          {/* Chapter Progress */}
          <div className="space-y-1.5 pb-2 border-b border-slate-800">
            <div className="flex justify-between text-[11px] font-mono text-slate-400">
              <span>Chapter {selectedChapterId} of 10</span>
              <span>{Math.round((selectedChapterId / 10) * 100)}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden flex">
              <div
                style={{ width: `${(selectedChapterId / 10) * 100}%` }}
                className="bg-purple-500 transition-all duration-300"
              />
            </div>
          </div>

          {/* Search bar inside report */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search in report..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Chapter Links */}
          <div className="space-y-1 max-h-[500px] overflow-y-auto pr-1">
            {filteredChapters.map((chapter) => {
              const isActive = chapter.id === selectedChapterId;
              return (
                <button
                  key={chapter.id}
                  onClick={() => setSelectedChapterId(chapter.id)}
                  className={`w-full text-left p-2.5 rounded-lg text-xs transition-colors flex items-center justify-between cursor-pointer ${
                    isActive
                      ? 'bg-purple-600/15 border border-purple-500/30 text-purple-300 font-semibold'
                      : 'text-slate-300 hover:bg-slate-900/60'
                  }`}
                >
                  <span className="truncate">{chapter.title}</span>
                  <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-purple-400' : 'text-slate-600'}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Reader: Active Chapter Body (8 cols) */}
        <div className="lg:col-span-8 bg-[#0e131f] border border-[#1c2638] rounded-xl p-6 sm:p-10 space-y-8 shadow-xl print:border-none print:p-0">
          {/* Chapter Heading */}
          <div className="border-b border-slate-800 pb-4">
            <span className="text-[11px] font-mono text-purple-400 uppercase tracking-widest block mb-1">
              CSE FINAL-YEAR THESIS DISSERTATION
            </span>
            <h3 className="text-2xl font-bold text-white tracking-tight">
              {activeChapter.title}
            </h3>
          </div>

          {/* Sections List */}
          <div className="space-y-8 divide-y divide-slate-800/80">
            {activeChapter.sections.map((section, idx) => {
              const isCollapsed = expandedSections[idx] === false;
              const sectionAllText = `${section.heading}\n\n${section.content.join('\n\n')}`;

              return (
                <div key={idx} className={idx > 0 ? 'pt-6' : ''}>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <h4 className="text-base font-semibold text-slate-100">
                      {section.heading}
                    </h4>

                    <div className="flex items-center gap-1.5 no-print">
                      <button
                        onClick={() => handleCopySection(sectionAllText, idx)}
                        className="p-1 rounded text-slate-500 hover:text-white transition-colors cursor-pointer"
                        title="Copy Section Content"
                      >
                        {copiedSectionIndex === idx ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                    {section.content.map((paragraph, pIdx) => (
                      <p key={pIdx}>
                        {paragraph}
                      </p>
                    ))}
                  </div>

                  {/* Figure Placeholders where appropriate */}
                  {selectedChapterId === 5 && idx === 0 && (
                    <div className="my-4 p-4 rounded-lg bg-[#07090e] border border-slate-800 text-center space-y-2">
                      <span className="text-[11px] font-mono text-slate-400 block">
                        Figure 5.1: Comparative Neural Network Topological Diagram (Standard vs Modified CNN2D)
                      </span>
                      <div className="p-3 bg-slate-900/60 rounded text-[11px] font-mono text-cyan-300">
                        [Input: 32×32×3] → [Conv2D 32] → [Conv2D 64] → [GAP Head: 128] → [Dense: 2 Units]
                      </div>
                    </div>
                  )}

                  {selectedChapterId === 7 && idx === 0 && (
                    <div className="my-4 overflow-x-auto">
                      <table className="w-full text-left text-xs border border-slate-800 rounded">
                        <thead className="bg-slate-950 font-mono text-[11px] uppercase text-slate-400">
                          <tr>
                            <th className="p-2 border-b border-slate-800">Model</th>
                            <th className="p-2 border-b border-slate-800">Parameters</th>
                            <th className="p-2 border-b border-slate-800">Accuracy</th>
                            <th className="p-2 border-b border-slate-800">Recall</th>
                            <th className="p-2 border-b border-slate-800">F1-Score</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 font-mono text-slate-300">
                          <tr>
                            <td className="p-2">Standard CNN2D</td>
                            <td className="p-2">326,754</td>
                            <td className="p-2">91.42%</td>
                            <td className="p-2">92.10%</td>
                            <td className="p-2">91.47%</td>
                          </tr>
                          <tr className="text-emerald-400 font-semibold">
                            <td className="p-2">Modified CNN2D (GAP)</td>
                            <td className="p-2">83,202 (-74.5%)</td>
                            <td className="p-2">95.38%</td>
                            <td className="p-2">95.68%</td>
                            <td className="p-2">95.40%</td>
                          </tr>
                        </tbody>
                      </table>
                      <span className="text-[10px] font-mono text-slate-500 mt-1 block">
                        Table 7.1: Quantitative Performance Benchmarks on N=10,000 CIFAKE Test Set.
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Chapter Navigation Footer */}
          <div className="flex justify-between items-center pt-6 border-t border-slate-800 text-xs no-print">
            {selectedChapterId > 1 ? (
              <button
                onClick={() => setSelectedChapterId(selectedChapterId - 1)}
                className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors cursor-pointer"
              >
                ← Previous Chapter
              </button>
            ) : <div />}

            {selectedChapterId < 10 && (
              <button
                onClick={() => setSelectedChapterId(selectedChapterId + 1)}
                className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium transition-colors cursor-pointer"
              >
                Next Chapter →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
