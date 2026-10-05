import React from 'react';
import { X, Trophy, Trash2, Calendar, Award } from 'lucide-react';
import { GameSummary } from '../types/trivia.ts';
import { sound } from '../utils/audio.ts';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: GameSummary[];
  onClearHistory: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  const totalGames = history.length;
  const highestScore = history.length > 0 ? Math.max(...history.map((h) => h.totalScore)) : 0;

  const formatDate = (timestamp: number) => {
    try {
      const d = new Date(timestamp);
      return d.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="history-modal-title"
    >
      <div className="relative w-full max-w-lg rounded-3xl border border-white/[0.1] bg-[#0E131F] p-6 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
              <Trophy className="h-4 w-4" />
            </div>
            <h2 id="history-modal-title" className="font-display text-lg font-bold text-white">
              Quiz-Verlauf & Highscores
            </h2>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-indigo-400"
            aria-label="Schließen"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Top Summary stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3 text-center">
            <p className="text-[11px] text-neutral-400">Gespielte Runden</p>
            <p className="font-display text-2xl font-bold text-white font-mono tabular-nums">
              {totalGames}
            </p>
          </div>
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3 text-center">
            <p className="text-[11px] text-neutral-400">Höchste Punktzahl</p>
            <p className="font-display text-2xl font-bold text-indigo-400 font-mono tabular-nums">
              {highestScore.toLocaleString()}
            </p>
          </div>
        </div>

        {/* History List */}
        <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
          {history.length === 0 ? (
            <div className="py-8 text-center text-sm text-neutral-500">
              Noch keine Quiz-Runden abgeschlossen. Starte dein erstes Spiel!
            </div>
          ) : (
            history.map((item) => {
              const accuracy = Math.round((item.correctAnswers / item.totalQuestions) * 100);
              const isBest = item.totalScore === highestScore && highestScore > 0;

              return (
                <div
                  key={item.id}
                  className={`flex items-center justify-between rounded-xl border p-3 text-xs transition-colors ${
                    isBest
                      ? 'border-indigo-500/40 bg-indigo-950/20'
                      : 'border-white/[0.06] bg-white/[0.02]'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white truncate max-w-[160px]">
                        {item.categoryName}
                      </span>
                      {isBest && (
                        <span className="text-[10px] font-bold text-indigo-300 bg-indigo-500/20 px-1.5 py-0.5 rounded">
                          Bestwert
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-neutral-500 text-[11px]">
                      <span>{formatDate(item.timestamp)}</span>
                      <span>·</span>
                      <span className="capitalize">{item.config.difficulty}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-mono text-sm font-bold text-indigo-300 tabular-nums">
                      {item.totalScore.toLocaleString()} Pkt
                    </p>
                    <p className="text-[11px] text-neutral-400 font-mono tabular-nums">
                      {item.correctAnswers}/{item.totalQuestions} ({accuracy}%)
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-2">
          {history.length > 0 && (
            <button
              onClick={() => {
                sound.playClick();
                if (window.confirm('Möchtest du den gesamten Verlauf wirklich zurücksetzen?')) {
                  onClearHistory();
                }
              }}
              className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-rose-400 transition-colors focus-visible:ring-1 focus-visible:ring-rose-400 rounded p-1"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Verlauf löschen</span>
            </button>
          )}

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="ml-auto rounded-xl bg-white/[0.08] hover:bg-white/[0.14] px-4 py-2 text-xs font-semibold text-white transition-colors"
          >
            Fertig
          </button>
        </div>

      </div>
    </div>
  );
};
