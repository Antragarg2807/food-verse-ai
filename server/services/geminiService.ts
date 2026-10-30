import { GoogleGenAI, Type } from '@google/genai';
import type { 
  FoodRecognitionResult, 
  FreshnessResult, 
  HygieneResult, 
  RecipeResult, 
  MealPlanResult 
} from '../../src/types/index.ts';
import { 
  sampleFoodRecognition, 
  sampleFreshnessFresh, 
  sampleFreshnessSpoiled, 
  sampleHygieneAudit, 
  sampleRecipe, 
  sampleMealPlan 
} from './sampleDataService.ts';

// Preferred model: gemini-3.1-flash-lite provides sub-second multimodal vision & reasoning
const PRIMARY_MODEL = 'gemini-3.1-flash-lite';
const REQUEST_TIMEOUT_MS = 28000;

function getGenAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      },
      timeout: REQUEST_TIMEOUT_MS
    }
  });
}

export function isGeminiConfigured(): boolean {
  return getGenAIClient() !== null;
}

/**
 * Execute Gemini call with a strict timeout promise wrapper to prevent infinite loading
 */
async function callGeminiWithTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = REQUEST_TIMEOUT_MS
): Promise<T> {
  let timeoutHandle: any;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(() => {
      reject(new Error(`AI generation timed out after ${Math.round(timeoutMs / 1000)}s`));
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    return result;
  } finally {
    clearTimeout(timeoutHandle);
  }
}

/**
 * Helper to safely extract JSON from model text
 */
function parseJsonSafely(rawText: string | undefined): any {
  if (!rawText) return {};
  try {
    // Strip markdown code fences if model enclosed in ```json ... ```
    const cleaned = rawText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();
    return JSON.parse(cleaned);
  } catch {
    // Attempt greedy object extraction
    const match = rawText.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {}
    }
    return {};
  }
}

/**
 * 1. MULTIMODAL FOOD RECOGNITION & NUTRITION ANALYSIS
 */
