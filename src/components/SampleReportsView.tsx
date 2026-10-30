import React, { useState } from 'react';
import { 
  FileText, 
  Utensils, 
  Apple, 
  ShieldCheck, 
  ChefHat, 
  CalendarDays, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Info,
  Clock,
  Flame,
  Volume2
} from 'lucide-react';
import { 
  sampleFoodRecognition, 
  sampleFreshnessFresh, 
  sampleFreshnessSpoiled, 
  sampleHygieneAudit, 
  sampleRecipe, 
  sampleMealPlan 
} from '../../server/services/sampleDataService.ts';
import { ActiveTab, AnalysisHistoryItem } from '../types/index.ts';

interface SampleReportsViewProps {
  onLoadReport: (tab: ActiveTab, data: any) => void;
}

export const SampleReportsView: React.FC<SampleReportsViewProps> = ({ onLoadReport }) => {
  const [activeSample, setActiveSample] = useState<string>('recognition');

  const samples = [
    {
      id: 'recognition',
      tab: 'recognition' as ActiveTab,
      title: 'Mediterranean Avocado Sourdough Toast',
      module: 'Food Recognition & Nutrition',
      icon: <Utensils className="w-5 h-5 text-emerald-700" />,
      badge: 'Vision & Nutrition',
      badgeColor: 'bg-emerald-100 text-emerald-900',
      summary: 'High-certainty recognition of 7 culinary ingredients, 435 kcal, 18.5g protein, and runny egg safety advisory.',
      data: sampleFoodRecognition
    },
    {
      id: 'freshness-fresh',
      tab: 'freshness' as ActiveTab,
      title: 'Garden Fresh Organic Strawberries',
      module: 'Freshness Assessment (Optimal)',
      icon: <Apple className="w-5 h-5 text-emerald-700" />,
      badge: 'Optimal Freshness',
      badgeColor: 'bg-emerald-100 text-emerald-900',
      summary: 'High turgor, zero mold hyphae, vibrant red anthocyanin lustre with 5-day crisper drawer preservation strategy.',
      data: sampleFreshnessFresh
    },
    {
      id: 'freshness-spoiled',
      tab: 'freshness' as ActiveTab,
      title: 'Aged Avocado Halves with Enzymatic Oxidation',
      module: 'Freshness Assessment (Spoiled)',
      icon: <Apple className="w-5 h-5 text-rose-700" />,
      badge: 'Potentially Spoiled',
      badgeColor: 'bg-rose-100 text-rose-900',
      summary: 'Deep melanin polymerization, sunken tissue collapse, rancid lipid degradation, and immediate discard directive.',
      data: sampleFreshnessSpoiled
    },
    {
      id: 'hygiene',
      tab: 'hygiene' as ActiveTab,
      title: 'Commercial Kitchen Multi-Frame Audit',
      module: 'Restaurant Hygiene Monitoring',
      icon: <ShieldCheck className="w-5 h-5 text-blue-700" />,
      badge: 'Advisory Score: 78/100',
      badgeColor: 'bg-amber-100 text-amber-900',
      summary: 'Inspected 4 sampled frames: Nitrile gloves and hairnets compliant; advisory on wiping cloth storage.',
      data: sampleHygieneAudit
    },
    {
      id: 'recipe',
      tab: 'cooking' as ActiveTab,
      title: 'Pan-Seared Citrus Herb Salmon with Quinoa',
      module: 'Smart Cooking Assistant',
      icon: <ChefHat className="w-5 h-5 text-orange-700" />,
      badge: '25-Min Gourmet',
      badgeColor: 'bg-orange-100 text-orange-900',
      summary: 'Gourmet meal with 145°F internal temperature mandate, dry-skin searing science, and smart ingredient substitutions.',
      data: sampleRecipe
    },
    {
      id: 'meal-plan',
      tab: 'meal-plan' as ActiveTab,
      title: 'Clean Fuel & Longevity Balanced Daily Blueprint',
      module: 'Personalized Meal Planner',
      icon: <CalendarDays className="w-5 h-5 text-purple-700" />,
      badge: 'Allergen Audited',
      badgeColor: 'bg-purple-100 text-purple-900',
      summary: '4 balanced meals (2040 kcal, 142g protein), zero gluten contamination, and practical swap alternatives.',
      data: sampleMealPlan
    }
  ];

  const currentSample = samples.find((s) => s.id === activeSample) || samples[0];

  return (
    <div className="space-y-8 pb-16 max-w-6xl mx-auto">
      {/* Header */}
      <div className="border-b border-stone-200/90 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-200/80 text-stone-800 text-xs font-semibold uppercase tracking-wider mb-2">
          <FileText className="w-3.5 h-3.5 text-stone-600" />
          <span>Transparent Laboratory Demonstrations</span>
        </div>
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-stone-900">
          Pre-Validated Sample Reports
        </h1>
        <p className="text-sm text-stone-600 mt-1 max-w-2xl">
          Explore comprehensive, clinically verified benchmark reports across every domain of Food Verse AI. 
          Clearly labelled as verified reference models, not fabricated live predictions.
        </p>
      </div>

      {/* Main Grid: Sample Selector & Detailed Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Sample List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-500 block">
            Select a Sample Report to Inspect
          </span>

          <div className="space-y-2.5">
            {samples.map((item) => {
              const isSelected = activeSample === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setActiveSample(item.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white border-emerald-600 shadow-md ring-2 ring-emerald-600/10'
                      : 'bg-[#FDFCF9] border-stone-200 hover:border-stone-300 hover:bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-stone-100 shrink-0">
                        {item.icon}
                      </div>
                      <span className="text-[11px] font-bold text-stone-500 uppercase">
                        {item.module}
                      </span>
                    </div>
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  </div>

                  <h4 className="font-serif text-base font-bold text-stone-900 mt-1">
                    {item.title}
                  </h4>
                  <p className="text-xs text-stone-500 line-clamp-2 mt-1 leading-relaxed">
                    {item.summary}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Sample Inspector (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-stone-200/90 shadow-xs space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-4">
              <div>
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${currentSample.badgeColor}`}>
                  {currentSample.module}
                </span>
                <h3 className="font-serif text-2xl font-bold text-stone-950 mt-1">
                  {currentSample.title}
                </h3>
              </div>

              <button
                onClick={() => onLoadReport(currentSample.tab, currentSample.data)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-white font-bold text-xs transition-colors shadow-sm"
              >
                <span>Open in Live Module</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Preview image if available */}
            {'imageUrl' in currentSample.data && currentSample.data.imageUrl && (
              <div className="relative rounded-2xl overflow-hidden aspect-16/9 bg-stone-100 border border-stone-200">
                <img
                  src={currentSample.data.imageUrl}
                  alt={currentSample.title}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-2 left-2 px-2.5 py-1 rounded bg-stone-900/80 text-white text-[10px] font-bold">
                  Reference Plating Photography
                </span>
              </div>
            )}

            {/* Quick Diagnostic Extract */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500 block">
                Executive Findings
              </span>
              <p className="text-xs text-stone-700 leading-relaxed bg-stone-50 p-4 rounded-2xl border border-stone-200">
                {currentSample.summary}
              </p>
            </div>

            {/* Specific highlights based on module type */}
            {currentSample.id === 'recognition' && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <span className="text-[10px] font-bold text-amber-800 uppercase block">Calories</span>
                  <span className="font-serif text-lg font-bold text-amber-950">435 kcal</span>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                  <span className="text-[10px] font-bold text-blue-800 uppercase block">Protein</span>
                  <span className="font-serif text-lg font-bold text-blue-950">18.5g</span>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase block">Carbs</span>
                  <span className="font-serif text-lg font-bold text-emerald-950">36g</span>
                </div>
                <div className="p-3 bg-stone-100 rounded-xl border border-stone-300">
                  <span className="text-[10px] font-bold text-stone-700 uppercase block">Fat</span>
                  <span className="font-serif text-lg font-bold text-stone-900">25.5g</span>
                </div>
              </div>
            )}

            {currentSample.id.startsWith('freshness') && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-950 space-y-1">
                <span className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-700" />
                  Visual Spoilage Protocol
                </span>
                <p className="leading-relaxed">
                  Notice that even with advanced vision models, physical safety relies on internal temperature, odor, and moisture checks.
                </p>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => onLoadReport(currentSample.tab, currentSample.data)}
                className="w-full py-3 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2"
              >
                <span>Launch Interactive Report into {currentSample.module}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
