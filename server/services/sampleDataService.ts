import type { FoodRecognitionResult, FreshnessResult, HygieneResult, RecipeResult, MealPlanResult } from '../../src/types/index.ts';

export const sampleFoodRecognition: FoodRecognitionResult = {
  id: 'sample-rec-1',
  dishName: 'Mediterranean Avocado Toast with Soft-Boiled Egg',
  cuisineOrigin: 'Mediterranean-California Fusion',
  confidenceCategory: 'High Certainty',
  confidenceExplanation: 'Clear visual resolution displaying toasted artisan multigrain sourdough, coarsely crushed Hass avocado, microgreens, crumbled Greek feta, halved heirloom cherry tomatoes, and sliced soft-boiled organic egg.',
  description: 'A vibrant open-faced artisan sandwich featuring mashed ripe Hass avocado on toasted whole-grain sourdough, topped with a jammy soft-boiled egg, sheep milk feta, and antioxidant-rich microgreens.',
  estimatedPortionSize: '1 open-faced slice (~255g total plated mass)',
  detectedDishes: [
    'Mediterranean Avocado Toast',
    'Soft-Boiled Egg with Paprika Garnish',
    'Heirloom Cherry Tomato Micro-Salad'
  ],
  detectedIngredients: [
    { name: 'Multigrain Artisan Sourdough', estimatedGrams: 75, role: 'base', notes: 'Thick toasted slice, high whole-grain content' },
    { name: 'Hass Avocado', estimatedGrams: 60, role: 'primary', notes: 'Coarsely mashed with visible lime juice emulsion' },
    { name: 'Soft-Boiled Egg', estimatedGrams: 50, role: 'primary', notes: 'Visible jammy yolk, cooked ~6.5 minutes' },
    { name: 'Heirloom Cherry Tomatoes', estimatedGrams: 40, role: 'garnish', notes: 'Halved, red and yellow cultivars' },
    { name: 'Crumbled Feta Cheese', estimatedGrams: 15, role: 'garnish', notes: 'Sheep and goat milk blend' },
    { name: 'Radish Microgreens & Chia Seeds', estimatedGrams: 10, role: 'seasoning', notes: 'High micronutrient density' },
    { name: 'Extra Virgin Olive Oil & Red Chili Flakes', estimatedGrams: 5, role: 'sauce', notes: 'Light drizzle finish' }
  ],
  preparationStyle: 'Toasted, fresh assembly with gentle boiling',
  nutrition: {
    calories: 435,
    proteinGrams: 18.5,
    carbsGrams: 36,
    fatGrams: 25.5,
    fiberGrams: 8.2,
    sodiumMg: 490,
    sugarGrams: 3.8,
    healthScore: 92,
    healthScoreBasis: 'High density of heart-healthy monounsaturated oleic fats, low glycemic index whole grains, 8.2g prebiotic fiber (33% DV), and bioavailable choline for cognitive function.',
    summary: 'Exceptional nutritional profile rich in monounsaturated fats (oleic acid), bioavailable choline from egg yolk, complex carbohydrates, and gut-beneficial dietary fiber.',
    distinctionNote: 'These figures represent AI model optical volumetric approximations based on standard restaurant plating. Actual metabolic caloric yield can fluctuate ±15% compared to USDA chemical bomb calorimetry depending on exact bread density and oil measure.',
    portionNote: 'Estimated for 1 single open-faced slice (~255g total plated mass). Adjust slider to scale for personal serving size.',
    recommendations: [
      'Pair with a citrus fruit or green tea to enhance non-heme iron absorption from microgreens.',
      'For athletes requiring higher protein, add a side of wild smoked salmon or hemp seeds (+12g protein).',
      'If managing sodium restrictions, substitute crumbled feta with nutritional yeast or sliced cucumber.'
    ],
    micronutrients: [
      { name: 'Vitamin K', amount: '48 mcg', dailyValuePercentage: 40 },
      { name: 'Folate (B9)', amount: '120 mcg', dailyValuePercentage: 30 },
      { name: 'Potassium', amount: '620 mg', dailyValuePercentage: 18 },
      { name: 'Choline', amount: '147 mg', dailyValuePercentage: 27 },
      { name: 'Vitamin E', amount: '3.1 mg', dailyValuePercentage: 21 }
    ]
  },
  dietaryTags: ['Vegetarian', 'High Fiber', 'Heart-Healthy Fats', 'Pescetarian-Friendly'],
  allergensDetected: ['Eggs', 'Gluten (Wheat)', 'Dairy (Feta)'],
  foodSafetyNotice: 'Soft-boiled eggs with runny or jammy yolks should be prepared using pasteurized eggs if consumed by immunocompromised individuals, pregnant women, or young children.',
  imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80',
  timestamp: new Date().toISOString(),
  isDemo: true
};

