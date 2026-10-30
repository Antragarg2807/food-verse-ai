export type ActiveTab = 
  | 'dashboard' 
  | 'recognition' 
  | 'nutrition' 
  | 'freshness' 
  | 'hygiene' 
  | 'cooking' 
  | 'meal-plan' 
  | 'history' 
  | 'settings' 
  | 'samples';

export interface NutritionInfo {
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  fiberGrams?: number;
  sodiumMg?: number;
  sugarGrams?: number;
  healthScore?: number; // 1-100
  healthScoreBasis?: string; // Transparent explanation of the health score rationale
  summary: string;
  distinctionNote: string; // Explaining model estimate vs lab database
  portionNote: string; // How portion size affects these numbers
  recommendations?: string[]; // Food-related recommendations & portion adjustments
  micronutrients?: {
    name: string;
    amount: string;
    dailyValuePercentage?: number;
  }[];
}

export interface DetectedIngredient {
  name: string;
  estimatedGrams?: number;
  role: 'primary' | 'garnish' | 'sauce' | 'seasoning' | 'base';
  notes?: string;
}

export interface FoodRecognitionResult {
  id: string;
  dishName: string;
  cuisineOrigin?: string;
  confidenceCategory: 'High Certainty' | 'Moderate Certainty' | 'Tentative / Ambiguous';
  confidenceExplanation: string;
  description: string;
  estimatedPortionSize: string;
  detectedDishes?: string[]; // Multiple food items detected on the plate
  detectedIngredients: DetectedIngredient[];
  preparationStyle?: string;
  nutrition: NutritionInfo;
  dietaryTags: string[];
  allergensDetected: string[];
  foodSafetyNotice: string;
  imageUrl?: string;
  timestamp: string;
  isDemo?: boolean;
}

export type FreshnessCategory = 'Fresh' | 'Moderately Fresh' | 'Potentially Spoiled';

export interface FreshnessObservation {
  aspect: string; // e.g. "Surface Color", "Texture & Wrinkling", "Moisture / Spots"
  observation: string;
  status: 'optimal' | 'warning' | 'alert';
}

export interface FreshnessResult {
  id: string;
  foodName: string;
  category: FreshnessCategory;
  categoryHeadline: string;
  confidenceExplanation: string;
  visualObservations: FreshnessObservation[];
  recommendedNextSteps: string[];
  safeStorageTips: string[];
  criticalSafetyDisclaimer: string;
  imageUrl?: string;
  timestamp: string;
  isDemo?: boolean;
}

export type HygieneRating = 'Compliant Practices Observed' | 'Minor Observations / Advisory' | 'Multiple Critical Flags';

export interface HygieneFinding {
  category: 'Glove & Hand Hygiene' | 'Hair & Face Coverings' | 'Food Handling & Cross-Contamination' | 'Surface & Station Cleanliness' | 'Storage & Utensils';
  observation: string;
  status: 'compliant' | 'warning' | 'violation';
  timestampOrFrame?: string;
}

export interface HygieneResult {
  id: string;
  establishmentType: string;
  framesAnalyzedCount: number;
  hygieneRating: HygieneRating;
  overallScore: number; // 0-100
  summary: string;
  findings: HygieneFinding[];
  positivePractices: string[];
  concernsIdentified: string[];
  actionableRecommendations: string[];
  inspectionDisclaimer: string; // Explicit preliminary assistance disclaimer
  analyzedFramesPreviews?: string[];
  timestamp: string;
  isDemo?: boolean;
}

export interface RecipeStep {
  stepNumber: number;
  instruction: string;
  durationMinutes?: number;
  safetyTip?: string;
}

export interface RecipeIngredient {
  item: string;
  quantity: string;
  notes?: string;
  substitution?: string;
}

export interface RecipeResult {
  id: string;
  recipeTitle: string;
  description: string;
  cuisine: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  totalTimeMinutes: number;
  servings: number;
  difficulty: 'Easy' | 'Intermediate' | 'Advanced';
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  cookingTips?: string[];
  substitutions: { original: string; replacement: string; reason: string }[];
  foodSafetyAdvice: string[];
  estimatedNutritionPerServing: {
    calories: number;
    proteinGrams: number;
    carbsGrams: number;
    fatGrams: number;
  };
  chefTip?: string;
  timestamp: string;
  isDemo?: boolean;
}

export interface MealItem {
  mealType: 'Breakfast' | 'Mid-morning Snack' | 'Lunch' | 'Evening Snack' | 'Dinner' | 'Snack';
  dishName: string;
  description: string;
  prepTimeMinutes: number;
  estimatedNutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  keyIngredients: string[];
  allergenAlerts: string[];
  suitableAlternatives: string[];
}

export interface MealPlanResult {
  id: string;
  planTitle: string;
  age?: number;
  dietPreference: string;
  targetGoal: string;
  mealsPerDay?: number;
  totalDailyEstimatedNutrition: {
    calories: number;
    proteinGrams: number;
    carbsGrams: number;
    fatGrams: number;
    hydrationRecommendationLiters: number;
  };
  meals: MealItem[];
  allergenSafetyAudit: {
    requestedExclusions: string[];
    safeConfirmed: boolean;
    auditNotes: string;
  };
  dietitianGuidance: string;
  hydrationSuggestions?: string[];
  nutritionEstimateDisclaimer: string;
  timestamp: string;
  isDemo?: boolean;
}

export interface AnalysisHistoryItem {
  id: string;
  type: 'recognition' | 'nutrition' | 'freshness' | 'hygiene' | 'cooking' | 'meal-plan';
  title: string;
  subtitle: string;
  timestamp: string;
  thumbnailUrl?: string;
  data: FoodRecognitionResult | FreshnessResult | HygieneResult | RecipeResult | MealPlanResult;
}
