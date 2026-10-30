import React from 'react';
import { Sparkles, Shield, Heart, ExternalLink, Info } from 'lucide-react';
import { ActiveTab } from '../types/index.ts';

interface FooterProps {
  setActiveTab: (tab: ActiveTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab }) => {
  return (
    <footer className="mt-auto border-t border-stone-200 bg-[#F3EFE6] text-stone-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-950 flex items-center justify-center text-amber-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-serif text-xl font-bold text-stone-900">
                Food Verse <span className="text-amber-700 font-sans font-extrabold text-sm px-1.5 py-0.5 rounded bg-amber-100">AI</span>
              </span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed max-w-md">
              A multimodal food intelligence platform merging optical dish recognition, macronutrient estimation, 
              spoilage assessment, restaurant hygiene screening, and personalized allergen-verified meal planning.
            </p>
            <p className="text-[11px] text-stone-500 font-medium">
              Tagline: <span className="text-emerald-900 font-bold">Smarter Food. Safer Choices. Healthier Living.</span>
            </p>
          </div>

          {/* Quick Navigation */}
          <div className="space-y-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-900 block">
              Platform Modules
            </span>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button onClick={() => setActiveTab('recognition')} className="hover:text-emerald-900 transition-colors">
                  Food Recognition & Nutrition
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('freshness')} className="hover:text-emerald-900 transition-colors">
                  Freshness & Spoilage Test
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('hygiene')} className="hover:text-emerald-900 transition-colors">
                  Restaurant Hygiene Monitor
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('cooking')} className="hover:text-emerald-900 transition-colors">
                  Smart Cooking Assistant
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('meal-plan')} className="hover:text-emerald-900 transition-colors">
                  Personalized Meal Planner
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('samples')} className="hover:text-emerald-900 transition-colors">
                  Verified Sample Reports
                </button>
              </li>
            </ul>
          </div>

          {/* Critical Food Safety & Legal Limitation Note */}
          <div className="space-y-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-900 block flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-amber-600" />
              Safety & Regulatory Notice
            </span>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              Food Verse AI is an artificial intelligence decision-support tool. Visual inspection 
              cannot verify odorless pathogens (e.g. Salmonella, Listeria) or internal core temperatures. 
              Always observe local health guidelines and consult registered medical professionals for dietetic prescriptions.
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-stone-300/70 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-stone-500">
          <div>
            © {new Date().getFullYear()} Food Verse AI. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span>Powered by Gemini 3.8 Flash Multimodal AI</span>
            <span>•</span>
            <span>Server-Side Secure Architecture</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
