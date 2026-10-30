import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { Dashboard } from './components/Dashboard.tsx';
import { FoodRecognitionView } from './components/FoodRecognitionView.tsx';
import { NutritionAnalysisView } from './components/NutritionAnalysisView.tsx';
import { FreshnessAssessmentView } from './components/FreshnessAssessmentView.tsx';
import { RestaurantHygieneView } from './components/RestaurantHygieneView.tsx';
import { CookingAssistantView } from './components/CookingAssistantView.tsx';
import { MealPlannerView } from './components/MealPlannerView.tsx';
import { SampleReportsView } from './components/SampleReportsView.tsx';
import { HistoryView } from './components/HistoryView.tsx';
import { SettingsView } from './components/SettingsView.tsx';
import { Footer } from './components/Footer.tsx';
import { 
  ActiveTab, 
  AnalysisHistoryItem, 
  FoodRecognitionResult, 
  FreshnessResult, 
  HygieneResult, 
  RecipeResult, 
  MealPlanResult 
} from './types/index.ts';
import { fetchSystemStatus, SystemStatus } from './services/api.ts';
import { 
  sampleFoodRecognition, 
  sampleFreshnessFresh, 
  sampleHygieneAudit, 
  sampleRecipe, 
  sampleMealPlan 
} from '../server/services/sampleDataService.ts';

const STORAGE_KEY = 'foodverse_ai_history_v1';