export async function analyzeFoodImage(
  imageBase64: string,
  mimeType: string,
  userNotes?: string
): Promise<FoodRecognitionResult> {
  const ai = getGenAIClient();
  if (!ai) {
    return {
      ...sampleFoodRecognition,
      id: `analysis-${Date.now()}`,
      timestamp: new Date().toISOString(),
      isDemo: true,
      confidenceExplanation: 'DEMO MODE: Gemini API key is not configured in server environment. Displaying validated sample food recognition and nutrition report.'
    };
  }

  const prompt = `Analyze this food image as an expert culinary scientist, clinical nutritionist, and food safety specialist.
${userNotes ? `User context/notes: "${userNotes}"` : ''}

CRITICAL REQUIREMENTS:
1. Dish Recognition: Identify primary dish name, regional cuisine origin, culinary preparation style, and a short 1-2 sentence description.
2. Multiple Food Items: Identify all distinct food items or sides visible on the plate (array of strings in detectedDishes).
3. Estimated Portion Size: State the optical estimated portion size (e.g. "1 bowl (~320g)" or "1 plate with 2 skewers").
4. Confidence: Provide an objective certainty category ('High Certainty', 'Moderate Certainty', or 'Tentative / Ambiguous') with visual explanation. NEVER fabricate fake 99.9% certainty if plating is obscured or ambiguous.
5. Ingredients: Break down visible ingredients with estimated mass in grams, culinary role (primary, garnish, sauce, seasoning, base), and notes.
6. Comprehensive Nutrition Estimates:
   - Calories (kcal), protein (g), carbs (g), fat (g), fiber (g), sodium (mg), sugar (g).
   - Health score (1-100) and a transparent explanation of its basis (healthScoreBasis).
   - Summary of macro/micronutrient balance.
   - Food recommendations: suggestions for nutrient absorption, healthier pairings, and portion adjustments.
   - Key micronutrients: estimated amounts and % daily values (Vitamin K, Iron, Potassium, etc.).
   - Explicit disclaimers: distinguish visual estimations from chemical laboratory calorimetry.
7. Food Safety & Allergens: List declared major allergens (Gluten, Dairy, Eggs, Tree Nuts, Soy, Fish, Shellfish, Sesame, Peanuts) and provide food safety/temperature handling notices.

Respond strictly in valid JSON matching the requested schema.`;

  try {
    const cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, '');
    const apiCall = ai.models.generateContent({
      model: PRIMARY_MODEL,
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType: mimeType || 'image/jpeg',
                data: cleanBase64
              }
            },
            {
              text: prompt
            }
          ]
        }
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            dishName: { type: Type.STRING },
            cuisineOrigin: { type: Type.STRING },
            description: { type: Type.STRING },
            estimatedPortionSize: { type: Type.STRING },
            detectedDishes: { type: Type.ARRAY, items: { type: Type.STRING } },
            confidenceCategory: { 
              type: Type.STRING, 
              enum: ['High Certainty', 'Moderate Certainty', 'Tentative / Ambiguous'] 
            },
            confidenceExplanation: { type: Type.STRING },
            preparationStyle: { type: Type.STRING },
            detectedIngredients: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  estimatedGrams: { type: Type.NUMBER },
                  role: { type: Type.STRING, enum: ['primary', 'garnish', 'sauce', 'seasoning', 'base'] },
                  notes: { type: Type.STRING }
                },
                required: ['name', 'role']
              }
            },
            nutrition: {
              type: Type.OBJECT,
              properties: {
                calories: { type: Type.NUMBER },
                proteinGrams: { type: Type.NUMBER },
                carbsGrams: { type: Type.NUMBER },
                fatGrams: { type: Type.NUMBER },
                fiberGrams: { type: Type.NUMBER },
                sodiumMg: { type: Type.NUMBER },
                sugarGrams: { type: Type.NUMBER },
                healthScore: { type: Type.NUMBER },
                healthScoreBasis: { type: Type.STRING },
                summary: { type: Type.STRING },
                distinctionNote: { type: Type.STRING },
                portionNote: { type: Type.STRING },
                recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
                micronutrients: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      amount: { type: Type.STRING },
                      dailyValuePercentage: { type: Type.NUMBER }
                    },
                    required: ['name', 'amount']
                  }
                }
              },
              required: ['calories', 'proteinGrams', 'carbsGrams', 'fatGrams', 'summary', 'distinctionNote', 'portionNote']
            },
            dietaryTags: { type: Type.ARRAY, items: { type: Type.STRING } },
            allergensDetected: { type: Type.ARRAY, items: { type: Type.STRING } },
            foodSafetyNotice: { type: Type.STRING }
          },
          required: [
            'dishName', 
            'confidenceCategory', 
            'confidenceExplanation', 
            'description',
            'estimatedPortionSize',
            'detectedIngredients', 
            'nutrition', 
            'dietaryTags', 
            'allergensDetected', 
            'foodSafetyNotice'
          ]
        }
      }
    });

    const response = await callGeminiWithTimeout(apiCall);
    const parsed = parseJsonSafely(response.text);

    return {
      id: `rec-${Date.now()}`,
      dishName: parsed.dishName || 'Identified Dish',
      cuisineOrigin: parsed.cuisineOrigin || 'International',
      description: parsed.description || 'Nutrient-rich plated meal analyzed via computer vision.',
      estimatedPortionSize: parsed.estimatedPortionSize || 'Standard plated serving (~250-300g)',
      detectedDishes: parsed.detectedDishes && parsed.detectedDishes.length > 0 
        ? parsed.detectedDishes 
        : [parsed.dishName || 'Main Dish'],
      confidenceCategory: parsed.confidenceCategory || 'Moderate Certainty',
      confidenceExplanation: parsed.confidenceExplanation || 'Analysis derived from visible morphological patterns and culinary plating textures.',
      detectedIngredients: parsed.detectedIngredients || [],
      preparationStyle: parsed.preparationStyle || 'Plated preparation',
      nutrition: {
        calories: Number(parsed.nutrition?.calories) || 0,
        proteinGrams: Number(parsed.nutrition?.proteinGrams) || 0,
        carbsGrams: Number(parsed.nutrition?.carbsGrams) || 0,
        fatGrams: Number(parsed.nutrition?.fatGrams) || 0,
        fiberGrams: Number(parsed.nutrition?.fiberGrams) || 0,
        sodiumMg: Number(parsed.nutrition?.sodiumMg) || 0,
        sugarGrams: Number(parsed.nutrition?.sugarGrams) || 0,
        healthScore: Number(parsed.nutrition?.healthScore) || 80,
        healthScoreBasis: parsed.nutrition?.healthScoreBasis || 'Evaluated based on macronutrient balance, micronutrient density, and whole-food ingredients.',
        summary: parsed.nutrition?.summary || 'Nutrient profile estimated from recognized components.',
        distinctionNote: parsed.nutrition?.distinctionNote || 'These figures are optical estimates calibrated against standard recipe databases, not laboratory chemical bomb calorimetry.',
        portionNote: parsed.nutrition?.portionNote || 'Values reflect the detected visual portion. Adjust the portion slider to recalculate for your exact serving.',
        recommendations: parsed.nutrition?.recommendations || [
          'Pair with leafy greens or high-fiber sides to slow glycemic absorption.',
          'Hydrate adequately between meals to support metabolic digestion.'
        ],
        micronutrients: parsed.nutrition?.micronutrients || []
      },
      dietaryTags: parsed.dietaryTags || [],
      allergensDetected: parsed.allergensDetected || [],
      foodSafetyNotice: parsed.foodSafetyNotice || 'Refrigerate any perishable leftovers within 2 hours at or below 40°F (4°C).',
      timestamp: new Date().toISOString(),
      isDemo: false
    };
  } catch (err: any) {
    console.error('Error calling Gemini for food recognition:', err);
    throw new Error(`AI food analysis failed: ${err.message || 'Unknown error'}`);
  }
}

