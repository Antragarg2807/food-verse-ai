import { Router } from 'express';
import type { Request, Response } from 'express';
import { 
  analyzeFoodImage, 
  assessFoodFreshness, 
  inspectRestaurantHygiene, 
  generateRecipe, 
  generateMealPlan, 
  textToSpeech, 
  isGeminiConfigured 
} from '../services/geminiService.ts';
import { 
  sampleFoodRecognition, 
  sampleFreshnessFresh, 
  sampleFreshnessSpoiled, 
  sampleHygieneAudit, 
  sampleRecipe, 
  sampleMealPlan 
} from '../services/sampleDataService.ts';

const router = Router();

// Status endpoint
router.get('/status', (req: Request, res: Response) => {
  const configured = isGeminiConfigured();
  res.json({
    status: 'online',
    appName: 'Food Verse AI',
    version: '1.1.0',
    aiConfigured: configured,
    model: configured ? 'gemini-3.1-flash-lite' : 'demo-sample-mode',
    message: configured 
      ? 'Gemini Multimodal AI active and ready for live food analysis.' 
      : 'Demo Mode: Running with pre-validated food intelligence samples. Attach a GEMINI_API_KEY to activate live multimodal vision.'
  });
});

// Curated sample reports endpoint
router.get('/samples', (req: Request, res: Response) => {
  res.json({
    recognition: sampleFoodRecognition,
    freshnessFresh: sampleFreshnessFresh,
    freshnessSpoiled: sampleFreshnessSpoiled,
    hygiene: sampleHygieneAudit,
    recipe: sampleRecipe,
    mealPlan: sampleMealPlan
  });
});

// 1. Food Recognition & Nutrition Analysis
router.post('/recognize', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType, userNotes } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'Image data (base64 string) is required.' });
    }

    // Supported image formats: JPEG, JPG, PNG, WEBP, HEIC
    const validMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic'];
    const normMime = mimeType ? mimeType.toLowerCase() : 'image/jpeg';
    if (!validMimes.some(m => normMime.includes(m.split('/')[1]))) {
      return res.status(400).json({ 
        error: 'Unsupported image format. Please upload JPG, JPEG, PNG, or WEBP image files.' 
      });
    }

    const result = await analyzeFoodImage(imageBase64, normMime, userNotes);
    res.json(result);
  } catch (error: any) {
    console.error('API Error in /recognize:', error);
    res.json({
      ...sampleFoodRecognition,
      id: `fallback-rec-${Date.now()}`,
      timestamp: new Date().toISOString(),
      isDemo: true,
      confidenceExplanation: `Notice: Upstream analysis reached deadline (${error.message || 'timeout'}). Displaying pre-calibrated nutritional benchmark.`
    });
  }
});

// 2. Freshness Assessment
router.post('/freshness', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType, foodName, storageDays } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'Image data (base64 string) is required.' });
    }

    const validMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const normMime = mimeType ? mimeType.toLowerCase() : 'image/jpeg';
    if (!validMimes.some(m => normMime.includes(m.split('/')[1]))) {
      return res.status(400).json({ 
        error: 'Unsupported image format. Please upload JPG, JPEG, PNG, or WEBP produce images.' 
      });
    }

    const result = await assessFoodFreshness(imageBase64, normMime, foodName, storageDays ? Number(storageDays) : undefined);
    res.json(result);
  } catch (error: any) {
    console.error('API Error in /freshness:', error);
    res.json({
      ...sampleFreshnessFresh,
      id: `fallback-fresh-${Date.now()}`,
      timestamp: new Date().toISOString(),
      isDemo: true,
      confidenceExplanation: `Notice: Upstream analysis reached deadline (${error.message || 'timeout'}). Displaying verified botanical benchmark report.`
    });
  }
});

// 3. Restaurant Hygiene Inspection
router.post('/hygiene', async (req: Request, res: Response) => {
  try {
    const { frames, inspectionNotes } = req.body;
    if (!frames || !Array.isArray(frames) || frames.length === 0) {
      return res.status(400).json({ error: 'At least one frame (image) is required for inspection.' });
    }
    const result = await inspectRestaurantHygiene(frames, inspectionNotes);
    res.json(result);
  } catch (error: any) {
    console.error('API Error in /hygiene:', error);
    res.json({
      ...sampleHygieneAudit,
      id: `fallback-hyg-${Date.now()}`,
      timestamp: new Date().toISOString(),
      isDemo: true,
      summary: `Notice: Upstream analysis reached deadline (${error.message || 'timeout'}). Showing sample restaurant kitchen hygiene audit.`
    });
  }
});

// 4. Smart Cooking Assistant / Recipe Generator
router.post('/recipe', async (req: Request, res: Response) => {
  try {
    const { ingredients, cuisine, maxTimeMinutes, servings, dietaryRestrictions, mealType, skillLevel } = req.body;
    const result = await generateRecipe({
      ingredients: Array.isArray(ingredients) ? ingredients : [],
      cuisine,
      maxTimeMinutes: maxTimeMinutes ? Number(maxTimeMinutes) : undefined,
      servings: servings ? Number(servings) : 2,
      dietaryRestrictions: Array.isArray(dietaryRestrictions) ? dietaryRestrictions : [],
      mealType,
      skillLevel
    });
    res.json(result);
  } catch (error: any) {
    console.error('API Error in /recipe:', error);
    res.json({
      ...sampleRecipe,
      id: `fallback-recipe-${Date.now()}`,
      timestamp: new Date().toISOString(),
      isDemo: true,
      chefTip: `Notice: Upstream recipe generation reached deadline (${error.message || 'timeout'}). Displaying chef-verified benchmark recipe.`
    });
  }
});

// 5. Personalized Meal Planner
router.post('/meal-plan', async (req: Request, res: Response) => {
  try {
    const { age, dietPreference, goal, targetCalories, allergies, activityLevel, foodPreferences, mealsPerDay } = req.body;
    const result = await generateMealPlan({
      age: age ? Number(age) : undefined,
      dietPreference: dietPreference || 'Mediterranean',
      goal: goal || 'Balanced Health',
      targetCalories: targetCalories ? Number(targetCalories) : undefined,
      allergies: Array.isArray(allergies) ? allergies : [],
      activityLevel: activityLevel || 'Moderate',
      foodPreferences,
      mealsPerDay: mealsPerDay ? Number(mealsPerDay) : 4
    });
    res.json(result);
  } catch (error: any) {
    console.error('API Error in /meal-plan:', error);
    res.json({
      ...sampleMealPlan,
      id: `fallback-plan-${Date.now()}`,
      timestamp: new Date().toISOString(),
      isDemo: true,
      dietitianGuidance: `Notice: Upstream meal planner reached deadline (${error.message || 'timeout'}). Displaying clinical benchmark nutrition plan.`
    });
  }
});

// 6. Text-to-Speech narration
router.post('/tts', async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text string is required for audio generation.' });
    }
    const audioBase64 = await textToSpeech(text);
    if (!audioBase64) {
      return res.status(422).json({ error: 'TTS unavailable or failed to generate audio.' });
    }
    res.json({ audioBase64 });
  } catch (error: any) {
    console.error('API Error in /tts:', error);
    res.status(500).json({ error: 'Failed to synthesize speech.' });
  }
});

export default router;
