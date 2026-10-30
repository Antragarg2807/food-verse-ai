import React, { useState } from 'react';
import { 
  Clock, 
  Trash2, 
  Search, 
  Filter, 
  ArrowRight, 
  ExternalLink, 
  Utensils, 
  Apple, 
  ShieldCheck, 
  ChefHat, 
  CalendarDays, 
  Sparkles, 
  Download, 
  FileText,
  HeartPulse,
  RotateCcw
} from 'lucide-react';
import { AnalysisHistoryItem, ActiveTab } from '../types/index.ts';

interface HistoryViewProps {
  history: AnalysisHistoryItem[];
  onSelectHistoryItem: (item: AnalysisHistoryItem) => void;
  onDeleteItem: (id: string) => void;
  onClearAll: () => void;
  setActiveTab: (tab: ActiveTab) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onSelectHistoryItem,
  onDeleteItem,
  onClearAll,
  setActiveTab
}) => {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [confirmClear, setConfirmClear] = useState<boolean>(false);

  const filteredHistory = history.filter((item) => {
    const matchesType = selectedType === 'all' || item.type === selectedType;
    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const getIconForType = (type: string) => {
    switch (type) {
      case 'recognition':
        return <Utensils className="w-4 h-4 text-emerald-700" />;
      case 'freshness':
        return <Apple className="w-4 h-4 text-amber-700" />;
      case 'hygiene':
        return <ShieldCheck className="w-4 h-4 text-blue-700" />;
      case 'cooking':
        return <ChefHat className="w-4 h-4 text-orange-700" />;
      case 'meal-plan':
        return <CalendarDays className="w-4 h-4 text-purple-700" />;
      default:
        return <Sparkles className="w-4 h-4 text-stone-700" />;
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'recognition':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'freshness':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'hygiene':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cooking':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'meal-plan':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-stone-100 text-stone-800 border-stone-200';
    }
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(history, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `foodverse-history-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-stone-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100 text-stone-700 text-xs font-semibold uppercase tracking-wider mb-2">
            <Clock className="w-3.5 h-3.5" />
            <span>Audit Trail & Records</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-stone-900">
            Analysis History & Archives
          </h1>
          <p className="text-stone-600 text-sm mt-1 max-w-2xl">
            Browse, re-open, or export all your recorded food scans, macro breakdowns, produce freshness audits, kitchen hygiene checks, and tailored recipes.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {history.length > 0 && (
            <button
              onClick={handleExportJSON}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone-200 hover:border-stone-300 bg-white text-stone-700 text-xs font-bold transition-colors shadow-2xs"
            >
              <Download className="w-4 h-4 text-stone-500" />
              <span>Export JSON</span>
            </button>
          )}

          {history.length > 0 && !confirmClear && (
            <button
              onClick={() => setConfirmClear(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 text-xs font-bold transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear History</span>
            </button>
          )}

          {confirmClear && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-red-700">Delete all items?</span>
              <button
                onClick={() => {
                  onClearAll();
                  setConfirmClear(false);
                }}
                className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
              >
                Yes, Clear
              </button>
              <button
                onClick={() => setConfirmClear(false)}
                className="px-3 py-1.5 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-bold"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200/90 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Type tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'All Items' },
            { id: 'recognition', label: 'Food Recognition' },
            { id: 'freshness', label: 'Freshness' },
            { id: 'hygiene', label: 'Hygiene' },
            { id: 'cooking', label: 'Recipes' },
            { id: 'meal-plan', label: 'Meal Plans' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedType(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedType === tab.id
                  ? 'bg-emerald-900 text-white shadow-2xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, dish, or notes..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-800 placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-700 focus:bg-white"
          />
        </div>
      </div>

      {/* History Grid or Empty State */}
      {filteredHistory.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-stone-200 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
            <Clock className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif text-lg font-bold text-stone-900">
              {searchQuery ? 'No matching history items found' : 'No analysis history recorded yet'}
            </h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              {searchQuery
                ? 'Try broadening your search term or selecting "All Items" above.'
                : 'Run an image recognition scan, evaluate food spoilage, or build a personalized recipe to store items in your local history archive.'}
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={() => setActiveTab('recognition')}
              className="px-5 py-2.5 rounded-xl bg-emerald-900 text-white text-xs font-bold hover:bg-emerald-800 transition-colors shadow-xs"
            >
              Launch Food Scanner
            </button>
            <button
              onClick={() => setActiveTab('samples')}
              className="px-5 py-2.5 rounded-xl bg-stone-100 text-stone-800 text-xs font-bold hover:bg-stone-200 transition-colors"
            >
              Explore Sample Library
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredHistory.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl border border-stone-200/90 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
            >
              <div>
                {/* Thumbnail banner if available */}
                {item.thumbnailUrl ? (
                  <div className="relative h-44 w-full overflow-hidden bg-stone-100 border-b border-stone-100">
                    <img
                      src={item.thumbnailUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-900/80 backdrop-blur-xs text-white text-[11px] font-semibold border border-white/20">
                      {getIconForType(item.type)}
                      <span className="capitalize">{item.type}</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 border-b border-stone-100 flex items-center justify-between">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${getBadgeColor(item.type)}`}>
                      {getIconForType(item.type)}
                      <span className="capitalize">{item.type}</span>
                    </div>
                    <span className="text-[11px] text-stone-400 font-medium">
                      {new Date(item.timestamp).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                )}

                <div className="p-5 space-y-2">
                  {item.thumbnailUrl && (
                    <div className="text-[11px] text-stone-400 font-medium">
                      {new Date(item.timestamp).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  )}

                  <h3 className="font-serif text-lg font-bold text-stone-900 group-hover:text-emerald-900 transition-colors line-clamp-1">
                    {item.title}
                  </h3>

                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                    {item.subtitle || 'Multimodal analysis record generated by Food Verse AI engine.'}
                  </p>
                </div>
              </div>

              {/* Action Footer */}
              <div className="px-5 py-3.5 bg-stone-50/80 border-t border-stone-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => onSelectHistoryItem(item)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 transition-colors"
                >
                  <span>Open Full Report</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteItem(item.id);
                  }}
                  className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove from history"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
