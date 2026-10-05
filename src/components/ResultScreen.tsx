import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { RotateCcw, Sliders, Trophy, CheckCircle2, XCircle, ChevronDown, Award, Clock, ArrowRight, Share2, Check } from 'lucide-react';
import { GameSummary, QuestionResult } from '../types/trivia.ts';
import { sound } from '../utils/audio.ts';

interface ResultScreenProps {
  summary: GameSummary;
  onPlayAgain: () => void;
  onNewConfig: () => void;
  onOpenHistory: () => void;
  isNewHighScore?: boolean;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  summary,
  onPlayAgain,
  onNewConfig,
  onOpenHistory,
  isNewHighScore = false,
}) => {
  const [showReview, setShowReview] = useState(false);
  const [copied, setCopied] = useState(false);

  const percentage = Math.round((summary.correctAnswers / summary.totalQuestions) * 100);

  // Trigger celebration effects
  useEffect(() => {
    sound.playFanfare();

    if (percentage >= 60) {
      try {
        confetti({
          particleCount: percentage >= 80 ? 90 : 50,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#6366f1', '#818cf8', '#10b981', '#38bdf8']
        });
      } catch {
        // Ignore canvas confetti in non-browser envs
      }
    }
  }, [percentage]);

  const getRankAssessment = () => {
    if (percentage === 100) return { title: 'Makellose Runde!', desc: 'Perfektes Wissen unter Beweis gestellt.' };
    if (percentage >= 80) return { title: 'Trivia-Meister!', desc: 'Herausragende Trefferquote.' };
    if (percentage >= 60) return { title: 'Starke Leistung!', desc: 'Über dem Durchschnitt geantwortet.' };
    if (percentage >= 40) return { title: 'Guter Versuch!', desc: 'Einige knifflige Fragen waren dabei.' };
    return { title: 'Quiz abgeschlossen', desc: 'Übung macht den Trivia-Meister!' };
  };

  const rank = getRankAssessment();

  const handleShare = () => {
    sound.playClick();
    const shareText = `🎯 Trivia v2 Quiz beendet!\nScore: ${summary.totalScore} Pkt (${summary.correctAnswers}/${summary.totalQuestions} richtig - ${percentage}%)\nKategorie: ${summary.categoryName}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 md:py-14 animate-in fade-in duration-300">
      
      {/* Result Hero Header */}
      <div className="text-center mb-10 md:mb-12">
        <div className="inline-flex items-center gap-2 mb-3 text-xs font-semibold text-indigo-400 uppercase tracking-widest">
          <span>{summary.categoryName}</span>
          <span aria-hidden="true">·</span>
          <span>Stufe: {summary.config.difficulty}</span>
        </div>

        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white mb-3">
          {rank.title}
        </h1>
        <p className="text-base text-neutral-400 font-normal">
          {rank.desc}
        </p>

        {isNewHighScore && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold text-amber-300">
            <Trophy className="h-4 w-4" />
            <span>Neuer persönlicher Highscore in dieser Kategorie!</span>
          </div>
        )}
      </div>

      {/* Main Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-10">
        {/* Total Score */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 text-center">
          <p className="text-xs font-medium text-neutral-400 mb-1">Gesamtpunkte</p>
          <p className="font-display text-3xl sm:text-4xl font-extrabold text-white font-mono tabular-nums">
            {summary.totalScore.toLocaleString()}
          </p>
          <p className="text-[11px] text-neutral-500 mt-1">inkl. Boni & Serie</p>
        </div>

        {/* Correct Answers */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 text-center">
          <p className="text-xs font-medium text-neutral-400 mb-1">Trefferquote</p>
          <p className="font-display text-3xl sm:text-4xl font-extrabold text-indigo-400 font-mono tabular-nums">
            {percentage}%
          </p>
          <p className="text-[11px] text-neutral-400 mt-1">
            <span className="font-semibold text-white font-mono tabular-nums">{summary.correctAnswers}</span> von{' '}
            <span className="font-mono tabular-nums">{summary.totalQuestions}</span> richtig
          </p>
        </div>

        {/* Avg Time */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 text-center">
          <p className="text-xs font-medium text-neutral-400 mb-1">Ø Zeit pro Frage</p>
          <p className="font-display text-3xl sm:text-4xl font-extrabold text-neutral-200 font-mono tabular-nums">
            {summary.averageTimeSeconds}s
          </p>
          <p className="text-[11px] text-neutral-500 mt-1">Reaktionszeit</p>
        </div>
      </div>

      {/* Primary Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            onPlayAgain();
          }}
          className="flex min-h-[52px] w-full sm:w-auto items-center justify-center gap-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/25 transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-indigo-400"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Erneut spielen</span>
        </button>

        <button
          type="button"
          onClick={() => {
            sound.playClick();
            onNewConfig();
          }}
          className="flex min-h-[52px] w-full sm:w-auto items-center justify-center gap-2.5 rounded-2xl border border-white/[0.12] bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/[0.2] px-6 py-3 text-sm font-semibold text-white transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-indigo-400"
        >
          <Sliders className="h-4 w-4 text-neutral-400" />
          <span>Neu konfigurieren</span>
        </button>

        <button
          type="button"
          onClick={handleShare}
          className="flex min-h-[52px] w-full sm:w-auto items-center justify-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] px-5 py-3 text-sm font-medium text-neutral-300 transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-indigo-400"
          title="Ergebnis kopieren"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-emerald-400" />
              <span className="text-emerald-300 text-xs">Kopiert!</span>
            </>
          ) : (
            <>
              <Share2 className="h-4 w-4 text-neutral-400" />
              <span className="text-xs">Teilen</span>
            </>
          )}
        </button>
      </div>

      {/* Detailed Question Review Section */}
      <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6 backdrop-blur-sm">
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            setShowReview(!showReview);
          }}
          className="flex w-full items-center justify-between text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded-xl"
        >
          <div className="flex items-center gap-2.5">
            <span className="text-sm font-bold text-white uppercase tracking-wider">
              Fragen-Rückblick
            </span>
            <span className="text-xs text-neutral-400">
              ({summary.questionResults.length} Fragen überprüft)
            </span>
          </div>
          <ChevronDown
            className={`h-4 w-4 text-neutral-400 transition-transform duration-200 ${
              showReview ? 'rotate-180 text-indigo-400' : ''
            }`}
          />
        </button>

        {showReview && (
          <div className="mt-6 space-y-4 divide-y divide-white/[0.06]">
            {summary.questionResults.map((res, idx) => (
              <div key={idx} className="pt-4 first:pt-0 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5 shrink-0">
                      {res.isCorrect ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <XCircle className="h-4 w-4 text-rose-400" />
                      )}
                    </div>
                    <p className="text-sm font-medium text-white leading-snug">
                      <span className="font-mono text-neutral-500 mr-1.5">{idx + 1}.</span>
                      {res.question.questionText}
                    </p>
                  </div>
                  <div className="shrink-0 text-right text-xs font-mono tabular-nums text-neutral-500">
                    +{res.pointsEarned} Pkt
                  </div>
                </div>

                {/* Answer comparison */}
                <div className="ml-7 space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-500">Deine Antwort:</span>
                    <span
                      className={`font-medium ${
                        res.isCorrect ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {res.userAnswer || 'Keine Antwort (Zeit abgelaufen)'}
                    </span>
                  </div>

                  {!res.isCorrect && (
                    <div className="flex items-center gap-2">
                      <span className="text-neutral-500">Richtige Antwort:</span>
                      <span className="font-semibold text-emerald-400">
                        {res.question.correctAnswer}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
