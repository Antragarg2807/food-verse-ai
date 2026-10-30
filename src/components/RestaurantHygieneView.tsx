import React, { useState, useRef } from 'react';
import { 
  ShieldCheck, 
  Video, 
  Image as ImageIcon, 
  Upload, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  RefreshCw, 
  Info, 
  Volume2, 
  VolumeX, 
  HelpCircle,
  FileBadge,
  Layers,
  ChevronRight,
  RotateCcw,
  Play
} from 'lucide-react';
import { HygieneResult, HygieneFinding } from '../types/index.ts';
import { inspectHygiene, extractFramesFromVideo, fileToBase64, playTtsNarration, stopSpeech } from '../services/api.ts';

interface RestaurantHygieneViewProps {
  onSaveToHistory: (result: HygieneResult) => void;
  initialResult?: HygieneResult | null;
}

const SAMPLE_KITCHEN_FRAMES = [
  {
    url: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=700&q=80',
    label: 'Frame 1 (Prep Counter)'
  },
  {
    url: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=700&q=80',
    label: 'Frame 2 (Chef Assembly)'
  },
  {
    url: 'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?auto=format&fit=crop&w=700&q=80',
    label: 'Frame 3 (Cooking Station)'
  },
  {
    url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=700&q=80',
    label: 'Frame 4 (Plating Service)'
  }
];

