"use client";

import { useState, useEffect } from "react";
import { use } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { getCourseSubmissions, getCourseById } from "@/lib/api";
import { ArrowLeft, CheckCircle, Clock, User, BookOpen, HelpCircle, CheckSquare } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function SubmissionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [courseName, setCourseName] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedSub, setSelectedSub] = useState<any | null>(null);

  useEffect(() => {
    Promise.all([
      getCourseById(id),
      getCourseSubmissions(id),
    ])
      .then(([course, subs]) => {
        setCourseName(course.title);
        setSubmissions(subs);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const LESSON_TYPE_ICON: Record<string, any> = {
    TEXT: BookOpen,
    FILE: BookOpen,
    LINK: BookOpen,
    TASK: CheckSquare,
    QUIZ: HelpCircle,
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const parseAnswers = (answers: string | null) => {
    if (!answers) return null;
    try {
      return JSON.parse(answers);
    } catch {
      return null;
    }
  };

  return (
    <DashboardLayout role="MENTOR">
      <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href={`/mentor/courses/${id}`}
            className="p-2 rounded-xl bg-primary-800 text-text-muted hover:text-text-primary transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              Submission <span className="text-gradient">Member</span>
            </h1>
            <p className="text-text-muted text-sm mt-0.5">{courseName}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="w-8 h-8 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : submissions.length === 0 ? (
          <div className="glass-card p-12 text-center text-text-muted">
            <CheckCircle size={40} className="mx-auto mb-3 opacity-30" />
            <p>Belum ada submission dari member.</p>
          </div>
        ) : (
          <div className="flex gap-5">
            {/* Submissions list */}
            <div className="flex-1 space-y-3">
              {submissions.map((sub, i) => {
                const Icon = LESSON_TYPE_ICON[sub.lesson_type] || BookOpen;
                const isSelected = selectedSub === sub;
                const parsed = parseAnswers(sub.answers);
                return (
                  <div
                    key={i}
                    onClick={() => setSelectedSub(isSelected ? null : sub)}
                    className={cn(
                      "glass-card p-4 cursor-pointer transition-all border",
                      isSelected
                        ? "border-accent-500 bg-accent-500/5"
                        : "border-border-secondary hover:border-accent-500/50"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary-800 flex items-center justify-center flex-shrink-0">
                        <Icon size={16} className="text-accent-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-text-primary truncate">{sub.lesson_title}</p>
                          <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 flex-shrink-0 flex items-center gap-1">
                            <CheckCircle size={10} /> Selesai
                          </span>
                        </div>
                        <p className="text-xs text-text-muted mt-0.5">{sub.module_title}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-text-muted">
                          <span className="flex items-center gap-1">
                            <User size={11} /> {sub.user_name}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={11} /> {formatDate(sub.completed_at)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Expanded: show quiz answers */}
                    {isSelected && sub.lesson_type === "QUIZ" && (
                      <div className="mt-4 pl-12 space-y-3 border-t border-border-secondary pt-4">
                        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Jawaban Member</p>
                        {parsed ? (
                          Object.entries(parsed).map(([idx, ans]: [string, any]) => (
                            <div key={idx} className="border border-border-secondary rounded-lg p-3">
                              <p className="text-xs text-text-muted mb-1">Pertanyaan {Number(idx) + 1}</p>
                              <p className="text-sm text-text-primary font-medium">{ans || <span className="italic text-text-muted">Tidak dijawab</span>}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-text-muted italic">Tidak ada jawaban tersimpan.</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Stats sidebar */}
            <div className="w-60 flex-shrink-0 space-y-4">
              <div className="glass-card p-4">
                <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Ringkasan</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Total Submission</span>
                    <span className="text-text-primary font-semibold">{submissions.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Member Unik</span>
                    <span className="text-text-primary font-semibold">
                      {new Set(submissions.map((s) => s.user_id)).size}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Kuis</span>
                    <span className="text-text-primary font-semibold">
                      {submissions.filter((s) => s.lesson_type === "QUIZ").length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Tugas</span>
                    <span className="text-text-primary font-semibold">
                      {submissions.filter((s) => s.lesson_type === "TASK").length}
                    </span>
                  </div>
                </div>
              </div>

              <div className="glass-card p-4">
                <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Top Member</p>
                <div className="space-y-2">
                  {Object.entries(
                    submissions.reduce((acc: Record<string, number>, s) => {
                      acc[s.user_name] = (acc[s.user_name] || 0) + 1;
                      return acc;
                    }, {})
                  )
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 5)
                    .map(([name, count]) => (
                      <div key={name} className="flex justify-between text-xs">
                        <span className="text-text-secondary truncate">{name}</span>
                        <span className="text-accent-400 font-semibold">{count}x</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