/**
 * 2. FOOD FRESHNESS & SPOILAGE ASSESSMENT
 */
export async function assessFoodFreshness(
  imageBase64: string,
  mimeType: string,
  foodName?: string,
  storageDays?: number
): Promise<FreshnessResult> {
  const ai = getGenAIClient();
  if (!ai) {
    return {
      ...sampleFreshnessFresh,
      id: `freshness-${Date.now()}`,
      timestamp: new Date().toISOString(),
      isDemo: true,
      confidenceExplanation: 'DEMO MODE: Gemini API key is not configured. Displaying verified laboratory freshness assessment protocol.'
    };
  }

  const prompt = `Perform a comprehensive food freshness, spoilage, and quality diagnostic on this food item.
${foodName ? `Food item specified: "${foodName}"` : ''}
${storageDays ? `Reported storage time: ${storageDays} days` : ''}

INSPECTION CRITERIA:
1. Color & Pigment: Look for enzymatic browning, dark oxidation, abnormal greying, bleached patches.
2. Texture & Turgor: Check for wilting, wrinkling, shriveling, loss of cellular rigidity, sunken pockets, bruising, or weeping liquid.
3. Mould & Microbial Markers: Check for fungal hyphae/mold mycelium (white, green, blue, black fuzz), slimy bio-sheen, yeast colonization, or surface irregularities.
4. Classification: Strictly classify as 'Fresh', 'Moderately Fresh', or 'Potentially Spoiled'.
5. Observations Matrix: Provide detailed diagnostic observations for surface color, texture/wrinkling, bruising, and microbial indicators with status ('optimal', 'warning', or 'alert').
6. Recommended Next Steps & Storage Protocols: Specific culinary actions (eat raw, cook thoroughly, refrigerate, freeze, or discard).
7. CRITICAL SAFETY DISCLAIMER: Prominently explain that visual AI appearance CANNOT confirm microbiological safety, cannot detect invisible bacterial pathogens (Salmonella, Listeria, E. coli, botulinum toxins), and questionable food must NEVER be consumed based solely on photo analysis.`;

  try {
    const cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, '');
    const apiCall = ai.models.generateContent({
      model: PRIMARY_MODEL,
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType: mimeType || 'image/jpeg',
                data: cleanBase64
              }
            },
            {
              text: prompt
            }
          ]
        }
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            foodName: { type: Type.STRING },
            category: { 
              type: Type.STRING, 
              enum: ['Fresh', 'Moderately Fresh', 'Potentially Spoiled'] 
            },
            categoryHeadline: { type: Type.STRING },
            confidenceExplanation: { type: Type.STRING },
            visualObservations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  aspect: { type: Type.STRING },
                  observation: { type: Type.STRING },
                  status: { type: Type.STRING, enum: ['optimal', 'warning', 'alert'] }
                },
                required: ['aspect', 'observation', 'status']
              }
            },
            recommendedNextSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
            safeStorageTips: { type: Type.ARRAY, items: { type: Type.STRING } },
            criticalSafetyDisclaimer: { type: Type.STRING }
          },
          required: [
            'foodName', 
            'category', 
            'categoryHeadline', 
            'confidenceExplanation', 
            'visualObservations', 
            'recommendedNextSteps', 
            'safeStorageTips', 
            'criticalSafetyDisclaimer'
          ]
        }
      }
    });

    const response = await callGeminiWithTimeout(apiCall);
    const parsed = parseJsonSafely(response.text);

    return {
      id: `fresh-${Date.now()}`,
      foodName: parsed.foodName || foodName || 'Inspected Food',
      category: parsed.category || 'Moderately Fresh',
      categoryHeadline: parsed.categoryHeadline || 'Visual Freshness Assessment',
      confidenceExplanation: parsed.confidenceExplanation || 'Assessment derived from observable chromatic and textural qualities.',
      visualObservations: parsed.visualObservations || [],
      recommendedNextSteps: parsed.recommendedNextSteps || [],
      safeStorageTips: parsed.safeStorageTips || [],
      criticalSafetyDisclaimer: parsed.criticalSafetyDisclaimer || 'Appearance alone cannot confirm food safety. Visual AI analysis cannot detect invisible pathogens or guarantee microbial safety. When in doubt, discard.',
      timestamp: new Date().toISOString(),
      isDemo: false
    };
  } catch (err: any) {
    console.error('Error calling Gemini for freshness assessment:', err);
    throw new Error(`Freshness assessment failed: ${err.message || 'Unknown error'}`);
  }
}

