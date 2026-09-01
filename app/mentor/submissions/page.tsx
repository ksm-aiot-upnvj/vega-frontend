"use client";

import { useState, useEffect, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { getMentorSubmissions, scoreSubmission } from "@/lib/api";
import {
  CheckCircle,
  Clock,
  User,
  BookOpen,
  HelpCircle,
  CheckSquare,
  Search,
  ChevronDown,
  ChevronUp,
  Star,
  Filter,
  Inbox,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Button from "@/components/Button";
import Input from "@/components/Input";

interface Submission {
  submission_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  course_id: string;
  course_title: string;
  lesson_id: string;
  lesson_title: string;
  lesson_type: string;
  module_title: string;
  is_completed: boolean;
  completed_at: string | null;
  answers: string | null;
  score: number | null;
  lesson_content?: string | null;
}

const LESSON_TYPE_LABEL: Record<string, string> = {
  QUIZ: "Kuis",
  TASK: "Tugas",
  TEXT: "Teks",
  FILE: "File",
  LINK: "Tautan",
};

const LESSON_TYPE_COLOR: Record<string, string> = {
  QUIZ: "text-rose-400 bg-rose-500/10",
  TASK: "text-amber-400 bg-amber-500/10",
  TEXT: "text-accent-400 bg-accent-500/10",
  FILE: "text-blue-400 bg-blue-500/10",
  LINK: "text-purple-400 bg-purple-500/10",
};

export default function MentorSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [filterCourse, setFilterCourse] = useState<string>("ALL");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => {
    getMentorSubmissions()
      .then((data) => {
        setSubmissions(data);
        // Initialize scores from existing data
        const initScores: Record<string, string> = {};
        data.forEach((s: Submission) => {
          if (s.score !== null && s.score !== undefined) {
            initScores[s.submission_id] = String(s.score);
          }
        });
        setScores(initScores);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const courses = useMemo(() => {
    const set = new Set(submissions.map((s) => s.course_title));
    return ["ALL", ...Array.from(set)];
  }, [submissions]);

  const filtered = useMemo(() => {
    return submissions.filter((s) => {
      const matchSearch =
        search === "" ||
        s.user_name.toLowerCase().includes(search.toLowerCase()) ||
        s.user_email.toLowerCase().includes(search.toLowerCase()) ||
        s.lesson_title.toLowerCase().includes(search.toLowerCase());
      const matchType = filterType === "ALL" || s.lesson_type === filterType;
      const matchCourse = filterCourse === "ALL" || s.course_title === filterCourse;
      return matchSearch && matchType && matchCourse;
    });
  }, [submissions, search, filterType, filterCourse]);

  const parseAnswers = (answers: string | null) => {
    if (!answers) return null;
    try {
      return JSON.parse(answers);
    } catch {
      return null;
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const handleSaveScore = async (submissionId: string) => {
    const scoreVal = parseFloat(scores[submissionId] || "0");
    if (isNaN(scoreVal) || scoreVal < 0 || scoreVal > 100) return;
    setSaving(submissionId);
    try {
      await scoreSubmission(submissionId, scoreVal);
      setSubmissions((prev) =>
        prev.map((s) =>
          s.submission_id === submissionId ? { ...s, score: scoreVal } : s
        )
      );
      setSaved(submissionId);
      setTimeout(() => setSaved(null), 2000);
    } catch {
      // silent fail
    } finally {
      setSaving(null);
    }
  };

  const statsTotal = submissions.length;
  const statsNeedGrading = submissions.filter(
    (s) => (s.lesson_type === "QUIZ" || s.lesson_type === "TASK") && s.score === null
  ).length;
  const statsGraded = submissions.filter((s) => s.score !== null).length;

  return (
    <DashboardLayout role="MENTOR">
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              Submission <span className="text-gradient">Member</span>
            </h1>
            <p className="text-text-muted mt-1 text-sm">
              Lihat dan nilai jawaban yang dikumpulkan oleh member
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4">
          <div className="glass-card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-500/10 flex items-center justify-center">
              <Inbox size={20} className="text-accent-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{statsTotal}</p>
              <p className="text-xs text-text-muted">Total Submission</p>
            </div>
          </div>
          <div className="glass-card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Clock size={20} className="text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{statsNeedGrading}</p>
              <p className="text-xs text-text-muted">Belum Dinilai</p>
            </div>
          </div>
          <div className="glass-card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Star size={20} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{statsGraded}</p>
              <p className="text-xs text-text-muted">Sudah Dinilai</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="glass-card p-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <Search size={16} className="text-text-muted flex-shrink-0" />
            <input
              type="text"
              placeholder="Cari nama member, email, atau lesson..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-text-muted" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-primary-800 border border-border-secondary rounded-lg px-3 py-1.5 text-sm text-text-primary outline-none focus:border-accent-500"
            >
              <option value="ALL">Semua Tipe</option>
              <option value="QUIZ">Kuis</option>
              <option value="TASK">Tugas</option>
            </select>
            <select
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              className="bg-primary-800 border border-border-secondary rounded-lg px-3 py-1.5 text-sm text-text-primary outline-none focus:border-accent-500 max-w-[200px] truncate"
            >
              {courses.map((c) => (
                <option key={c} value={c}>
                  {c === "ALL" ? "Semua Course" : c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Submissions list */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="w-8 h-8 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-card p-12 text-center text-text-muted">
            <Inbox size={40} className="mx-auto mb-3 opacity-30" />
            <p>
              {submissions.length === 0
                ? "Belum ada submission dari member."
                : "Tidak ada hasil yang cocok dengan filter."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((sub) => {
              const isExpanded = expanded === sub.submission_id;
              const parsed = parseAnswers(sub.answers);
              const needsGrading =
                (sub.lesson_type === "QUIZ" || sub.lesson_type === "TASK") &&
                sub.score === null;
              const isSaved = saved === sub.submission_id;
              const isSaving = saving === sub.submission_id;

              return (
                <div
                  key={sub.submission_id}
                  className={cn(
                    "glass-card overflow-hidden border transition-all",
                    isExpanded ? "border-accent-500/40" : "border-border-secondary",
                    needsGrading && !isExpanded && "border-l-2 border-l-amber-500"
                  )}
                >
                  {/* Row header */}
                  <div
                    className="flex items-center gap-4 p-4 cursor-pointer hover:bg-primary-700/20 transition-colors"
                    onClick={() =>
                      setExpanded(isExpanded ? null : sub.submission_id)
                    }
                  >
                    {/* Type badge */}
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded text-xs font-semibold flex-shrink-0",
                        LESSON_TYPE_COLOR[sub.lesson_type] || "bg-primary-700 text-text-muted"
                      )}
                    >
                      {LESSON_TYPE_LABEL[sub.lesson_type] || sub.lesson_type}
                    </span>

                    {/* Main info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-text-primary truncate">
                          {sub.lesson_title}
                        </p>
                        <span className="text-xs text-text-muted">
                          — {sub.module_title} · {sub.course_title}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-0.5 text-xs text-text-muted">
                        <span className="flex items-center gap-1">
                          <User size={11} /> {sub.user_name}
                        </span>
                        <span className="text-text-muted/50">{sub.user_email}</span>
                        <span className="flex items-center gap-1">
                          <Clock size={11} /> {formatDate(sub.completed_at)}
                        </span>
                      </div>
                    </div>

                    {/* Score badge */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {sub.score !== null ? (
                        <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400">
                          <Star size={11} /> {sub.score} / 100
                        </span>
                      ) : needsGrading ? (
                        <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-400">
                          Belum dinilai
                        </span>
                      ) : (
                        <span className="text-xs text-text-muted">—</span>
                      )}
                      {isExpanded ? (
                        <ChevronUp size={16} className="text-text-muted" />
                      ) : (
                        <ChevronDown size={16} className="text-text-muted" />
                      )}
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="border-t border-border-secondary bg-surface-secondary/30 p-5 space-y-5">
                      {/* Answers */}
                      {sub.lesson_type === "QUIZ" && (
                        <div>
                          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
                            Jawaban Member
                          </p>
                          {(() => {
                            let questions: any[] = [];
                            try { questions = JSON.parse(sub.lesson_content || "[]"); } catch {}
                            
                            if (parsed) {
                              return (
                                <div className="space-y-3">
                                  {Object.entries(parsed).map(
                                    ([idxStr, ans]: [string, any]) => {
                                      const idx = Number(idxStr);
                                      const questionObj = questions[idx];
                                      return (
                                        <div
                                          key={idx}
                                          className="p-3 bg-primary-800 rounded-xl border border-border-secondary"
                                        >
                                          <p className="text-xs text-text-muted mb-1 font-semibold">
                                            Pertanyaan {idx + 1}
                                          </p>
                                          <p className="text-sm text-text-primary mb-2">
                                            {questionObj?.question || `Pertanyaan ${idx + 1} tidak ditemukan`}
                                          </p>
                                          
                                          {questionObj?.type === 'mcq' && (
                                              <div className="mb-2 text-xs text-text-muted pl-2 border-l-2 border-border-secondary">
                                                  Pilihan:
                                                  {questionObj.options?.map((opt: string, optIdx: number) => 
                                                    opt ? <div key={optIdx}>{String.fromCharCode(65 + optIdx)}. {opt}</div> : null
                                                  )}
                                              </div>
                                          )}
                                          
                                          <div className="bg-surface-secondary px-3 py-2 rounded text-sm text-accent-400">
                                            <span className="font-semibold text-text-muted mr-2">Jawaban:</span> 
                                            {ans || (
                                              <span className="italic text-text-muted">
                                                Tidak dijawab
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    }
                                  )}
                                </div>
                              );
                            } else {
                              return (
                                <p className="text-sm text-text-muted italic">
                                  Tidak ada jawaban tersimpan.
                                </p>
                              );
                            }
                          })()}
                        </div>
                      )}

                      {sub.lesson_type === "TASK" && (
                        <div>
                          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                            Status Tugas
                          </p>
                          <span className="flex items-center gap-1.5 text-sm text-emerald-400">
                            <CheckCircle size={14} /> Dikonfirmasi dengan kode yang benar
                          </span>
                        </div>
                      )}

                      {/* Grading section */}
                      {(sub.lesson_type === "QUIZ" || sub.lesson_type === "TASK") && (
                        <div className="pt-4 border-t border-border-secondary">
                          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
                            Berikan Nilai
                          </p>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 bg-primary-800 border border-border-secondary rounded-xl px-3 py-2">
                              <Star size={14} className="text-amber-400" />
                              <input
                                type="number"
                                min="0"
                                max="100"
                                step="1"
                                placeholder="0–100"
                                value={scores[sub.submission_id] ?? (sub.score !== null ? String(sub.score) : "")}
                                onChange={(e) =>
                                  setScores((prev) => ({
                                    ...prev,
                                    [sub.submission_id]: e.target.value,
                                  }))
                                }
                                className="w-16 bg-transparent text-sm text-text-primary outline-none"
                              />
                              <span className="text-xs text-text-muted">/ 100</span>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleSaveScore(sub.submission_id)}
                              disabled={isSaving}
                            >
                              {isSaving
                                ? "Menyimpan..."
                                : isSaved
                                ? "✓ Tersimpan"
                                : "Simpan Nilai"}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
