import React, { useState } from 'react';
import { Play, Sparkles, Sliders, ChevronDown, Check, Zap, AlertCircle, Loader2 } from 'lucide-react';
import { CATEGORIES, CategoryItem } from '../services/opentdb.ts';
import { CategoryIcon } from './CategoryIcon.tsx';
import { Difficulty, QuestionType, QuizConfig } from '../types/trivia.ts';
import { sound } from '../utils/audio.ts';

interface ConfigScreenProps {
  config: QuizConfig;
  onChangeConfig: (newConfig: QuizConfig) => void;
  onStartQuiz: () => void;
  isLoading: boolean;
  errorMessage?: string | null;
}

const QUESTION_AMOUNTS = [5, 10, 15, 20, 25];

const DIFFICULTIES: { id: Difficulty; label: string; desc: string }[] = [
  { id: 'any', label: 'Beliebig', desc: 'Gemischte Stufen' },
  { id: 'easy', label: 'Leicht', desc: 'Entspanntes Wissen' },
  { id: 'medium', label: 'Mittel', desc: 'Solide Herausforderung' },
  { id: 'hard', label: 'Schwer', desc: 'Echte Expertenfragen' },
];

const QUESTION_TYPES: { id: QuestionType; label: string; desc: string }[] = [
  { id: 'any', label: 'Beliebig', desc: 'Gemischt' },
  { id: 'multiple', label: 'Multiple Choice', desc: '4 Antwortoptionen' },
  { id: 'boolean', label: 'Richtig / Falsch', desc: 'Wahr oder Falsch' },
];

const TIMER_OPTIONS = [
  { seconds: 0, label: 'Ohne Limit', desc: 'Zen Modus' },
  { seconds: 15, label: '15 Sek.', desc: 'Schnelles Tempo' },
  { seconds: 30, label: '30 Sek.', desc: 'Ausgewogen' },
];