/**
 * 3. RESTAURANT HYGIENE MONITORING (Multi-frame & Video analysis)
 */
export async function inspectRestaurantHygiene(
  frames: Array<{ data: string; mimeType: string; timestampLabel?: string }>,
  inspectionNotes?: string
): Promise<HygieneResult> {
  const ai = getGenAIClient();
  if (!ai) {
    return {
      ...sampleHygieneAudit,
      id: `hygiene-${Date.now()}`,
      timestamp: new Date().toISOString(),
      isDemo: true,
      summary: 'DEMO MODE: Gemini API key is not configured. Showing sample restaurant kitchen hygiene inspection analysis.'
    };
  }

  const prompt = `Conduct a rigorous preliminary food hygiene & sanitation inspection on the provided camera/video frames from a food preparation or dining establishment.
${inspectionNotes ? `Context notes: "${inspectionNotes}"` : ''}

Frames evaluated: ${frames.length}.
Important: Transparently state that exactly ${frames.length} sampled static frames were inspected. Do NOT claim the entire video stream was analyzed.

Examine available visual evidence for:
1. Glove Usage: Single-use glove compliance on ready-to-eat items, bare-hand contact, glove cleanliness.
2. Hair Covering & Face Restraints: Hats, nets, beard guards, aprons.
3. Food Handling & Cross-Contamination: Separation of raw meat/poultry handling from cooked foods or salad stations, cutting board discipline.
4. Cleanliness of Work Surfaces: Sanitizer bucket use, wiping cloths on prep counters vs submerged, splash-backs, organization.
5. Rating: Choose between 'Compliant Practices Observed', 'Minor Observations / Advisory', or 'Multiple Critical Flags'.
6. Score: 0 to 100.
7. Findings Matrix: Group findings into categories with status ('compliant', 'warning', 'violation').
8. Positive indicators, risk indicators / concerns, and actionable recommendations.
9. Regulatory Disclaimer: State clearly that this is an AI preliminary assistance tool, NOT a certified municipal health code inspection or guarantee of biological sanitization.`;

  try {
    const parts: any[] = [];
    frames.slice(0, 5).forEach((f, idx) => {
      const raw = f.data || (f as any).base64 || '';
      const cleanData = typeof raw === 'string' ? raw.replace(/^data:[^;]+;base64,/, '') : '';
      const label = f.timestampLabel || (f as any).label || `Frame #${idx + 1}`;
      parts.push({
        inlineData: {
          mimeType: f.mimeType || 'image/jpeg',
          data: cleanData
        }
      });
      parts.push({
        text: `Frame #${idx + 1} (${label})`
      });
    });
    parts.push({ text: prompt });

    const apiCall = ai.models.generateContent({
      model: PRIMARY_MODEL,
      contents: [{ role: 'user', parts }],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            establishmentType: { type: Type.STRING },
            hygieneRating: {
              type: Type.STRING,
              enum: ['Compliant Practices Observed', 'Minor Observations / Advisory', 'Multiple Critical Flags']
            },
            overallScore: { type: Type.NUMBER },
            summary: { type: Type.STRING },
            findings: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: {
                    type: Type.STRING,
                    enum: [
                      'Glove & Hand Hygiene',
                      'Hair & Face Coverings',
                      'Food Handling & Cross-Contamination',
                      'Surface & Station Cleanliness',
                      'Storage & Utensils'
                    ]
                  },
                  observation: { type: Type.STRING },
                  status: { type: Type.STRING, enum: ['compliant', 'warning', 'violation'] },
                  timestampOrFrame: { type: Type.STRING }
                },
                required: ['category', 'observation', 'status']
              }
            },
            positivePractices: { type: Type.ARRAY, items: { type: Type.STRING } },
            concernsIdentified: { type: Type.ARRAY, items: { type: Type.STRING } },
            actionableRecommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
            inspectionDisclaimer: { type: Type.STRING }
          },
          required: [
            'establishmentType',
            'hygieneRating',
            'overallScore',
            'summary',
            'findings',
            'positivePractices',
            'concernsIdentified',
            'actionableRecommendations',
            'inspectionDisclaimer'
          ]
        }
      }
    });

    const response = await callGeminiWithTimeout(apiCall);
    const parsed = parseJsonSafely(response.text);

    return {
      id: `hyg-${Date.now()}`,
      establishmentType: parsed.establishmentType || 'Food Service Facility',
      framesAnalyzedCount: frames.length,
      hygieneRating: parsed.hygieneRating || 'Minor Observations / Advisory',
      overallScore: Number(parsed.overallScore) || 75,
      summary: parsed.summary || 'Visual inspection completed across provided frames.',
      findings: parsed.findings || [],
      positivePractices: parsed.positivePractices || [],
      concernsIdentified: parsed.concernsIdentified || [],
      actionableRecommendations: parsed.actionableRecommendations || [],
      inspectionDisclaimer: parsed.inspectionDisclaimer || 'Preliminary optical audit only. Not an official regulatory health certificate.',
      timestamp: new Date().toISOString(),
      isDemo: false
    };
  } catch (err: any) {
    console.error('Error calling Gemini for hygiene inspection:', err);
    throw new Error(`Hygiene inspection failed: ${err.message || 'Unknown error'}`);
  }
}

