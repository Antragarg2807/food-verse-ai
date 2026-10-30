import React, { useState } from 'react';
import { 
  Sparkles, 
  Utensils, 
  Apple, 
  ShieldCheck, 
  ChefHat, 
  CalendarDays, 
  LayoutDashboard, 
  FileText, 
  Menu, 
  X, 
  Activity, 
  Info,
  CheckCircle2,
  AlertTriangle,
  History,
  Settings,
  HeartPulse
} from 'lucide-react';
import { ActiveTab } from '../types/index.ts';
import { SystemStatus } from '../services/api.ts';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  status: SystemStatus | null;
  historyCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, status, historyCount = 0 }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  const primaryNavItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'recognition', label: 'Food Recognition', icon: <Utensils className="w-4 h-4" /> },
    { id: 'nutrition', label: 'Nutrition Analysis', icon: <HeartPulse className="w-4 h-4" /> },
    { id: 'freshness', label: 'Freshness Test', icon: <Apple className="w-4 h-4" /> },
    { id: 'hygiene', label: 'Hygiene Monitor', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'cooking', label: 'Cooking Assistant', icon: <ChefHat className="w-4 h-4" /> },
    { id: 'meal-plan', label: 'Meal Planner', icon: <CalendarDays className="w-4 h-4" /> },
  ];

  const secondaryNavItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'history', label: 'History', icon: <History className="w-4 h-4" />, badge: historyCount > 0 ? String(historyCount) : undefined },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
    { id: 'samples', label: 'Samples', icon: <FileText className="w-4 h-4" />, badge: '6' }
  ];

  const allNavItems = [...primaryNavItems, ...secondaryNavItems];
  const isLive = status?.aiConfigured;

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#FBF9F4]/90 backdrop-blur-md border-b border-stone-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Brand Logo & Tagline */}
            <div 
              onClick={() => setActiveTab('dashboard')} 
              className="flex items-center gap-3 cursor-pointer group select-none shrink-0"
            >
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-800 to-emerald-950 flex items-center justify-center shadow-md shadow-emerald-950/20 group-hover:scale-105 transition-transform border border-emerald-700/30">
                <Sparkles className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif text-2xl font-bold tracking-tight text-emerald-950">
                    Food Verse <span className="text-amber-600 font-sans font-extrabold text-lg px-2 py-0.5 rounded-md bg-amber-100/80 border border-amber-300/60">AI</span>
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] font-medium tracking-wide text-stone-500 uppercase">
                  Smarter Food. Safer Choices. Healthier Living.
                </p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden 2xl:flex items-center gap-1 bg-stone-100/90 p-1.5 rounded-full border border-stone-200/90 shadow-2xs">
              {allNavItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all select-none ${
                      isActive
                        ? 'bg-emerald-900 text-white shadow-sm shadow-emerald-950/20'
                        : 'text-stone-600 hover:text-emerald-950 hover:bg-stone-200/60'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isActive ? 'bg-amber-400 text-stone-900' : 'bg-stone-200 text-stone-700'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Laptop / Compact Desktop Navigation (1024px to 1535px) */}
            <nav className="hidden lg:flex 2xl:hidden items-center gap-1 bg-stone-100/90 p-1 rounded-full border border-stone-200/90 shadow-2xs">
              {primaryNavItems.slice(0, 5).map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold transition-all select-none ${
                      isActive
                        ? 'bg-emerald-900 text-white shadow-sm shadow-emerald-950/20'
                        : 'text-stone-600 hover:text-emerald-950 hover:bg-stone-200/60'
                    }`}
                    title={item.label}
                  >
                    {item.icon}
                    <span>{item.label.split(' ')[0]}</span>
                  </button>
                );
              })}

              {/* Overflow tabs */}
              <div className="flex items-center border-l border-stone-300 pl-1 ml-0.5 gap-1">
                <button
                  onClick={() => setActiveTab('cooking')}
                  className={`p-1.5 rounded-full text-xs font-semibold ${activeTab === 'cooking' ? 'bg-emerald-900 text-white' : 'text-stone-600 hover:bg-stone-200'}`}
                  title="Cooking Assistant"
                >
                  <ChefHat className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveTab('meal-plan')}
                  className={`p-1.5 rounded-full text-xs font-semibold ${activeTab === 'meal-plan' ? 'bg-emerald-900 text-white' : 'text-stone-600 hover:bg-stone-200'}`}
                  title="Meal Planner"
                >
                  <CalendarDays className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`p-1.5 rounded-full text-xs font-semibold ${activeTab === 'history' ? 'bg-emerald-900 text-white' : 'text-stone-600 hover:bg-stone-200'}`}
                  title="History"
                >
                  <History className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`p-1.5 rounded-full text-xs font-semibold ${activeTab === 'settings' ? 'bg-emerald-900 text-white' : 'text-stone-600 hover:bg-stone-200'}`}
                  title="Settings"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </nav>

            {/* AI Status Badge & Quick Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowStatusModal(true)}
                className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors shadow-2xs ${
                  isLive 
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100/80' 
                    : 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100/80'
                }`}
                title="Click to view AI system status"
              >
                <span className={`w-2 h-2 rounded-full animate-pulse ${isLive ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                <span className="font-semibold">{isLive ? 'Gemini Flash AI Active' : 'Demo Mode (Sample Data)'}</span>
                <Info className="w-3.5 h-3.5 opacity-60 ml-0.5" />
              </button>

              {/* Mobile hamburger button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2.5 rounded-xl bg-stone-100 border border-stone-200 text-stone-700 hover:bg-stone-200"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-b border-stone-200 bg-[#FBF9F4] px-4 pt-2 pb-6 space-y-2">
            <div className="py-2 mb-2 border-b border-stone-200/80">
              <button
                onClick={() => {
                  setShowStatusModal(true);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold border ${
                  isLive ? 'bg-emerald-50 text-emerald-900 border-emerald-200' : 'bg-amber-50 text-amber-900 border-amber-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  <span>Engine: {isLive ? 'Gemini Multimodal Active' : 'Demo Mode Active'}</span>
                </div>
                <Info className="w-4 h-4 opacity-70" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {allNavItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center justify-between p-3 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-emerald-900 text-white'
                        : 'bg-stone-100/70 text-stone-700 hover:bg-stone-200/80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        isActive ? 'bg-amber-400 text-stone-900' : 'bg-stone-200 text-stone-800'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* AI System Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/40 backdrop-blur-xs">
          <div className="bg-[#FBF9F4] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowStatusModal(false)}
              className="absolute top-5 right-5 p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200/50"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                isLive ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {isLive ? <CheckCircle2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-900">AI Platform Architecture</h3>
                <p className="text-xs text-stone-500">Gemini Multimodal Intelligence Status</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-stone-600 bg-white/70 p-4 rounded-2xl border border-stone-200">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-stone-700">Inference Status:</span>
                <span className={`font-bold px-2 py-0.5 rounded-full ${isLive ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'}`}>
                  {isLive ? 'Active Live AI' : 'Demonstration Mode'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-stone-700">Primary Vision Model:</span>
                <span className="font-mono text-[11px] text-stone-800 bg-stone-100 px-2 py-0.5 rounded">gemini-3.1-flash-lite</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-stone-700">Voice Synthesis Model:</span>
                <span className="font-mono text-[11px] text-stone-800 bg-stone-100 px-2 py-0.5 rounded">gemini-3.8-flash-lite-tts</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-stone-700">API Key Privacy:</span>
                <span className="text-emerald-700 font-semibold">100% Server-Side Only (Zero client leaks)</span>
              </div>
            </div>

            <p className="mt-4 text-xs text-stone-600 leading-relaxed">
              {isLive 
                ? 'Your server is connected to Google Gemini multimodal AI. Uploaded food images, video frames, and customized recipes are processed with real-time vision reasoning.'
                : 'When no Gemini API key is detected in the server environment, Food Verse AI automatically runs in Demo Mode with laboratory-calibrated sample reports and templates so you can explore every single feature without interruption.'}
            </p>

            <div className="mt-6 flex gap-2">
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setActiveTab('settings');
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs transition-colors"
              >
                Go to Settings
              </button>
              <button
                onClick={() => setShowStatusModal(false)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-900 text-white font-semibold text-xs hover:bg-emerald-800 transition-colors shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
