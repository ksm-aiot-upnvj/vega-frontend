"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import Button from "@/components/Button";
import { getCourseById } from "@/lib/api";
import type { CourseWithModules, LessonType } from "@/types/course";
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
} from "lucide-react";

const lessonTypeIcons: Record<LessonType, typeof FileText> = {
  TEXT: FileText,
  VIDEO: Video,
  PDF: File,
  FILE: File,
  LINK: LinkIcon,
};

export default function LessonPage({
  params,
}: {
  params: Promise<{ id: string; lessonId: string }>;
}) {
  const { id, lessonId } = use(params);
  
  const [course, setCourse] = useState<CourseWithModules | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCourseById(id)
      .then(setCourse)
      .catch(() => {})
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
    (m) => m.id === currentLesson?.module_id
  );

  const [completed, setCompleted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (currentLesson) {
      setCompleted(currentLesson.is_completed || false);
    }
  }, [currentLesson]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-text-muted">Loading...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!course || !currentLesson) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-text-muted">Lesson tidak ditemukan</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex gap-6 animate-fade-in">
        {/* Sidebar - Lesson Navigation */}
        {sidebarOpen && (
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
                      const LessonIcon =
                        lessonTypeIcons[lesson.lesson_type] || FileText;
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
                          {lesson.is_completed || (isActive && completed) ? (
                            <CheckCircle
                              size={14}
                              className="text-emerald-400 flex-shrink-0"
                            />
                          ) : (
                            <LessonIcon
                              size={14}
                              className="flex-shrink-0"
                            />
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
        )}

        {/* Main Content */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <Link
              href={`/courses/${id}`}
              className="hover:text-text-primary transition-colors"
            >
              {course.title}
            </Link>
            <ChevronRight size={12} />
            <span>{currentModule?.title}</span>
            <ChevronRight size={12} />
            <span className="text-text-secondary">{currentLesson.title}</span>
          </div>

          {/* Lesson Content */}
          <div className="glass-card p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent-500/10 text-accent-400">
                <BookOpen size={20} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-text-primary">
                  {currentLesson.title}
                </h1>
                {currentLesson.description && (
                  <p className="text-sm text-text-muted mt-0.5">
                    {currentLesson.description}
                  </p>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="prose prose-invert max-w-none text-text-secondary leading-relaxed text-sm">
              {currentLesson.content ? (
                currentLesson.content.split("\n").map((line, i) => {
                  if (line.startsWith("# "))
                    return (
                      <h1
                        key={i}
                        className="text-2xl font-bold text-text-primary mt-8 mb-4 first:mt-0"
                      >
                        {line.slice(2)}
                      </h1>
                    );
                  if (line.startsWith("## "))
                    return (
                      <h2
                        key={i}
                        className="text-xl font-semibold text-text-primary mt-6 mb-3"
                      >
                        {line.slice(3)}
                      </h2>
                    );
                  if (line.startsWith("- "))
                    return (
                      <li key={i} className="ml-4 mb-1 text-text-secondary">
                        {line.slice(2)}
                      </li>
                    );
                  if (line.startsWith("**") && line.endsWith("**"))
                    return (
                      <p key={i} className="font-semibold text-text-primary mb-2">
                        {line.slice(2, -2)}
                      </p>
                    );
                  if (line.match(/^\d+\./))
                    return (
                      <li
                        key={i}
                        className="ml-4 mb-1 list-decimal text-text-secondary"
                      >
                        {line.replace(/^\d+\.\s*/, "")}
                      </li>
                    );
                  if (line.trim() === "") return <br key={i} />;
                  return (
                    <p key={i} className="mb-2 text-text-secondary">
                      {line}
                    </p>
                  );
                })
              ) : (
                <div className="text-center py-12 text-text-muted">
                  <BookOpen size={32} className="mx-auto mb-3 opacity-50" />
                  <p>Konten lesson akan tersedia setelah mentor melengkapinya.</p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
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
            <div className="flex items-center gap-3">
              {!completed && (
                <Button
                  onClick={() => setCompleted(true)}
                  icon={<CheckCircle size={16} />}
                >
                  Tandai Selesai
                </Button>
              )}
              {completed && (
                <span className="flex items-center gap-2 text-sm text-emerald-400 font-medium">
                  <CheckCircle size={16} /> Selesai
                </span>
              )}
              {nextLesson && (
                <Link href={`/courses/${id}/learn/${nextLesson.id}`}>
                  <Button variant="secondary" className="gap-2">
                    Selanjutnya <ChevronRight size={16} />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
