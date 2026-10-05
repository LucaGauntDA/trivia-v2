import React from 'react';
import { Volume2, VolumeX, History, Sparkles } from 'lucide-react';
import { sound } from '../utils/audio.ts';

interface HeaderProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenHistory: () => void;
  onResetToHome?: () => void;
  gameActive?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  soundEnabled,
  onToggleSound,
  onOpenHistory,
  onResetToHome,
  gameActive = false,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-white/[0.06] bg-[#090D16]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6 md:px-8">
        {/* Zone 1: Single Brand Wordmark */}
        <button
          onClick={() => {
            sound.playClick();
            onResetToHome?.();
          }}
          className="group flex items-center gap-2.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded-lg p-1"
          aria-label="Trivia v2 Home"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-md shadow-indigo-500/20 transition-transform group-hover:scale-105">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight text-white transition-colors group-hover:text-indigo-300">
            Trivia <span className="text-indigo-400 font-extrabold">v2</span>
          </span>
        </button>

        {/* Zone 2: Minimalist Navigation or Context */}
        <div className="hidden sm:flex items-center gap-6 text-xs text-neutral-400 font-medium">
          <span className="transition-colors hover:text-neutral-200">Open Trivia DB</span>
          <span aria-hidden="true" className="text-neutral-600">·</span>
          <span>Echtzeit-Quiz</span>
          {gameActive && (
            <>
              <span aria-hidden="true" className="text-neutral-600">·</span>
              <span className="text-indigo-400">Spiel läuft</span>
            </>
          )}
        </div>

        {/* Zone 3: Interactive Affordances (Sound & History) */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sound.playClick();
              onOpenHistory();
            }}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-neutral-300 transition-all hover:border-white/[0.18] hover:bg-white/[0.07] hover:text-white active:scale-95 focus-visible:ring-2 focus-visible:ring-indigo-400"
            title="Verlauf & Highscores"
            aria-label="Quiz-Verlauf und Highscores ansehen"
          >
            <History className="h-4 w-4" />
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onToggleSound();
            }}
            className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-indigo-400 ${
              soundEnabled
                ? 'border-indigo-500/30 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20'
                : 'border-white/[0.08] bg-white/[0.03] text-neutral-500 hover:border-white/[0.18] hover:text-neutral-300'
            }`}
            title={soundEnabled ? 'Ton stummschalten' : 'Ton aktivieren'}
            aria-label={soundEnabled ? 'Ton stummschalten' : 'Ton aktivieren'}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
