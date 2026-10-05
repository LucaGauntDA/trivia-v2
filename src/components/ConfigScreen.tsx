import React from 'react';
import { Play, AlertCircle, Loader2 } from 'lucide-react';
import { CATEGORIES, CategoryItem } from '../services/opentdb.ts';
import { CategoryIcon } from './CategoryIcon.tsx';
import { Difficulty, QuestionType, QuizConfig } from '../types/trivia.ts';
import { IOSSlider } from './IOSSlider.tsx';
import { sound } from '../utils/audio.ts';

interface ConfigScreenProps {
  config: QuizConfig;
  onChangeConfig: (newConfig: QuizConfig) => void;
  onStartQuiz: () => void;
  isLoading: boolean;
  errorMessage?: string | null;
}

const DIFFICULTY_LEVELS: Difficulty[] = ['any', 'easy', 'medium', 'hard'];
const DIFFICULTY_LABELS = ['Beliebig', 'Leicht', 'Mittel', 'Schwer'];

const QUESTION_TYPES: { id: QuestionType; label: string }[] = [
  { id: 'any', label: 'Beliebig' },
  { id: 'multiple', label: 'Multiple Choice' },
  { id: 'boolean', label: 'Richtig / Falsch' },
];

const TIMER_STEPS = [0, 10, 15, 20, 30, 45, 60];

export const ConfigScreen: React.FC<ConfigScreenProps> = ({
  config,
  onChangeConfig,
  onStartQuiz,
  isLoading,
  errorMessage,
}) => {
  // Map difficulty to slider index 0..3
  const difficultyIndex = DIFFICULTY_LEVELS.indexOf(config.difficulty);
  const safeDifficultyIndex = difficultyIndex >= 0 ? difficultyIndex : 0;

  // Map timerSeconds to index in TIMER_STEPS
  const currentTimerIndex = TIMER_STEPS.indexOf(config.timerSeconds) >= 0
    ? TIMER_STEPS.indexOf(config.timerSeconds)
    : 0;

  const handleDifficultySlider = (val: number) => {
    const idx = Math.round(val);
    const target = DIFFICULTY_LEVELS[idx] || 'any';
    onChangeConfig({ ...config, difficulty: target });
  };

  const handleTimerSlider = (val: number) => {
    const idx = Math.round(val);
    const seconds = TIMER_STEPS[idx] ?? 0;
    onChangeConfig({ ...config, timerSeconds: seconds });
  };

  const formatTimerLabel = (seconds: number) => {
    if (seconds === 0) return 'Ohne Limit';
    return `${seconds} Sek.`;
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 md:py-12">
      {/* Hero: Bold Clean Title, NO logo, NO texts above headline */}
      <div className="text-center mb-10 md:mb-14">
        <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-black tracking-tight text-white mb-3">
          Trivia <span className="text-indigo-400">v2</span>
        </h1>
        <p className="mx-auto max-w-md text-base sm:text-lg text-neutral-400 font-normal">
          Konfiguriere dein Wissensquiz und starte direkt.
        </p>
      </div>

      {/* Error / Notice Banner */}
      {errorMessage && (
        <div className="mb-8 flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-amber-200 text-sm">
          <AlertCircle className="h-5 w-5 shrink-0 text-amber-400 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Configuration Card Container */}
      <div className="space-y-10 rounded-3xl border border-white/[0.08] bg-white/[0.02] p-6 sm:p-8 md:p-10 backdrop-blur-sm">
        
        {/* 1. Anzahl der Fragen - iOS Slider */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white tracking-wide">
              Anzahl der Fragen
            </h2>
            <span className="font-mono text-base font-bold text-indigo-400 tabular-nums">
              {config.amount} Fragen
            </span>
          </div>

          <IOSSlider
            value={config.amount}
            min={5}
            max={30}
            step={1}
            onChange={(val) => onChangeConfig({ ...config, amount: val })}
            ariaLabel="Anzahl der Fragen"
            labels={['5', '10', '15', '20', '25', '30']}
          />
        </section>

        {/* 2. Kategorie - ALL categories as cards like the first 5 */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white tracking-wide">
              Kategorie
            </h2>
            <span className="text-xs text-neutral-400">
              {CATEGORIES.find((c) => c.id === config.category)?.nameDe || 'Alle Kategorien'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {CATEGORIES.map((cat) => {
              const isSelected = config.category === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    onChangeConfig({ ...config, category: cat.id });
                  }}
                  className={`flex min-h-[48px] items-center gap-2.5 rounded-2xl border px-3.5 py-2.5 text-left text-xs font-semibold transition-all duration-150 active:scale-95 focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                      : 'border-white/[0.08] bg-white/[0.03] text-neutral-300 hover:border-white/[0.18] hover:bg-white/[0.06] hover:text-white'
                  }`}
                  aria-pressed={isSelected}
                >
                  <div className={`shrink-0 ${isSelected ? 'text-white' : 'text-neutral-400'}`}>
                    <CategoryIcon name={cat.icon} className="h-4 w-4" />
                  </div>
                  <span className="truncate">{cat.nameDe}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 3. Schwierigkeit - iOS Slider without descriptions */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white tracking-wide">
              Schwierigkeit
            </h2>
            <span className="font-mono text-sm font-bold text-indigo-400">
              {DIFFICULTY_LABELS[safeDifficultyIndex]}
            </span>
          </div>

          <IOSSlider
            value={safeDifficultyIndex}
            min={0}
            max={3}
            step={1}
            onChange={handleDifficultySlider}
            ariaLabel="Schwierigkeit"
            labels={DIFFICULTY_LABELS}
          />
        </section>

        {/* 4. Fragentyp - Clean segmented buttons without descriptions */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white tracking-wide">
              Fragentyp
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {QUESTION_TYPES.map((t) => {
              const isSelected = config.type === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    onChangeConfig({ ...config, type: t.id });
                  }}
                  className={`flex min-h-[48px] items-center justify-center rounded-2xl border px-4 py-2.5 text-center text-sm font-semibold transition-all duration-150 active:scale-95 focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                      : 'border-white/[0.08] bg-white/[0.03] text-neutral-300 hover:border-white/[0.18] hover:bg-white/[0.06] hover:text-white'
                  }`}
                  aria-pressed={isSelected}
                >
                  <span className="whitespace-nowrap">{t.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 5. Zeitlimit pro Frage - iOS Slider */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white tracking-wide">
              Zeitlimit pro Frage
            </h2>
            <span className="font-mono text-sm font-bold text-indigo-400">
              {formatTimerLabel(config.timerSeconds)}
            </span>
          </div>

          <IOSSlider
            value={currentTimerIndex}
            min={0}
            max={TIMER_STEPS.length - 1}
            step={1}
            onChange={handleTimerSlider}
            ariaLabel="Zeitlimit pro Frage"
            labels={TIMER_STEPS.map((s) => (s === 0 ? 'Aus' : `${s}s`))}
          />
        </section>

      </div>

      {/* Start Button */}
      <div className="mt-8 flex justify-center">
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            onStartQuiz();
          }}
          disabled={isLoading}
          className="group relative flex min-h-[58px] w-full max-w-md items-center justify-center gap-3 rounded-2xl bg-indigo-600 px-8 text-base font-bold text-white shadow-xl shadow-indigo-600/25 transition-all duration-200 hover:bg-indigo-500 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-4 focus-visible:ring-indigo-400/40"
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