export const RestaurantHygieneView: React.FC<RestaurantHygieneViewProps> = ({
  onSaveToHistory,
  initialResult
}) => {
  const [frames, setFrames] = useState<Array<{ data: string; mimeType: string; timestampLabel?: string }>>([]);
  const [videoFileName, setVideoFileName] = useState<string | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [inspectionNotes, setInspectionNotes] = useState<string>('');
  
  const [isProcessingVideo, setIsProcessingVideo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<HygieneResult | null>(initialResult || null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  const resetMedia = () => {
    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    setVideoPreviewUrl(null);
    setVideoFileName(null);
    setFrames([]);
    setResult(null);
    setError(null);
    setInspectionNotes('');
    stopSpeech();
    setIsSpeaking(false);
    if (videoInputRef.current) videoInputRef.current.value = '';
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setResult(null);

    // Size check (< 60MB)
    if (file.size > 60 * 1024 * 1024) {
      setError('Video file exceeds 60MB limit. Please upload a smaller video or extract shorter clips.');
      return;
    }

    // Format check
    const validExtensions = /\.(mp4|webm|mov|m4v)$/i;
    if (!file.type.startsWith('video/') && !validExtensions.test(file.name)) {
      setError('Unsupported video format. Please upload MP4, WebM, or MOV video files.');
      return;
    }

    setIsProcessingVideo(true);
    setVideoFileName(file.name);
    const blobUrl = URL.createObjectURL(file);
    setVideoPreviewUrl(blobUrl);

    try {
      const extracted = await extractFramesFromVideo(file, 4);
      setFrames(extracted);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Could not extract frames from this video format. Try uploading kitchen photos instead.');
    } finally {
      setIsProcessingVideo(false);
    }
  };

  const handleImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setError(null);
    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    setVideoPreviewUrl(null);
    setVideoFileName(null);
    setResult(null);

    try {
      const loaded: Array<{ data: string; mimeType: string; timestampLabel?: string }> = [];
      const count = Math.min(files.length, 4);
      for (let i = 0; i < count; i++) {
        const { base64, mimeType } = await fileToBase64(files[i]);
        loaded.push({ data: base64, mimeType, timestampLabel: `Photo #${i + 1}` });
      }
      setFrames(loaded);
    } catch (err: any) {
      setError(err.message || 'Failed to load selected kitchen images.');
    }
  };

  const loadSampleKitchen = async () => {
    setError(null);
    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    setVideoPreviewUrl(null);
    setVideoFileName('commercial_kitchen_prep_sample.mp4');
    setInspectionNotes('Fast-casual prep kitchen & sandwich assembly line');
    setResult(null);

    try {
      setLoading(true);
      const converted: Array<{ data: string; mimeType: string; timestampLabel: string }> = [];
      for (const sample of SAMPLE_KITCHEN_FRAMES) {
        const res = await fetch(sample.url);
        const blob = await res.blob();
        await new Promise<void>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            converted.push({
              data: reader.result as string,
              mimeType: blob.type || 'image/jpeg',
              timestampLabel: sample.label
            });
            resolve();
          };
          reader.readAsDataURL(blob);
        });
      }
      setFrames(converted);
    } catch {
      setFrames(SAMPLE_KITCHEN_FRAMES.map((s) => ({ data: s.url, mimeType: 'image/jpeg', timestampLabel: s.label })));
    } finally {
      setLoading(false);
    }
  };

  const runAudit = async () => {
    if (frames.length === 0) {
      setError('Please provide at least 1 kitchen photo or video file to analyze.');
      return;
    }

    setLoading(true);
    setError(null);
    stopSpeech();
    setIsSpeaking(false);

    try {
      const data = await inspectHygiene(frames, inspectionNotes.trim() || undefined);
      data.analyzedFramesPreviews = frames.map((f) => f.data);
      setResult(data);
      onSaveToHistory(data);
    } catch (err: any) {
      setError(err.message || 'Hygiene inspection failed.');
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

    const narrative = `Hygiene Inspection Report for ${result.establishmentType}. Overall rating: ${result.hygieneRating} with score ${result.overallScore} out of 100 based on ${result.framesAnalyzedCount} sampled frames. ${result.summary}`;
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-semibold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
              <span>Multi-Frame Sanitation & Safety</span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-stone-900">
              Restaurant Hygiene Monitor
            </h1>
            <p className="text-sm text-stone-600 mt-1 max-w-2xl">
              Inspect video footage or prep station photos for visible glove use, hair covering / hair-caps, 
              food-handling practices, cleanliness of work surfaces, and raw vs cooked food separation.
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
        {/* Left Column: Input Media (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-stone-900">
                1. Upload Kitchen Media
              </h3>
              {(frames.length > 0 || videoPreviewUrl) && (
                <button
                  onClick={resetMedia}
                  className="text-xs font-bold text-stone-500 hover:text-stone-800 flex items-center gap-1 transition-colors"
                  title="Upload another video or photos"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Upload Another</span>
                </button>
              )}
            </div>

            {/* Video vs Photo Tabs */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => videoInputRef.current?.click()}
                className="flex items-center justify-center gap-2 py-3 px-3 rounded-2xl border-2 border-stone-200 hover:border-blue-700 bg-white hover:bg-blue-50/30 text-xs font-bold text-stone-800 transition-all text-center"
              >
                <Video className="w-4 h-4 text-blue-700" />
                <span>Upload Video</span>
              </button>

              <button
                onClick={() => imageInputRef.current?.click()}
                className="flex items-center justify-center gap-2 py-3 px-3 rounded-2xl border-2 border-stone-200 hover:border-blue-700 bg-white hover:bg-blue-50/30 text-xs font-bold text-stone-800 transition-all text-center"
              >
                <ImageIcon className="w-4 h-4 text-emerald-700" />
                <span>Upload Photos</span>
              </button>
            </div>

            <input
              ref={videoInputRef}
              type="file"
              accept=".mp4,.webm,.mov,video/mp4,video/webm,video/quicktime"
              onChange={handleVideoUpload}
              className="hidden"
            />

            <input
              ref={imageInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              multiple
              onChange={handleImagesUpload}
              className="hidden"
            />

            {/* Video Preview Player if uploaded */}
            {videoPreviewUrl && (
              <div className="rounded-2xl overflow-hidden border border-stone-200 bg-black aspect-16/9">
                <video src={videoPreviewUrl} controls playsInline className="w-full h-full object-contain" />
              </div>
            )}

            {/* Video Processing State */}
            {isProcessingVideo && (
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-center space-y-2">
                <RefreshCw className="w-5 h-5 text-blue-700 animate-spin mx-auto" />
                <p className="text-xs font-bold text-blue-900">
                  Sampling Key Video Frames...
                </p>
                <p className="text-[11px] text-blue-700">
                  Extracting accessible timestamps for computer vision inspection without overflowing model limits.
                </p>
              </div>
            )}

            {/* Frame Gallery Preview */}
            {frames.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-stone-700">
                  <span>{frames.length} Accessible Frames Ready for Analysis</span>
                  {videoFileName && <span className="text-[10px] text-blue-800 font-mono truncate max-w-[140px]">{videoFileName}</span>}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {frames.map((frame, idx) => (
                    <div key={idx} className="relative rounded-xl overflow-hidden aspect-4/3 bg-stone-100 border border-stone-200">
                      <img src={frame.data} alt={`Frame ${idx + 1}`} className="w-full h-full object-cover" />
                      <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-stone-900/80 text-white text-[9px] font-bold">
                        {frame.timestampLabel || `Frame ${idx + 1}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Context Note */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Facility / Station Context (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Prep counter, grill line, sushi bar"
                value={inspectionNotes}
                onChange={(e) => setInspectionNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-blue-700"
              />
            </div>

            {/* Run Audit Button */}
            <button
              onClick={runAudit}
              disabled={loading || frames.length === 0}
              className="w-full py-3.5 px-4 rounded-2xl bg-blue-900 hover:bg-blue-800 disabled:opacity-50 text-white font-bold text-sm transition-all shadow-md shadow-blue-950/20 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                  <span>Inspecting Accessible Frames with Gemini AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Analyze Kitchen Hygiene</span>
                </>
              )}
            </button>

            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Inspection Error:</span>
                  <span>{error}</span>
                </div>
              </div>
            )}
          </div>

          {/* Preset Sample Button */}
          <div className="bg-stone-100/80 rounded-3xl p-5 border border-stone-200/90 space-y-3">
            <span className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
              1-Click Demo Kitchen
            </span>
            <button
              onClick={loadSampleKitchen}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-white hover:bg-blue-50 border border-stone-200 hover:border-blue-300 text-left transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center font-bold text-xs">
                  4F
                </div>
                <div>
                  <span className="text-xs font-bold text-stone-900 block group-hover:text-blue-900">
                    Commercial Prep Line Footage
                  </span>
                  <span className="text-[11px] text-stone-500">
                    4 Sample frames: Gloves, cutting boards, towels
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-blue-700" />
            </button>
          </div>
        </div>

        {/* Right Column: Audit Results (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {!result && !loading && (
            <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/80 shadow-xs space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-800 flex items-center justify-center mx-auto border border-blue-100">
                <ShieldCheck className="w-8 h-8 opacity-80" />
              </div>
              <h3 className="font-serif text-xl font-bold text-stone-800">
                Awaiting Kitchen Media
              </h3>
              <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
                Upload a video clip (MP4, WebM, MOV) or kitchen station photos to inspect visible 
                glove usage, hair restraints, cross-contact hazards, and surface sanitization.
              </p>
            </div>
          )}

          {loading && (
            <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/80 shadow-xs space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-800 flex items-center justify-center mx-auto animate-pulse">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-xl font-bold text-stone-900">
                Auditing Accessible Frames...
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Inspecting glove usage on ready-to-eat items, head restraints, proximity of raw proteins, and sanitizer towel protocols.
              </p>
            </div>
          )}

          {result && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Score & Rating Banner */}
              <div className="bg-white rounded-3xl p-6 md:p-8 border border-stone-200/90 shadow-xs space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-100 pb-4">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-800 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                      {result.establishmentType}
                    </span>
                    <h2 className="font-serif text-2xl md:text-3xl font-bold text-stone-950 mt-1">
                      Visual Hygiene Score: {result.overallScore} / 100
                    </h2>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Based on {result.framesAnalyzedCount} selected static frames
                    </p>
                  </div>

                  <div>
                    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold ${
                      result.hygieneRating === 'Compliant Practices Observed'
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : result.hygieneRating === 'Minor Observations / Advisory'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-red-100 text-red-900 border border-red-300'
                    }`}>
                      {result.hygieneRating === 'Compliant Practices Observed' && <CheckCircle2 className="w-4 h-4 text-emerald-700" />}
                      {result.hygieneRating === 'Minor Observations / Advisory' && <AlertTriangle className="w-4 h-4 text-amber-700" />}
                      {result.hygieneRating === 'Multiple Critical Flags' && <XCircle className="w-4 h-4 text-red-700" />}
                      <span>{result.hygieneRating}</span>
                    </span>
                  </div>
                </div>

                {/* Summary */}
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/90 text-xs text-stone-700 leading-relaxed">
                  <span className="font-bold text-stone-900">Auditor Summary: </span>
                  {result.summary}
                </div>

                {/* Category Findings Matrix */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    Category Breakdown
                  </h4>
                  <div className="space-y-2">
                    {result.findings.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl border border-stone-200 bg-[#FDFCF9] flex items-start justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-stone-900">{item.category}</span>
                            {item.timestampOrFrame && (
                              <span className="text-[10px] text-stone-400 bg-stone-100 px-1.5 py-0.2 rounded font-mono">
                                {item.timestampOrFrame}
                              </span>
                            )}
                          </div>
                          <p className="text-stone-600">{item.observation}</p>
                        </div>
                        <span className={`shrink-0 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          item.status === 'compliant'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status === 'warning'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Positive Practices & Concerns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2 text-xs">
                    <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      Positive Practices Observed
                    </span>
                    <ul className="space-y-1 text-emerald-900">
                      {result.positivePractices.map((pos, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-emerald-700 font-bold">•</span>
                          <span>{pos}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2 text-xs">
                    <span className="font-bold text-amber-950 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-700" />
                      Noted Concerns / Risks
                    </span>
                    <ul className="space-y-1 text-amber-900">
                      {result.concernsIdentified.map((concern, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-amber-700 font-bold">•</span>
                          <span>{concern}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-2 text-xs">
                  <span className="font-bold text-blue-950 block">
                    Actionable Hygiene Recommendations
                  </span>
                  <ul className="space-y-1.5 text-blue-900">
                    {result.actionableRecommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-blue-200 text-blue-900 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Mandatory Disclaimer (Requirement 4) */}
                <div className="p-4 rounded-2xl bg-stone-100 border border-stone-200 text-stone-600 text-[11px] space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-stone-800">
                    <Info className="w-3.5 h-3.5 text-blue-700" />
                    <span>Regulatory & Inspection Limitation Notice</span>
                  </div>
                  <p className="leading-relaxed">
                    {result.inspectionDisclaimer}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
