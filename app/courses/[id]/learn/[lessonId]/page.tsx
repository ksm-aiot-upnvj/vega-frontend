"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { getCourseById, completeLesson, getCourseProgress } from "@/lib/api";
import type { CourseWithModules } from "@/types/course";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  BookOpen,
  FileText,
  Video,
  File,
  Link as LinkIcon,
  CheckSquare,
  HelpCircle,
  ExternalLink,
  Clock,
  AlertCircle,
} from "lucide-react";

const LESSON_TYPE_ICON: Record<string, any> = {
  TEXT: BookOpen,
  VIDEO: Video,
  PDF: File,
  FILE: FileText,
  LINK: LinkIcon,
  TASK: CheckSquare,
  QUIZ: HelpCircle,
};

const LESSON_TYPE_LABEL: Record<string, string> = {
  TEXT: "Materi Teks",
  VIDEO: "Video",
  PDF: "PDF",
  FILE: "File / Dokumen",
  LINK: "Tautan Eksternal",
  TASK: "Tugas",
  QUIZ: "Kuis",
};

export default function LessonPage({
  params,
}: {
  params: Promise<{ id: string; lessonId: string }>;
}) {
  const { id, lessonId } = use(params);

  const [course, setCourse] = useState<CourseWithModules | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProgress, setUserProgress] = useState<Record<string, { is_completed: boolean; completed_at: string | null; answers: string | null; score: number | null }>>({});

  useEffect(() => {
    Promise.all([
      getCourseById(id),
      getCourseProgress(id).catch(() => ({}))
    ])
      .then(([courseData, progressData]) => {
        setCourse(courseData);
        setUserProgress(progressData);
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [id]);

  const allLessons = course?.modules?.flatMap((m) => m.lessons) || [];
  const currentIndex = allLessons.findIndex((l) => l.id === lessonId);
  const currentLesson = currentIndex >= 0 ? allLessons[currentIndex] : null;
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex >= 0 && currentIndex < allLessons.length - 1
      ? allLessons[currentIndex + 1]
      : null;
  const currentModule = course?.modules?.find(
    (m) => m.id === (currentLesson as any)?.module_id
  );

  // Deadline check
  const moduleDeadline = currentModule?.deadline ? new Date(currentModule.deadline) : null;
  const isDeadlinePassed = moduleDeadline ? new Date() > moduleDeadline : false;

  const [completed, setCompleted] = useState(false);
  const [taskCode, setTaskCode] = useState("");
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (currentLesson) {
      const prog = userProgress[currentLesson.id];
      setCompleted(prog?.is_completed || currentLesson.is_completed || false);
      setTaskCode("");
      setErrorMsg("");
      // Restore saved quiz answers if any
      if (prog?.answers) {
        try {
          setQuizAnswers(JSON.parse(prog.answers));
        } catch {
          setQuizAnswers({});
        }
      } else {
        setQuizAnswers({});
      }
    }
  }, [currentLesson, userProgress]);

  const handleComplete = async () => {
    if (!currentLesson) return;
    setErrorMsg("");
    setSubmitting(true);
    try {
      const answersStr =
        currentLesson.lesson_type === "QUIZ"
          ? JSON.stringify(quizAnswers)
          : undefined;
      await completeLesson(currentLesson.id, taskCode, answersStr);
      setCompleted(true);
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal menyimpan progress");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-2 border-accent-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-text-muted">Memuat materi...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!course || !currentLesson) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-3">
            <AlertCircle size={40} className="text-text-muted mx-auto" />
            <p className="text-text-muted">Lesson tidak ditemukan</p>
            <Link href={`/courses/${id}`}>
              <Button variant="secondary">Kembali ke Course</Button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const LessonIcon = LESSON_TYPE_ICON[currentLesson.lesson_type] || BookOpen;
  const lessonLabel = LESSON_TYPE_LABEL[currentLesson.lesson_type] || "Materi";

  return (
    <DashboardLayout>
      <div className="flex gap-6 animate-fade-in">
        {/* Sidebar - Lesson Navigation */}
        <aside className="hidden lg:block w-72 flex-shrink-0">
          <div className="glass-card p-0 sticky top-24 overflow-hidden max-h-[calc(100vh-8rem)] overflow-y-auto">
            <div className="p-4 border-b border-border-secondary">
              <Link
                href={`/courses/${id}`}
                className="text-xs text-accent-400 hover:text-accent-300 flex items-center gap-1 mb-2 transition-colors"
              >
                <ChevronLeft size={12} /> Kembali ke Course
              </Link>
              <h3 className="text-sm font-semibold text-text-primary truncate">
                {course.title}
              </h3>
            </div>
            <nav className="py-2">
              {course.modules?.map((module) => (
                <div key={module.id}>
                  <div className="px-4 py-2">
                    <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                      {module.title}
                    </p>
                  </div>
                  {module.lessons?.map((lesson) => {
                    const isActive = lesson.id === lessonId;
                    const Icon = LESSON_TYPE_ICON[lesson.lesson_type] || FileText;
                    const isThisCompleted = lesson.is_completed || (isActive && completed);
                    return (
                      <Link
                        key={lesson.id}
                        href={`/courses/${id}/learn/${lesson.id}`}
                        className={cn(
                          "flex items-center gap-2.5 px-4 py-2.5 text-xs transition-colors",
                          isActive
                            ? "bg-accent-500/10 text-accent-300 border-r-2 border-accent-500"
                            : "text-text-muted hover:text-text-primary hover:bg-primary-700/30"
                        )}
                      >
                        {isThisCompleted ? (
                          <CheckCircle
                            size={14}
                            className="text-emerald-400 flex-shrink-0"
                          />
                        ) : (
                          <Icon size={14} className="flex-shrink-0" />
                        )}
                        <span className="truncate">{lesson.title}</span>
                      </Link>
                    );
                  })}
                </div>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0 space-y-5">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <Link href={`/courses/${id}`} className="hover:text-text-primary transition-colors">
              {course.title}
            </Link>
            <ChevronRight size={12} />
            <span>{currentModule?.title}</span>
            <ChevronRight size={12} />
            <span className="text-text-secondary">{currentLesson.title}</span>
          </div>

          {/* Lesson Header */}
          <div className="glass-card p-6">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-accent-500/10 text-accent-400 flex-shrink-0">
                <LessonIcon size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium px-2 py-0.5 rounded bg-primary-700 text-text-muted">
                    {lessonLabel}
                  </span>
                  {completed && (
                    <span className="text-xs font-medium px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 flex items-center gap-1">
                      <CheckCircle size={10} /> Selesai
                    </span>
                  )}
                </div>
                <h1 className="text-xl font-bold text-text-primary">{currentLesson.title}</h1>
                {currentLesson.description && (
                  <p className="text-sm text-text-muted mt-1">{currentLesson.description}</p>
                )}
              </div>
            </div>
          </div>

          {/* Content Body */}
          <div className="glass-card p-6 space-y-6">

            {/* TEXT */}
            {currentLesson.lesson_type === "TEXT" && (
              <div className="prose prose-invert max-w-none text-text-secondary leading-relaxed text-sm">
                {currentLesson.content ? (
                  currentLesson.content.split("\n").map((line, i) => {
                    const urlRegex = /(https?:\/\/[^\s]+)/g;
                    const parts = line.split(urlRegex);
                    if (line.startsWith("# ")) return <h1 key={i} className="text-2xl font-bold text-text-primary mt-6 mb-3">{line.slice(2)}</h1>;
                    if (line.startsWith("## ")) return <h2 key={i} className="text-xl font-semibold text-text-primary mt-5 mb-2">{line.slice(3)}</h2>;
                    if (line.startsWith("- ")) return <li key={i} className="ml-5 mb-1">{line.slice(2)}</li>;
                    if (line.startsWith("**") && line.endsWith("**")) return <p key={i} className="font-semibold text-text-primary mb-2">{line.slice(2, -2)}</p>;
                    if (line.match(/^\d+\./)) return <li key={i} className="ml-5 mb-1 list-decimal">{line.replace(/^\d+\.\s*/, "")}</li>;
                    if (line.trim() === "") return <br key={i} />;
                    return (
                      <p key={i} className="mb-2">
                        {parts.map((part, j) =>
                          part.match(urlRegex) ? (
                            <a key={j} href={part} target="_blank" rel="noopener noreferrer" className="text-accent-400 hover:underline inline-flex items-center gap-0.5">
                              {part} <ExternalLink size={11} />
                            </a>
                          ) : (
                            <span key={j}>{part}</span>
                          )
                        )}
                      </p>
                    );
                  })
                ) : (
                  <p className="text-text-muted italic">Tidak ada konten teks.</p>
                )}
              </div>
            )}

            {/* FILE / LINK */}
            {(currentLesson.lesson_type === "FILE" || currentLesson.lesson_type === "LINK") && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-surface-secondary border border-border-secondary rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-primary-800 flex items-center justify-center flex-shrink-0">
                    {currentLesson.lesson_type === "FILE"
                      ? <FileText size={20} className="text-blue-400" />
                      : <LinkIcon size={20} className="text-purple-400" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary">{currentLesson.title}</p>
                    <p className="text-xs text-text-muted truncate">{currentLesson.content || "-"}</p>
                  </div>
                  <a href={currentLesson.content || "#"} target="_blank" rel="noopener noreferrer">
                    <Button variant="secondary" icon={<ExternalLink size={14} />}>
                      Buka
                    </Button>
                  </a>
                </div>

                {/* Status tabel mirip Moodle */}
                <div className="border border-border-secondary rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <tbody>
                      <tr className="border-b border-border-secondary">
                        <td className="px-4 py-3 bg-surface-secondary text-text-secondary font-medium w-44">Status</td>
                        <td className="px-4 py-3 text-text-primary">
                          {completed
                            ? <span className="flex items-center gap-1.5 text-emerald-400"><CheckCircle size={14} /> Selesai dibuka</span>
                            : <span className="text-text-muted">Belum dibuka</span>
                          }
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TASK */}
            {currentLesson.lesson_type === "TASK" && (
              <div className="space-y-4">
                {currentLesson.content && (
                  <p className="text-text-secondary text-sm leading-relaxed">{currentLesson.content}</p>
                )}

                {/* Status tabel mirip Moodle */}
                <div className="border border-border-secondary rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <tbody>
                      <tr className="border-b border-border-secondary">
                        <td className="px-4 py-3 bg-surface-secondary text-text-secondary font-medium w-44">Status Pengumpulan</td>
                        <td className="px-4 py-3 text-text-primary">
                          {completed
                            ? <span className="flex items-center gap-1.5 text-emerald-400 font-medium"><CheckCircle size={14} /> Sudah dikonfirmasi</span>
                            : <span className="text-text-muted">Belum dikonfirmasi</span>
                          }
                        </td>
                      </tr>
                      <tr className="border-b border-border-secondary">
                        <td className="px-4 py-3 bg-surface-secondary text-text-secondary font-medium">Status Penilaian</td>
                        <td className="px-4 py-3">
                          {(() => {
                            const prog = userProgress[currentLesson.id];
                            if (prog?.score !== null && prog?.score !== undefined) {
                              return (
                                <span className="flex items-center gap-1.5 text-amber-400 font-bold text-base">
                                  {prog.score} <span className="text-text-muted font-normal text-xs">/ 100</span>
                                </span>
                              );
                            }
                            return <span className="text-text-muted">{completed ? "Menunggu koreksi Mentor" : "Belum dinilai"}</span>;
                          })()}
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 bg-surface-secondary text-text-secondary font-medium">Kode Verifikasi</td>
                        <td className="px-4 py-3">
                          {!completed ? (
                            <div className="flex items-center gap-2 max-w-xs">
                              <Input
                                placeholder="Masukkan kode dari Mentor..."
                                value={taskCode}
                                onChange={(e) => setTaskCode(e.target.value)}
                              />
                            </div>
                          ) : (
                            <span className="text-emerald-400 text-xs font-medium">✓ Kode valid</span>
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* QUIZ */}
            {currentLesson.lesson_type === "QUIZ" && (
              <div className="space-y-4">
                {/* Status tabel mirip Moodle */}
                <div className="border border-border-secondary rounded-xl overflow-hidden mb-6">
                  <table className="w-full text-sm">
                    <tbody>
                      <tr className="border-b border-border-secondary">
                        <td className="px-4 py-3 bg-surface-secondary text-text-secondary font-medium w-44">Status Kuis</td>
                        <td className="px-4 py-3 text-text-primary">
                          {completed
                            ? <span className="flex items-center gap-1.5 text-emerald-400 font-medium"><CheckCircle size={14} /> Jawaban dikirim</span>
                            : <span className="text-text-muted">Belum dikerjakan</span>
                          }
                        </td>
                      </tr>
                      <tr className="border-b border-border-secondary">
                        <td className="px-4 py-3 bg-surface-secondary text-text-secondary font-medium">Status Penilaian</td>
                        <td className="px-4 py-3">
                          {(() => {
                            const prog = userProgress[currentLesson.id];
                            if (prog?.score !== null && prog?.score !== undefined) {
                              return (
                                <span className="flex items-center gap-1.5 text-amber-400 font-bold text-base">
                                  {prog.score} <span className="text-text-muted font-normal text-xs">/ 100</span>
                                </span>
                              );
                            }
                            return <span className="text-text-muted">{completed ? "Menunggu koreksi Mentor" : "Belum dinilai"}</span>;
                          })()}
                        </td>
                      </tr>
                      {(() => {
                        const prog = userProgress[currentLesson.id];
                        if (prog?.score !== null && prog?.score !== undefined) {
                          return (
                            <tr>
                              <td className="px-4 py-3 bg-surface-secondary text-text-secondary font-medium">Nilai Akhir</td>
                              <td className="px-4 py-3">
                                <span className={cn(
                                  "font-bold text-lg",
                                  prog.score >= 75 ? "text-emerald-400" : prog.score >= 50 ? "text-amber-400" : "text-red-400"
                                )}>
                                  {prog.score >= 75 ? "Lulus ✓" : prog.score >= 50 ? "Cukup" : "Tidak Lulus"}
                                </span>
                              </td>
                            </tr>
                          );
                        }
                        return null;
                      })()}
                    </tbody>
                  </table>
                </div>

                {/* Quiz Questions */}
                {(() => {
                  let questions: any[] = [];
                  try { questions = JSON.parse(currentLesson.content || "[]"); } catch (e) { }

                  if (questions.length === 0) {
                    return (
                      <div className="text-center py-8 text-text-muted">
                        <HelpCircle size={32} className="mx-auto mb-2 opacity-40" />
                        <p>Kuis belum dikonfigurasi oleh Mentor.</p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-6">
                      {questions.map((q: any, i: number) => (
                        <div key={i} className="border border-border-secondary rounded-xl overflow-hidden">
                          <div className="px-5 py-3 bg-surface-secondary border-b border-border-secondary">
                            <p className="text-sm font-semibold text-text-primary">
                              <span className="text-accent-400 mr-2">{i + 1}.</span>
                              {q.question}
                            </p>
                          </div>
                          <div className="p-5">
                            {q.type === "mcq" ? (
                              <div className="space-y-3">
                                {q.options?.map((opt: string, optIdx: number) =>
                                  opt ? (
                                    <label
                                      key={optIdx}
                                      className={cn(
                                        "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                                        quizAnswers[i] === String.fromCharCode(65 + optIdx)
                                          ? "border-accent-500 bg-accent-500/10"
                                          : "border-border-secondary hover:border-accent-500/50 hover:bg-accent-500/5",
                                        completed && "cursor-default"
                                      )}
                                    >
                                      <input
                                        type="radio"
                                        name={`question-${i}`}
                                        className="w-4 h-4 accent-accent-500"
                                        disabled={completed}
                                        checked={quizAnswers[i] === String.fromCharCode(65 + optIdx)}
                                        onChange={() =>
                                          !completed && setQuizAnswers((prev) => ({
                                            ...prev,
                                            [i]: String.fromCharCode(65 + optIdx),
                                          }))
                                        }
                                      />
                                      <span className="text-sm text-text-secondary">
                                        <span className="font-bold mr-2 text-text-primary">
                                          {String.fromCharCode(65 + optIdx)}.
                                        </span>
                                        {opt}
                                      </span>
                                    </label>
                                  ) : null
                                )}
                              </div>
                            ) : (
                              <textarea
                                className="w-full bg-primary-900 border border-border-secondary rounded-lg p-3 text-sm focus:border-accent-500 outline-none resize-none"
                                rows={4}
                                placeholder="Ketik jawaban Anda di sini..."
                                disabled={completed}
                                value={quizAnswers[i] || ""}
                                onChange={(e) =>
                                  !completed && setQuizAnswers((prev) => ({ ...prev, [i]: e.target.value }))
                                }
                              />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}

          </div>

          {/* Action Bar */}
          <div className="glass-card p-4 flex items-center justify-between">
            <div>
              {prevLesson && (
                <Link
                  href={`/courses/${id}/learn/${prevLesson.id}`}
                  className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors"
                >
                  <ChevronLeft size={16} /> {prevLesson.title}
                </Link>
              )}
            </div>

            <div className="flex flex-col items-center gap-1">
              {/* Deadline info */}
              {moduleDeadline && (
                <div className={cn(
                  "flex items-center gap-1.5 text-xs mb-1",
                  isDeadlinePassed ? "text-red-400" : "text-amber-400"
                )}>
                  <Clock size={12} />
                  {isDeadlinePassed
                    ? `Deadline telah lewat: ${moduleDeadline.toLocaleString("id-ID")}`
                    : `Deadline: ${moduleDeadline.toLocaleString("id-ID")}`
                  }
                </div>
              )}
              {errorMsg && (
                <div className="flex items-center gap-1.5 text-red-400 text-xs">
                  <AlertCircle size={12} /> {errorMsg}
                </div>
              )}
              <div className="flex items-center gap-3">
                {completed ? (
                  <span className="flex items-center gap-2 text-sm text-emerald-400 font-medium">
                    <CheckCircle size={16} /> Selesai
                  </span>
                ) : isDeadlinePassed ? (
                  <span className="flex items-center gap-2 text-sm text-red-400 font-medium">
                    <AlertCircle size={16} /> Deadline Sudah Lewat
                  </span>
                ) : (
                  <Button onClick={handleComplete} disabled={submitting} icon={<CheckCircle size={16} />}>
                    {submitting ? "Menyimpan..." : "Tandai Selesai"}
                  </Button>
                )}
                {nextLesson && (
                  <Link href={`/courses/${id}/learn/${nextLesson.id}`}>
                    <Button variant="secondary" icon={<ChevronRight size={16} />}>
                      Selanjutnya
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
