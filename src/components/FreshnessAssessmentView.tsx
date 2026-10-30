import React, { useState, useRef } from 'react';
import { 
  Apple, 
  Upload, 
  Camera, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  ShieldAlert, 
  RefreshCw, 
  Sparkles, 
  Info, 
  Volume2, 
  VolumeX, 
  Calendar, 
  Archive,
  ThermometerSnowflake,
  ExternalLink,
  RotateCcw
} from 'lucide-react';
import { FreshnessResult, FreshnessObservation } from '../types/index.ts';
import { assessFreshness, fileToBase64, playTtsNarration, stopSpeech } from '../services/api.ts';

interface FreshnessAssessmentViewProps {
  onSaveToHistory: (result: FreshnessResult) => void;
  initialResult?: FreshnessResult | null;
}

const FRESHNESS_PRESETS = [
  {
    name: 'Fresh Garden Strawberries',
    url: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=700&q=80',
    foodName: 'Organic Strawberries',
    days: 1
  },
  {
    name: 'Oxidized / Aged Avocado',
    url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=700&q=80',
    foodName: 'Avocado Halves',
    days: 4
  },
  {
    name: 'Crisp Romaine Lettuce',
    url: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?auto=format&fit=crop&w=700&q=80',
    foodName: 'Romaine Lettuce',
    days: 2
  },
  {
    name: 'Overripe Spotted Banana',
    url: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=700&q=80',
    foodName: 'Spotted Cavendish Banana',
    days: 6
  }
];