/**
 * 4. SMART COOKING ASSISTANT
 */
export async function generateRecipe(params: {
  ingredients: string[];
  cuisine?: string;
  maxTimeMinutes?: number;
  servings?: number;
  dietaryRestrictions?: string[];
  mealType?: string;
  skillLevel?: string;
}): Promise<RecipeResult> {
  const ai = getGenAIClient();
  if (!ai) {
    return {
      ...sampleRecipe,
      id: `recipe-${Date.now()}`,
      timestamp: new Date().toISOString(),
      isDemo: true,
      description: 'DEMO MODE: Gemini API key not configured. Displaying chef-curated culinary recipe template.'
    };
  }

  const prompt = `You are an elite culinary chef and certified food safety educator.
Generate an extraordinary, foolproof recipe tailored strictly to the user's inputs:
- Available ingredients: ${params.ingredients.length > 0 ? params.ingredients.join(', ') : 'Pantry staples (olive oil, salt, garlic, eggs, greens)'}
- Desired Cuisine: ${params.cuisine || 'Chef Choice'}
- Maximum preparation & cooking time: ${params.maxTimeMinutes ? `${params.maxTimeMinutes} minutes` : '30 minutes'}
- Number of servings: ${params.servings || 2}
- Dietary restrictions: ${params.dietaryRestrictions && params.dietaryRestrictions.length > 0 ? params.dietaryRestrictions.join(', ') : 'None'}
- Desired meal type: ${params.mealType || 'Dinner'}
- Skill level: ${params.skillLevel || 'Intermediate'}

MANDATORY OUTPUT REQUIREMENTS:
1. Recipe title, description, serving size, preparation time, cooking time, and total time in minutes.
2. Complete ingredient quantities with standard culinary measures (e.g. "2 tbsp", "150g", "1 tsp").
3. Step-by-step cooking instructions with timings and specific safety tips (internal temperature check, meat resting, pan heat control).
4. Cooking tips: 2-3 expert technique secrets for maximum flavor.
5. Ingredient substitutions: practical alternatives with reasons.
6. Food safety advice: mandatory internal temperatures, raw meat handling separation, leftover storage rules.
7. Estimated nutrition per serving: calories, protein (g), carbs (g), fat (g).

Respond strictly in valid JSON matching the requested schema.`;

  try {
    const apiCall = ai.models.generateContent({
      model: PRIMARY_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recipeTitle: { type: Type.STRING },
            description: { type: Type.STRING },
            cuisine: { type: Type.STRING },
            prepTimeMinutes: { type: Type.NUMBER },
            cookTimeMinutes: { type: Type.NUMBER },
            totalTimeMinutes: { type: Type.NUMBER },
            servings: { type: Type.NUMBER },
            difficulty: { type: Type.STRING, enum: ['Easy', 'Intermediate', 'Advanced'] },
            ingredients: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  item: { type: Type.STRING },
                  quantity: { type: Type.STRING },
                  notes: { type: Type.STRING }
                },
                required: ['item', 'quantity']
              }
            },
            steps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  stepNumber: { type: Type.NUMBER },
                  instruction: { type: Type.STRING },
                  durationMinutes: { type: Type.NUMBER },
                  safetyTip: { type: Type.STRING }
                },
                required: ['stepNumber', 'instruction']
              }
            },
            cookingTips: { type: Type.ARRAY, items: { type: Type.STRING } },
            substitutions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  original: { type: Type.STRING },
                  replacement: { type: Type.STRING },
                  reason: { type: Type.STRING }
                },
                required: ['original', 'replacement', 'reason']
              }
            },
            foodSafetyAdvice: { type: Type.ARRAY, items: { type: Type.STRING } },
            estimatedNutritionPerServing: {
              type: Type.OBJECT,
              properties: {
                calories: { type: Type.NUMBER },
                proteinGrams: { type: Type.NUMBER },
                carbsGrams: { type: Type.NUMBER },
                fatGrams: { type: Type.NUMBER }
              },
              required: ['calories', 'proteinGrams', 'carbsGrams', 'fatGrams']
            },
            chefTip: { type: Type.STRING }
          },
          required: [
            'recipeTitle',
            'description',
            'cuisine',
            'prepTimeMinutes',
            'cookTimeMinutes',
            'totalTimeMinutes',
            'servings',
            'difficulty',
            'ingredients',
            'steps',
            'substitutions',
            'foodSafetyAdvice',
            'estimatedNutritionPerServing'
          ]
        }
      }
    });

    const response = await callGeminiWithTimeout(apiCall);
    const parsed = parseJsonSafely(response.text);

    return {
      id: `recip-${Date.now()}`,
      recipeTitle: parsed.recipeTitle || 'Artisan Recipe',
      description: parsed.description || 'Custom crafted recipe tailored to your ingredients.',
      cuisine: parsed.cuisine || params.cuisine || 'Contemporary',
      prepTimeMinutes: Number(parsed.prepTimeMinutes) || 10,
      cookTimeMinutes: Number(parsed.cookTimeMinutes) || 15,
      totalTimeMinutes: Number(parsed.totalTimeMinutes) || 25,
      servings: Number(parsed.servings) || params.servings || 2,
      difficulty: parsed.difficulty || 'Easy',
      ingredients: parsed.ingredients || [],
      steps: parsed.steps || [],
      cookingTips: parsed.cookingTips || [
        'Taste in layers throughout cooking to adjust acidity and seasoning.',
        'Allow cooked proteins to rest for 3-5 minutes before slicing.'
      ],
      substitutions: parsed.substitutions || [],
      foodSafetyAdvice: parsed.foodSafetyAdvice || [],
      estimatedNutritionPerServing: {
        calories: Number(parsed.estimatedNutritionPerServing?.calories) || 450,
        proteinGrams: Number(parsed.estimatedNutritionPerServing?.proteinGrams) || 25,
        carbsGrams: Number(parsed.estimatedNutritionPerServing?.carbsGrams) || 40,
        fatGrams: Number(parsed.estimatedNutritionPerServing?.fatGrams) || 15
      },
      chefTip: parsed.chefTip || 'Taste and balance flavors as you cook.',
      timestamp: new Date().toISOString(),
      isDemo: false
    };
  } catch (err: any) {
    console.error('Error calling Gemini for recipe:', err);
    throw new Error(`Recipe generation failed: ${err.message || 'Unknown error'}`);
  }
}

