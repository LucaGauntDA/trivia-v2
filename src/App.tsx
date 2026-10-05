/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, History, Home } from 'lucide-react';
import { ConfigScreen } from './components/ConfigScreen.tsx';
import { QuizScreen } from './components/QuizScreen.tsx';
import { ResultScreen } from './components/ResultScreen.tsx';
import { HistoryModal } from './components/HistoryModal.tsx';
import { FormattedQuestion, GameSummary, QuestionResult, QuizConfig } from './types/trivia.ts';
import { CATEGORIES, fetchTriviaQuestions } from './services/opentdb.ts';
import { sound } from './utils/audio.ts';

const LOCAL_STORAGE_KEY = 'trivia_v2_history';
const LOCAL_STORAGE_SOUND = 'trivia_v2_sound';

const DEFAULT_CONFIG: QuizConfig = {
  amount: 10,
  category: 'any',
  difficulty: 'any',
  type: 'any',
  timerSeconds: 0,
  soundEnabled: true,
};

export default function App() {
  const [viewMode, setViewMode] = useState<'config' | 'quiz' | 'result'>('config');
  const [config, setConfig] = useState<QuizConfig>(DEFAULT_CONFIG);
  const [questions, setQuestions] = useState<FormattedQuestion[]>([]);
  const [latestSummary, setLatestSummary] = useState<GameSummary | null>(null);
  const [history, setHistory] = useState<GameSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isNewHighScore, setIsNewHighScore] = useState(false);

  // Load history & sound preference from localStorage on mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }

      const savedSound = localStorage.getItem(LOCAL_STORAGE_SOUND);
      if (savedSound !== null) {
        const soundOn = savedSound === 'true';
        setConfig((prev) => ({ ...prev, soundEnabled: soundOn }));
        sound.setEnabled(soundOn);
      }
    } catch (e) {
      console.warn('LocalStorage could not be loaded:', e);
    }
  }, []);

  const handleToggleSound = () => {
    const nextState = !config.soundEnabled;
    setConfig((prev) => ({ ...prev, soundEnabled: nextState }));
    sound.setEnabled(nextState);
    try {
      localStorage.setItem(LOCAL_STORAGE_SOUND, String(nextState));
    } catch {
      // Ignore
    }
  };

  const handleStartQuiz = async (customConfig?: QuizConfig) => {
    const activeConfig = customConfig || config;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await fetchTriviaQuestions(activeConfig);
      
      if (!result.questions || result.questions.length === 0) {
        setErrorMessage('Keine Fragen für diese Filterkombination gefunden. Bitte wähle eine andere Stufe oder Kategorie.');
        setIsLoading(false);
        return;
      }

      setQuestions(result.questions);
      setViewMode('quiz');

      if (result.message) {
        setErrorMessage(result.message);
      }
    } catch (err) {
      console.error('Fehler beim Starten des Quiz:', err);
      setErrorMessage('Verbindungsfehler beim Laden der Fragen. Bitte versuche es erneut.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuizComplete = (results: QuestionResult[]) => {
    const correctCount = results.filter((r) => r.isCorrect).length;
    const totalScore = results.reduce((acc, curr) => acc + curr.pointsEarned, 0);
    const totalTime = results.reduce((acc, curr) => acc + curr.timeSpentSeconds, 0);
    const avgTime = results.length > 0 ? Math.round((totalTime / results.length) * 10) / 10 : 0;

    const matchedCat = CATEGORIES.find((c) => c.id === config.category);
    const categoryName = matchedCat ? matchedCat.nameDe : 'Alle Kategorien';

    // Calculate max potential score
    const maxScore = results.length * 350;

    const summary: GameSummary = {
      id: `game-${Date.now()}`,
      timestamp: Date.now(),
      config,
      categoryName,
      totalQuestions: results.length,
      correctAnswers: correctCount,
      totalScore,
      maxPossibleScore: maxScore,
      averageTimeSeconds: avgTime,
      questionResults: results,
    };

    // Check if new personal best in category
    const previousRuns = history.filter((h) => h.config.category === config.category);
    const isBest =
      previousRuns.length === 0 ||
      totalScore > Math.max(...previousRuns.map((r) => r.totalScore));

    setIsNewHighScore(isBest);
    setLatestSummary(summary);

    const updatedHistory = [summary, ...history].slice(0, 50);
    setHistory(updatedHistory);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedHistory));
    } catch {
      // Ignore
    }

    setViewMode('result');
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch {
      // Ignore
    }
  };

  return (
    <div className="min-h-screen bg-[#090D16] text-neutral-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Subtle Floating Corner Controls (No Header bar, No logo) */}
      <div className="fixed top-4 right-4 z-40 flex items-center gap-2">
        {viewMode !== 'config' && (
          <button
            onClick={() => {
              sound.playClick();
              if (viewMode === 'quiz') {
                if (window.confirm('Möchtest du zur Konfiguration zurückkehren? Der Fortschritt geht verloren.')) {
                  setViewMode('config');
                }
              } else {
                setViewMode('config');
              }
            }}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-[#090D16]/80 text-neutral-300 backdrop-blur-md transition-all hover:border-white/[0.18] hover:text-white active:scale-95 focus-visible:ring-2 focus-visible:ring-indigo-400"
            title="Zurück zum Start"
            aria-label="Zurück zum Start"
          >
            <Home className="h-4 w-4" />
          </button>
        )}

        <button
          onClick={() => {
            sound.playClick();
            setIsHistoryOpen(true);
          }}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-[#090D16]/80 text-neutral-300 backdrop-blur-md transition-all hover:border-white/[0.18] hover:text-white active:scale-95 focus-visible:ring-2 focus-visible:ring-indigo-400"
          title="Verlauf & Highscores"
          aria-label="Quiz-Verlauf und Highscores ansehen"
        >
          <History className="h-4 w-4" />
        </button>

        <button
          onClick={() => {
            sound.playClick();
            handleToggleSound();
          }}
          className={`flex h-10 w-10 items-center justify-center rounded-xl border backdrop-blur-md transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-indigo-400 ${
            config.soundEnabled
              ? 'border-indigo-500/30 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20'
              : 'border-white/[0.08] bg-[#090D16]/80 text-neutral-500 hover:border-white/[0.18] hover:text-neutral-300'
          }`}
          title={config.soundEnabled ? 'Ton stummschalten' : 'Ton aktivieren'}
          aria-label={config.soundEnabled ? 'Ton stummschalten' : 'Ton aktivieren'}
        >
          {config.soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </button>
      </div>

      {/* Main Content Areas */}
      <main className="flex-1 flex flex-col">
        {viewMode === 'config' && (
          <ConfigScreen
            config={config}
            onChangeConfig={setConfig}
            onStartQuiz={() => handleStartQuiz()}
            isLoading={isLoading}
            errorMessage={errorMessage}
          />
        )}

        {viewMode === 'quiz' && questions.length > 0 && (
          <QuizScreen
            questions={questions}
            timerSeconds={config.timerSeconds}
            onComplete={handleQuizComplete}
            onQuit={() => setViewMode('config')}
          />
        )}

        {viewMode === 'result' && latestSummary && (
          <ResultScreen
            summary={latestSummary}
            onPlayAgain={() => handleStartQuiz(latestSummary.config)}
            onNewConfig={() => setViewMode('config')}
            onOpenHistory={() => setIsHistoryOpen(true)}
            isNewHighScore={isNewHighScore}
          />
        )}
      </main>

      {/* History & Highscores Modal */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onClearHistory={handleClearHistory}
      />

      {/* Minimal Footer */}
      <footer className="border-t border-white/[0.04] py-6 text-center text-xs text-neutral-400">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 sm:px-6">
          <p>© Trivia v2 · Open Trivia DB</p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                sound.playClick();
                setIsHistoryOpen(true);
              }}
              className="hover:text-neutral-200 transition-colors"
            >
              Statistiken
            </button>
            <span aria-hidden="true" className="text-neutral-700">·</span>
            <a
              href="https://opentdb.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-neutral-200 transition-colors"
            >
              API Quellseite
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