const getInitialSeeds = (): AnalysisHistoryItem[] => [
  {
    id: 'seed-1',
    type: 'recognition',
    title: sampleFoodRecognition.dishName,
    subtitle: `${sampleFoodRecognition.nutrition.calories} kcal • ${sampleFoodRecognition.cuisineOrigin}`,
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    thumbnailUrl: sampleFoodRecognition.imageUrl,
    data: sampleFoodRecognition
  },
  {
    id: 'seed-2',
    type: 'freshness',
    title: sampleFreshnessFresh.foodName,
    subtitle: `${sampleFreshnessFresh.category} • ${sampleFreshnessFresh.categoryHeadline}`,
    timestamp: new Date(Date.now() - 3600000 * 6).toISOString(),
    thumbnailUrl: sampleFreshnessFresh.imageUrl,
    data: sampleFreshnessFresh
  },
  {
    id: 'seed-3',
    type: 'cooking',
    title: sampleRecipe.recipeTitle,
    subtitle: `${sampleRecipe.totalTimeMinutes}m • ${sampleRecipe.cuisine}`,
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
    data: sampleRecipe
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);
  
  // Active report objects passed to each module when selected from history/sample
  const [activeRecognitionResult, setActiveRecognitionResult] = useState<FoodRecognitionResult | null>(null);
  const [activeFreshnessResult, setActiveFreshnessResult] = useState<FreshnessResult | null>(null);
  const [activeHygieneResult, setActiveHygieneResult] = useState<HygieneResult | null>(null);
  const [activeRecipeResult, setActiveRecipeResult] = useState<RecipeResult | null>(null);
  const [activeMealPlanResult, setActiveMealPlanResult] = useState<MealPlanResult | null>(null);

  // Load initial system status and history
  useEffect(() => {
    fetchSystemStatus().then((s) => setStatus(s));

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setHistory(JSON.parse(saved));
      } else {
        const initialSeeds = getInitialSeeds();
        setHistory(initialSeeds);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialSeeds));
      }
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, []);

  const saveHistoryItem = (item: AnalysisHistoryItem) => {
    setHistory((prev) => {
      const updated = [item, ...prev.filter((p) => p.id !== item.id)].slice(0, 30);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleDeleteHistoryItem = (id: string) => {
    setHistory((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  const handleResetSampleData = () => {
    const seeds = getInitialSeeds();
    setHistory(seeds);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeds));
    } catch {}
  };

  const handleSaveRecognition = (res: FoodRecognitionResult) => {
    setActiveRecognitionResult(res);
    saveHistoryItem({
      id: res.id,
      type: 'recognition',
      title: res.dishName,
      subtitle: `${res.nutrition.calories} kcal • ${res.cuisineOrigin || 'Food Scan'}`,
      timestamp: res.timestamp,
      thumbnailUrl: res.imageUrl,
      data: res
    });
  };

  const handleSaveFreshness = (res: FreshnessResult) => {
    setActiveFreshnessResult(res);
    saveHistoryItem({
      id: res.id,
      type: 'freshness',
      title: res.foodName,
      subtitle: `${res.category} • ${res.categoryHeadline}`,
      timestamp: res.timestamp,
      thumbnailUrl: res.imageUrl,
      data: res
    });
  };

  const handleSaveHygiene = (res: HygieneResult) => {
    setActiveHygieneResult(res);
    saveHistoryItem({
      id: res.id,
      type: 'hygiene',
      title: res.establishmentType,
      subtitle: `Score ${res.overallScore}/100 • ${res.hygieneRating}`,
      timestamp: res.timestamp,
      thumbnailUrl: res.analyzedFramesPreviews?.[0],
      data: res
    });
  };

  const handleSaveRecipe = (res: RecipeResult) => {
    setActiveRecipeResult(res);
    saveHistoryItem({
      id: res.id,
      type: 'cooking',
      title: res.recipeTitle,
      subtitle: `${res.totalTimeMinutes} min • ${res.cuisine}`,
      timestamp: res.timestamp,
      data: res
    });
  };

  const handleSaveMealPlan = (res: MealPlanResult) => {
    setActiveMealPlanResult(res);
    saveHistoryItem({
      id: res.id,
      type: 'meal-plan',
      title: res.planTitle,
      subtitle: `${res.totalDailyEstimatedNutrition.calories} kcal • ${res.dietPreference}`,
      timestamp: res.timestamp,
      data: res
    });
  };

  const handleSelectHistoryItem = (item: AnalysisHistoryItem) => {
    if (item.type === 'recognition') {
      setActiveRecognitionResult(item.data as FoodRecognitionResult);
      setActiveTab('recognition');
    } else if (item.type === 'freshness') {
      setActiveFreshnessResult(item.data as FreshnessResult);
      setActiveTab('freshness');
    } else if (item.type === 'hygiene') {
      setActiveHygieneResult(item.data as HygieneResult);
      setActiveTab('hygiene');
    } else if (item.type === 'cooking') {
      setActiveRecipeResult(item.data as RecipeResult);
      setActiveTab('cooking');
    } else if (item.type === 'meal-plan') {
      setActiveMealPlanResult(item.data as MealPlanResult);
      setActiveTab('meal-plan');
    }
  };

  const handleLoadSampleReport = (tab: ActiveTab, data: any) => {
    if (tab === 'recognition') {
      setActiveRecognitionResult(data);
      setActiveTab('recognition');
    } else if (tab === 'nutrition') {
      setActiveRecognitionResult(data);
      setActiveTab('nutrition');
    } else if (tab === 'freshness') {
      setActiveFreshnessResult(data);
      setActiveTab('freshness');
    } else if (tab === 'hygiene') {
      setActiveHygieneResult(data);
      setActiveTab('hygiene');
    } else if (tab === 'cooking') {
      setActiveRecipeResult(data);
      setActiveTab('cooking');
    } else if (tab === 'meal-plan') {
      setActiveMealPlanResult(data);
      setActiveTab('meal-plan');
    } else {
      setActiveTab(tab);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F4] text-stone-800 font-sans selection:bg-emerald-200 selection:text-emerald-950">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        status={status}
      />

      {/* Demo Mode Notice Banner if not configured with live key */}
      {status && !status.aiConfigured && (
        <aside aria-label="Demo mode announcement" className="bg-amber-100/70 border-b border-amber-200/90 text-amber-950 px-4 py-2 text-xs">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
              <span className="font-bold">Demonstration Mode Active:</span>
              <span className="text-amber-900">
                Running with pre-calibrated culinary benchmarks. Every feature, recipe builder, 
                and freshness scanner works out of the box.
              </span>
            </div>
            <button
              onClick={() => setActiveTab('samples')}
              className="text-[11px] font-extrabold text-amber-900 underline hover:text-amber-950 cursor-pointer"
            >
              Browse Preloaded Sample Reports →
            </button>
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {activeTab === 'dashboard' && (
          <Dashboard
            setActiveTab={setActiveTab}
            status={status}
            history={history}
            onSelectHistoryItem={handleSelectHistoryItem}
            onClearHistory={handleClearHistory}
          />
        )}

        {activeTab === 'recognition' && (
          <FoodRecognitionView
            onSaveToHistory={handleSaveRecognition}
            initialResult={activeRecognitionResult}
            onNavigateToNutrition={(result) => {
              setActiveRecognitionResult(result);
              setActiveTab('nutrition');
            }}
          />
        )}

        {activeTab === 'nutrition' && (
          <NutritionAnalysisView
            currentResult={activeRecognitionResult}
            setActiveTab={setActiveTab}
            onSelectSamplePlate={(result) => {
              setActiveRecognitionResult(result);
            }}
          />
        )}

        {activeTab === 'freshness' && (
          <FreshnessAssessmentView
            onSaveToHistory={handleSaveFreshness}
            initialResult={activeFreshnessResult}
          />
        )}

        {activeTab === 'hygiene' && (
          <RestaurantHygieneView
            onSaveToHistory={handleSaveHygiene}
            initialResult={activeHygieneResult}
          />
        )}

        {activeTab === 'cooking' && (
          <CookingAssistantView
            onSaveToHistory={handleSaveRecipe}
            initialResult={activeRecipeResult}
          />
        )}

        {activeTab === 'meal-plan' && (
          <MealPlannerView
            onSaveToHistory={handleSaveMealPlan}
            initialResult={activeMealPlanResult}
          />
        )}

        {activeTab === 'samples' && (
          <SampleReportsView
            onLoadReport={handleLoadSampleReport}
          />
        )}

        {activeTab === 'history' && (
          <HistoryView
            history={history}
            onSelectHistoryItem={handleSelectHistoryItem}
            onDeleteItem={handleDeleteHistoryItem}
            onClearAll={handleClearHistory}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            status={status}
            onResetSampleData={handleResetSampleData}
            onClearCache={handleClearHistory}
          />
        )}
      </main>

      {/* Footer */}
      <Footer setActiveTab={setActiveTab} />
    </div>
  );
}
