import React, { useState } from 'react';
import { 
  CalendarDays, 
  Sparkles, 
  ShieldCheck, 
  Droplet, 
  Flame, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Shuffle, 
  Clock, 
  FileText, 
  Volume2, 
  VolumeX, 
  Check, 
  Copy,
  Info,
  ChevronDown,
  Edit3,
  RotateCcw
} from 'lucide-react';
import { MealPlanResult, MealItem } from '../types/index.ts';
import { requestMealPlan, playTtsNarration, stopSpeech } from '../services/api.ts';

interface MealPlannerViewProps {
  onSaveToHistory: (result: MealPlanResult) => void;
  initialResult?: MealPlanResult | null;
}

const COMMON_ALLERGIES = [
  'Gluten / Wheat', 'Dairy / Lactose', 'Tree Nuts', 'Peanuts', 
  'Shellfish', 'Eggs', 'Soy', 'Sesame', 'Fish'
];

const DIET_PREFERENCES = [
  'Mediterranean', 'Balanced Omnivore', 'Vegetarian', 'Vegan', 
  'Pescatarian', 'Keto / Low-Carb', 'Paleo', 'Low-FODMAP'
];

const HEALTH_GOALS = [
  'Lean Muscle Preservation', 'Fat Loss & Metabolic Health', 
  'Maintenance & Longevity', 'Heart-Healthy / Low-Sodium', 'Stable Blood Sugar / Glycemic Control'
];