export const sampleFreshnessFresh: FreshnessResult = {
  id: 'sample-fresh-1',
  foodName: 'Organic Strawberries (Garden Harvest)',
  category: 'Fresh',
  categoryHeadline: 'Optimal Freshness — High Turgor and Vibrant Pigmentation',
  confidenceExplanation: 'Deep uniform scarlet skin with glossy sheen. Calyx (leaves) are bright green, upright, and firmly attached without dehydration or black stem tips. Seed achenes are firm with zero fungal hyphae or indentation.',
  visualObservations: [
    { aspect: 'Coloration & Surface Lustre', observation: 'Rich carmine red pigment; zero white shoulder or darkening oxidation.', status: 'optimal' },
    { aspect: 'Cellular Turgor & Texture', observation: 'Skin is firm and unwrinkled; no mechanical puncture or leakage observed.', status: 'optimal' },
    { aspect: 'Stem / Calyx Condition', observation: 'Vibrant green leaves with natural moisture retention.', status: 'optimal' },
    { aspect: 'Fungal / Microbial Markers', observation: 'No Botrytis cinerea (gray mold) or watery soft rot detected.', status: 'optimal' }
  ],
  recommendedNextSteps: [
    'Store unwashed in the refrigerator crisper drawer at 32-36°F (0-2°C) inside a breathable or paper-towel lined container.',
    'Wash immediately prior to consumption under cold running water to avoid premature mold activation.',
    'Consume within 4 to 6 days for peak antioxidant polyphenol concentration.'
  ],
  safeStorageTips: [
    'Do not remove green caps before washing, as water enters the fruit core and dilutes flavor while accelerating rot.',
    'A quick 3:1 water-to-white vinegar soak followed by thorough drying can extend shelf-life by 3 days.'
  ],
  criticalSafetyDisclaimer: 'IMPORTANT SAFETY NOTICE: Visual inspection evaluates surface phenotype and visible fungal decay only. It cannot detect microscopic foodborne pathogens (e.g., Norovirus, E. coli, Listeria monocytogenes) or chemical pesticide residue. Always wash produce thoroughly.',
  imageUrl: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=800&q=80',
  timestamp: new Date().toISOString(),
  isDemo: true
};

export const sampleFreshnessSpoiled: FreshnessResult = {
  id: 'sample-fresh-2',
  foodName: 'Aged Avocado Halves with Surface Oxidation',
  category: 'Potentially Spoiled',
  categoryHeadline: 'Significant Enzymatic Browning and Tissue Breakdown',
  confidenceExplanation: 'Widespread melanin polymerization producing deep greyish-brown discoloration across ~70% of the mesocarp. Visible micro-fissuring and sunken flesh indicating structural cellular collapse and advanced enzymatic breakdown.',
  visualObservations: [
    { aspect: 'Pigment & Melanin Accumulation', observation: 'Extensive polyphenol oxidase (PPO) reaction across entire cut face.', status: 'alert' },
    { aspect: 'Flesh Texture & Elasticity', observation: 'Mushy, weeping tissue texture with collapse around seed pit pocket.', status: 'alert' },
    { aspect: 'Rancidity & Lipid Markers', observation: 'Dark stringy vascular bundles visible, typical of oxidized lipid degradation.', status: 'warning' },
    { aspect: 'Fungal Indicators', observation: 'Early translucent sheen suggesting potential anaerobic bacterial or yeast biofilm.', status: 'alert' }
  ],
  recommendedNextSteps: [
    'Discard this portion. Do not attempt to salvage by scraping when discolored depth exceeds 3-4mm or smells rancid/sour.',
    'If discarding, compost the organic matter away from indoor prep counters.',
    'Thoroughly sanitize the storage container and knife used with hot soapy water.'
  ],
  safeStorageTips: [
    'Cut avocado should be stored tightly wrapped in plastic film in contact with the flesh, or with a brush of lemon juice/olive oil inside an airtight container with an onion slice.'
  ],
  criticalSafetyDisclaimer: 'CRITICAL SAFETY DIRECTIVE: Advanced oxidation degrades fatty acids into potentially gastro-irritating rancid peroxides. If off-odors (fermented, sour, or chemical), slimy surface films, or bitter flavors are present, NEVER consume. Appearance alone cannot prove safety.',
  imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
  timestamp: new Date().toISOString(),
  isDemo: true
};