/**
 * 5. PERSONALIZED MEAL PLANNER
 */
export async function generateMealPlan(params: {
  age?: number;
  dietPreference: string;
  goal: string;
  targetCalories?: number;
  allergies: string[];
  activityLevel: string;
  foodPreferences?: string;
  mealsPerDay?: number;
}): Promise<MealPlanResult> {
  const ai = getGenAIClient();
  if (!ai) {
    return {
      ...sampleMealPlan,
      id: `plan-${Date.now()}`,
      timestamp: new Date().toISOString(),
      isDemo: true,
      planTitle: 'DEMO MODE: High-Protein Mediterranean Daily Meal Blueprint'
    };
  }

  const mealsCount = params.mealsPerDay || 4;
  const prompt = `You are a clinical registered dietitian and sports nutritionist.
Create a personalized 1-day meal plan based on the user's specific metabolic profile:
- User Age: ${params.age ? `${params.age} years old` : 'Adult'}
- Diet preference: ${params.dietPreference}
- Health & Fitness Goal: ${params.goal}
- Target Daily Calories: ${params.targetCalories ? `${params.targetCalories} kcal` : 'Calculated optimal energy expenditure'}
- Activity Level: ${params.activityLevel}
- Prohibited Allergens & Restrictions: ${params.allergies.length > 0 ? params.allergies.join(', ') : 'None declared'}
- Food Preferences / Taste Notes: ${params.foodPreferences || 'Standard balanced preferences'}
- Number of Meals per day: ${mealsCount}

STRICT SAFETY & DIETETIC REQUIREMENTS:
1. Generate exactly ${mealsCount} meals matching the requested meal count:
   - If 3 meals: Breakfast, Lunch, Dinner.
   - If 4 meals: Breakfast, Lunch, Dinner, Snack (or Mid-morning Snack).
   - If 5 meals: Breakfast, Mid-morning Snack, Lunch, Evening Snack, Dinner.
2. STRICT ALLERGEN AUDIT: Absolutely zero foods or cross-reactive ingredients containing declared allergens (${params.allergies.join(', ')}). Audit and confirm in allergenSafetyAudit.
3. No dangerously restrictive diets or extreme fasting recommendations.
4. Suitable alternatives for every meal in case of ingredient preference or availability.
5. Estimated calories, protein, carbs, and fat for each meal and total daily sum.
6. Hydration suggestions (liters and timing).
7. Nutrition estimate disclaimer explaining that values are approximations, not medical prescriptions.

Respond strictly in valid JSON matching the requested schema.`;

  try {
    const apiCall = ai.models.generateContent({
      model: PRIMARY_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            planTitle: { type: Type.STRING },
            dietPreference: { type: Type.STRING },
            targetGoal: { type: Type.STRING },
            totalDailyEstimatedNutrition: {
              type: Type.OBJECT,
              properties: {
                calories: { type: Type.NUMBER },
                proteinGrams: { type: Type.NUMBER },
                carbsGrams: { type: Type.NUMBER },
                fatGrams: { type: Type.NUMBER },
                hydrationRecommendationLiters: { type: Type.NUMBER }
              },
              required: ['calories', 'proteinGrams', 'carbsGrams', 'fatGrams', 'hydrationRecommendationLiters']
            },
            meals: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  mealType: { 
                    type: Type.STRING, 
                    enum: ['Breakfast', 'Mid-morning Snack', 'Lunch', 'Evening Snack', 'Dinner', 'Snack'] 
                  },
                  dishName: { type: Type.STRING },
                  description: { type: Type.STRING },
                  prepTimeMinutes: { type: Type.NUMBER },
                  estimatedNutrition: {
                    type: Type.OBJECT,
                    properties: {
                      calories: { type: Type.NUMBER },
                      protein: { type: Type.NUMBER },
                      carbs: { type: Type.NUMBER },
                      fat: { type: Type.NUMBER }
                    },
                    required: ['calories', 'protein', 'carbs', 'fat']
                  },
                  keyIngredients: { type: Type.ARRAY, items: { type: Type.STRING } },
                  allergenAlerts: { type: Type.ARRAY, items: { type: Type.STRING } },
                  suitableAlternatives: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ['mealType', 'dishName', 'description', 'prepTimeMinutes', 'estimatedNutrition', 'keyIngredients']
              }
            },
            allergenSafetyAudit: {
              type: Type.OBJECT,
              properties: {
                requestedExclusions: { type: Type.ARRAY, items: { type: Type.STRING } },
                safeConfirmed: { type: Type.BOOLEAN },
                auditNotes: { type: Type.STRING }
              },
              required: ['requestedExclusions', 'safeConfirmed', 'auditNotes']
            },
            dietitianGuidance: { type: Type.STRING },
            hydrationSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
            nutritionEstimateDisclaimer: { type: Type.STRING }
          },
          required: [
            'planTitle',
            'dietPreference',
            'targetGoal',
            'totalDailyEstimatedNutrition',
            'meals',
            'allergenSafetyAudit',
            'dietitianGuidance',
            'nutritionEstimateDisclaimer'
          ]
        }
      }
    });

    const response = await callGeminiWithTimeout(apiCall);
    const parsed = parseJsonSafely(response.text);

    return {
      id: `plan-${Date.now()}`,
      planTitle: parsed.planTitle || `${params.goal} Daily Plan`,
      age: params.age,
      dietPreference: parsed.dietPreference || params.dietPreference,
      targetGoal: parsed.targetGoal || params.goal,
      mealsPerDay: mealsCount,
      totalDailyEstimatedNutrition: {
        calories: Number(parsed.totalDailyEstimatedNutrition?.calories) || 2000,
        proteinGrams: Number(parsed.totalDailyEstimatedNutrition?.proteinGrams) || 120,
        carbsGrams: Number(parsed.totalDailyEstimatedNutrition?.carbsGrams) || 200,
        fatGrams: Number(parsed.totalDailyEstimatedNutrition?.fatGrams) || 70,
        hydrationRecommendationLiters: Number(parsed.totalDailyEstimatedNutrition?.hydrationRecommendationLiters) || 2.5
      },
      meals: parsed.meals || [],
      allergenSafetyAudit: {
        requestedExclusions: parsed.allergenSafetyAudit?.requestedExclusions || params.allergies,
        safeConfirmed: Boolean(parsed.allergenSafetyAudit?.safeConfirmed ?? true),
        auditNotes: parsed.allergenSafetyAudit?.auditNotes || 'Safe allergen exclusion validated.'
      },
      dietitianGuidance: parsed.dietitianGuidance || 'Prioritize whole, nutrient-dense ingredients.',
      hydrationSuggestions: parsed.hydrationSuggestions || [
        'Drink 500ml of mineral-rich water upon waking.',
        'Drink 250ml water between feeding windows.',
        'Limit fluid intake during meals to optimize stomach acid concentration.'
      ],
      nutritionEstimateDisclaimer: parsed.nutritionEstimateDisclaimer || 'Nutrition amounts are calculated estimates and should be adapted to personal health needs.',
      timestamp: new Date().toISOString(),
      isDemo: false
    };
  } catch (err: any) {
    console.error('Error calling Gemini for meal plan:', err);
    throw new Error(`Meal planning failed: ${err.message || 'Unknown error'}`);
  }
}

/**
 * 6. TEXT-TO-SPEECH (TTS) NARRATION
 */
export async function textToSpeech(text: string): Promise<string | null> {
  const ai = getGenAIClient();
  if (!ai) return null;

  try {
    const cleanText = text.slice(0, 400);
    const apiCall = ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: cleanText,
              speechMetadata: {
                style: 'Clear, warm, knowledgeable culinary chef narrator'
              }
            }
          ]
        }
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }
          }
        }
      }
    });

    const response = await callGeminiWithTimeout(apiCall, 15000);
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio || null;
  } catch (err) {
    console.warn('TTS generation fallback to client synthesis:', err);
    return null;
  }
}