export const FreshnessAssessmentView: React.FC<FreshnessAssessmentViewProps> = ({
  onSaveToHistory,
  initialResult
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(initialResult?.imageUrl || null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [foodName, setFoodName] = useState<string>('');
  const [storageDays, setStorageDays] = useState<number>(2);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FreshnessResult | null>(initialResult || null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const hasValidExt = file.name.match(/\.(jpe?g|png|webp)$/i);
    if (!validTypes.includes(file.type) && !hasValidExt) {
      setError('Please upload a valid produce image (JPG, JPEG, PNG, or WEBP).');
      return;
    }

    try {
      const { base64, mimeType } = await fileToBase64(file);
      setImagePreview(base64);
      setImageBase64(base64);
      setMimeType(mimeType);
      setResult(null);
    } catch (err: any) {
      setError(err.message || 'Failed to process image file.');
    }
  };

  const resetImage = () => {
    setImagePreview(null);
    setImageBase64(null);
    setResult(null);
    setError(null);
    stopSpeech();
    setIsSpeaking(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const selectPreset = async (preset: typeof FRESHNESS_PRESETS[0]) => {
    setImagePreview(preset.url);
    setFoodName(preset.foodName);
    setStorageDays(preset.days);
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
        video: { facingMode: 'environment', width: { ideal: 1280 } }
      });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch {
      setCameraActive(false);
      setError('Camera access not granted or unavailable.');
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

  const runAssessment = async () => {
    if (!imageBase64 && !imagePreview) {
      setError('Please provide an image of the food item first.');
      return;
    }

    setLoading(true);
    setError(null);
    stopSpeech();
    setIsSpeaking(false);

    try {
      const data = await assessFreshness(
        imageBase64 || imagePreview!,
        mimeType,
        foodName.trim() || undefined,
        storageDays
      );
      data.imageUrl = imagePreview || undefined;
      setResult(data);
      onSaveToHistory(data);
    } catch (err: any) {
      setError(err.message || 'Freshness assessment failed.');
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

    const narrative = `${result.foodName} has been classified as ${result.category}. ${result.categoryHeadline}. ${result.confidenceExplanation}. Safety Notice: ${result.criticalSafetyDisclaimer}`;
    setIsSpeaking(true);
    const played = await playTtsNarration(narrative);
    if (!played) setIsSpeaking(false);
  };

  return (
    <div className="space-y-8 pb-16 max-w-6xl mx-auto">
      {/* Header */}
      <div className="border-b border-stone-200/90 pb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold uppercase tracking-wider mb-2">
              <Apple className="w-3.5 h-3.5 text-amber-700" />
              <span>Microbial & Quality Assessment</span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-stone-900">
              Food Freshness & Spoilage Detection
            </h1>
            <p className="text-sm text-stone-600 mt-1 max-w-2xl">
              Inspect surface color, texture, discoloration, mould-like appearance, bruising, and surface irregularities 
              to classify food as Fresh, Moderately Fresh, or Potentially Spoiled with strict safety guidance.
            </p>
          </div>

          {result && (
            <button
              onClick={handleSpeak}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                isSpeaking
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
              }`}
            >
              {isSpeaking ? <VolumeX className="w-4 h-4 text-amber-600" /> : <Volume2 className="w-4 h-4 text-stone-600" />}
              <span>{isSpeaking ? 'Stop Audio' : 'Listen to Report'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Image & Inputs (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-stone-900">
                1. Inspect Produce or Perishable
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

            {/* Camera View */}
            {cameraActive ? (
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-4/3 flex flex-col items-center justify-center">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                <div className="absolute bottom-4 flex items-center gap-3">
                  <button
                    onClick={capturePhoto}
                    className="px-5 py-2.5 rounded-full bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg"
                  >
                    Snap Photo
                  </button>
                  <button
                    onClick={stopCamera}
                    className="px-4 py-2.5 rounded-full bg-stone-800 text-white font-semibold text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : imagePreview ? (
              <div className="relative rounded-2xl overflow-hidden border border-stone-200 group bg-stone-100">
                <img
                  src={imagePreview}
                  alt="Food freshness target"
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
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-stone-300 hover:border-amber-600 rounded-2xl p-8 text-center cursor-pointer transition-colors bg-stone-50/50 hover:bg-amber-50/20 group"
              >
                <div className="w-14 h-14 rounded-full bg-white shadow-xs border border-stone-200 flex items-center justify-center mx-auto text-amber-700 group-hover:scale-110 transition-transform mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-stone-800">
                  Upload food photo to test freshness
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

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-xs font-bold text-stone-700 transition-colors"
              >
                <Upload className="w-4 h-4 text-emerald-700" />
                <span>Upload Photo</span>
              </button>

              <button
                onClick={startCamera}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-xs font-bold text-stone-700 transition-colors"
              >
                <Camera className="w-4 h-4 text-amber-600" />
                <span>Camera Snap</span>
              </button>
            </div>

            {/* Inputs: Food Name & Days Stored */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Food Item Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Avocado, Berries, Tomato"
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Days in Storage (Optional)
                </label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={storageDays}
                  onChange={(e) => setStorageDays(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-700"
                />
              </div>
            </div>

            {/* Working Analyze Freshness Button (Requirement 3) */}
            <button
              onClick={runAssessment}
              disabled={loading || (!imageBase64 && !imagePreview)}
              className="w-full py-3.5 px-4 rounded-2xl bg-amber-700 hover:bg-amber-800 disabled:opacity-50 text-white font-bold text-sm transition-all shadow-md shadow-amber-900/20 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-200" />
                  <span>Analyzing Freshness with Gemini AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-200" />
                  <span>Analyze Freshness</span>
                </>
              )}
            </button>

            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Assessment Error:</span>
                  <span>{error}</span>
                </div>
              </div>
            )}
          </div>

          {/* Preset Buttons */}
          <div className="bg-stone-100/80 rounded-3xl p-5 border border-stone-200/90 space-y-3">
            <span className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
              Quick Freshness Tests
            </span>

            <div className="grid grid-cols-2 gap-2.5">
              {FRESHNESS_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => selectPreset(preset)}
                  className="flex items-center gap-2.5 p-2 rounded-xl bg-white hover:bg-amber-50 border border-stone-200 hover:border-amber-300 text-left transition-all group"
                >
                  <img
                    src={preset.url}
                    alt={preset.name}
                    className="w-10 h-10 rounded-lg object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold text-stone-800 group-hover:text-amber-900 line-clamp-1">
                      {preset.name}
                    </span>
                    <span className="text-[10px] text-stone-400 block">
                      {preset.days}d stored
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Assessment Result (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {!result && !loading && (
            <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/80 shadow-xs space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto border border-amber-100">
                <Apple className="w-8 h-8 opacity-80" />
              </div>
              <h3 className="font-serif text-xl font-bold text-stone-800">
                Awaiting Produce or Food Item
              </h3>
              <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
                Provide an image to inspect skin wrinkling, discoloration, weeping fluid, 
                and fungal signs. Get clear recommendations on safe refrigeration or discarding.
              </p>
            </div>
          )}

          {loading && (
            <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/80 shadow-xs space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto animate-pulse">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-xl font-bold text-stone-900">
                Scanning Surface Phenotype & Turgor...
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Analyzing RGB hue distribution, surface mycelium indicators, enzymatic oxidation depth, and cellular collapse.
              </p>
            </div>
          )}

          {result && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Category Status Card */}
              <div className="bg-white rounded-3xl p-6 md:p-8 border border-stone-200/90 shadow-xs space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-4">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400 block mb-0.5">
                      Visual Freshness Category
                    </span>
                    <h2 className="font-serif text-2xl md:text-3xl font-bold text-stone-950">
                      {result.foodName}
                    </h2>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {result.categoryHeadline}
                    </p>
                  </div>

                  {/* Classification Badge */}
                  <div>
                    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-extrabold shadow-xs ${
                      result.category === 'Fresh'
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : result.category === 'Moderately Fresh'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-red-100 text-red-900 border border-red-300'
                    }`}>
                      {result.category === 'Fresh' && <CheckCircle2 className="w-5 h-5 text-emerald-700" />}
                      {result.category === 'Moderately Fresh' && <AlertTriangle className="w-5 h-5 text-amber-700" />}
                      {result.category === 'Potentially Spoiled' && <XCircle className="w-5 h-5 text-red-700" />}
                      <span>{result.category}</span>
                    </span>
                  </div>
                </div>

                {/* Technical Observation */}
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/90 text-xs text-stone-700 leading-relaxed">
                  <span className="font-bold text-stone-900">Visual Evidence: </span>
                  {result.confidenceExplanation}
                </div>

                {/* Visual Observations Matrix */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    Surface Diagnostic Observations
                  </h4>
                  <div className="space-y-2">
                    {result.visualObservations.map((obs, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl border border-stone-200 bg-[#FDFCF9] flex items-start justify-between gap-3 text-xs"
                      >
                        <div className="space-y-0.5">
                          <span className="font-bold text-stone-900 block">{obs.aspect}</span>
                          <span className="text-stone-600">{obs.observation}</span>
                        </div>
                        <span className={`shrink-0 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          obs.status === 'optimal'
                            ? 'bg-emerald-100 text-emerald-800'
                            : obs.status === 'warning'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {obs.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CRITICAL SAFETY DISCLAIMER BANNER (MANDATORY REQUIREMENT) */}
                <div className="p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-500/30 text-amber-950 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-xs text-amber-900">
                    <ShieldAlert className="w-4 h-4 text-amber-700" />
                    <span>MANDATORY FOOD SAFETY DIRECTIVE</span>
                  </div>
                  <p className="text-xs text-amber-900/90 leading-relaxed">
                    {result.criticalSafetyDisclaimer}
                  </p>
                  <p className="text-[11px] text-amber-800 font-semibold pt-1">
                    Rule of thumb: "When in doubt, throw it out." Never consume food that produces off-odors, abnormal textures, or slimy biofilms regardless of visual appearance.
                  </p>
                </div>
              </div>

              {/* Recommended Next Steps & Storage Protocols */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-xs space-y-3">
                  <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
                    <Archive className="w-4 h-4 text-emerald-800" />
                    <span>Recommended Action</span>
                  </div>
                  <ul className="space-y-2 text-xs text-stone-600">
                    {result.recommendedNextSteps.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-xs space-y-3">
                  <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
                    <ThermometerSnowflake className="w-4 h-4 text-blue-800" />
                    <span>Optimal Storage Protocol</span>
                  </div>
                  <ul className="space-y-2 text-xs text-stone-600">
                    {result.safeStorageTips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 mt-1.5" />
                        <span>{tip}</span>
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