export const sampleHygieneAudit: HygieneResult = {
  id: 'sample-hyg-1',
  establishmentType: 'Commercial Fast-Casual Prep Kitchen & Assembly Line',
  framesAnalyzedCount: 4,
  hygieneRating: 'Minor Observations / Advisory',
  overallScore: 78,
  summary: 'Visual frame inspection shows rigorous PPE compliance (gloves and hair restraints present on all visible staff). One advisory noted regarding proximity of raw poultry handling board to ready-to-eat salad garnish staging area, plus a damp wiping towel resting on the stainless counter.',
  findings: [
    {
      category: 'Glove & Hand Hygiene',
      observation: 'Staff members in frames 1-3 wear blue nitriles. No bare hand contact observed on ready-to-eat wraps.',
      status: 'compliant',
      timestampOrFrame: 'Frame 1 (0:02)'
    },
    {
      category: 'Hair & Face Coverings',
      observation: 'Chefs and line cooks exhibit fitted baseball caps and hairnets tucked behind ears. Beard restraint worn by prep worker.',
      status: 'compliant',
      timestampOrFrame: 'Frame 2 (0:05)'
    },
    {
      category: 'Food Handling & Cross-Contamination',
      observation: 'Cutting boards are color-coded (red for protein, green for produce), but red board is placed within 12 inches of salad station without a physical divider.',
      status: 'warning',
      timestampOrFrame: 'Frame 3 (0:08)'
    },
    {
      category: 'Surface & Station Cleanliness',
      observation: 'Damp non-sanitized cloth left directly on food prep stainless surface rather than submerged in designated sanitizer bucket (quaternary ammonium / chlorine).',
      status: 'warning',
      timestampOrFrame: 'Frame 4 (0:12)'
    }
  ],
  positivePractices: [
    'Consistent single-use disposable glove protocol adhered to by front-line handlers.',
    'Clear physical separation of raw protein utensils from cold service tongs.',
    'Clean stainless steel splash-backs with no visible carbon build-up or grease drip.'
  ],
  concernsIdentified: [
    'Unsubmerged wiping towel on active food prep counter can harbor bacterial growth.',
    'Proximity of raw handling station to open cold garnish pan creates splash risk.'
  ],
  actionableRecommendations: [
    'Store all sanitation towels submerged in a bucket with measured sanitizer solution (200-400 ppm quat) when not in immediate use.',
    'Maintain a minimum 24-inch buffer zone or install acrylic hygiene baffles between raw meat trimming and ready-to-eat stations.',
    'Schedule mandatory 30-minute glove change and handwash intervals for line assemblers.'
  ],
  inspectionDisclaimer: 'LEGAL & HEALTH DISCLAIMER: This automated visual hygiene assessment is a computer-assisted preliminary screening tool based solely on visible static video frames or photographs. It DOES NOT constitute an official regulatory inspection, municipal health code certification, or proof of biological food safety. It cannot evaluate microbial colony counts, internal holding temperatures, or chemical sanitization levels.',
  analyzedFramesPreviews: [
    'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80'
  ],
  timestamp: new Date().toISOString(),
  isDemo: true
};

