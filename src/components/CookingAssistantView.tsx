import React, { useState } from 'react';
import { 
  ChefHat, 
  Sparkles, 
  Plus, 
  X, 
  Clock, 
  Flame, 
  ShieldAlert, 
  Shuffle, 
  Check, 
  Volume2, 
  VolumeX, 
  Copy, 
  AlertCircle, 
  RefreshCw,
  Utensils,
  BookOpen,
  RotateCcw,
  Users,
  Lightbulb
} from 'lucide-react';
import { RecipeResult, RecipeIngredient, RecipeStep } from '../types/index.ts';
import { requestRecipe, playTtsNarration, stopSpeech } from '../services/api.ts';

interface CookingAssistantViewProps {
  onSaveToHistory: (result: RecipeResult) => void;
  initialResult?: RecipeResult | null;
}

const COMMON_STAPLES = [
  'Garlic', 'Olive Oil', 'Eggs', 'Tomatoes', 'Pasta', 'Chicken Breast', 
  'Organic Tofu', 'Baby Spinach', 'Button Mushrooms', 'Basmati Rice', 
  'Fresh Lemon', 'Yellow Onion', 'Greek Yogurt', 'Avocado', 'Parmesan'
];

const CUISINE_OPTIONS = [
  'Mediterranean', 'Italian', 'Asian Fusion', 'Mexican', 
  'Indian', 'Japanese', 'French Bistro', 'American Healthy', 'Chef Creative'
];

const DIETARY_OPTIONS = [
  'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto / Low-Carb', 'Nut-Free', 'High-Protein'
];

const MEAL_TYPES = ['Dinner', 'Lunch', 'Breakfast', 'Snack', 'Post-Workout Meal'];

