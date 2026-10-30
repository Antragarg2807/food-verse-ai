import { 
  FoodRecognitionResult, 
  FreshnessResult, 
  HygieneResult, 
  RecipeResult, 
  MealPlanResult 
} from '../types/index.ts';

const BASE_URL = '/api/food';
const CLIENT_TIMEOUT_MS = 35000;

export interface SystemStatus {
  status: string;
  appName: string;
  version: string;
  aiConfigured: boolean;
  model: string;
  message: string;
}

export async function fetchSystemStatus(): Promise<SystemStatus> {
  try {
    const res = await fetch(`${BASE_URL}/status`, {
      signal: AbortSignal.timeout ? AbortSignal.timeout(8000) : undefined
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Status check fallback:', err);
    return {
      status: 'offline',
      appName: 'Food Verse AI',
      version: '1.1.0',
      aiConfigured: false,
      model: 'demo-sample-mode',
      message: 'Demo mode active. Connect Gemini API to enable live inference.'
    };
  }
}

export async function fetchSampleReports(): Promise<{
  recognition: FoodRecognitionResult;
  freshnessFresh: FreshnessResult;
  freshnessSpoiled: FreshnessResult;
  hygiene: HygieneResult;
  recipe: RecipeResult;
  mealPlan: MealPlanResult;
}> {
  const res = await fetch(`${BASE_URL}/samples`, {
    signal: AbortSignal.timeout ? AbortSignal.timeout(10000) : undefined
  });
  if (!res.ok) throw new Error('Failed to fetch sample reports');
  return await res.json();
}

export async function recognizeFood(
  imageBase64: string,
  mimeType: string,
  userNotes?: string
): Promise<FoodRecognitionResult> {
  const res = await fetch(`${BASE_URL}/recognize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, mimeType, userNotes }),
    signal: AbortSignal.timeout ? AbortSignal.timeout(CLIENT_TIMEOUT_MS) : undefined
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Recognition failed with code ${res.status}`);
  }
  return await res.json();
}

export async function assessFreshness(
  imageBase64: string,
  mimeType: string,
  foodName?: string,
  storageDays?: number
): Promise<FreshnessResult> {
  const res = await fetch(`${BASE_URL}/freshness`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, mimeType, foodName, storageDays }),
    signal: AbortSignal.timeout ? AbortSignal.timeout(CLIENT_TIMEOUT_MS) : undefined
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Freshness assessment failed with code ${res.status}`);
  }
  return await res.json();
}

export async function inspectHygiene(
  frames: Array<{ data: string; mimeType: string; timestampLabel?: string }>,
  inspectionNotes?: string
): Promise<HygieneResult> {
  const res = await fetch(`${BASE_URL}/hygiene`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ frames, inspectionNotes }),
    signal: AbortSignal.timeout ? AbortSignal.timeout(CLIENT_TIMEOUT_MS) : undefined
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Hygiene inspection failed with code ${res.status}`);
  }
  return await res.json();
}

export async function requestRecipe(params: {
  ingredients: string[];
  cuisine?: string;
  maxTimeMinutes?: number;
  servings?: number;
  dietaryRestrictions?: string[];
  mealType?: string;
  skillLevel?: string;
}): Promise<RecipeResult> {
  const res = await fetch(`${BASE_URL}/recipe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
    signal: AbortSignal.timeout ? AbortSignal.timeout(CLIENT_TIMEOUT_MS) : undefined
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Recipe generation failed with code ${res.status}`);
  }
  return await res.json();
}

export async function requestMealPlan(params: {
  age?: number;
  dietPreference: string;
  goal: string;
  targetCalories?: number;
  allergies: string[];
  activityLevel: string;
  foodPreferences?: string;
  mealsPerDay?: number;
}): Promise<MealPlanResult> {
  const res = await fetch(`${BASE_URL}/meal-plan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
    signal: AbortSignal.timeout ? AbortSignal.timeout(CLIENT_TIMEOUT_MS) : undefined
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Meal plan generation failed with code ${res.status}`);
  }
  return await res.json();
}