export const MealPlannerView: React.FC<MealPlannerViewProps> = ({
  onSaveToHistory,
  initialResult
}) => {
  const [age, setAge] = useState<number>(30);
  const [dietPreference, setDietPreference] = useState<string>('Mediterranean');
  const [goal, setGoal] = useState<string>('Lean Muscle Preservation');
  const [targetCalories, setTargetCalories] = useState<number>(2050);
  const [activityLevel, setActivityLevel] = useState<string>('Moderate (3-5 workouts/wk)');
  const [mealsPerDay, setMealsPerDay] = useState<number>(4);
  const [foodPreferences, setFoodPreferences] = useState<string>('Loves seasonal herbs, prefers lean poultry and fish');
  const [allergies, setAllergies] = useState<string[]>(['Gluten / Wheat']);
  const [customAllergyInput, setCustomAllergyInput] = useState<string>('');
  
  const [isEditingPreferences, setIsEditingPreferences] = useState<boolean>(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mealPlan, setMealPlan] = useState<MealPlanResult | null>(initialResult || null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expandedAlternatives, setExpandedAlternatives] = useState<Record<string, boolean>>({});

  const toggleAllergy = (allergy: string) => {
    if (allergies.includes(allergy)) {
      setAllergies(allergies.filter((a) => a !== allergy));
    } else {
      setAllergies([...allergies, allergy]);
    }
  };

  const addCustomAllergy = () => {
    if (!customAllergyInput.trim()) return;
    if (!allergies.includes(customAllergyInput.trim())) {
      setAllergies([...allergies, customAllergyInput.trim()]);
    }
    setCustomAllergyInput('');
  };

  const toggleAlternative = (mealType: string) => {
    setExpandedAlternatives((prev) => ({
      ...prev,
      [mealType]: !prev[mealType]
    }));
  };

  const handleGeneratePlan = async () => {
    // Validation
    if (age < 12 || age > 115) {
      setError('Please provide a valid age between 12 and 115.');
      return;
    }
    if (targetCalories < 1200 || targetCalories > 5000) {
      setError('Please enter a target daily calorie value between 1,200 and 5,000 kcal for safe nutritional planning.');
      return;
    }

    setLoading(true);
    setError(null);
    stopSpeech();
    setIsSpeaking(false);

    try {
      const data = await requestMealPlan({
        age,
        dietPreference,
        goal,
        targetCalories,
        allergies,
        activityLevel,
        foodPreferences,
        mealsPerDay
      });
      setMealPlan(data);
      setIsEditingPreferences(false);
      onSaveToHistory(data);
    } catch (err: any) {
      setError(err.message || 'Failed to generate meal plan. Please check your network and inputs.');
    } finally {
      setLoading(false);
    }
  };

  const handleSpeak = async () => {
    if (!mealPlan) return;
    if (isSpeaking) {
      stopSpeech();
      setIsSpeaking(false);
      return;
    }

    const narrative = `Daily Meal Plan: ${mealPlan.planTitle}. Target goal: ${mealPlan.targetGoal}. Total calories: ${mealPlan.totalDailyEstimatedNutrition.calories} kcal with ${mealPlan.totalDailyEstimatedNutrition.proteinGrams} grams of protein. Includes ${mealPlan.meals.length} meals. ${mealPlan.dietitianGuidance}`;
    setIsSpeaking(true);
    const played = await playTtsNarration(narrative);
    if (!played) setIsSpeaking(false);
  };

  const copyPlan = () => {
    if (!mealPlan) return;
    const mealsText = mealPlan.meals
      .map(
        (m) =>
          `[${m.mealType}] ${m.dishName} (~${m.estimatedNutrition.calories} kcal)\n${m.description}\nKey Ingredients: ${m.keyIngredients.join(', ')}`
      )
      .join('\n\n');
    const full = `${mealPlan.planTitle}\nAge: ${mealPlan.age || age} | Goal: ${mealPlan.targetGoal} | Diet: ${mealPlan.dietPreference}\nDaily Energy: ${mealPlan.totalDailyEstimatedNutrition.calories} kcal (P: ${mealPlan.totalDailyEstimatedNutrition.proteinGrams}g, C: ${mealPlan.totalDailyEstimatedNutrition.carbsGrams}g, F: ${mealPlan.totalDailyEstimatedNutrition.fatGrams}g)\n\nMEALS:\n${mealsText}\n\nDIETITIAN NOTE:\n${mealPlan.dietitianGuidance}`;
    navigator.clipboard.writeText(full);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 pb-16 max-w-6xl mx-auto">
      {/* Header */}
      <div className="border-b border-stone-200/90 pb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-950 text-xs font-semibold uppercase tracking-wider mb-2">
              <CalendarDays className="w-3.5 h-3.5 text-purple-700" />
              <span>Personalized Nutrition & Allergen Audit</span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-stone-900">
              Personalized Meal Planner
            </h1>
            <p className="text-sm text-stone-600 mt-1 max-w-2xl">
              Construct a clinical-grade daily nutrition blueprint with customized caloric targets, 
              strict allergen protection audits, and flexible ingredient swap alternatives.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {mealPlan && (
              <>
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
                  onClick={copyPlan}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-50"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>

                {/* Working Edit Preferences Button (Requirement 6) */}
                <button
                  onClick={() => setIsEditingPreferences(!isEditingPreferences)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-100 text-stone-800 border border-stone-300 text-xs font-bold hover:bg-stone-200 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>{isEditingPreferences ? 'Hide Preferences' : 'Edit Preferences'}</span>
                </button>

                {/* Working Regenerate Meal Plan Button (Requirement 6) */}
                <button
                  onClick={handleGeneratePlan}
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-900 text-white text-xs font-bold hover:bg-purple-800 transition-colors shadow-2xs"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  <span>Regenerate Meal Plan</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Profile Inputs (5 cols) */}
        <div className={`lg:col-span-5 space-y-6 ${!isEditingPreferences && mealPlan ? 'hidden lg:block' : ''}`}>
          <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-xs space-y-5">
            <h3 className="font-serif text-lg font-bold text-stone-900">
              1. Your Metabolic Profile
            </h3>

            {/* Age & Target Calories */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Age (Years)
                </label>
                <input
                  type="number"
                  min="14"
                  max="110"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value) || 30)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-purple-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Daily Calories (kcal)
                </label>
                <input
                  type="number"
                  min="1200"
                  max="4500"
                  step="50"
                  value={targetCalories}
                  onChange={(e) => setTargetCalories(Number(e.target.value) || 2000)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-purple-700"
                />
              </div>
            </div>

            {/* Health Goal */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Health & Fitness Goal
              </label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-purple-700"
              >
                {HEALTH_GOALS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            {/* Dietary Archetype */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Dietary Preference Archetype
              </label>
              <select
                value={dietPreference}
                onChange={(e) => setDietPreference(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-purple-700"
              >
                {DIET_PREFERENCES.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Activity Level & Number of Meals per day (Requirement 6) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Activity Level
                </label>
                <select
                  value={activityLevel}
                  onChange={(e) => setActivityLevel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-purple-700"
                >
                  <option value="Sedentary (Desk)">Sedentary (Desk)</option>
                  <option value="Light (1-2x/wk)">Light (1-2x/wk)</option>
                  <option value="Moderate (3-5x/wk)">Moderate (3-5x/wk)</option>
                  <option value="Very Active (Daily)">Very Active (Daily)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Meals Per Day
                </label>
                <div className="flex items-center gap-1.5">
                  {[3, 4, 5].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setMealsPerDay(count)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${
                        mealsPerDay === count
                          ? 'bg-purple-900 text-white border-purple-950'
                          : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {count} Meals
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Food Preferences & Taste Notes (Requirement 6) */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Food Preferences / Favorite Ingredients
              </label>
              <input
                type="text"
                placeholder="e.g. Loves salmon, berries, quinoa; dislikes cilantro"
                value={foodPreferences}
                onChange={(e) => setFoodPreferences(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-purple-700"
              />
            </div>

            {/* Allergies & Intolerances (Requirement 6) */}
            <div className="pt-2 border-t border-stone-100">
              <label className="block text-xs font-bold text-stone-700 mb-2">
                Strictly Exclude Allergens & Prohibited Foods
              </label>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_ALLERGIES.map((allergy) => {
                  const isExcluded = allergies.includes(allergy);
                  return (
                    <button
                      key={allergy}
                      type="button"
                      onClick={() => toggleAllergy(allergy)}
                      className={`text-xs px-2.5 py-1 rounded-full font-semibold transition-all border ${
                        isExcluded
                          ? 'bg-red-50 text-red-700 border-red-300 shadow-2xs font-bold'
                          : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {isExcluded ? `✕ ${allergy}` : `+ ${allergy}`}
                    </button>
                  );
                })}
              </div>

              {/* Custom allergy write-in */}
              <div className="flex gap-2 mt-3">
                <input
                  type="text"
                  placeholder="Other allergy / ingredient exclusion..."
                  value={customAllergyInput}
                  onChange={(e) => setCustomAllergyInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomAllergy();
                    }
                  }}
                  className="flex-1 px-3 py-1.5 rounded-xl border border-stone-300 text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-purple-700"
                />
                <button
                  type="button"
                  onClick={addCustomAllergy}
                  className="px-3 py-1.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Working Generate Meal Plan Button (Requirement 6) */}
            <button
              onClick={handleGeneratePlan}
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-2xl bg-purple-900 hover:bg-purple-800 disabled:opacity-50 text-white font-bold text-sm transition-all shadow-md shadow-purple-950/20 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                  <span>Synthesizing Meal Architecture with Gemini AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Generate Meal Plan</span>
                </>
              )}
            </button>

            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Validation Error:</span>
                  <span>{error}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Meal Plan Results (7 cols) */}
        <div className={`lg:col-span-7 space-y-6 ${!mealPlan ? 'lg:col-span-7' : ''}`}>
          {!mealPlan && !loading && (
            <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/80 shadow-xs space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-800 flex items-center justify-center mx-auto border border-purple-100">
                <CalendarDays className="w-8 h-8 opacity-80" />
              </div>
              <h3 className="font-serif text-xl font-bold text-stone-800">
                Awaiting Profile Input
              </h3>
              <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
                Configure your age, fitness goal, dietary preference, number of meals per day, and any declared allergies on the left, then click <strong>Generate Meal Plan</strong>.
              </p>
            </div>
          )}

          {loading && (
            <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/80 shadow-xs space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-800 flex items-center justify-center mx-auto animate-pulse">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-xl font-bold text-stone-900">
                Engineering Custom Meal Architecture...
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Auditing allergen barriers, distributing protein across feeding windows, and calculating micro and macronutrient density.
              </p>
            </div>
          )}

          {mealPlan && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Daily Overview Card */}
              <div className="bg-white rounded-3xl p-6 md:p-8 border border-stone-200/90 shadow-xs space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-4">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-900 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                      {mealPlan.dietPreference}
                    </span>
                    <h2 className="font-serif text-2xl md:text-3xl font-bold text-stone-950 mt-1">
                      {mealPlan.planTitle}
                    </h2>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Target Goal: {mealPlan.targetGoal} • {mealPlan.meals.length} Scheduled Feeding Windows
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 inline-flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Allergens Audited</span>
                    </span>
                  </div>
                </div>

                {/* Macro Summary Dashboard */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">
                    Daily Macronutrient Target Breakdown
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/90">
                      <span className="text-[10px] font-bold text-amber-800 uppercase block">Daily Energy</span>
                      <span className="font-serif text-2xl font-bold text-amber-950">
                        {mealPlan.totalDailyEstimatedNutrition.calories}
                      </span>
                      <span className="text-[10px] text-amber-700 block">kcal target</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200/90">
                      <span className="text-[10px] font-bold text-blue-800 uppercase block">Protein</span>
                      <span className="font-serif text-2xl font-bold text-blue-950">
                        {mealPlan.totalDailyEstimatedNutrition.proteinGrams}g
                      </span>
                      <span className="text-[10px] text-blue-700 block">High Bioavailability</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/90">
                      <span className="text-[10px] font-bold text-emerald-800 uppercase block">Carbohydrates</span>
                      <span className="font-serif text-2xl font-bold text-emerald-950">
                        {mealPlan.totalDailyEstimatedNutrition.carbsGrams}g
                      </span>
                      <span className="text-[10px] text-emerald-700 block">Complex & Fiber</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-purple-50/80 border border-purple-200/90">
                      <span className="text-[10px] font-bold text-purple-800 uppercase block">Hydration</span>
                      <span className="font-serif text-2xl font-bold text-purple-950">
                        {mealPlan.totalDailyEstimatedNutrition.hydrationRecommendationLiters}L
                      </span>
                      <span className="text-[10px] text-purple-700 block">Water / Herbal</span>
                    </div>
                  </div>
                </div>

                {/* Dietitian Clinical Strategy */}
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/90 text-xs space-y-1.5">
                  <span className="font-bold text-stone-900 block">Dietitian Strategy Guidance</span>
                  <p className="text-stone-600 leading-relaxed">
                    {mealPlan.dietitianGuidance}
                  </p>
                </div>

                {/* Hydration Suggestions (Requirement 6) */}
                {mealPlan.hydrationSuggestions && mealPlan.hydrationSuggestions.length > 0 && (
                  <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 text-xs space-y-1.5">
                    <span className="font-bold text-blue-950 flex items-center gap-1.5">
                      <Droplet className="w-4 h-4 text-blue-700" />
                      Hydration Guidance & Timing
                    </span>
                    <ul className="space-y-1 text-blue-900">
                      {mealPlan.hydrationSuggestions.map((sug, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-blue-600 font-bold">•</span>
                          <span>{sug}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Allergen Audit Confirmation */}
                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-950">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span>Allergen Safety Audit Confirmed</span>
                  </div>
                  <p className="text-emerald-900/90">
                    {mealPlan.allergenSafetyAudit.auditNotes}
                  </p>
                  {mealPlan.allergenSafetyAudit.requestedExclusions.length > 0 && (
                    <div className="text-[11px] text-emerald-800 font-medium pt-1">
                      Excluded items: {mealPlan.allergenSafetyAudit.requestedExclusions.join(', ')}
                    </div>
                  )}
                </div>
              </div>

              {/* The Meals Cards (Breakfast, Mid-morning, Lunch, Evening snack, Dinner) */}
              <div className="space-y-4">
                <h3 className="font-serif text-xl font-bold text-stone-900">
                  Daily Meal Sequence
                </h3>

                {mealPlan.meals.map((meal, index) => {
                  const showAlt = expandedAlternatives[meal.mealType];
                  return (
                    <div
                      key={index}
                      className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-xs space-y-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-stone-100 text-stone-800">
                            {meal.mealType}
                          </span>
                          <span className="text-xs text-stone-400 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {meal.prepTimeMinutes} min
                          </span>
                        </div>

                        {/* Meal Macros */}
                        <div className="flex items-center gap-3 text-xs font-bold text-stone-700 bg-stone-50 px-3 py-1 rounded-full border border-stone-200">
                          <span className="text-amber-900">{meal.estimatedNutrition.calories} kcal</span>
                          <span>• P: {meal.estimatedNutrition.protein}g</span>
                          <span>• C: {meal.estimatedNutrition.carbs}g</span>
                          <span>• F: {meal.estimatedNutrition.fat}g</span>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-serif text-lg font-bold text-stone-950">
                          {meal.dishName}
                        </h4>
                        <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                          {meal.description}
                        </p>
                      </div>

                      {/* Key ingredients */}
                      <div>
                        <span className="text-[10px] font-bold uppercase text-stone-400 block mb-1.5">
                          Key Ingredients
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {meal.keyIngredients.map((ing, i) => (
                            <span
                              key={i}
                              className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200"
                            >
                              {ing}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Alternatives Toggle (Requirement 6) */}
                      {meal.suitableAlternatives.length > 0 && (
                        <div className="pt-2 border-t border-stone-100">
                          <button
                            type="button"
                            onClick={() => toggleAlternative(meal.mealType)}
                            className="text-xs font-bold text-purple-900 hover:text-purple-950 flex items-center gap-1.5 transition-colors"
                          >
                            <Shuffle className="w-3.5 h-3.5 text-purple-700" />
                            <span>
                              {showAlt ? 'Hide Suitable Alternatives' : 'View Ingredient Swaps & Alternatives'}
                            </span>
                          </button>

                          {showAlt && (
                            <div className="mt-2.5 p-3 rounded-xl bg-purple-50/60 border border-purple-200 text-xs text-purple-950 space-y-1">
                              <span className="font-bold block">Available Swaps:</span>
                              <ul className="space-y-1">
                                {meal.suitableAlternatives.map((alt, i) => (
                                  <li key={i} className="flex items-start gap-1.5">
                                    <span className="text-purple-700 font-bold">•</span>
                                    <span>{alt}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Disclaimer (Requirement 6) */}
              <div className="p-4 rounded-2xl bg-stone-100 border border-stone-200 text-stone-600 text-[11px] space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-stone-800">
                  <Info className="w-3.5 h-3.5 text-emerald-800" />
                  <span>Clinical Disclaimer on Nutritional Estimation</span>
                </div>
                <p className="leading-relaxed">
                  {mealPlan.nutritionEstimateDisclaimer}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
