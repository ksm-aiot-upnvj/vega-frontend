"use client";

import { use } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProgressBar from "@/components/ProgressBar";
import Button from "@/components/Button";
import {
  mockCourseDetail,
  mockEnrollments,
  mockQuiz,
} from "@/lib/mock-data";
import {
  LEVEL_LABELS,
  LEVEL_COLORS,
  formatDuration,
  getInitials,
  cn,
} from "@/lib/utils";
import {
  Clock,
  Users,
  BookOpen,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Play,
  FileText,
  Video,
  Link as LinkIcon,
  File,
  Award,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { LessonType } from "@/types/course";

const lessonTypeIcons: Record<LessonType, typeof FileText> = {
  TEXT: FileText,
  VIDEO: Video,
  PDF: File,
  FILE: File,
  LINK: LinkIcon,
};

export default function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const course = mockCourseDetail;
  const enrollment = mockEnrollments.find((e) => e.course_id === id);
  const isEnrolled = !!enrollment;
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set(course.modules.map((m) => m.id))
  );

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  };

  const completedLessons = course.modules
    .flatMap((m) => m.lessons)
    .filter((l) => l.is_completed).length;
  const totalLessons = course.modules.flatMap((m) => m.lessons).length;
  const progressPercent =
    totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        {/* Course Header */}
        <div className="glass-card p-0 overflow-hidden">
          {/* Banner */}
          <div className="relative h-48 bg-gradient-purple overflow-hidden">
            <div className="absolute inset-0 dot-pattern opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-t from-surface-elevated to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex items-center gap-2 mb-3">
                <span
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-xs font-medium bg-primary-900/70 backdrop-blur-sm border border-border-primary",
                    LEVEL_COLORS[course.level]
                  )}
                >
                  {LEVEL_LABELS[course.level]}
                </span>
                <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-accent-500/20 text-accent-300 backdrop-blur-sm">
                  {course.category?.name}
                </span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-text-primary">
                {course.title}
              </h1>
            </div>
          </div>

          {/* Info */}
          <div className="p-6 space-y-4">
            <p className="text-sm text-text-muted leading-relaxed">
              {course.description}
            </p>

            <div className="flex flex-wrap items-center gap-5 text-sm text-text-muted">
              <span className="flex items-center gap-1.5">
                <Clock size={15} />
                {formatDuration(course.estimated_duration)}
              </span>
              <span className="flex items-center gap-1.5">
                <BookOpen size={15} />
                {course.total_modules} modul · {course.total_lessons} lesson
              </span>
              <span className="flex items-center gap-1.5">
                <Users size={15} />
                {course.enrolled_count} terdaftar
              </span>
            </div>

            {/* Mentor */}
            <div className="flex items-center gap-3 pt-2">
              <div className="flex items-center justify-center w-9 h-9 rounded-full bg-secondary-600 text-sm font-medium text-secondary-100">
                {getInitials(course.mentor_name)}
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary">
                  {course.mentor_name}
                </p>
                <p className="text-xs text-text-muted">Mentor</p>
              </div>
            </div>

            {/* Progress / Enroll */}
            {isEnrolled ? (
              <div className="pt-4 border-t border-border-secondary">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-text-secondary">
                    Progress: {completedLessons}/{totalLessons} lesson
                  </span>
                  {progressPercent >= 100 && (
                    <span className="flex items-center gap-1 text-emerald-400 text-sm font-medium">
                      <Award size={16} /> Selesai!
                    </span>
                  )}
                </div>
                <ProgressBar value={progressPercent} size="md" />
              </div>
            ) : (
              <div className="pt-4 border-t border-border-secondary">
                <Button size="lg" icon={<Play size={16} />}>
                  Enroll Course
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Quiz quick link */}
        <Link
          href={`/courses/${id}/quiz/${mockQuiz.id}`}
          className="glass-card p-4 flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400">
              <Award size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary group-hover:text-accent-300 transition-colors">
                {mockQuiz.title}
              </p>
              <p className="text-xs text-text-muted">
                {mockQuiz.total_questions} soal ·{" "}
                {mockQuiz.time_limit && `${mockQuiz.time_limit} menit`}
              </p>
            </div>
          </div>
          <ChevronRight size={18} className="text-text-muted" />
        </Link>

        {/* Modules Accordion */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-text-primary">
            Konten Course
          </h2>
          {course.modules.map((module) => {
            const isExpanded = expandedModules.has(module.id);
            const moduleCompleted = module.lessons.filter(
              (l) => l.is_completed
            ).length;

            return (
              <div
                key={module.id}
                className="glass-card p-0 overflow-hidden"
              >
                {/* Module Header */}
                <button
                  onClick={() => toggleModule(module.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-primary-700/30 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-secondary-700 text-sm font-bold text-secondary-200">
                      {module.order}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-text-primary">
                        {module.title}
                      </p>
                      <p className="text-xs text-text-muted">
                        {moduleCompleted}/{module.lessons.length} lesson selesai
                      </p>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronDown size={18} className="text-text-muted" />
                  ) : (
                    <ChevronRight size={18} className="text-text-muted" />
                  )}
                </button>

                {/* Lessons */}
                {isExpanded && (
                  <div className="border-t border-border-secondary">
                    {module.lessons.map((lesson) => {
                      const LessonIcon =
                        lessonTypeIcons[lesson.lesson_type] || FileText;
                      return (
                        <Link
                          key={lesson.id}
                          href={`/courses/${id}/learn/${lesson.id}`}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-primary-700/20 transition-colors border-b border-border-secondary last:border-0"
                        >
                          <div
                            className={cn(
                              "flex items-center justify-center w-7 h-7 rounded-lg flex-shrink-0",
                              lesson.is_completed
                                ? "bg-emerald-500/10 text-emerald-400"
                                : "bg-primary-700 text-text-muted"
                            )}
                          >
                            {lesson.is_completed ? (
                              <CheckCircle size={14} />
                            ) : (
                              <LessonIcon size={14} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className={cn(
                                "text-sm",
                                lesson.is_completed
                                  ? "text-text-muted line-through"
                                  : "text-text-primary"
                              )}
                            >
                              {lesson.title}
                            </p>
                          </div>
                          <span className="text-xs text-text-muted whitespace-nowrap">
                            {lesson.duration} min
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
