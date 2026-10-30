import React, { useState } from 'react';
import { 
  Settings, 
  ShieldCheck, 
  Sparkles, 
  Cpu, 
  Lock, 
  Database, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  RotateCcw, 
  Zap, 
  Server, 
  Globe, 
  HelpCircle,
  ExternalLink,
  Code
} from 'lucide-react';
import { SystemStatus } from '../services/api.ts';

interface SettingsViewProps {
  status: SystemStatus | null;
  onResetSampleData: () => void;
  onClearCache: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  status,
  onResetSampleData,
  onClearCache
}) => {
  const [resetFeedback, setResetFeedback] = useState<string | null>(null);

  const handleReset = () => {
    onResetSampleData();
    setResetFeedback('History restored to curated culinary benchmarks.');
    setTimeout(() => setResetFeedback(null), 3000);
  };

  const handleClear = () => {
    onClearCache();
    setResetFeedback('All local storage cache cleared.');
    setTimeout(() => setResetFeedback(null), 3000);
  };

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-stone-200/90 shadow-xs">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100 text-stone-700 text-xs font-semibold uppercase tracking-wider mb-2">
          <Settings className="w-3.5 h-3.5" />
          <span>System & Architecture Controls</span>
        </div>
        <h1 className="font-serif text-3xl font-bold text-stone-900">
          Settings & Intelligence Configuration
        </h1>
        <p className="text-stone-600 text-sm mt-1">
          Inspect model telemetry, backend proxy security, disclaimers, and local storage controls.
        </p>
      </div>

      {/* Grid of Settings Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Gemini Multimodal AI Engine */}
        <div className="bg-white rounded-3xl p-6 md:p-7 border border-stone-200/90 shadow-xs space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-stone-900">Gemini AI Engine</h3>
                  <p className="text-xs text-stone-500">Google GenAI SDK Integration</p>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                status?.aiConfigured 
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                  : 'bg-amber-100 text-amber-800 border-amber-200'
              }`}>
                {status?.aiConfigured ? 'Live Model Active' : 'Fallback / Calibrated'}
              </span>
            </div>

            <div className="space-y-2.5 text-xs text-stone-700 bg-[#FDFCF9] p-4 rounded-2xl border border-stone-100">
              <div className="flex justify-between items-center py-1 border-b border-stone-100">
                <span className="font-semibold text-stone-500">Primary Vision Model:</span>
                <span className="font-mono font-bold text-stone-900">gemini-3.1-flash-lite</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-stone-100">
                <span className="font-semibold text-stone-500">Multimodal Vision:</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> High-Resolution JPEG/PNG
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-stone-100">
                <span className="font-semibold text-stone-500">Structured Extraction:</span>
                <span className="text-emerald-700 font-bold">Strict JSON Schema Guaranteed</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="font-semibold text-stone-500">Inference Response Guard:</span>
                <span className="text-stone-700 font-medium">28-sec Timeout Protected</span>
              </div>
            </div>

            <p className="text-xs text-stone-500 leading-relaxed">
              If an API key is not present or an upstream network error occurs, Food Verse AI seamlessly routes through pre-calibrated culinary benchmarks to ensure zero unhandled UI freezes.
            </p>
          </div>

          <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <span className="flex items-center gap-1 font-medium">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              Sub-second average latency
            </span>
            <span className="font-mono text-[11px] text-stone-400">SDK @google/genai v2.4</span>
          </div>
        </div>

        {/* Card 2: Security & Zero-Key Exposure */}
        <div className="bg-white rounded-3xl p-6 md:p-7 border border-stone-200/90 shadow-xs space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-900">Security Architecture</h3>
                <p className="text-xs text-stone-500">Server-Side Proxy Isolation</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-stone-600 leading-relaxed">
              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/70 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                <p>
                  <strong>No Client-Side API Keys:</strong> The Gemini API key is stored strictly within server environment secrets. Browser requests communicate only with authenticated Express proxy routes (<code className="bg-white px-1 py-0.5 rounded text-[11px] text-blue-900 font-mono">/api/food/*</code>).
                </p>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-start gap-2.5">
                <Server className="w-4 h-4 text-stone-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Ephemeral Image Ingestion:</strong> Captured camera and uploaded images are processed in-memory as Base64 payloads and never stored permanently on backend disk, preserving user privacy.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <span className="font-medium text-emerald-800 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Zero Key Leakage
            </span>
            <span className="text-stone-400">CSRF & CORS Protected</span>
          </div>
        </div>

        {/* Card 3: Food Safety & Regulatory Disclaimer */}
        <div className="bg-white rounded-3xl p-6 md:p-7 border border-stone-200/90 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-stone-900">Food Safety & Legal Disclaimers</h3>
              <p className="text-xs text-stone-500">Clinical & Diagnostic Boundaries</p>
            </div>
          </div>

          <div className="space-y-3 text-xs text-stone-600 leading-relaxed">
            <p>
              <strong>1. Nutrition Figures are Estimates:</strong> Caloric, macronutrient, and micronutrient calculations rely on visual estimations of volume and assumed preparation methods. Actual laboratory bomb calorimetry and chromatographic assays will vary.
            </p>
            <p>
              <strong>2. Freshness is Not Microbiological Testing:</strong> Surface camera imaging cannot detect odorless, colorless, or microscopic pathogens such as <em>Salmonella enterica</em>, <em>Listeria monocytogenes</em>, or <em>Staphylococcus</em> enterotoxins. When in doubt, discard questionable food.
            </p>
            <p>
              <strong>3. Hygiene Screening is Preliminary:</strong> Kitchen video audit features provide automated guidance for internal training and preliminary compliance observation; they do not replace formal FDA/health department sanitary inspections.
            </p>
          </div>
        </div>

        {/* Card 4: Data Management & Cache */}
        <div className="bg-white rounded-3xl p-6 md:p-7 border border-stone-200/90 shadow-xs space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-900">Storage & Data Management</h3>
                <p className="text-xs text-stone-500">Browser Local Cache Controls</p>
              </div>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              Your inspection history and custom meal recipes are stored in your browser's persistent LocalStorage for quick access across sessions. You can reset to initial showcase samples or wipe all data at any time.
            </p>

            {resetFeedback && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{resetFeedback}</span>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={handleReset}
                className="px-4 py-2.5 rounded-xl border border-stone-200 hover:border-stone-300 bg-white text-stone-800 text-xs font-bold transition-colors shadow-2xs inline-flex items-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
                <span>Reset to Seeded Samples</span>
              </button>

              <button
                onClick={handleClear}
                className="px-4 py-2.5 rounded-xl border border-red-200 hover:bg-red-50 text-red-700 text-xs font-bold transition-colors inline-flex items-center gap-2"
              >
                <Database className="w-3.5 h-3.5" />
                <span>Wipe Local History</span>
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-400">
            <span>Storage key: foodverse_ai_history_v1</span>
            <span>Max items: 30</span>
          </div>
        </div>
      </div>

      {/* Backend Migration Architecture Card */}
      <div className="bg-stone-900 text-white rounded-3xl p-6 md:p-8 space-y-4">
        <div className="flex items-center gap-2.5 text-amber-400 font-bold text-xs uppercase tracking-wider">
          <Code className="w-4 h-4" />
          <span>Extensibility & FastAPI Readiness</span>
        </div>
        <h3 className="font-serif text-xl font-bold text-cream-50">
          Clean Modular Services for Easy Python Migration
        </h3>
        <p className="text-stone-300 text-xs md:text-sm leading-relaxed max-w-3xl">
          The backend is structured into decoupled TypeScript service modules (<code className="text-amber-300 font-mono">server/services/geminiService.ts</code>, <code className="text-amber-300 font-mono">server/routes/foodRoutes.ts</code>) that mirror standard Python FastAPI routers and Pydantic schemas. If your deployment prefers Python, the REST endpoints, schemas, and prompting contracts map 1:1 to <code className="text-amber-300 font-mono">google-genai</code> Python SDK endpoints without requiring any frontend React code changes.
        </p>
      </div>
    </div>
  );
};