export const sampleRecipe: RecipeResult = {
  id: 'sample-recip-1',
  recipeTitle: 'Pan-Seared Citrus Herb Salmon with Warm Quinoa & Asparagus',
  description: 'A vibrant, heart-healthy 25-minute dinner balancing omega-3 fatty acids, complex grains, and crisp seasonal greens in a light garlic-lemon pan emulsion.',
  cuisine: 'Mediterranean Modern',
  prepTimeMinutes: 10,
  cookTimeMinutes: 15,
  totalTimeMinutes: 25,
  servings: 2,
  difficulty: 'Easy',
  ingredients: [
    { item: 'Wild Alaskan Salmon Fillets (skin-on)', quantity: '2 x 6oz (340g total)', notes: 'Pat completely dry with paper towels for crisp skin' },
    { item: 'Dry Organic Quinoa', quantity: '3/4 cup (130g)', notes: 'Rinsed in fine-mesh sieve' },
    { item: 'Fresh Asparagus Spears', quantity: '1 bunch (250g)', notes: 'Woody ends snapped off' },
    { item: 'Extra Virgin Olive Oil', quantity: '2 tbsp (30ml)', notes: 'Divided for searing and grain dressing' },
    { item: 'Fresh Lemon Juice & Zest', quantity: '1 whole lemon', notes: 'Zest first, then juice' },
    { item: 'Garlic Cloves', quantity: '3 cloves', notes: 'Thinly sliced' },
    { item: 'Fresh Dill & Flat-Leaf Parsley', quantity: '3 tbsp finely chopped', notes: 'Fresh herbs elevate aroma' },
    { item: 'Sea Salt & Coarse Black Pepper', quantity: 'To taste', notes: 'Season salmon immediately before pan contact' }
  ],
  steps: [
    {
      stepNumber: 1,
      instruction: 'In a small pot, combine rinsed quinoa with 1.5 cups water and a pinch of salt. Bring to a rapid boil, cover with a tight lid, reduce heat to low, and simmer undisturbed for 14 minutes until water is absorbed. Fluff with a fork and fold in lemon zest, 1 tbsp olive oil, and fresh dill.',
      durationMinutes: 14,
      safetyTip: 'Always rinse quinoa to wash away natural saponin, which causes a bitter or soapy taste.'
    },
    {
      stepNumber: 2,
      instruction: 'Pat salmon fillets thoroughly dry on both sides with paper towels. Season generously with sea salt and freshly cracked black pepper. Heat 1 tbsp olive oil in a heavy-bottomed stainless steel or cast-iron skillet over medium-high heat until shimmering (oil should ripple, not smoke).',
      durationMinutes: 3,
      safetyTip: 'Dry skin is the fundamental secret to preventing the fish from sticking to the pan.'
    },
    {
      stepNumber: 3,
      instruction: 'Gently place fillets skin-side down in the hot pan, pressing lightly with a flexible spatula for 10 seconds to ensure even skin contact. Sear undisturbed for 4-5 minutes until skin is golden crisp and sides turn opaque up to 60%. Flip once and cook for another 3 minutes.',
      durationMinutes: 7,
      safetyTip: 'FOOD SAFETY MANDATE: Use an instant-read digital thermometer inserted into the thickest core. The FDA recommends cooking finfish to a minimum internal temperature of 145°F (63°C).'
    },
    {
      stepNumber: 4,
      instruction: 'Push salmon to one side of the skillet and add trimmed asparagus spears and sliced garlic. Sauté for 3-4 minutes until bright emerald and tender-crisp. Drizzle fresh lemon juice over the fish and greens, resting the fish for 2 minutes before plating over warm herb quinoa.',
      durationMinutes: 4,
      safetyTip: 'Never reuse the cutting board or raw packaging plate that held raw salmon without thorough sanitization.'
    }
  ],
  cookingTips: [
    'Skin Dryness: Air-dry skin-on fillets in the refrigerator for 20 minutes before searing to guarantee maximum crunch.',
    'Flake Test: Salmon is done when it yields gently to pressure with a fork and flakes along the white albumin lines.',
    'Herb Infusion: Stir fresh dill and flat-leaf parsley into the warm quinoa at the very end to preserve delicate aromatics.'
  ],
  substitutions: [
    { original: 'Salmon Fillets', replacement: 'Firm Organic Tofu or Steelhead Trout', reason: 'Press tofu dry, season with smoked paprika for vegetarian alternative.' },
    { original: 'Quinoa', replacement: 'Brown Basmati Rice, Farro, or Cauliflower Rice', reason: 'Cauliflower rice drops carbs by 80% for ketogenic adaptation.' },
    { original: 'Asparagus', replacement: 'Broccolini, Green Beans, or Sugar Snap Peas', reason: 'Maintains crisp crunch with matching cook times.' }
  ],
  foodSafetyAdvice: [
    'Cross-Contamination: Dedicate a separate cutting board for raw fish and immediately sanitize prep surfaces.',
    'Internal Temperature: Reach 145°F (63°C) at the thickest section.',
    'Storage of Leftovers: Cool promptly and refrigerate in airtight container within 2 hours; consume within 2 days.'
  ],
  estimatedNutritionPerServing: {
    calories: 520,
    proteinGrams: 42,
    carbsGrams: 38,
    fatGrams: 22
  },
  chefTip: 'For the crispiest skin imaginable, leave salmon uncovered on a paper towel in the fridge for 30 minutes before cooking to air-dry the skin.',
  timestamp: new Date().toISOString(),
  isDemo: true
};

