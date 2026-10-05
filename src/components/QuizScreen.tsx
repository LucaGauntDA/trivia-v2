import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FormattedQuestion, QuestionResult } from '../types/trivia.ts';
import { sound } from '../utils/audio.ts';
import { Check, X, ArrowRight, Clock, Award, XCircle, Flame } from 'lucide-react';

interface QuizScreenProps {
  questions: FormattedQuestion[];
  timerSeconds: number; // 0 for no timer
  onComplete: (results: QuestionResult[]) => void;
  onQuit: () => void;
}

const OPTION_KEYS = ['A', 'B', 'C', 'D'];

export const QuizScreen: React.FC<QuizScreenProps> = ({
  questions,
  timerSeconds,
  onComplete,
  onQuit,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [results, setResults] = useState<QuestionResult[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(timerSeconds);
  const [streak, setStreak] = useState(0);
  const [currentScore, setCurrentScore] = useState(0);

  const startTimeRef = useRef<number>(Date.now());
  const timerIntervalRef = useRef<number | null>(null);
  const autoAdvanceTimeoutRef = useRef<number | null>(null);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const progressPercent = ((currentIndex) / totalQuestions) * 100;

  // Clear pending timers on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (autoAdvanceTimeoutRef.current) clearTimeout(autoAdvanceTimeoutRef.current);
    };
  }, []);

  // Initialize timer for each question
  useEffect(() => {
    startTimeRef.current = Date.now();
    setSelectedAnswer(null);
    setIsAnswered(false);

    if (timerSeconds > 0) {
      setTimeLeft(timerSeconds);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

      timerIntervalRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            // Time out!
            handleTimeOut();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [currentIndex, timerSeconds]);

  const handleTimeOut = useCallback(() => {
    if (isAnswered) return;
    setIsAnswered(true);
    sound.playIncorrect();

    const timeSpent = timerSeconds;
    const result: QuestionResult = {
      question: currentQuestion,
      userAnswer: null,
      isCorrect: false,
      timeSpentSeconds: timeSpent,
      pointsEarned: 0,
    };

    setStreak(0);
    setResults((prev) => [...prev, result]);

    // Schedule next
    autoAdvanceTimeoutRef.current = window.setTimeout(() => {
      advanceNextQuestion([...results, result]);
    }, 1800);
  }, [currentQuestion, isAnswered, results, timerSeconds]);

  const handleSelectAnswer = (answer: string) => {
    if (isAnswered) return;

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    setIsAnswered(true);
    setSelectedAnswer(answer);

    const timeSpent = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
    const isCorrect = answer === currentQuestion.correctAnswer;

    let points = 0;
    if (isCorrect) {
      sound.playCorrect();
      // Base points based on difficulty
      const diffMultiplier =
        currentQuestion.difficulty === 'hard' ? 300 :
        currentQuestion.difficulty === 'medium' ? 200 : 100;
      
      // Speed bonus if timer active
      const speedBonus = timerSeconds > 0 ? Math.round((timeLeft / timerSeconds) * 50) : 0;
      // Streak bonus
      const streakBonus = streak * 25;

      points = diffMultiplier + speedBonus + streakBonus;
      setStreak((s) => s + 1);
      setCurrentScore((sc) => sc + points);
    } else {
      sound.playIncorrect();
      setStreak(0);
    }

    const currentResult: QuestionResult = {
      question: currentQuestion,
      userAnswer: answer,
      isCorrect,
      timeSpentSeconds: timeSpent,
      pointsEarned: points,
    };

    const updatedResults = [...results, currentResult];
    setResults(updatedResults);

    // Auto-advance after 1.4s, or player can click "Weiter" immediately
    autoAdvanceTimeoutRef.current = window.setTimeout(() => {
      advanceNextQuestion(updatedResults);
    }, 1400);
  };

  const advanceNextQuestion = (allResults: QuestionResult[]) => {
    if (autoAdvanceTimeoutRef.current) {
      clearTimeout(autoAdvanceTimeoutRef.current);
    }

    if (currentIndex + 1 < totalQuestions) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onComplete(allResults);
    }
  };

  // Keyboard support: 1-4, A-D, Space/Enter for next
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAnswered) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          advanceNextQuestion(results);
        }
        return;
      }

      const key = e.key.toUpperCase();
      if (['1', '2', '3', '4'].includes(e.key)) {
        const idx = parseInt(e.key, 10) - 1;
        if (idx < currentQuestion.answers.length) {
          handleSelectAnswer(currentQuestion.answers[idx]);
        }
      } else if (['A', 'B', 'C', 'D'].includes(key)) {
        const idx = ['A', 'B', 'C', 'D'].indexOf(key);
        if (idx < currentQuestion.answers.length) {
          handleSelectAnswer(currentQuestion.answers[idx]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnswered, currentQuestion, results]);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 md:py-10 flex flex-col min-h-[calc(100vh-5rem)] justify-between">
      
      {/* Top Header Information & Hairline Progress */}
      <div className="space-y-4">
        {/* Progress bar */}
        <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Status Meta Bar */}
        <div className="flex items-center justify-between text-xs sm:text-sm text-neutral-400 font-medium">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">
              Frage <span className="font-mono tabular-nums text-indigo-400">{currentIndex + 1}</span> von{' '}
              <span className="font-mono tabular-nums">{totalQuestions}</span>
            </span>
            <span aria-hidden="true" className="text-neutral-600">·</span>
            <span className="truncate max-w-[140px] sm:max-w-[220px] text-neutral-300">
              {currentQuestion.category}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {streak > 1 && (
              <div className="flex items-center gap-1 text-amber-400 font-semibold animate-pulse">
                <Flame className="h-4 w-4 fill-current" />
                <span className="font-mono tabular-nums">{streak}x</span>
              </div>
            )}

            <div className="flex items-center gap-1 font-mono tabular-nums font-semibold text-indigo-300">
              <span>{currentScore}</span>
              <span className="text-[11px] text-neutral-500 font-sans">Pkt</span>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                if (window.confirm('Möchtest du das Quiz wirklich abbrechen? Dein aktueller Fortschritt geht verloren.')) {
                  onQuit();
                }
              }}
              className="text-neutral-500 hover:text-neutral-300 p-1 rounded transition-colors focus-visible:ring-1 focus-visible:ring-indigo-400"
              title="Quiz abbrechen"
              aria-label="Quiz abbrechen"
            >
              <XCircle className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Optional Timer indicator */}
        {timerSeconds > 0 && (
          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-1.5 text-xs text-neutral-400">
              <Clock className="h-3.5 w-3.5 text-indigo-400" />
              <span>Verbleibende Zeit:</span>
            </div>
            <div
              className={`font-mono text-sm font-bold tabular-nums transition-colors ${
                timeLeft <= 5 ? 'text-rose-400 scale-110 animate-bounce' : 'text-indigo-400'
              }`}
            >
              {timeLeft}s
            </div>
          </div>
        )}
      </div>

      {/* Main Question Display Card */}
      <div className="my-auto py-8 sm:py-12 md:py-14 text-center">
        {/* Subtle difficulty metadata without pill boxes */}
        <div className="mb-4 flex items-center justify-center gap-2 text-xs font-medium text-neutral-500 uppercase tracking-widest">
          <span>Stufe: {currentQuestion.difficulty}</span>
          <span aria-hidden="true">·</span>
          <span>{currentQuestion.type === 'boolean' ? 'Wahr/Falsch' : 'Multiple Choice'}</span>
        </div>

        {/* Big Bold Question Typography */}
        <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white leading-snug sm:leading-tight md:leading-tight max-w-2xl mx-auto px-2">
          {currentQuestion.questionText}
        </h2>
      </div>

      {/* Answer Options Grid */}
      <div className="space-y-3 pb-6">
        <div
          className={`grid gap-3 ${
            currentQuestion.type === 'boolean'
              ? 'grid-cols-1 sm:grid-cols-2'
              : 'grid-cols-1 sm:grid-cols-2'
          }`}
        >
          {currentQuestion.answers.map((answer, idx) => {
            const isSelected = selectedAnswer === answer;
            const isCorrectAnswer = answer === currentQuestion.correctAnswer;
            
            // Visual state calculation
            let buttonStyles = 'border-white/[0.08] bg-white/[0.03] text-neutral-200 hover:border-white/[0.22] hover:bg-white/[0.06] hover:text-white';
            let keyBadgeStyles = 'bg-white/[0.06] text-neutral-400 border-white/[0.08]';
            let iconElement = null;

            if (isAnswered) {
              if (isCorrectAnswer) {
                // Correct answer always highlights green
                buttonStyles = 'border-emerald-500 bg-emerald-600/90 text-white font-semibold shadow-lg shadow-emerald-600/25';
                keyBadgeStyles = 'bg-emerald-700/80 text-white border-emerald-400';
                iconElement = <Check className="h-5 w-5 text-white" />;
              } else if (isSelected && !isCorrectAnswer) {
                // Incorrect chosen answer highlights crimson
                buttonStyles = 'border-rose-500 bg-rose-600/80 text-white font-semibold shadow-lg shadow-rose-600/20';
                keyBadgeStyles = 'bg-rose-700/80 text-white border-rose-400';
                iconElement = <X className="h-5 w-5 text-white" />;
              } else {
                // Other options fade quietly
                buttonStyles = 'border-white/[0.04] bg-white/[0.01] text-neutral-500 opacity-40';
                keyBadgeStyles = 'bg-white/[0.02] text-neutral-600 border-transparent';
              }
            }

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectAnswer(answer)}
                disabled={isAnswered}
                className={`group relative flex min-h-[60px] sm:min-h-[68px] w-full items-center justify-between rounded-2xl border px-5 py-4 text-left transition-all duration-150 active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-indigo-400 ${buttonStyles}`}
              >
                <div className="flex items-center gap-3.5 pr-2">
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border text-xs font-bold transition-colors ${keyBadgeStyles}`}
                  >
                    {OPTION_KEYS[idx] || idx + 1}
                  </span>
                  <span className="text-sm sm:text-base font-medium leading-snug">
                    {answer}
                  </span>
                </div>
                {iconElement && <div className="shrink-0 pl-2">{iconElement}</div>}
              </button>
            );
          })}
        </div>

        {/* Immediate Skip / Advance CTA when answered */}
        {isAnswered && (
          <div className="flex items-center justify-between pt-3 animate-in fade-in duration-200">
            <div className="text-xs text-neutral-400 pl-1">
              {selectedAnswer === currentQuestion.correctAnswer ? (
                <span className="text-emerald-400 font-medium">Richtig beantwortet!</span>
              ) : selectedAnswer === null ? (
                <span className="text-rose-400 font-medium">Zeit abgelaufen!</span>
              ) : (
                <span className="text-neutral-400">
                  Richtige Antwort: <span className="text-emerald-400 font-medium">{currentQuestion.correctAnswer}</span>
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                advanceNextQuestion(results);
              }}
              className="flex items-center gap-2 rounded-xl bg-white/[0.1] hover:bg-white/[0.16] px-4 py-2.5 text-xs sm:text-sm font-semibold text-white transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              <span>{currentIndex + 1 < totalQuestions ? 'Nächste Frage' : 'Zum Ergebnis'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
