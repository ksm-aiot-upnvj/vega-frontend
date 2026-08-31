// ============================================
// VEGA LMS — Quiz Types
// ============================================

export type QuestionType = "MULTIPLE_CHOICE" | "TRUE_FALSE" | "MULTIPLE_ANSWER";

export interface Quiz {
  id: string;
  course_id: string;
  module_id?: string;
  title: string;
  description?: string;
  time_limit?: number; // in minutes
  passing_score: number; // percentage
  total_questions: number;
  is_final: boolean;
  created_at: string;
}

export interface Question {
  id: string;
  quiz_id: string;
  question_text: string;
  question_type: QuestionType;
  order: number;
  points: number;
  options: QuestionOption[];
}

export interface QuestionOption {
  id: string;
  question_id: string;
  option_text: string;
  order: number;
  // NOTE: is_correct is NEVER sent to frontend before submission
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  user_id: string;
  answers: UserAnswer[];
  started_at: string;
  submitted_at?: string;
}

export interface UserAnswer {
  question_id: string;
  selected_option_ids: string[];
}

export interface QuizResult {
  attempt_id: string;
  quiz_id: string;
  quiz_title: string;
  score: number;
  total_points: number;
  percentage: number;
  passed: boolean;
  submitted_at: string;
  question_results: QuestionResult[];
}

export interface QuestionResult {
  question_id: string;
  question_text: string;
  is_correct: boolean;
  points_earned: number;
  points_possible: number;
  selected_option_ids: string[];
  correct_option_ids: string[];
}
