export type Difficulty = 'any' | 'easy' | 'medium' | 'hard';
export type QuestionType = 'any' | 'multiple' | 'boolean';

export interface Category {
  id: number;
  name: string;
}

export interface QuizConfig {
  amount: number;
  category: number | 'any';
  difficulty: Difficulty;
  type: QuestionType;
  timerSeconds: number; // 0 for no timer (zen mode), or 10, 15, 20, 30
  soundEnabled: boolean;
}

export interface RawOpenTDBQuestion {
  category: string;
  type: 'multiple' | 'boolean';
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

export interface OpenTDBResponse {
  response_code: number;
  results: RawOpenTDBQuestion[];
}

export interface FormattedQuestion {
  id: string;
  category: string;
  type: 'multiple' | 'boolean';
  difficulty: 'easy' | 'medium' | 'hard';
  questionText: string;
  correctAnswer: string;
  answers: string[];
}

export interface QuestionResult {
  question: FormattedQuestion;
  userAnswer: string | null;
  isCorrect: boolean;
  timeSpentSeconds: number;
  pointsEarned: number;
}

export interface GameSummary {
  id: string;
  timestamp: number;
  config: QuizConfig;
  categoryName: string;
  totalQuestions: number;
  correctAnswers: number;
  totalScore: number;
  maxPossibleScore: number;
  averageTimeSeconds: number;
  questionResults: QuestionResult[];
}
