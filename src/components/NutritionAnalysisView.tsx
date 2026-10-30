import React, { useState } from 'react';
import { 
  HeartPulse, 
  Flame, 
  Activity, 
  Info, 
  Sliders, 
  Sparkles, 
  Utensils, 
  ArrowRight, 
  CheckCircle2, 
  ShieldAlert, 
  Scale, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check,
  TrendingUp,
  Apple
} from 'lucide-react';
import { FoodRecognitionResult, ActiveTab } from '../types/index.ts';
import { sampleFoodRecognition } from '../../server/services/sampleDataService.ts';
import { playTtsNarration, stopSpeech } from '../services/api.ts';

interface NutritionAnalysisViewProps {
  currentResult: FoodRecognitionResult | null;
  setActiveTab: (tab: ActiveTab) => void;
  onSelectSamplePlate: (result: FoodRecognitionResult) => void;
}

export const NutritionAnalysisView: React.FC<NutritionAnalysisViewProps> = ({
  currentResult,
  setActiveTab,
  onSelectSamplePlate
}) => {
  const result = currentResult || sampleFoodRecognition;
  const [portionScale, setPortionScale] = useState<number>(1.0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);

  // Scaled values
  const scaledCalories = Math.round(result.nutrition.calories * portionScale);
  const scaledProtein = Math.round(result.nutrition.proteinGrams * portionScale * 10) / 10;
  const scaledCarbs = Math.round(result.nutrition.carbsGrams * portionScale * 10) / 10;
  const scaledFat = Math.round(result.nutrition.fatGrams * portionScale * 10) / 10;
  const scaledFiber = result.nutrition.fiberGrams 
    ? Math.round(result.nutrition.fiberGrams * portionScale * 10) / 10 
    : undefined;
  const scaledSodium = result.nutrition.sodiumMg 
    ? Math.round(result.nutrition.sodiumMg * portionScale) 
    : undefined;

  // Caloric percentage calculations
  const totalMacroCalories = (scaledProtein * 4) + (scaledCarbs * 4) + (scaledFat * 9) || 1;
  const proteinPercent = Math.min(100, Math.round(((scaledProtein * 4) / totalMacroCalories) * 100));
  const carbsPercent = Math.min(100, Math.round(((scaledCarbs * 4) / totalMacroCalories) * 100));
  const fatPercent = Math.max(0, 100 - proteinPercent - carbsPercent);

  // Daily Value Benchmarks (Standard 2000 kcal diet)
  const dvCalories = Math.round((scaledCalories / 2000) * 100);
  const dvProtein = Math.round((scaledProtein / 50) * 100);
  const dvCarbs = Math.round((scaledCarbs / 275) * 100);
  const dvFat = Math.round((scaledFat / 78) * 100);
  const dvFiber = scaledFiber ? Math.round((scaledFiber / 28) * 100) : 0;
  const dvSodium = scaledSodium ? Math.round((scaledSodium / 2300) * 100) : 0;

  const handleSpeak = async () => {
    if (isSpeaking) {
      stopSpeech();
      setIsSpeaking(false);
      return;
    }

    const narrative = `Nutrition analysis for ${result.dishName}. Estimated at ${scaledCalories} calories, ${scaledProtein} grams of protein, ${scaledCarbs} grams of carbohydrates, and ${scaledFat} grams of fat. Health score: ${result.nutrition.healthScore || 85} out of 100. ${result.nutrition.summary}`;
    setIsSpeaking(true);
    const played = await playTtsNarration(narrative);
    if (!played) setIsSpeaking(false);
  };

  const copySummary = () => {
    const text = `Nutrition Summary for ${result.dishName} (${portionScale}x portion):\n- Calories: ${scaledCalories} kcal (${dvCalories}% DV)\n- Protein: ${scaledProtein}g (${dvProtein}% DV)\n- Carbs: ${scaledCarbs}g (${dvCarbs}% DV)\n- Fat: ${scaledFat}g (${dvFat}% DV)\n- Health Score: ${result.nutrition.healthScore}/100\n- Note: AI-generated nutritional estimate, not laboratory measurement.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 pb-16 max-w-6xl mx-auto">
      {/* Header */}
      <div className="border-b border-stone-200/90 pb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-950 text-xs font-semibold uppercase tracking-wider mb-2">
              <HeartPulse className="w-3.5 h-3.5 text-emerald-700" />
              <span>Nutrient Density & Biomarker Estimations</span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-stone-900">
              Nutrition Analysis & Macro Audit
            </h1>
            <p className="text-sm text-stone-600 mt-1 max-w-2xl">
              In-depth nutritional profiling, macronutrient energy distribution, micronutrient daily values, 
              and adaptive portion size modeling.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSpeak}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                isSpeaking
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
              }`}
            >
              {isSpeaking ? <VolumeX className="w-4 h-4 text-amber-600" /> : <Volume2 className="w-4 h-4 text-stone-600" />}
              <span>{isSpeaking ? 'Stop Audio' : 'Listen with AI Voice'}</span>
            </button>

            <button
              onClick={copySummary}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-50"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Share'}</span>
            </button>

            <button
              onClick={() => setActiveTab('recognition')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-900 text-white text-xs font-bold hover:bg-emerald-800 transition-colors shadow-2xs"
            >
              <Utensils className="w-4 h-4" />
              <span>Scan Another Plate</span>
            </button>
          </div>
        </div>
      </div>

      {/* Notice if viewing default sample vs live analysis */}
      {!currentResult && (
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-950">
          <div className="flex items-center gap-2.5">
            <Info className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              Currently displaying reference profile: <strong className="font-bold">{result.dishName}</strong>. 
              Upload any food image in Food Recognition to inspect your own meal!
            </span>
          </div>
          <button
            onClick={() => setActiveTab('recognition')}
            className="font-bold text-amber-900 underline hover:text-amber-950 shrink-0 text-left"
          >
            Upload Food Image →
          </button>
        </div>
      )}

      {/* Main Grid: Left Overview & Right Deep-Dive */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Food Identity, Portion Scaler & Health Score (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Food Profile Card */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-xs space-y-5">
            {result.imageUrl && (
              <div className="relative rounded-2xl overflow-hidden aspect-16/10 bg-stone-100 border border-stone-200">
                <img
                  src={result.imageUrl}
                  alt={result.dishName}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-2 left-2 px-2.5 py-1 rounded bg-stone-900/80 text-white text-[11px] font-semibold backdrop-blur-xs">
                  {result.cuisineOrigin || 'Culinary Plating'}
                </span>
              </div>
            )}

            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                {result.cuisineOrigin || 'Plated Dish'}
              </span>
              <h2 className="font-serif text-2xl font-bold text-stone-950 mt-1.5">
                {result.dishName}
              </h2>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                {result.description || result.nutrition.summary}
              </p>
              <div className="text-[11px] text-stone-500 mt-2 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-stone-400" />
                <span>Base Serving: {result.estimatedPortionSize || '1 plate (~250-300g)'}</span>
              </div>
            </div>

            {/* Interactive Portion Size Adjustment (Requirement 2) */}
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-stone-800">
                <span className="flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-emerald-800" />
                  Portion Adjustment Tool
                </span>
                <span className="text-emerald-950 font-extrabold bg-white px-2.5 py-0.5 rounded-md border border-stone-200 text-xs">
                  {portionScale === 1.0 ? '1.0x (Standard)' : `${portionScale.toFixed(2)}x Portion`}
                </span>
              </div>

              <input
                type="range"
                min="0.5"
                max="2.5"
                step="0.1"
                value={portionScale}
                onChange={(e) => setPortionScale(parseFloat(e.target.value))}
                className="w-full accent-emerald-800 cursor-pointer"
              />

              <div className="flex justify-between text-[10px] text-stone-500 font-medium">
                <span>0.5x (Half)</span>
                <span>1.0x (Base)</span>
                <span>1.5x</span>
                <span>2.0x</span>
                <span>2.5x (Feast)</span>
              </div>

              <p className="text-[11px] text-stone-500 leading-relaxed italic border-t border-stone-200/80 pt-2">
                {result.nutrition.portionNote}
              </p>
            </div>

            {/* Health Score Gauge with Transparent Explanation (Requirement 2) */}
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                  Health Score
                </span>
                <span className="font-serif text-2xl font-bold text-emerald-900">
                  {result.nutrition.healthScore || 85} <span className="text-xs font-sans text-emerald-700">/ 100</span>
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-emerald-200/60 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-700 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${result.nutrition.healthScore || 85}%` }}
                />
              </div>

              <div>
                <span className="text-[10px] font-bold text-emerald-900 uppercase block mb-0.5">
                  Basis & Calculation Rationale
                </span>
                <p className="text-[11px] text-emerald-950/80 leading-relaxed">
                  {result.nutrition.healthScoreBasis || 
                   'Calibrated using whole-food component ratio, dietary fiber concentration, monounsaturated lipid balance, and low glycemic load whole-grain base.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Macro Breakdown, Progress Charts & Recommendations (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Primary Macro Cards */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-stone-200/90 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-serif text-xl font-bold text-stone-900">
                  Macronutrient Energy Breakdown
                </h3>
                <p className="text-xs text-stone-500">
                  Caloric contribution and daily reference values (% DV based on 2,000 kcal)
                </p>
              </div>
              <span className="text-xs font-bold text-stone-400 font-mono">
                {portionScale}x serving
              </span>
            </div>

            {/* 4 Big Macro Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              {/* Calories */}
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/90 shadow-2xs">
                <span className="text-[10px] font-bold text-amber-800 uppercase block">Calories</span>
                <span className="font-serif text-3xl font-bold text-amber-950 block my-1">
                  {scaledCalories}
                </span>
                <span className="text-[10px] text-amber-700 font-semibold block">
                  {dvCalories}% Daily Value
                </span>
              </div>

              {/* Protein */}
              <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200/90 shadow-2xs">
                <span className="text-[10px] font-bold text-blue-800 uppercase block">Protein</span>
                <span className="font-serif text-3xl font-bold text-blue-950 block my-1">
                  {scaledProtein}g
                </span>
                <span className="text-[10px] text-blue-700 font-semibold block">
                  {dvProtein}% Daily Value
                </span>
              </div>

              {/* Carbohydrates */}
              <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/90 shadow-2xs">
                <span className="text-[10px] font-bold text-emerald-800 uppercase block">Carbohydrates</span>
                <span className="font-serif text-3xl font-bold text-emerald-950 block my-1">
                  {scaledCarbs}g
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold block">
                  {dvCarbs}% Daily Value
                </span>
              </div>

              {/* Total Fat */}
              <div className="p-4 rounded-2xl bg-stone-100 border border-stone-300 shadow-2xs">
                <span className="text-[10px] font-bold text-stone-700 uppercase block">Total Fat</span>
                <span className="font-serif text-3xl font-bold text-stone-900 block my-1">
                  {scaledFat}g
                </span>
                <span className="text-[10px] text-stone-500 font-semibold block">
                  {dvFat}% Daily Value
                </span>
              </div>
            </div>

            {/* Visual Macro Energy Distribution Bar (Visual Chart Requirement) */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs font-bold text-stone-700">
                <span>Energy Distribution (% of total calories)</span>
                <span className="text-[11px] text-stone-400 font-normal">Protein • Carbs • Fat</span>
              </div>

              <div className="w-full h-4 rounded-full overflow-hidden flex bg-stone-100 border border-stone-200">
                <div 
                  className="bg-blue-600 h-full transition-all duration-300" 
                  style={{ width: `${proteinPercent}%` }} 
                  title={`Protein: ${proteinPercent}%`} 
                />
                <div 
                  className="bg-emerald-600 h-full transition-all duration-300" 
                  style={{ width: `${carbsPercent}%` }} 
                  title={`Carbohydrates: ${carbsPercent}%`} 
                />
                <div 
                  className="bg-stone-500 h-full transition-all duration-300" 
                  style={{ width: `${fatPercent}%` }} 
                  title={`Fat: ${fatPercent}%`} 
                />
              </div>

              <div className="flex justify-between text-[11px] font-semibold text-stone-600 pt-1">
                <span className="text-blue-700 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
                  Protein: {proteinPercent}%
                </span>
                <span className="text-emerald-700 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
                  Carbs: {carbsPercent}%
                </span>
                <span className="text-stone-700 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-stone-500 inline-block" />
                  Fats: {fatPercent}%
                </span>
              </div>
            </div>

            {/* Secondary Nutrients: Fiber & Sodium */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-stone-800 block">Dietary Fiber</span>
                  <span className="text-[11px] text-stone-500">Supports gut microbiome</span>
                </div>
                <div className="text-right">
                  <span className="font-serif text-lg font-bold text-emerald-950">
                    {scaledFiber !== undefined ? `${scaledFiber}g` : '—'}
                  </span>
                  {scaledFiber !== undefined && (
                    <span className="text-[10px] text-emerald-700 font-semibold block">{dvFiber}% DV</span>
                  )}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-stone-800 block">Sodium</span>
                  <span className="text-[11px] text-stone-500">Electrolyte balance</span>
                </div>
                <div className="text-right">
                  <span className="font-serif text-lg font-bold text-stone-900">
                    {scaledSodium !== undefined ? `${scaledSodium}mg` : '—'}
                  </span>
                  {scaledSodium !== undefined && (
                    <span className="text-[10px] text-stone-500 font-semibold block">{dvSodium}% DV</span>
                  )}
                </div>
              </div>
            </div>

            {/* Micronutrients Progress Bars */}
            {result.nutrition.micronutrients && result.nutrition.micronutrients.length > 0 && (
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Estimated Key Micronutrients & Bioactives
                </h4>
                <div className="space-y-2">
                  {result.nutrition.micronutrients.map((micro, idx) => (
                    <div key={idx} className="p-3 rounded-xl border border-stone-200 bg-[#FDFCF9] space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-stone-800">{micro.name}</span>
                        <span className="font-semibold text-stone-600">
                          {micro.amount} {micro.dailyValuePercentage ? `(${Math.round(micro.dailyValuePercentage * portionScale)}% DV)` : ''}
                        </span>
                      </div>
                      {micro.dailyValuePercentage && (
                        <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-emerald-600 h-full rounded-full"
                            style={{ width: `${Math.min(100, Math.round(micro.dailyValuePercentage * portionScale))}%` }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Food Recommendations & Portion Suggestions (Requirement 2) */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-800" />
                Dietitian Recommendations & Food Pairings
              </h4>
              <div className="space-y-2">
                {result.nutrition.recommendations && result.nutrition.recommendations.length > 0 ? (
                  result.nutrition.recommendations.map((rec, i) => (
                    <div key={i} className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200/80 text-xs text-emerald-950 flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-emerald-200 text-emerald-900 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="leading-relaxed">{rec}</span>
                    </div>
                  ))
                ) : (
                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-600">
                    Pair with raw vegetables, citrus, or green tea to maximize polyphenol and vitamin uptake.
                  </div>
                )}
              </div>
            </div>

            {/* Mandatory Distinction & Lab Estimate Disclaimer (Requirement 2) */}
            <div className="p-4 rounded-2xl bg-stone-100 border border-stone-200 text-stone-600 text-[11px] space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-stone-800">
                <Info className="w-3.5 h-3.5 text-emerald-800" />
                <span>Mandatory Nutritional Estimate Disclosure</span>
              </div>
              <p className="leading-relaxed">
                {result.nutrition.distinctionNote}
              </p>
              <p className="text-stone-500 italic">
                All values shown are AI-generated optical approximations based on visual portion sizing and standard recipe databases. They are not chemical bomb calorimetry laboratory measurements and should not be used as clinical medical prescriptions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
