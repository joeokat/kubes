export interface QuizOption {
  id: number;
  text: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: QuizOption[];
  correctOptionId: number;
  explanation: string;
}

export interface Lesson {
  id: string;
  slug: string;
  category: string;
  title: string;
  order_index: number;
  read_time_mins: number;
  summary: string;
  content: string[]; // Structured paragraphs & markdown sections
  callout?: {
    title: string;
    body: string;
    isGhanaSpecific?: boolean;
  };
  is_free: boolean;
  price_ghs: number;
  quiz: QuizQuestion[];
}

export interface QuizSubmission {
  lessonId: string;
  answers: Record<number, number>; // questionId -> optionId
}

export interface QuizResult {
  lessonId: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  passed: boolean;
  details: {
    questionId: number;
    userAnswerId: number | undefined;
    correctAnswerId: number;
    isCorrect: boolean;
    explanation: string;
  }[];
}

export interface UserLessonProgress {
  lesson_id: string;
  completed_at: string;
  quiz_score: number;
}
