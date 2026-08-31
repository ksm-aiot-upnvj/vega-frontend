"use client";

import { use, useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import Button from "@/components/Button";
import { mockQuiz, mockQuizQuestions } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  Clock,
  CheckCircle,
  XCircle,
  Award,
  ArrowRight,
} from "lucide-react";
import type { QuestionResult } from "@/types/quiz";

type QuizState = "intro" | "taking" | "result";

export default function QuizPage({
  params,
}: {
  params: Promise<{ id: string; quizId: string }>;
}) {
  const { id, quizId } = use(params);
  const quiz = mockQuiz;
  const questions = mockQuizQuestions;

  const [state, setState] = useState<QuizState>("intro");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Map<string, Set<string>>>(new Map());
  const [result, setResult] = useState<{
    score: number;
    total: number;
    percentage: number;
    passed: boolean;
    questionResults: QuestionResult[];
  } | null>(null);

  const question = questions[currentQuestion];

  const handleSelectOption = (optionId: string) => {
    setAnswers((prev) => {
      const next = new Map(prev);
      const questionType = question.question_type;

      if (questionType === "MULTIPLE_ANSWER") {
        const current = next.get(question.id) || new Set();
        const updated = new Set(current);
        if (updated.has(optionId)) updated.delete(optionId);
        else updated.add(optionId);
        next.set(question.id, updated);
      } else {
        next.set(question.id, new Set([optionId]));
      }

      return next;
    });
  };

  const handleSubmit = () => {
    // Mock result
    const questionResults: QuestionResult[] = questions.map((q, i) => ({
      question_id: q.id,
      question_text: q.question_text,
      is_correct: i !== 2, // Question 3 is wrong for demo
      points_earned: i !== 2 ? q.points : 0,
      points_possible: q.points,
      selected_option_ids: Array.from(answers.get(q.id) || []),
      correct_option_ids: [q.options[1]?.id || ""],
    }));

    const score = questionResults.reduce((s, r) => s + r.points_earned, 0);
    const total = questionResults.reduce((s, r) => s + r.points_possible, 0);
    const percentage = total > 0 ? (score / total) * 100 : 0;

    setResult({
      score,
      total,
      percentage,
      passed: percentage >= quiz.passing_score,
      questionResults,
    });
    setState("result");
  };

  // ---- INTRO ----
  if (state === "intro") {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto animate-fade-in-up">
          <Link
            href={`/courses/${id}`}
            className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-primary mb-6 transition-colors"
          >
            <ChevronLeft size={14} /> Kembali ke Course
          </Link>

          <div className="glass-card p-8 text-center space-y-6">
            <div className="flex justify-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-accent-500/10 border border-accent-500/20">
                <Award size={32} className="text-accent-400" />
              </div>
            </div>

            <div>
              <h1 className="text-2xl font-bold text-text-primary">
                {quiz.title}
              </h1>
              {quiz.description && (
                <p className="text-text-muted mt-2">{quiz.description}</p>
              )}
            </div>

            <div className="flex justify-center gap-6 text-sm text-text-muted">
              <span className="flex items-center gap-1.5">
                <Clock size={15} />
                {quiz.time_limit ? `${quiz.time_limit} menit` : "Tanpa batas waktu"}
              </span>
              <span>{quiz.total_questions} soal</span>
              <span>Passing score: {quiz.passing_score}%</span>
            </div>

            <Button size="lg" onClick={() => setState("taking")}>
              Mulai Quiz
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ---- RESULT ----
  if (state === "result" && result) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in-up">
          {/* Score Card */}
          <div className="glass-card p-8 text-center space-y-5">
            <div className="flex justify-center">
              <div
                className={cn(
                  "flex items-center justify-center w-20 h-20 rounded-3xl border-2",
                  result.passed
                    ? "bg-emerald-500/10 border-emerald-500/30"
                    : "bg-error-500/10 border-error-500/30"
                )}
              >
                {result.passed ? (
                  <CheckCircle size={40} className="text-emerald-400" />
                ) : (
                  <XCircle size={40} className="text-error-400" />
                )}
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-text-primary">
                {Math.round(result.percentage)}%
              </h1>
              <p
                className={cn(
                  "text-sm font-medium mt-1",
                  result.passed ? "text-emerald-400" : "text-error-400"
                )}
              >
                {result.passed ? "Selamat, kamu lulus!" : "Belum lulus, coba lagi!"}
              </p>
            </div>
            <p className="text-sm text-text-muted">
              Skor: {result.score}/{result.total} poin
            </p>
            <div className="flex justify-center gap-3">
              <Link href={`/courses/${id}`}>
                <Button variant="secondary">Kembali ke Course</Button>
              </Link>
              {!result.passed && (
                <Button
                  onClick={() => {
                    setState("intro");
                    setAnswers(new Map());
                    setCurrentQuestion(0);
                    setResult(null);
                  }}
                >
                  Ulangi Quiz
                </Button>
              )}
            </div>
          </div>

          {/* Question Results */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-text-primary">
              Detail Jawaban
            </h2>
            {result.questionResults.map((qr, i) => (
              <div
                key={qr.question_id}
                className={cn(
                  "glass-card p-5 border-l-4",
                  qr.is_correct ? "border-l-emerald-500" : "border-l-error-500"
                )}
              >
                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-primary-700 text-xs font-bold text-text-muted">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm text-text-primary">
                      {qr.question_text}
                    </p>
                    <p
                      className={cn(
                        "text-xs mt-1",
                        qr.is_correct ? "text-emerald-400" : "text-error-400"
                      )}
                    >
                      {qr.is_correct ? "Benar" : "Salah"} · {qr.points_earned}/
                      {qr.points_possible} poin
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ---- TAKING QUIZ ----
  const selectedOptions = answers.get(question.id) || new Set();
  const isMultiAnswer = question.question_type === "MULTIPLE_ANSWER";
  const answeredCount = answers.size;

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        {/* Progress */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-muted">
            Soal {currentQuestion + 1} dari {questions.length}
          </span>
          <span className="text-sm text-text-muted">
            {answeredCount}/{questions.length} dijawab
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-primary-700 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-accent-600 to-accent-400 transition-all duration-300"
            style={{
              width: `${((currentQuestion + 1) / questions.length) * 100}%`,
            }}
          />
        </div>

        {/* Question Nav Dots */}
        <div className="flex items-center gap-2 justify-center">
          {questions.map((q, i) => (
            <button
              key={q.id}
              onClick={() => setCurrentQuestion(i)}
              className={cn(
                "w-8 h-8 rounded-lg text-xs font-medium transition-all cursor-pointer",
                i === currentQuestion
                  ? "bg-accent-500 text-white"
                  : answers.has(q.id)
                  ? "bg-accent-500/20 text-accent-300 border border-accent-500/30"
                  : "bg-primary-700 text-text-muted border border-border-secondary hover:border-border-primary"
              )}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {/* Question Card */}
        <div className="glass-card p-8 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              {isMultiAnswer && (
                <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-medium">
                  Pilih beberapa jawaban
                </span>
              )}
              {question.question_type === "TRUE_FALSE" && (
                <span className="text-xs px-2 py-0.5 rounded bg-info-500/10 text-info-400 font-medium">
                  Benar / Salah
                </span>
              )}
            </div>
            <h2 className="text-lg font-semibold text-text-primary">
              {question.question_text}
            </h2>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {question.options.map((option) => {
              const isSelected = selectedOptions.has(option.id);
              return (
                <button
                  key={option.id}
                  onClick={() => handleSelectOption(option.id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-all cursor-pointer",
                    isSelected
                      ? "bg-accent-500/10 border-accent-500/30 text-text-primary"
                      : "bg-primary-800 border-border-secondary text-text-muted hover:border-border-primary hover:text-text-primary"
                  )}
                >
                  <div
                    className={cn(
                      "flex items-center justify-center w-6 h-6 rounded-md border-2 flex-shrink-0 transition-all",
                      isMultiAnswer ? "rounded-md" : "rounded-full",
                      isSelected
                        ? "bg-accent-500 border-accent-500"
                        : "border-border-primary"
                    )}
                  >
                    {isSelected && (
                      <CheckCircle size={14} className="text-white" />
                    )}
                  </div>
                  <span className="text-sm">{option.option_text}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => setCurrentQuestion((p) => Math.max(0, p - 1))}
            disabled={currentQuestion === 0}
          >
            <ChevronLeft size={16} /> Sebelumnya
          </Button>

          {currentQuestion === questions.length - 1 ? (
            <Button onClick={handleSubmit} disabled={answeredCount < questions.length}>
              Submit Quiz
            </Button>
          ) : (
            <Button
              variant="secondary"
              onClick={() =>
                setCurrentQuestion((p) =>
                  Math.min(questions.length - 1, p + 1)
                )
              }
            >
              Selanjutnya <ArrowRight size={16} />
            </Button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
