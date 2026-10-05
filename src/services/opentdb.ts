import {
  Category,
  FormattedQuestion,
  OpenTDBResponse,
  QuizConfig,
  RawOpenTDBQuestion
} from '../types/trivia.ts';
import { decodeHtml } from '../utils/htmlDecoder.ts';

export interface CategoryItem {
  id: number | 'any';
  name: string;
  nameDe: string;
  icon: string;
}

export const CATEGORIES: CategoryItem[] = [
  { id: 'any', name: 'Any Category', nameDe: 'Alle Kategorien', icon: 'Sparkles' },
  { id: 9, name: 'General Knowledge', nameDe: 'Allgemeinwissen', icon: 'Brain' },
  { id: 11, name: 'Entertainment: Film', nameDe: 'Filme & Kino', icon: 'Film' },
  { id: 12, name: 'Entertainment: Music', nameDe: 'Musik', icon: 'Music' },
  { id: 14, name: 'Entertainment: Television', nameDe: 'Serien & TV', icon: 'Tv' },
  { id: 15, name: 'Entertainment: Video Games', nameDe: 'Videospiele & Gaming', icon: 'Gamepad2' },
  { id: 17, name: 'Science & Nature', nameDe: 'Wissenschaft & Natur', icon: 'Atom' },
  { id: 18, name: 'Science: Computers', nameDe: 'Informatik & Tech', icon: 'Cpu' },
  { id: 21, name: 'Sports', nameDe: 'Sport', icon: 'Trophy' },
  { id: 22, name: 'Geography', nameDe: 'Geografie & Länder', icon: 'Globe' },
  { id: 23, name: 'History', nameDe: 'Geschichte & Epochen', icon: 'Landmark' },
  { id: 24, name: 'Politics', nameDe: 'Politik & Gesellschaft', icon: 'Vote' },
  { id: 20, name: 'Mythology', nameDe: 'Mythologie & Sagen', icon: 'Flame' },
  { id: 27, name: 'Animals', nameDe: 'Tierwelt & Natur', icon: 'Cat' },
  { id: 10, name: 'Entertainment: Books', nameDe: 'Literatur & Bücher', icon: 'BookOpen' },
  { id: 19, name: 'Science: Mathematics', nameDe: 'Mathematik', icon: 'Calculator' },
  { id: 25, name: 'Art', nameDe: 'Kunst & Design', icon: 'Palette' },
  { id: 28, name: 'Vehicles', nameDe: 'Fahrzeuge & Mobilität', icon: 'Car' },
  { id: 16, name: 'Entertainment: Board Games', nameDe: 'Brettspiele', icon: 'Dice5' },
  { id: 31, name: 'Entertainment: Japanese Anime & Manga', nameDe: 'Anime & Manga', icon: 'Tv2' },
  { id: 32, name: 'Entertainment: Cartoon & Animations', nameDe: 'Cartoons & Animation', icon: 'Clapperboard' },
];

/**
 * Fisher-Yates array shuffle
 */
function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * High quality curated fallback questions in case of network issue or OpenTDB rate-limit
 */
const BACKUP_QUESTIONS: RawOpenTDBQuestion[] = [
  {
    category: 'General Knowledge',
    type: 'multiple',
    difficulty: 'medium',
    question: 'Welches Element hat die Ordnungszahl 1 im Periodensystem?',
    correct_answer: 'Wasserstoff',
    incorrect_answers: ['Helium', 'Sauerstoff', 'Kohlenstoff']
  },
  {
    category: 'Science: Computers',
    type: 'multiple',
    difficulty: 'medium',
    question: 'In welchem Jahr wurde die Programmiersprache JavaScript erstmals veröffentlicht?',
    correct_answer: '1995',
    incorrect_answers: ['1991', '1998', '2001']
  },
  {
    category: 'Geography',
    type: 'multiple',
    difficulty: 'easy',
    question: 'Was ist die Hauptstadt von Australien?',
    correct_answer: 'Canberra',
    incorrect_answers: ['Sydney', 'Melbourne', 'Brisbane']
  },
  {
    category: 'History',
    type: 'multiple',
    difficulty: 'medium',
    question: 'Welches Bauwerk wurde am 9. November 1989 symbolisch zu Fall gebracht?',
    correct_answer: 'Die Berliner Mauer',
    incorrect_answers: ['Die Chinesische Mauer', 'Die Bastille', 'Die Hadriansmauer']
  },
  {
    category: 'Science & Nature',
    type: 'boolean',
    difficulty: 'easy',
    question: 'Licht bewegt sich im Vakuum mit rund 300.000 Kilometern pro Sekunde.',
    correct_answer: 'True',
    incorrect_answers: ['False']
  },
  {
    category: 'Entertainment: Video Games',
    type: 'multiple',
    difficulty: 'easy',
    question: 'Wer ist der ikonische Klempner-Protagonist in Nintendos Flaggschiff-Reihe?',
    correct_answer: 'Mario',
    incorrect_answers: ['Luigi', 'Sonic', 'Link']
  },
  {
    category: 'Sports',
    type: 'boolean',
    difficulty: 'easy',
    question: 'Ein reguläres Fußballspiel dauert inklusive beider Halbzeiten ohne Nachspielzeit 90 Minuten.',
    correct_answer: 'True',
    incorrect_answers: ['False']
  },
  {
    category: 'General Knowledge',
    type: 'multiple',
    difficulty: 'hard',
    question: 'Wie viele Tasten hat ein klassisches Konzert-Klavier üblicherweise?',
    correct_answer: '88',
    incorrect_answers: ['76', '84', '92']
  },
  {
    category: 'Geography',
    type: 'multiple',
    difficulty: 'medium',
    question: 'Welcher ist der längste Fluss der Welt nach offizieller geographischer Einordnung?',
    correct_answer: 'Nil',
    incorrect_answers: ['Amazonas', 'Jangtsekiang', 'Mississippi']
  },
  {
    category: 'Entertainment: Film',
    type: 'multiple',
    difficulty: 'easy',
    question: 'Wer führte Regie beim Science-Fiction-Meilenstein „Inception“ (2010)?',
    correct_answer: 'Christopher Nolan',
    incorrect_answers: ['Steven Spielberg', 'Denis Villeneuve', 'James Cameron']
  }
];

