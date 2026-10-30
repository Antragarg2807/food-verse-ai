import React, { useState } from 'react';
import { 
  Sparkles, 
  Utensils, 
  Apple, 
  ShieldCheck, 
  ChefHat, 
  CalendarDays, 
  ArrowRight, 
  Flame, 
  HeartPulse, 
  Clock, 
  AlertCircle, 
  FileText, 
  Trash2, 
  ExternalLink,
  CheckCircle,
  ThermometerSnowflake,
  ShieldAlert,
  Calculator
} from 'lucide-react';
import { ActiveTab, AnalysisHistoryItem } from '../types/index.ts';
import { SystemStatus } from '../services/api.ts';

interface DashboardProps {
  setActiveTab: (tab: ActiveTab) => void;
  status: SystemStatus | null;
  history: AnalysisHistoryItem[];
  onSelectHistoryItem: (item: AnalysisHistoryItem) => void;
  onClearHistory: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  setActiveTab,
  status,
  history,
  onSelectHistoryItem,
  onClearHistory
}) => {
  const [historyFilter, setHistoryFilter] = useState<string>('all');
  
  // Interactive Quick Macro Calculator state
  const [calcWeightKg, setCalcWeightKg] = useState<number>(70);
  const [calcActivity, setCalcActivity] = useState<'sedentary' | 'moderate' | 'active'>('moderate');
  const [calcGoal, setCalcGoal] = useState<'lose' | 'maintain' | 'gain'>('maintain');

  const calculateTargetCalories = () => {
    let bmr = calcWeightKg * 22; // Quick Harris-Benedict ballpark
    let mult = calcActivity === 'sedentary' ? 1.2 : calcActivity === 'moderate' ? 1.55 : 1.75;
    let tdee = Math.round(bmr * mult);
    if (calcGoal === 'lose') return Math.max(1400, tdee - 450);
    if (calcGoal === 'gain') return tdee + 400;
    return tdee;
  };

  const targetCals = calculateTargetCalories();
  const targetProtein = Math.round((targetCals * 0.28) / 4);
  const targetCarbs = Math.round((targetCals * 0.45) / 4);
  const targetFats = Math.round((targetCals * 0.27) / 9);

  const filteredHistory = history.filter((item) => {
    if (historyFilter === 'all') return true;
    return item.type === historyFilter;
  });

  return (
    <div className="space-y-10 pb-16">
      {/* Hero Welcome Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-stone-900 text-white p-8 md:p-12 shadow-xl border border-emerald-800/40">
        <div className="absolute -right-24 -top-24 w-96 h-96 bg-emerald-700/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-12 -bottom-20 w-80 h-80 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-800/80 border border-emerald-600/40 text-amber-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Generation Culinary AI</span>
          </div>

          <h1 className="font-serif text-3xl md:text-5xl font-bold tracking-tight text-cream-50 leading-[1.15]">
            Food Verse <span className="text-amber-400 italic">AI</span>
          </h1>

          <p className="text-stone-200 text-base md:text-lg font-light leading-relaxed">
            Smarter Food. Safer Choices. Healthier Living. A comprehensive multimodal intelligence suite 
            bridging visual food recognition, macro nutrition auditing, microbial freshness verification, 
            restaurant hygiene compliance, and personalized culinary science.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('recognition')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm transition-all transform hover:-translate-y-0.5 shadow-md shadow-amber-500/20"
            >
              <Utensils className="w-4 h-4" />
              <span>Analyze Food Plate</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              onClick={() => setActiveTab('freshness')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition-all border border-white/20 backdrop-blur-xs"
            >
              <Apple className="w-4 h-4 text-emerald-300" />
              <span>Test Spoilage & Freshness</span>
            </button>

            <button
              onClick={() => setActiveTab('samples')}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl text-stone-300 hover:text-white text-sm font-medium transition-colors"
            >
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Explore Preloaded Samples</span>
            </button>
          </div>
        </div>
      </section>

      {/* Feature Showcase Cards */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl font-bold text-stone-900">Intelligence Modules</h2>
            <p className="text-xs text-stone-500">Pick any capability to begin your analysis</p>
          </div>
          <span className="text-xs font-semibold text-emerald-800 bg-emerald-100/70 px-3 py-1 rounded-full border border-emerald-200">
            7 Active Intelligence Modules
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* 1. Food Recognition */}
          <div 
            onClick={() => setActiveTab('recognition')}
            className="group cursor-pointer bg-white rounded-3xl p-6 border border-stone-200/90 shadow-xs hover:shadow-lg hover:border-emerald-300 transition-all transform hover:-translate-y-1 relative flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center mb-4 border border-emerald-100 group-hover:scale-110 transition-transform">
                <Utensils className="w-6 h-6" />
              </div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-serif text-lg font-bold text-stone-900 group-hover:text-emerald-900 transition-colors">
                  Food Recognition
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Multimodal Vision
                </span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed mb-4">
                Detect dish identity, culinary origin, detected ingredients, and portion size estimation with multimodal Gemini AI vision.
              </p>
            </div>
            <div className="flex items-center text-xs font-bold text-emerald-800 group-hover:text-emerald-950">
              <span>Scan Food Plate</span>
              <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 2. Nutrition Analysis Deep Dive */}
          <div 
            onClick={() => setActiveTab('nutrition')}
            className="group cursor-pointer bg-white rounded-3xl p-6 border border-stone-200/90 shadow-xs hover:shadow-lg hover:border-emerald-300 transition-all transform hover:-translate-y-1 relative flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-800 flex items-center justify-center mb-4 border border-teal-100 group-hover:scale-110 transition-transform">
                <HeartPulse className="w-6 h-6" />
              </div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-serif text-lg font-bold text-stone-900 group-hover:text-teal-900 transition-colors">
                  Nutrition Analysis
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                  Portion Scaler & Macros
                </span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed mb-4">
                Interactive macro distribution, daily value gauges, dynamic portion scaling (0.5x–2.5x), health score rationales, and dietary pairings.
              </p>
            </div>
            <div className="flex items-center text-xs font-bold text-teal-800 group-hover:text-teal-950">
              <span>Explore Nutrition Analytics</span>
              <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 2. Freshness Assessment */}
          <div 
            onClick={() => setActiveTab('freshness')}
            className="group cursor-pointer bg-white rounded-3xl p-6 border border-stone-200/90 shadow-xs hover:shadow-lg hover:border-emerald-300 transition-all transform hover:-translate-y-1 relative flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4 border border-amber-100 group-hover:scale-110 transition-transform">
                <Apple className="w-6 h-6" />
              </div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-serif text-lg font-bold text-stone-900 group-hover:text-amber-800 transition-colors">
                  Freshness & Spoilage
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  Surface Turgor & Mold
                </span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed mb-4">
                Classifies items as Fresh, Moderately Fresh, or Potentially Spoiled based on discoloration, texture, and microbial markers with safety advice.
              </p>
            </div>
            <div className="flex items-center text-xs font-bold text-amber-800 group-hover:text-amber-950">
              <span>Inspect Produce & Food</span>
              <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 3. Restaurant Hygiene Monitoring */}
          <div 
            onClick={() => setActiveTab('hygiene')}
            className="group cursor-pointer bg-white rounded-3xl p-6 border border-stone-200/90 shadow-xs hover:shadow-lg hover:border-emerald-300 transition-all transform hover:-translate-y-1 relative flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-800 flex items-center justify-center mb-4 border border-blue-100 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-serif text-lg font-bold text-stone-900 group-hover:text-blue-900 transition-colors">
                  Hygiene Monitoring
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  Video & Multi-Frame
                </span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed mb-4">
                Inspect sampled frames for glove usage, hairnets, cross-contamination, and station cleanliness with transparent non-certified screening disclaimers.
              </p>
            </div>
            <div className="flex items-center text-xs font-bold text-blue-800 group-hover:text-blue-950">
              <span>Analyze Kitchen Video/Frames</span>
              <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 4. Smart Cooking Assistant */}
          <div 
            onClick={() => setActiveTab('cooking')}
            className="group cursor-pointer bg-white rounded-3xl p-6 border border-stone-200/90 shadow-xs hover:shadow-lg hover:border-emerald-300 transition-all transform hover:-translate-y-1 relative flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-800 flex items-center justify-center mb-4 border border-orange-100 group-hover:scale-110 transition-transform">
                <ChefHat className="w-6 h-6" />
              </div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-serif text-lg font-bold text-stone-900 group-hover:text-orange-900 transition-colors">
                  Cooking Assistant
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800">
                  Chef & Safety Logic
                </span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed mb-4">
                Generate gourmet recipes from pantry ingredients with internal temperature guidelines, clever substitutions, and audio step narration.
              </p>
            </div>
            <div className="flex items-center text-xs font-bold text-orange-800 group-hover:text-orange-950">
              <span>Create Safe Recipe</span>
              <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 5. Personalized Meal Planner */}
          <div 
            onClick={() => setActiveTab('meal-plan')}
            className="group cursor-pointer bg-white rounded-3xl p-6 border border-stone-200/90 shadow-xs hover:shadow-lg hover:border-emerald-300 transition-all transform hover:-translate-y-1 relative flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-800 flex items-center justify-center mb-4 border border-purple-100 group-hover:scale-110 transition-transform">
                <CalendarDays className="w-6 h-6" />
              </div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-serif text-lg font-bold text-stone-900 group-hover:text-purple-900 transition-colors">
                  Meal Planner
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                  Allergen Audited
                </span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed mb-4">
                Generate tailored 1-day blueprints matching dietary goals, strictly verifying allergen exclusions, and providing practical ingredient swaps.
              </p>
            </div>
            <div className="flex items-center text-xs font-bold text-purple-800 group-hover:text-purple-950">
              <span>Design Daily Plan</span>
              <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 6. Curated Sample Laboratory */}
          <div 
            onClick={() => setActiveTab('samples')}
            className="group cursor-pointer bg-stone-100/80 rounded-3xl p-6 border border-stone-200 shadow-xs hover:shadow-md hover:border-stone-400 transition-all transform hover:-translate-y-1 relative flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-stone-200 text-stone-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  Sample Reports
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-200 text-stone-700">
                  Instant Test
                </span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed mb-4">
                Preview full interactive demonstrations of avocado toast analysis, fresh vs spoiled produce, kitchen hygiene audits, and high-protein recipes.
              </p>
            </div>
            <div className="flex items-center text-xs font-bold text-stone-800">
              <span>Browse 6 Sample Reports</span>
              <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* Two-Column Utility: Interactive Macro Targeter & Food Safety Alert Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Macro & Calorie Quick Targeter (7 cols) */}
        <section className="lg:col-span-7 bg-white rounded-3xl p-6 md:p-8 border border-stone-200/90 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-stone-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  Daily Nutrition & Macro Targeter
                </h3>
                <p className="text-xs text-stone-500">Calculate baseline energy targets for meal matching</p>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-stone-400">USDA Reference Formula</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">Weight (kg)</label>
              <input
                type="number"
                min="35"
                max="200"
                value={calcWeightKg}
                onChange={(e) => setCalcWeightKg(Number(e.target.value) || 70)}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">Activity Level</label>
              <select
                value={calcActivity}
                onChange={(e: any) => setCalcActivity(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-white"
              >
                <option value="sedentary">Sedentary (Desk)</option>
                <option value="moderate">Moderate (3-4x/wk)</option>
                <option value="active">Active (Daily Sport)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">Goal</label>
              <select
                value={calcGoal}
                onChange={(e: any) => setCalcGoal(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-white"
              >
                <option value="lose">Fat Loss (-450 kcal)</option>
                <option value="maintain">Maintenance</option>
                <option value="gain">Lean Surplus (+400 kcal)</option>
              </select>
            </div>
          </div>

          {/* Target Macro readout */}
          <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-white p-3 rounded-xl border border-stone-200/80 shadow-2xs">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Target Energy</span>
              <span className="font-serif text-xl font-bold text-emerald-950">{targetCals}</span>
              <span className="text-[10px] text-stone-400 block">kcal / day</span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-stone-200/80 shadow-2xs">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Protein</span>
              <span className="font-serif text-xl font-bold text-blue-900">{targetProtein}g</span>
              <span className="text-[10px] text-stone-400 block">~28% energy</span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-stone-200/80 shadow-2xs">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Carbs</span>
              <span className="font-serif text-xl font-bold text-amber-800">{targetCarbs}g</span>
              <span className="text-[10px] text-stone-400 block">~45% energy</span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-stone-200/80 shadow-2xs">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Fats</span>
              <span className="font-serif text-xl font-bold text-stone-800">{targetFats}g</span>
              <span className="text-[10px] text-stone-400 block">~27% energy</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>Use this profile to feed directly into the Meal Planner module.</span>
            <button
              onClick={() => setActiveTab('meal-plan')}
              className="font-bold text-emerald-800 hover:text-emerald-950 inline-flex items-center gap-1"
            >
              <span>Apply to Planner</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>

        {/* Right Column: Verified Food Safety & Microbial Storage Alerts (5 cols) */}
        <section className="lg:col-span-5 bg-white rounded-3xl p-6 md:p-8 border border-stone-200/90 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-stone-900 border-b border-stone-100 pb-3">
            <ShieldAlert className="w-5 h-5 text-amber-600" />
            <h3 className="font-serif text-lg font-bold">Food Safety Advisories</h3>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-900">
                <ThermometerSnowflake className="w-3.5 h-3.5" />
                <span>The Two-Hour Danger Zone Rule</span>
              </div>
              <p className="text-amber-800/90 leading-relaxed">
                Bacteria multiply fastest between 40°F and 140°F (4°C - 60°C). Never leave cooked perishable foods at room temperature for more than 2 hours (1 hour if above 90°F / 32°C).
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-emerald-950">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Color Does Not Guarantee Doneness</span>
              </div>
              <p className="text-emerald-900/90 leading-relaxed">
                Minced poultry can appear white or browned before reaching 165°F (74°C). Always rely on a calibrated probe digital thermometer rather than visual color.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-stone-100/90 border border-stone-200 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-stone-900">
                <AlertCircle className="w-3.5 h-3.5 text-stone-600" />
                <span>Invisible Pathogens Warning</span>
              </div>
              <p className="text-stone-600 leading-relaxed">
                Spoilage microbes create smell and slime, but deadly pathogenic bacteria (Listeria, Salmonella, Staph enterotoxin) are frequently odorless and invisible.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Analysis History Feed */}
      <section className="bg-white rounded-3xl p-6 md:p-8 border border-stone-200/90 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
          <div>
            <h2 className="font-serif text-xl font-bold text-stone-900">Recent Intelligence History</h2>
            <p className="text-xs text-stone-500">Your recent food analyses and generated culinary assets</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {['all', 'recognition', 'freshness', 'hygiene', 'cooking', 'meal-plan'].map((filterKey) => (
              <button
                key={filterKey}
                onClick={() => setHistoryFilter(filterKey)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-colors ${
                  historyFilter === filterKey
                    ? 'bg-emerald-900 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {filterKey === 'recognition' ? 'Nutrition' : filterKey.replace('-', ' ')}
              </button>
            ))}

            {history.length > 0 && (
              <button
                onClick={onClearHistory}
                className="p-1.5 text-stone-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                title="Clear local history"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
              <Clock className="w-6 h-6" />
            </div>
            <h4 className="font-serif text-base font-semibold text-stone-800">No Analysis History Yet</h4>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Run a Food Recognition scan, test food freshness, or create a custom recipe to build your intelligence log.
            </p>
            <div className="pt-2">
              <button
                onClick={() => setActiveTab('recognition')}
                className="px-4 py-2 rounded-xl bg-emerald-900 text-white text-xs font-semibold hover:bg-emerald-800 transition-colors shadow-2xs"
              >
                Start First Analysis
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredHistory.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectHistoryItem(item)}
                className="group cursor-pointer p-4 rounded-2xl border border-stone-200 hover:border-emerald-300 hover:shadow-md transition-all bg-[#FDFCF9] flex items-start gap-3.5"
              >
                {item.thumbnailUrl ? (
                  <img
                    src={item.thumbnailUrl}
                    alt={item.title}
                    className="w-16 h-16 rounded-xl object-cover border border-stone-200 shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                    <Sparkles className="w-6 h-6" />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-stone-200/70 text-stone-700">
                      {item.type}
                    </span>
                    <span className="text-[10px] text-stone-400">
                      {new Date(item.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <h4 className="font-serif text-sm font-bold text-stone-900 truncate group-hover:text-emerald-900">
                    {item.title}
                  </h4>
                  <p className="text-xs text-stone-500 line-clamp-1 mt-0.5">
                    {item.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