export const CookingAssistantView: React.FC<CookingAssistantViewProps> = ({
  onSaveToHistory,
  initialResult
}) => {
  const [ingredients, setIngredients] = useState<string[]>([
    'Wild Salmon Fillets', 'Organic Quinoa', 'Asparagus', 'Fresh Lemon', 'Garlic'
  ]);
  const [ingredientInput, setIngredientInput] = useState<string>('');
  const [cuisine, setCuisine] = useState<string>('Mediterranean');
  const [maxTimeMinutes, setMaxTimeMinutes] = useState<number>(30);
  const [servings, setServings] = useState<number>(2);
  const [selectedDiet, setSelectedDiet] = useState<string[]>(['Gluten-Free', 'High-Protein']);
  const [mealType, setMealType] = useState<string>('Dinner');
  const [skillLevel, setSkillLevel] = useState<string>('Intermediate');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recipe, setRecipe] = useState<RecipeResult | null>(initialResult || null);
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);

  const addIngredient = (item: string) => {
    const trimmed = item.trim();
    if (!trimmed) return;
    if (!ingredients.includes(trimmed)) {
      setIngredients([...ingredients, trimmed]);
    }
    setIngredientInput('');
  };

  const removeIngredient = (item: string) => {
    setIngredients(ingredients.filter((i) => i !== item));
  };

  const clearInputs = () => {
    setIngredients([]);
    setIngredientInput('');
    setError(null);
    setSelectedDiet([]);
    setMaxTimeMinutes(30);
    setServings(2);
  };

  const startNewRecipe = () => {
    setRecipe(null);
    setCompletedSteps({});
    setError(null);
    stopSpeech();
    setIsSpeaking(false);
  };

  const toggleDiet = (tag: string) => {
    if (selectedDiet.includes(tag)) {
      setSelectedDiet(selectedDiet.filter((t) => t !== tag));
    } else {
      setSelectedDiet([...selectedDiet, tag]);
    }
  };

  const toggleStep = (stepNumber: number) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [stepNumber]: !prev[stepNumber]
    }));
  };

  const handleGenerate = async () => {
    if (ingredients.length === 0) {
      setError('Please add at least 1 or 2 available ingredients to craft a recipe.');
      return;
    }

    setLoading(true);
    setError(null);
    stopSpeech();
    setIsSpeaking(false);
    setCompletedSteps({});

    try {
      const data = await requestRecipe({
        ingredients,
        cuisine,
        maxTimeMinutes,
        servings,
        dietaryRestrictions: selectedDiet,
        mealType,
        skillLevel
      });
      setRecipe(data);
      onSaveToHistory(data);
    } catch (err: any) {
      setError(err.message || 'Failed to generate recipe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSpeak = async () => {
    if (!recipe) return;
    if (isSpeaking) {
      stopSpeech();
      setIsSpeaking(false);
      return;
    }

    const narrative = `Recipe: ${recipe.recipeTitle}. Serves ${recipe.servings}. Total time: ${recipe.totalTimeMinutes} minutes. ${recipe.description}. Step one: ${recipe.steps[0]?.instruction || ''}. Food safety note: ${recipe.foodSafetyAdvice[0] || ''}`;
    setIsSpeaking(true);
    const played = await playTtsNarration(narrative);
    if (!played) setIsSpeaking(false);
  };

  const copyRecipe = () => {
    if (!recipe) return;
    const ings = recipe.ingredients.map((i) => `- ${i.quantity} ${i.item}`).join('\n');
    const stps = recipe.steps.map((s) => `${s.stepNumber}. ${s.instruction}`).join('\n\n');
    const tips = (recipe.cookingTips || []).map((t) => `• ${t}`).join('\n');
    const safety = recipe.foodSafetyAdvice.map((a) => `• ${a}`).join('\n');
    const full = `${recipe.recipeTitle}\n${recipe.description}\nServings: ${recipe.servings} | Prep: ${recipe.prepTimeMinutes}m | Cook: ${recipe.cookTimeMinutes}m\n\nINGREDIENTS:\n${ings}\n\nINSTRUCTIONS:\n${stps}\n\nCOOKING TIPS:\n${tips}\n\nFOOD SAFETY:\n${safety}`;
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-950 text-xs font-semibold uppercase tracking-wider mb-2">
              <ChefHat className="w-3.5 h-3.5 text-orange-700" />
              <span>Smart Culinary Intelligence</span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-stone-900">
              Smart Cooking Assistant
            </h1>
            <p className="text-sm text-stone-600 mt-1 max-w-2xl">
              Turn your available pantry items into restaurant-quality recipes with precise cooking temperatures, 
              safe cross-contamination precautions, and step-by-step guidance.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {recipe && (
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
                  onClick={copyRecipe}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-50"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>

                {/* Working New Recipe Button (Requirement 5) */}
                <button
                  onClick={startNewRecipe}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-100 text-orange-950 border border-orange-300 text-xs font-bold hover:bg-orange-200 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>New Recipe</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Ingredients & Parameters (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-stone-900">
                1. Ingredients & Preferences
              </h3>
              {/* Working Clear Inputs Button (Requirement 5) */}
              <button
                type="button"
                onClick={clearInputs}
                className="text-xs font-bold text-stone-500 hover:text-red-700 flex items-center gap-1 transition-colors"
                title="Clear all inputs"
              >
                <X className="w-3.5 h-3.5" />
                <span>Clear Inputs</span>
              </button>
            </div>

            {/* Input tag box */}
            <div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type an ingredient (e.g. Chicken breast)"
                  value={ingredientInput}
                  onChange={(e) => setIngredientInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addIngredient(ingredientInput);
                    }
                  }}
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-600"
                />
                <button
                  type="button"
                  onClick={() => addIngredient(ingredientInput)}
                  className="px-4 py-2.5 rounded-xl bg-orange-700 hover:bg-orange-600 text-white font-bold text-xs shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Tag Cloud */}
              <div className="flex flex-wrap gap-1.5 mt-3 min-h-[3rem] p-2 rounded-xl bg-stone-50 border border-stone-200">
                {ingredients.length === 0 ? (
                  <span className="text-xs text-stone-400 italic p-1">No ingredients added yet. Add items above or click staples below.</span>
                ) : (
                  ingredients.map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-white text-stone-800 border border-stone-300 shadow-2xs"
                    >
                      <span>{item}</span>
                      <button
                        onClick={() => removeIngredient(item)}
                        className="text-stone-400 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Quick Staples Quick-Add */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block mb-2">
                Quick-Add Pantry Staples
              </span>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_STAPLES.map((staple) => (
                  <button
                    key={staple}
                    onClick={() => addIngredient(staple)}
                    className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-stone-100 hover:bg-orange-100 text-stone-700 hover:text-orange-950 transition-colors border border-stone-200"
                  >
                    + {staple}
                  </button>
                ))}
              </div>
            </div>

            {/* Cuisine & Meal Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-stone-100">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Preferred Cuisine
                </label>
                <select
                  value={cuisine}
                  onChange={(e) => setCuisine(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-orange-600"
                >
                  {CUISINE_OPTIONS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Desired Meal Type
                </label>
                <select
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-orange-600"
                >
                  {MEAL_TYPES.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Cooking Time & Servings (Requirement 5) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Cooking Time: {maxTimeMinutes} min
                </label>
                <input
                  type="range"
                  min="15"
                  max="75"
                  step="5"
                  value={maxTimeMinutes}
                  onChange={(e) => setMaxTimeMinutes(Number(e.target.value))}
                  className="w-full accent-orange-700 cursor-pointer mt-1"
                />
                <div className="flex justify-between text-[10px] text-stone-400">
                  <span>15m Quick</span>
                  <span>45m</span>
                  <span>75m Feast</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Number of Servings
                </label>
                <div className="flex items-center gap-2 mt-1">
                  {[1, 2, 4, 6].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setServings(num)}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                        servings === num
                          ? 'bg-orange-700 text-white border-orange-800'
                          : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {num} {num === 1 ? 'serving' : 'servings'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Dietary Restrictions Checklist */}
            <div className="pt-2 border-t border-stone-100">
              <label className="block text-xs font-bold text-stone-700 mb-2">
                Dietary Preferences & Restrictions
              </label>
              <div className="flex flex-wrap gap-1.5">
                {DIETARY_OPTIONS.map((diet) => {
                  const isChecked = selectedDiet.includes(diet);
                  return (
                    <button
                      key={diet}
                      type="button"
                      onClick={() => toggleDiet(diet)}
                      className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all border ${
                        isChecked
                          ? 'bg-emerald-800 text-white border-emerald-900 shadow-2xs'
                          : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3 inline mr-1" />}
                      {diet}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Working Generate Recipe Button (Requirement 5) */}
            <button
              onClick={handleGenerate}
              disabled={loading || ingredients.length === 0}
              className="w-full py-3.5 px-4 rounded-2xl bg-orange-700 hover:bg-orange-800 disabled:opacity-50 text-white font-bold text-sm transition-all shadow-md shadow-orange-950/20 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-200" />
                  <span>Curating Chef Recipe with Gemini AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-200" />
                  <span>Generate Recipe</span>
                </>
              )}
            </button>

            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Recipe Error:</span>
                  <span>{error}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Recipe Output (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {!recipe && !loading && (
            <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/80 shadow-xs space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-orange-50 text-orange-800 flex items-center justify-center mx-auto border border-orange-100">
                <BookOpen className="w-8 h-8 opacity-80" />
              </div>
              <h3 className="font-serif text-xl font-bold text-stone-800">
                Ready to Cook?
              </h3>
              <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
                Add your available ingredients, select your cuisine and servings, then click <strong>Generate Recipe</strong>. 
                You'll receive tailored step-by-step instructions, chef cooking tips, substitutions, and verified temperature safety rules.
              </p>
            </div>
          )}

          {loading && (
            <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/80 shadow-xs space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-orange-50 text-orange-800 flex items-center justify-center mx-auto animate-pulse">
                <ChefHat className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-xl font-bold text-stone-900">
                Crafting Culinary Masterpiece...
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Balancing flavor profiles, validating allergen exclusions, and embedding USDA food temperature safety rules.
              </p>
            </div>
          )}

          {recipe && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Recipe Card */}
              <div className="bg-white rounded-3xl p-6 md:p-8 border border-stone-200/90 shadow-xs space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-orange-800 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200">
                        {recipe.cuisine}
                      </span>
                      <span className="text-[10px] font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">
                        {recipe.difficulty}
                      </span>
                    </div>
                    <h2 className="font-serif text-2xl md:text-3xl font-bold text-stone-950 mt-1">
                      {recipe.recipeTitle}
                    </h2>
                    <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
                      {recipe.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 text-center">
                    <div className="bg-stone-50 px-3 py-2 rounded-xl border border-stone-200">
                      <span className="text-[10px] font-bold text-stone-400 block uppercase">Prep</span>
                      <span className="font-serif text-base font-bold text-stone-800">{recipe.prepTimeMinutes}m</span>
                    </div>
                    <div className="bg-stone-50 px-3 py-2 rounded-xl border border-stone-200">
                      <span className="text-[10px] font-bold text-stone-400 block uppercase">Cook</span>
                      <span className="font-serif text-base font-bold text-stone-800">{recipe.cookTimeMinutes}m</span>
                    </div>
                    <div className="bg-stone-50 px-3 py-2 rounded-xl border border-stone-200">
                      <span className="text-[10px] font-bold text-stone-400 block uppercase">Serves</span>
                      <span className="font-serif text-base font-bold text-stone-800">{recipe.servings}</span>
                    </div>
                  </div>
                </div>

                {/* Estimated Macro Pill Header */}
                <div className="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <span className="font-bold text-amber-950">Estimated Nutrition per Serving:</span>
                  <div className="flex items-center gap-4 font-semibold text-amber-900">
                    <span>{recipe.estimatedNutritionPerServing.calories} kcal</span>
                    <span>• {recipe.estimatedNutritionPerServing.proteinGrams}g Protein</span>
                    <span>• {recipe.estimatedNutritionPerServing.carbsGrams}g Carbs</span>
                    <span>• {recipe.estimatedNutritionPerServing.fatGrams}g Fat</span>
                  </div>
                </div>

                {/* Ingredients List */}
                <div className="space-y-3">
                  <h4 className="font-serif text-base font-bold text-stone-900">
                    Ingredient Quantities
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {recipe.ingredients.map((ing, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-stone-50/80 border border-stone-200 text-xs flex items-start justify-between gap-2"
                      >
                        <div>
                          <span className="font-bold text-stone-900 block">{ing.item}</span>
                          {ing.notes && <span className="text-[10px] text-stone-500">{ing.notes}</span>}
                        </div>
                        <span className="font-semibold text-emerald-800 shrink-0 bg-white px-2 py-0.5 rounded border border-stone-200 text-[11px]">
                          {ing.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Step-by-Step Instructions with Check-Off */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif text-base font-bold text-stone-900">
                      Step-by-Step Cooking Instructions
                    </h4>
                    <span className="text-xs text-stone-500">
                      Check steps as you cook
                    </span>
                  </div>

                  <div className="space-y-3">
                    {recipe.steps.map((st) => {
                      const isDone = completedSteps[st.stepNumber];
                      return (
                        <div
                          key={st.stepNumber}
                          onClick={() => toggleStep(st.stepNumber)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                            isDone 
                              ? 'bg-emerald-50/40 border-emerald-300 opacity-60' 
                              : 'bg-[#FDFCF9] border-stone-200 hover:border-orange-300'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 transition-colors ${
                              isDone ? 'bg-emerald-600 text-white' : 'bg-orange-100 text-orange-950'
                            }`}>
                              {isDone ? <Check className="w-4 h-4" /> : st.stepNumber}
                            </div>
                            <div className="flex-1 space-y-1">
                              <p className={`text-xs leading-relaxed ${isDone ? 'line-through text-stone-500' : 'text-stone-800'}`}>
                                {st.instruction}
                              </p>
                              {st.safetyTip && (
                                <div className="p-2 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 text-[11px] font-medium flex items-center gap-1.5 mt-2">
                                  <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                  <span>{st.safetyTip}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Cooking Tips (Requirement 5) */}
                {recipe.cookingTips && recipe.cookingTips.length > 0 && (
                  <div className="space-y-2.5 pt-2">
                    <h4 className="font-serif text-base font-bold text-stone-900 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-600" />
                      <span>Chef Cooking Tips</span>
                    </h4>
                    <div className="space-y-2">
                      {recipe.cookingTips.map((tip, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/80 text-xs text-amber-950 flex items-start gap-2">
                          <span className="font-bold text-amber-700">•</span>
                          <span>{tip}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Substitutions */}
                {recipe.substitutions.length > 0 && (
                  <div className="space-y-2.5 pt-2">
                    <h4 className="font-serif text-base font-bold text-stone-900 flex items-center gap-2">
                      <Shuffle className="w-4 h-4 text-emerald-800" />
                      <span>Smart Chef Substitutions</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {recipe.substitutions.map((sub, i) => (
                        <div key={i} className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                          <span className="font-bold text-stone-900">{sub.original}</span>
                          <span className="text-stone-400"> → </span>
                          <span className="font-bold text-emerald-800">{sub.replacement}</span>
                          <p className="text-[11px] text-stone-500 mt-1">{sub.reason}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Food Safety Guidance */}
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-amber-950">
                    <ShieldAlert className="w-4 h-4 text-amber-700" />
                    <span>Essential Food Safety Guidance</span>
                  </div>
                  <ul className="space-y-1 text-amber-900">
                    {recipe.foodSafetyAdvice.map((adv, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-amber-700 font-bold">•</span>
                        <span>{adv}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