export async function fetchTriviaQuestions(config: QuizConfig): Promise<{
  questions: FormattedQuestion[];
  isFallback?: boolean;
  message?: string;
}> {
  const params = new URLSearchParams();
  params.append('amount', Math.min(50, Math.max(1, config.amount)).toString());

  if (config.category !== 'any') {
    params.append('category', config.category.toString());
  }
  if (config.difficulty !== 'any') {
    params.append('difficulty', config.difficulty);
  }
  if (config.type !== 'any') {
    params.append('type', config.type);
  }

  const url = `https://opentdb.com/api.php?${params.toString()}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9000);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`OpenTDB HTTP-Fehler: ${response.status}`);
    }

    const data: OpenTDBResponse = await response.json();

    if (data.response_code === 0 && data.results && data.results.length > 0) {
      return {
        questions: formatRawQuestions(data.results)
      };
    }

    // Response code 1: No results for these specific parameters (e.g. not enough questions in database)
    if (data.response_code === 1) {
      // Try relaxed query without category or difficulty
      const relaxedQuestions = await fetchRelaxedFallback(config);
      if (relaxedQuestions.length > 0) {
        return {
          questions: relaxedQuestions,
          message: 'Für deine spezifische Filterkombination gab es nicht genügend Fragen. Es wurden passende Alternativen geladen.'
        };
      }
    }

    // If rate-limited (code 5) or no results, use backup questions
    throw new Error(`OpenTDB Response Code: ${data.response_code}`);
  } catch (err) {
    console.warn('Falling back to curated question bank:', err);
    return {
      questions: formatRawQuestions(BACKUP_QUESTIONS.slice(0, config.amount)),
      isFallback: true,
      message: 'Netzwerk/API temporär nicht erreichbar. Curated Offline-Fragensatz geladen.'
    };
  }
}

async function fetchRelaxedFallback(config: QuizConfig): Promise<FormattedQuestion[]> {
  try {
    const relaxedUrl = `https://opentdb.com/api.php?amount=${config.amount}${
      config.category !== 'any' ? `&category=${config.category}` : ''
    }`;
    const res = await fetch(relaxedUrl);
    if (!res.ok) return [];
    const data: OpenTDBResponse = await res.json();
    if (data.response_code === 0 && data.results) {
      return formatRawQuestions(data.results);
    }
  } catch {
    // ignore
  }
  return [];
}

export function formatRawQuestions(raw: RawOpenTDBQuestion[]): FormattedQuestion[] {
  return raw.map((q, idx) => {
    const decodedCorrect = decodeHtml(q.correct_answer);
    const decodedIncorrect = q.incorrect_answers.map(decodeHtml);

    let answers: string[];
    if (q.type === 'boolean') {
      // Standardized order for True / False
      answers = ['True', 'False'];
    } else {
      answers = shuffleArray([decodedCorrect, ...decodedIncorrect]);
    }

    return {
      id: `q-${idx}-${Date.now()}`,
      category: decodeHtml(q.category),
      type: q.type,
      difficulty: q.difficulty,
      questionText: decodeHtml(q.question),
      correctAnswer: decodedCorrect,
      answers
    };
  });
}