export const ConfigScreen: React.FC<ConfigScreenProps> = ({
  config,
  onChangeConfig,
  onStartQuiz,
  isLoading,
  errorMessage,
}) => {
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [searchCategory, setSearchCategory] = useState('');

  const selectedCategoryItem =
    CATEGORIES.find((c) => c.id === config.category) || CATEGORIES[0];

  const filteredCategories = CATEGORIES.filter((c) =>
    c.nameDe.toLowerCase().includes(searchCategory.toLowerCase()) ||
    c.name.toLowerCase().includes(searchCategory.toLowerCase())
  );

  const handleCategorySelect = (item: CategoryItem) => {
    sound.playClick();
    onChangeConfig({ ...config, category: item.id });
    setShowAllCategories(false);
  };

  const handleAmountSelect = (amount: number) => {
    sound.playClick();
    onChangeConfig({ ...config, amount });
  };

  const handleDifficultySelect = (difficulty: Difficulty) => {
    sound.playClick();
    onChangeConfig({ ...config, difficulty });
  };

  const handleTypeSelect = (type: QuestionType) => {
    sound.playClick();
    onChangeConfig({ ...config, type });
  };

  const handleTimerSelect = (timerSeconds: number) => {
    sound.playClick();
    onChangeConfig({ ...config, timerSeconds });
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 md:py-14">
      {/* Hero Title Section with Large Bold Typography */}
      <div className="text-center mb-12 md:mb-16">
        <div className="inline-flex items-center gap-2 mb-4 text-xs font-semibold text-indigo-400 tracking-wider uppercase">
          <span>Version 2.0</span>
          <span aria-hidden="true">·</span>
          <span>Open Trivia Engine</span>
        </div>
        <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-black tracking-tight text-white mb-4">
          Trivia <span className="bg-gradient-to-r from-indigo-400 via-indigo-300 to-indigo-100 bg-clip-text text-transparent">v2</span>
        </h1>
        <p className="mx-auto max-w-lg text-base sm:text-lg text-neutral-400 font-normal leading-relaxed">
          Konfiguriere dein Wissensquiz und starte direkt im minimalistischen Dark Mode.
        </p>
      </div>

      {/* Error / Notice Banner if API was rate-limited or no questions */}
      {errorMessage && (
        <div className="mb-8 flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-amber-200 text-sm">
          <AlertCircle className="h-5 w-5 shrink-0 text-amber-400 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium">{errorMessage}</p>
            <p className="text-xs text-amber-300/80 mt-1">
              Tipp: Wähle „Alle Kategorien“ oder „Beliebig“ für maximale Fragenverfügbarkeit.
            </p>
          </div>
        </div>
      )}

      {/* Configuration Card Container */}
      <div className="space-y-10 rounded-3xl border border-white/[0.08] bg-white/[0.02] p-6 sm:p-8 md:p-10 backdrop-blur-sm">
        
        {/* SECTION 1: Anzahl der Fragen */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold tracking-wide text-neutral-200 uppercase">
              1. Anzahl der Fragen
            </label>
            <span className="text-xs font-mono tabular-nums text-neutral-400">
              {config.amount} Fragen ausgewählt
            </span>
          </div>

          <div className="grid grid-cols-5 gap-2 sm:gap-3">
            {QUESTION_AMOUNTS.map((num) => {
              const isSelected = config.amount === num;
              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleAmountSelect(num)}
                  className={`min-h-[48px] rounded-xl border text-sm font-semibold transition-all duration-150 active:scale-95 focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                      : 'border-white/[0.08] bg-white/[0.03] text-neutral-300 hover:border-white/[0.18] hover:bg-white/[0.06] hover:text-white'
                  }`}
                  aria-pressed={isSelected}
                >
                  {num}
                </button>
              );
            })}
          </div>
        </section>

        {/* SECTION 2: Kategorie */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold tracking-wide text-neutral-200 uppercase">
              2. Kategorie
            </label>
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setShowAllCategories(!showAllCategories);
              }}
              className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-400 rounded"
            >
              {showAllCategories ? 'Weniger anzeigen' : 'Alle 21 Kategorien durchsuchen'}
            </button>
          </div>

          {/* Selected Category Trigger Card */}
          <div
            onClick={() => {
              sound.playClick();
              setShowAllCategories(!showAllCategories);
            }}
            className="group flex min-h-[56px] w-full cursor-pointer items-center justify-between rounded-2xl border border-white/[0.12] bg-white/[0.04] px-4 py-3 transition-all hover:border-indigo-500/40 hover:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-indigo-400"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                setShowAllCategories(!showAllCategories);
              }
            }}
          >
            <div className="flex items-center gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20 transition-colors">
                <CategoryIcon name={selectedCategoryItem.icon} className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  {selectedCategoryItem.nameDe}
                </p>
                <p className="text-xs text-neutral-400">
                  {selectedCategoryItem.name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <span className="hidden sm:inline">Kategorie ändern</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${
                  showAllCategories ? 'rotate-180 text-indigo-400' : ''
                }`}
              />
            </div>
          </div>

          {/* Quick Category Suggestions Pill-Free Bar */}
          {!showAllCategories && (
            <div className="flex flex-wrap gap-2 pt-1">
              {CATEGORIES.slice(0, 5).map((cat) => {
                const isSelected = config.category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategorySelect(cat)}
                    className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-medium transition-all active:scale-95 ${
                      isSelected
                        ? 'border-indigo-500/40 bg-indigo-500/20 text-indigo-200'
                        : 'border-white/[0.06] bg-white/[0.02] text-neutral-400 hover:border-white/[0.14] hover:text-neutral-200'
                    }`}
                  >
                    <CategoryIcon name={cat.icon} className="h-3.5 w-3.5" />
                    <span>{cat.nameDe}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Expandable Category Picker */}
          {showAllCategories && (
            <div className="space-y-3 rounded-2xl border border-white/[0.08] bg-black/40 p-4 animate-in fade-in duration-150">
              <input
                type="text"
                placeholder="Kategorie filtern (z.B. Gaming, Geschichte, Film)..."
                value={searchCategory}
                onChange={(e) => setSearchCategory(e.target.value)}
                className="w-full rounded-xl border border-white/[0.1] bg-white/[0.05] px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />

              <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                {filteredCategories.map((cat) => {
                  const isSelected = config.category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategorySelect(cat)}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs transition-colors ${
                        isSelected
                          ? 'bg-indigo-600/30 text-white font-medium border border-indigo-500/40'
                          : 'text-neutral-300 hover:bg-white/[0.06]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <CategoryIcon name={cat.icon} className="h-4 w-4 text-neutral-400" />
                        <span>{cat.nameDe}</span>
                        <span className="text-neutral-500 text-[11px]">({cat.name})</span>
                      </div>
                      {isSelected && <Check className="h-4 w-4 text-indigo-400" />}
                    </button>
                  );
                })}
                {filteredCategories.length === 0 && (
                  <p className="py-4 text-center text-xs text-neutral-500">
                    Keine Kategorie gefunden.
                  </p>
                )}
              </div>
            </div>
          )}
        </section>

        {/* SECTION 3: Schwierigkeit */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold tracking-wide text-neutral-200 uppercase">
              3. Schwierigkeit
            </label>
            <span className="text-xs text-neutral-400 font-medium">
              {DIFFICULTIES.find((d) => d.id === config.difficulty)?.desc}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {DIFFICULTIES.map((d) => {
              const isSelected = config.difficulty === d.id;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => handleDifficultySelect(d.id)}
                  className={`flex min-h-[52px] flex-col items-center justify-center rounded-2xl border px-3 py-2 text-center transition-all duration-150 active:scale-95 focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                      : 'border-white/[0.08] bg-white/[0.03] text-neutral-300 hover:border-white/[0.18] hover:bg-white/[0.06] hover:text-white'
                  }`}
                  aria-pressed={isSelected}
                >
                  <span className="text-sm font-semibold whitespace-nowrap">{d.label}</span>
                  <span className={`text-[10px] mt-0.5 ${isSelected ? 'text-indigo-200' : 'text-neutral-500'}`}>
                    {d.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* SECTION 4: Fragentyp */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold tracking-wide text-neutral-200 uppercase">
              4. Fragentyp
            </label>
            <span className="text-xs text-neutral-400 font-medium">
              {QUESTION_TYPES.find((t) => t.id === config.type)?.desc}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {QUESTION_TYPES.map((t) => {
              const isSelected = config.type === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleTypeSelect(t.id)}
                  className={`flex min-h-[52px] flex-col items-center justify-center rounded-2xl border px-3 py-2 text-center transition-all duration-150 active:scale-95 focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                      : 'border-white/[0.08] bg-white/[0.03] text-neutral-300 hover:border-white/[0.18] hover:bg-white/[0.06] hover:text-white'
                  }`}
                  aria-pressed={isSelected}
                >
                  <span className="text-sm font-semibold whitespace-nowrap">{t.label}</span>
                  <span className={`text-[10px] mt-0.5 ${isSelected ? 'text-indigo-200' : 'text-neutral-500'}`}>
                    {t.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* SECTION 5: Zeitlimit (Zen vs Timer) */}
        <section className="space-y-4 pt-2 border-t border-white/[0.06]">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold tracking-wide text-neutral-300 uppercase">
              Zeitlimit pro Frage
            </label>
            <span className="text-xs text-neutral-500">Optional</span>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {TIMER_OPTIONS.map((opt) => {
              const isSelected = config.timerSeconds === opt.seconds;
              return (
                <button
                  key={opt.seconds}
                  type="button"
                  onClick={() => handleTimerSelect(opt.seconds)}
                  className={`flex min-h-[46px] items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-all active:scale-95 ${
                    isSelected
                      ? 'border-indigo-500/50 bg-indigo-500/20 text-indigo-200'
                      : 'border-white/[0.06] bg-white/[0.02] text-neutral-400 hover:border-white/[0.14] hover:text-neutral-200'
                  }`}
                >
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </section>

      </div>

      {/* Start Action Button - Prominent, Thumb-Friendly */}
      <div className="mt-8 flex justify-center">
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            onStartQuiz();
          }}
          disabled={isLoading}
          className="group relative flex min-h-[58px] w-full max-w-md items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-indigo-600 px-8 text-base font-bold text-white shadow-xl shadow-indigo-500/25 transition-all duration-200 hover:from-indigo-400 hover:to-indigo-500 hover:shadow-indigo-500/35 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-4 focus-visible:ring-indigo-400/40"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Fragen werden geladen...</span>
            </>
          ) : (
            <>
              <Play className="h-5 w-5 fill-current transition-transform group-hover:scale-110" />
              <span>Quiz starten</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
};