export async function playTtsNarration(text: string): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
      signal: AbortSignal.timeout ? AbortSignal.timeout(12000) : undefined
    });
    if (res.ok) {
      const data = await res.json();
      if (data.audioBase64) {
        const audio = new Audio(`data:audio/wav;base64,${data.audioBase64}`);
        await audio.play();
        return true;
      }
    }
  } catch (err) {
    console.warn('Server TTS failed, attempting browser speech synthesis fallback:', err);
  }

  // Graceful browser SpeechSynthesis fallback
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
    return true;
  }
  return false;
}

export function stopSpeech(): void {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Extract 3 to 5 evenly spaced frames from an HTML5 video file
 */
export async function extractFramesFromVideo(
  videoFile: File,
  maxFrames = 4
): Promise<Array<{ data: string; mimeType: string; timestampLabel: string }>> {
  return new Promise((resolve, reject) => {
    // Validate file type
    const validVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-m4v'];
    if (!validVideoTypes.includes(videoFile.type) && !videoFile.name.match(/\.(mp4|webm|mov|m4v)$/i)) {
      reject(new Error('Unsupported video format. Please upload MP4, WebM, or MOV video files.'));
      return;
    }

    // Validate size (max 60MB)
    if (videoFile.size > 60 * 1024 * 1024) {
      reject(new Error('Video file exceeds 60MB limit. Please upload a shorter clip or smaller video.'));
      return;
    }

    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;

    const fileUrl = URL.createObjectURL(videoFile);
    video.src = fileUrl;

    const timeoutId = setTimeout(() => {
      URL.revokeObjectURL(fileUrl);
      reject(new Error('Video frame extraction timed out. Please check that video is valid.'));
    }, 20000);

    video.onloadedmetadata = async () => {
      try {
        const duration = video.duration || 1;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          clearTimeout(timeoutId);
          URL.revokeObjectURL(fileUrl);
          reject(new Error('Canvas context unavailable for frame capture'));
          return;
        }

        const scale = Math.min(1, 640 / (video.videoWidth || 640));
        canvas.width = Math.round((video.videoWidth || 640) * scale);
        canvas.height = Math.round((video.videoHeight || 480) * scale);

        const frames: Array<{ data: string; mimeType: string; timestampLabel: string }> = [];
        const step = duration / (maxFrames + 1);

        for (let i = 1; i <= maxFrames; i++) {
          const time = Math.min(duration - 0.1, i * step);
          await new Promise<void>((resSeek) => {
            video.currentTime = time;
            video.onseeked = () => {
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
              const minutes = Math.floor(time / 60);
              const seconds = Math.floor(time % 60);
              const timestampLabel = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
              frames.push({
                data: dataUrl,
                mimeType: 'image/jpeg',
                timestampLabel
              });
              resSeek();
            };
          });
        }

        clearTimeout(timeoutId);
        URL.revokeObjectURL(fileUrl);
        resolve(frames);
      } catch (err) {
        clearTimeout(timeoutId);
        URL.revokeObjectURL(fileUrl);
        reject(err);
      }
    };

    video.onerror = () => {
      clearTimeout(timeoutId);
      URL.revokeObjectURL(fileUrl);
      reject(new Error('Failed to load video file. Please ensure it is an uncorrupted MP4/WebM.'));
    };
  });
}

/**
 * File to Base64 utility with format validation
 */
export function fileToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    // Validate file format: JPG, JPEG, PNG, WEBP, HEIC
    const validImageExtensions = /\.(jpe?g|png|webp|heic)$/i;
    if (!file.type.startsWith('image/') && !validImageExtensions.test(file.name)) {
      reject(new Error('Unsupported file format. Please upload JPG, JPEG, PNG, or WEBP image files.'));
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      reject(new Error('File exceeds 25MB maximum size. Please upload a smaller image.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const mimeType = file.type || 'image/jpeg';
      resolve({ base64: result, mimeType });
    };
    reader.onerror = (err) => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });
}
