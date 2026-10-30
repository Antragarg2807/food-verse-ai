import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Camera, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  AlertCircle, 
  CheckCircle2, 
  ShieldAlert, 
  Info, 
  RefreshCw, 
  Flame, 
  Layers, 
  Tag, 
  Clock, 
  Copy, 
  Check,
  Eye,
  Sliders,
  Scale,
  HeartPulse,
  RotateCcw,
  Utensils
} from 'lucide-react';
import { FoodRecognitionResult, ActiveTab } from '../types/index.ts';
import { recognizeFood, fileToBase64, playTtsNarration, stopSpeech } from '../services/api.ts';

interface FoodRecognitionViewProps {
  onSaveToHistory: (result: FoodRecognitionResult) => void;
  initialResult?: FoodRecognitionResult | null;
  onNavigateToNutrition?: (result: FoodRecognitionResult) => void;
}

const PRESET_SAMPLES = [
  {
    name: 'Avocado Toast & Egg',
    url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=700&q=80',
    notes: 'Artisan multigrain with runny poached egg'
  },
  {
    name: 'Grilled Salmon Salad',
    url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=700&q=80',
    notes: 'Wild Alaskan salmon with mixed greens and lemon vinaigrette'
  },
  {
    name: 'Açai Antioxidant Bowl',
    url: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=700&q=80',
    notes: 'Frozen açai puree with chia, berries, and shredded coconut'
  },
  {
    name: 'Artisan Neapolitan Pizza',
    url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=700&q=80',
    notes: 'Wood-fired crust with San Marzano tomatoes and buffalo mozzarella'
  }
];