export const sampleMealPlan: MealPlanResult = {
  id: 'sample-plan-1',
  planTitle: 'Clean Fuel & Longevity Balanced Daily Blueprint',
  age: 32,
  dietPreference: 'Mediterranean High-Protein / Gluten-Conscious',
  targetGoal: 'Lean Muscle Preservation & Metabolic Wellness',
  mealsPerDay: 4,
  totalDailyEstimatedNutrition: {
    calories: 2040,
    proteinGrams: 142,
    carbsGrams: 195,
    fatGrams: 76,
    hydrationRecommendationLiters: 2.7
  },
  meals: [
    {
      mealType: 'Breakfast',
      dishName: 'Chia Greek Yogurt Power Parfait with Wild Berries',
      description: 'Creamy high-protein 2% Greek yogurt layered with hydrated chia seeds, crushed walnuts, organic blueberries, and a drizzle of raw thyme honey.',
      prepTimeMinutes: 5,
      estimatedNutrition: { calories: 410, protein: 32, carbs: 42, fat: 14 },
      keyIngredients: ['2% Plain Greek Yogurt', 'Chia Seeds', 'Wild Blueberries', 'Raw Walnuts', 'Raw Honey'],
      allergenAlerts: ['Dairy (Greek Yogurt)', 'Tree Nuts (Walnuts)'],
      suitableAlternatives: ['Substitute Greek yogurt with silk coconut yogurt and walnuts with toasted pumpkin seeds for nut-free/dairy-free.']
    },
    {
      mealType: 'Lunch',
      dishName: 'Charred Chicken & Ancient Grain Harvest Bowl',
      description: 'Oregano-rubbed grilled chicken breast over warm quinoa and roasted sweet potato cubes, dressed with lemon-tahini vinaigrette and baby spinach.',
      prepTimeMinutes: 20,
      estimatedNutrition: { calories: 590, protein: 44, carbs: 58, fat: 21 },
      keyIngredients: ['Free-Range Chicken Breast', 'Tri-Color Quinoa', 'Roasted Sweet Potato', 'Baby Spinach', 'Tahini Lemon Dressing'],
      allergenAlerts: ['Sesame (Tahini)'],
      suitableAlternatives: ['Swap chicken with organic edamame and tempeh for a 100% plant-based version.']
    },
    {
      mealType: 'Dinner',
      dishName: 'Pan-Roasted Wild Cod with Fennel, Olives & Polenta',
      description: 'Flaky Atlantic cod seared with braised fennel bulbs, Kalamata olives, cherry tomatoes, and capers served over creamy organic corn polenta.',
      prepTimeMinutes: 25,
      estimatedNutrition: { calories: 640, protein: 46, carbs: 62, fat: 24 },
      keyIngredients: ['Wild Atlantic Cod', 'Organic Polenta Meal', 'Braised Fennel', 'Kalamata Olives', 'Extra Virgin Olive Oil'],
      allergenAlerts: ['Fish (Cod)'],
      suitableAlternatives: ['Replace cod with grilled Portobello mushroom steaks or organic firm tofu.']
    },
    {
      mealType: 'Snack',
      dishName: 'Apple Slices with Toasted Almond Butter & Dark Cacao Nibs',
      description: 'Crisp Honeycrisp apple wedges paired with single-ingredient stone-ground almond butter and 85% raw antioxidant cacao nibs.',
      prepTimeMinutes: 4,
      estimatedNutrition: { calories: 400, protein: 20, carbs: 33, fat: 17 },
      keyIngredients: ['Honeycrisp Apple', 'Almond Butter', 'Raw Cacao Nibs', 'Sea Salt'],
      allergenAlerts: ['Tree Nuts (Almond Butter)'],
      suitableAlternatives: ['Use sunflower seed butter (SunButter) for a school-safe nut-free snack.']
    }
  ],
  allergenSafetyAudit: {
    requestedExclusions: ['Gluten', 'Artificial Sweeteners'],
    safeConfirmed: true,
    auditNotes: 'All meal components rely on naturally gluten-free grains (Quinoa, Certified Gluten-Free Polenta). No processed wheat or malt derivatives detected.'
  },
  dietitianGuidance: 'Distributes protein evenly across four ingestion windows (32g to 46g per meal), optimizing muscle protein synthesis (MPS) and steady blood glycemic stability throughout waking hours.',
  hydrationSuggestions: [
    'Drink 500ml water upon waking with a pinch of mineral salt or lemon juice.',
    'Maintain a 250ml glass of water or herbal tea between each feeding window.',
    'Avoid consuming large fluid quantities within 15 minutes of heavy meals to optimize gastric enzyme concentration.'
  ],
  nutritionEstimateDisclaimer: 'Nutritional metrics are calculated algorithmic estimates calibrated for standard adult portion weights. Individual metabolic utilization, culinary oil absorption, and raw ingredient variance will alter exact values.',
  timestamp: new Date().toISOString(),
  isDemo: true
};