export const FoodRecognitionView: React.FC<FoodRecognitionViewProps> = ({
  onSaveToHistory,
  initialResult,
  onNavigateToNutrition
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(initialResult?.imageUrl || null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [userNotes, setUserNotes] = useState<string>('');
  const [portionScale, setPortionScale] = useState<number>(1.0);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FoodRecognitionResult | null>(initialResult || null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);

  // Camera capture modal state
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    // Accept JPG, JPEG, PNG, WEBP
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const hasValidExt = file.name.match(/\.(jpe?g|png|webp)$/i);
    if (!validTypes.includes(file.type) && !hasValidExt) {
      setError('Please upload a valid image file (JPG, JPEG, PNG, or WEBP).');
      return;
    }

    try {
      const { base64, mimeType } = await fileToBase64(file);
      setImagePreview(base64);
      setImageBase64(base64);
      setMimeType(mimeType);
      setResult(null);
    } catch (err: any) {
      setError(err.message || 'Failed to read image file. Please try another image.');
    }
  };

  const resetImage = () => {
    setImagePreview(null);
    setImageBase64(null);
    setResult(null);
    setError(null);
    setUserNotes('');
    stopSpeech();
    setIsSpeaking(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const selectPreset = async (preset: typeof PRESET_SAMPLES[0]) => {
    setImagePreview(preset.url);
    setUserNotes(preset.notes);
    setError(null);
    setResult(null);

    try {
      setLoading(true);
      const resp = await fetch(preset.url);
      const blob = await resp.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImageBase64(base64);
        setMimeType(blob.type || 'image/jpeg');
        setLoading(false);
      };
      reader.readAsDataURL(blob);
    } catch {
      setLoading(false);
      setImageBase64(preset.url);
    }
  };

  const startCamera = async () => {
    setError(null);
    try {
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      setCameraActive(false);
      setError('Camera access denied or unavailable on this device. Please upload an image instead.');
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setImagePreview(dataUrl);
      setImageBase64(dataUrl);
      setMimeType('image/jpeg');
      stopCamera();
      setResult(null);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const runAnalysis = async () => {
    if (!imageBase64 && !imagePreview) {
      setError('Please select or upload a food image first.');
      return;
    }

    setLoading(true);
    setError(null);
    stopSpeech();
    setIsSpeaking(false);

    try {
      const data = await recognizeFood(
        imageBase64 || imagePreview!,
        mimeType,
        userNotes.trim() || undefined
      );
      data.imageUrl = imagePreview || undefined;
      setResult(data);
      onSaveToHistory(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to complete multimodal food recognition.');
    } finally {
      setLoading(false);
    }
  };

  const handleSpeak = async () => {
    if (!result) return;
    if (isSpeaking) {
      stopSpeech();
      setIsSpeaking(false);
      return;
    }

    const narrative = `${result.dishName}. ${result.description || ''}. Estimated at ${Math.round(result.nutrition.calories * portionScale)} calories, ${Math.round(result.nutrition.proteinGrams * portionScale)} grams of protein, and ${Math.round(result.nutrition.carbsGrams * portionScale)} grams of carbohydrates.`;
    setIsSpeaking(true);
    const played = await playTtsNarration(narrative);
    if (!played) setIsSpeaking(false);
  };

  const copyNutritionSummary = () => {
    if (!result) return;
    const text = `Dish: ${result.dishName}\nDescription: ${result.description}\nPortion: ${result.estimatedPortionSize}\nEstimated Calories: ${Math.round(result.nutrition.calories * portionScale)} kcal\nProtein: ${Math.round(result.nutrition.proteinGrams * portionScale)}g | Carbs: ${Math.round(result.nutrition.carbsGrams * portionScale)}g | Fat: ${Math.round(result.nutrition.fatGrams * portionScale)}g\nDietary: ${result.dietaryTags.join(', ')}\nSafety Notice: ${result.foodSafetyNotice}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 pb-16 max-w-6xl mx-auto">
      {/* Header */}
      <div className="border-b border-stone-200/90 pb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              <span>Vision & Multimodal Intelligence</span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-stone-900">
              Food Recognition & Component Detection
            </h1>
            <p className="text-sm text-stone-600 mt-1 max-w-2xl">
              Inspect any food plate or packaging to identify dishes, detect multiple items, 
              quantify ingredients, estimate portion size, and assess nutritional parameters.
            </p>
          </div>

          {result && (
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
                onClick={copyNutritionSummary}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-50"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied' : 'Share'}</span>
              </button>

              {onNavigateToNutrition && (
                <button
                  onClick={() => onNavigateToNutrition(result)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-900 text-white text-xs font-bold hover:bg-emerald-800 transition-colors shadow-2xs"
                >
                  <HeartPulse className="w-4 h-4" />
                  <span>Full Nutrition View</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: Upload & Controls (Left) and Results (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Image Input & Sampling (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-stone-900">
                1. Upload Food Image
              </h3>
              {imagePreview && (
                <button
                  onClick={resetImage}
                  className="text-xs font-bold text-stone-500 hover:text-stone-800 flex items-center gap-1 transition-colors"
                  title="Upload another image"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Upload Another</span>
                </button>
              )}
            </div>

            {/* Camera View Modal */}
            {cameraActive ? (
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-4/3 flex flex-col items-center justify-center">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                <div className="absolute bottom-4 flex items-center gap-3">
                  <button
                    onClick={capturePhoto}
                    className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg"
                  >
                    Snap Photo
                  </button>
                  <button
                    onClick={stopCamera}
                    className="px-4 py-2.5 rounded-full bg-stone-800 hover:bg-stone-700 text-white font-semibold text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : imagePreview ? (
              /* Preview Area */
              <div className="relative rounded-2xl overflow-hidden border border-stone-200 group bg-stone-100">
                <img
                  src={imagePreview}
                  alt="Food plate preview"
                  className="w-full aspect-4/3 object-cover"
                />
                <div className="absolute inset-0 bg-stone-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2.5 rounded-full bg-white text-stone-800 hover:scale-105 transition-transform"
                    title="Change image"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={resetImage}
                    className="p-2.5 rounded-full bg-white text-stone-800 hover:scale-105 transition-transform"
                    title="Upload another image"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
                <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-md bg-stone-900/80 text-white text-[11px] font-medium backdrop-blur-xs">
                  Active Image Preview
                </div>
              </div>
            ) : (
              /* Upload Dropzone */
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-stone-300 hover:border-emerald-600 rounded-2xl p-8 text-center cursor-pointer transition-colors bg-stone-50/50 hover:bg-emerald-50/20 group"
              >
                <div className="w-14 h-14 rounded-full bg-white shadow-xs border border-stone-200 flex items-center justify-center mx-auto text-emerald-800 group-hover:scale-110 transition-transform mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-stone-800">
                  Click or drag food image here
                </p>
                <p className="text-[11px] text-stone-500 mt-1">
                  Supports JPG, JPEG, PNG, and WEBP formats
                </p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* Camera / Upload buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-xs font-bold text-stone-700 transition-colors"
              >
                <Upload className="w-4 h-4 text-emerald-700" />
                <span>Upload File</span>
              </button>

              <button
                onClick={startCamera}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-xs font-bold text-stone-700 transition-colors"
              >
                <Camera className="w-4 h-4 text-amber-600" />
                <span>Webcam Snap</span>
              </button>
            </div>

            {/* Optional Context Notes */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Plating Context / Preparation Notes (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Prepared with olive oil, gluten-free crust..."
                value={userNotes}
                onChange={(e) => setUserNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
            </div>

            {/* Working Analyze Food Action Button (Requirement 1) */}
            <button
              onClick={runAnalysis}
              disabled={loading || (!imageBase64 && !imagePreview)}
              className="w-full py-3.5 px-4 rounded-2xl bg-emerald-900 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-sm transition-all shadow-md shadow-emerald-950/20 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                  <span>Analyzing Food with Gemini AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Analyze Food</span>
                </>
              )}
            </button>

            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Analysis Error:</span>
                  <span>{error}</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick-Pick Sample Images */}
          <div className="bg-stone-100/80 rounded-3xl p-5 border border-stone-200/90 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                Instant Presets (1-Click Test)
              </span>
              <span className="text-[11px] text-stone-500">Curated culinary photos</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {PRESET_SAMPLES.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => selectPreset(preset)}
                  className="flex items-center gap-2.5 p-2 rounded-xl bg-white hover:bg-emerald-50 border border-stone-200/80 hover:border-emerald-300 text-left transition-all group"
                >
                  <img
                    src={preset.url}
                    alt={preset.name}
                    className="w-10 h-10 rounded-lg object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold text-stone-800 group-hover:text-emerald-900 line-clamp-1">
                      {preset.name}
                    </span>
                    <span className="text-[10px] text-stone-400 block line-clamp-1">
                      Select photo
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Analysis Results Display (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {!result && !loading && (
            <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/80 shadow-xs space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto border border-emerald-100">
                <Eye className="w-8 h-8 opacity-80" />
              </div>
              <h3 className="font-serif text-xl font-bold text-stone-800">
                Awaiting Food Plate Image
              </h3>
              <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
                Upload your dish image (JPG, JPEG, PNG, WEBP) or pick any sample preset on the left, 
                then click <strong>Analyze Food</strong> to identify dishes, detect ingredients, and estimate nutritional parameters.
              </p>
            </div>
          )}

          {loading && (
            <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/80 shadow-xs space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto animate-pulse">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-xl font-bold text-stone-900">
                Analyzing Culinary Vision...
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Sampling morphological texture, detecting garnishes, estimating volume, and cross-referencing nutritional database baselines.
              </p>
            </div>
          )}

          {result && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Dish Title, Description, Portion & Confidence Category */}
              <div className="bg-white rounded-3xl p-6 md:p-8 border border-stone-200/90 shadow-xs space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-4">
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                      {result.cuisineOrigin || 'Culinary Origin'}
                    </span>
                    <h2 className="font-serif text-2xl md:text-3xl font-bold text-stone-950 mt-1">
                      {result.dishName}
                    </h2>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {result.preparationStyle}
                    </p>
                  </div>

                  {/* Confidence Badge */}
                  <div className="text-right">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                      result.confidenceCategory === 'High Certainty'
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : result.confidenceCategory === 'Moderate Certainty'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-stone-200 text-stone-800 border border-stone-300'
                    }`}>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{result.confidenceCategory}</span>
                    </span>
                    {result.isDemo && (
                      <span className="block text-[10px] font-bold text-amber-700 mt-1">
                        Demo Mode (Sample Data)
                      </span>
                    )}
                  </div>
                </div>

                {/* Short Description (Requirement 1) */}
                {result.description && (
                  <div className="p-4 rounded-2xl bg-[#FDFCF9] border border-stone-200 text-xs text-stone-700 leading-relaxed">
                    <span className="font-bold text-stone-900 block mb-1">Dish Description:</span>
                    <p>{result.description}</p>
                  </div>
                )}

                {/* Multiple Food Items Detected (Requirement 1) */}
                {result.detectedDishes && result.detectedDishes.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                      Detected Food Components on Plate
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {result.detectedDishes.map((dish, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-800 border border-stone-200"
                        >
                          🍴 {dish}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Estimated Portion Size Badge (Requirement 1) */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs">
                  <span className="font-bold text-stone-800 flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-emerald-800" />
                    Estimated Portion Size:
                  </span>
                  <span className="font-semibold text-stone-700">
                    {result.estimatedPortionSize || 'Standard single serving (~250-300g)'}
                  </span>
                </div>

                {/* Confidence Explanation */}
                <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 text-xs text-stone-600 leading-relaxed">
                  <span className="font-bold text-stone-800">Visual Evidence: </span>
                  {result.confidenceExplanation}
                </div>

                {/* Portion Size Slider */}
                <div className="bg-stone-50/70 p-4 rounded-2xl border border-stone-200 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-stone-800">
                    <span className="flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-emerald-800" />
                      Adjust Portion Size Scale
                    </span>
                    <span className="text-emerald-900 font-extrabold bg-white px-2 py-0.5 rounded-md border border-stone-200">
                      {portionScale === 1.0 ? '1.0x (Standard Plating)' : `${portionScale.toFixed(2)}x Portion`}
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
                  <div className="flex justify-between text-[10px] text-stone-400">
                    <span>Half Serving (0.5x)</span>
                    <span>Standard Plating (1.0x)</span>
                    <span>Large Double (2.0x+)</span>
                  </div>
                </div>

                {/* Macronutrient Cards */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">
                    Estimated Nutrition Breakdown
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-center">
                      <span className="text-[10px] font-bold text-amber-800 uppercase block">Calories</span>
                      <span className="font-serif text-2xl font-bold text-amber-950">
                        {Math.round(result.nutrition.calories * portionScale)}
                      </span>
                      <span className="text-[10px] text-amber-700 block">kcal</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200/90 text-center">
                      <span className="text-[10px] font-bold text-blue-800 uppercase block">Protein</span>
                      <span className="font-serif text-2xl font-bold text-blue-950">
                        {Math.round(result.nutrition.proteinGrams * portionScale)}g
                      </span>
                      <span className="text-[10px] text-blue-700 block">
                        ~{Math.round((result.nutrition.proteinGrams * 4 * portionScale / Math.max(1, result.nutrition.calories * portionScale)) * 100)}% cals
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/90 text-center">
                      <span className="text-[10px] font-bold text-emerald-800 uppercase block">Carbs</span>
                      <span className="font-serif text-2xl font-bold text-emerald-950">
                        {Math.round(result.nutrition.carbsGrams * portionScale)}g
                      </span>
                      <span className="text-[10px] text-emerald-700 block">
                        {result.nutrition.fiberGrams ? `${Math.round(result.nutrition.fiberGrams * portionScale)}g fiber` : 'Carbohydrate'}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-stone-100 border border-stone-300 text-center">
                      <span className="text-[10px] font-bold text-stone-700 uppercase block">Fat</span>
                      <span className="font-serif text-2xl font-bold text-stone-900">
                        {Math.round(result.nutrition.fatGrams * portionScale)}g
                      </span>
                      <span className="text-[10px] text-stone-500 block">
                        {result.nutrition.sodiumMg ? `${Math.round(result.nutrition.sodiumMg * portionScale)}mg Na` : 'Lipids'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Nutrition Summary & Distinct Database Caveat */}
                <div className="space-y-3 pt-2">
                  <div className="p-4 rounded-2xl bg-white border border-stone-200 space-y-1.5">
                    <span className="text-xs font-bold text-stone-800 block">Nutritional Synthesis</span>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      {result.nutrition.summary}
                    </p>
                  </div>

                  {/* Mandatory Distinction & Portion Caveat */}
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/90 text-[11px] text-stone-600 space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-stone-800">
                      <Info className="w-3.5 h-3.5 text-emerald-800" />
                      <span>Estimate vs Chemical Database Disclosure</span>
                    </div>
                    <p className="leading-relaxed">
                      {result.nutrition.distinctionNote}
                    </p>
                    <p className="text-stone-500 italic">
                      {result.nutrition.portionNote}
                    </p>
                  </div>
                </div>
              </div>

              {/* Detected Ingredients Table */}
              <div className="bg-white rounded-3xl p-6 md:p-8 border border-stone-200/90 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-lg font-bold text-stone-900">
                    Detected Ingredients & Quantities
                  </h3>
                  <span className="text-xs font-semibold text-stone-500">
                    {result.detectedIngredients.length} Items Identified
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-stone-200 text-stone-400 font-bold uppercase tracking-wider">
                        <th className="pb-2.5">Ingredient</th>
                        <th className="pb-2.5">Est. Mass</th>
                        <th className="pb-2.5">Plating Role</th>
                        <th className="pb-2.5">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {result.detectedIngredients.map((ing, i) => (
                        <tr key={i} className="hover:bg-stone-50/60 transition-colors">
                          <td className="py-2.5 font-bold text-stone-800">{ing.name}</td>
                          <td className="py-2.5 text-stone-600">
                            {ing.estimatedGrams ? `~${Math.round(ing.estimatedGrams * portionScale)}g` : '—'}
                          </td>
                          <td className="py-2.5">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-stone-100 text-stone-700">
                              {ing.role}
                            </span>
                          </td>
                          <td className="py-2.5 text-stone-500">{ing.notes || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Allergens & Food Safety Directives */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Allergens & Dietary Tags */}
                <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-xs space-y-3">
                  <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
                    <Tag className="w-4 h-4 text-emerald-800" />
                    <span>Dietary & Allergens</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase text-stone-400 block mb-1">
                      Detected Allergens
                    </span>
                    {result.allergensDetected.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {result.allergensDetected.map((allergen, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200"
                          >
                            ⚠️ {allergen}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-stone-500">No common allergens highlighted.</span>
                    )}
                  </div>

                  <div className="pt-2">
                    <span className="text-[10px] font-bold uppercase text-stone-400 block mb-1">
                      Dietary Tags
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {result.dietaryTags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Food Safety Directive */}
                <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-xs space-y-3">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    <span>Food Safety Directive</span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {result.foodSafetyNotice}
                  </p>
                  <div className="text-[10px] text-stone-400 pt-2 border-t border-stone-100">
                    Always refrigerate leftovers promptly at or below 40°F (4°C) within two hours of cooking.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
