"use client";
import { PageLoader } from "@/components/LoadingState";

import { use, useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProgressBar from "@/components/ProgressBar";
import Button from "@/components/Button";
import { getCourseById, getMyEnrollments, enrollCourse, getCourseProgress } from "@/lib/api";
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
import type { LessonType, CourseWithModules, Enrollment } from "@/types/course";
import { useToast } from "@/components/Toast";

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
  const [course, setCourse] = useState<CourseWithModules | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [userProgress, setUserProgress] = useState<Record<string, { is_completed: boolean }>>({});
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    Promise.all([
      getCourseById(id),
      getMyEnrollments().catch(() => []),
      getCourseProgress(id).catch(() => ({}))
    ])
    .then(([courseData, enrollmentsData, progressData]) => {
      setCourse(courseData);
      setExpandedModules(new Set(courseData.modules?.map((m) => m.id) || []));
      setUserProgress(progressData);
      
      const userEnrollment = enrollmentsData.find((e) => e.course_id === id);
      if (userEnrollment) {
        setEnrollment(userEnrollment);
      }
    })
    .catch(() => {
      toast("error", "Error", "Gagal memuat detail course");
    })
    .finally(() => {
      setLoading(false);
    });
  }, [id, toast]);

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      const newEnrollment = await enrollCourse(id);
      setEnrollment(newEnrollment);
      toast("success", "Berhasil", "Kamu berhasil mendaftar ke course ini!");
    } catch (err) {
      toast("error", "Error", "Gagal mendaftar ke course");
    } finally {
      setEnrolling(false);
    }
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  };

  if (loading) {
    return <DashboardLayout><PageLoader /></DashboardLayout>;
  }

  if (!course) {
    return <DashboardLayout><div className="text-text-muted">Course tidak ditemukan</div></DashboardLayout>;
  }

  const isEnrolled = !!enrollment;
  const completedLessons = enrollment?.completed_lessons || 0;
  const totalLessons = course.total_lessons || 0;
  const progressPercent = enrollment?.progress_percentage || 0;

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
                    "px-2.5 py-1 rounded-lg text-xs font-medium bg-white shadow-sm",
                    LEVEL_COLORS[course.level]
                  )}
                >
                  {LEVEL_LABELS[course.level]}
                </span>
                <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white/20 text-white backdrop-blur-sm">
                  {course.category?.name || "Umum"}
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
                <Button size="lg" icon={<Play size={16} />} onClick={handleEnroll} loading={enrolling}>
                  Enroll Course
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Modules Accordion */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-text-primary">
            Konten Course
          </h2>
          {(!course.modules || course.modules.length === 0) && (
            <p className="text-sm text-text-muted">Belum ada konten pada course ini.</p>
          )}
          {course.modules?.map((module) => {
            const isExpanded = expandedModules.has(module.id);
            const moduleCompleted = module.lessons?.filter(
              (l) => userProgress[l.id]?.is_completed || l.is_completed
            ).length || 0;
            const moduleLessonsCount = module.lessons?.length || 0;

            return (
              <div
                key={module.id}
                className="glass-card p-0 overflow-hidden"
              >
                {/* Module Header */}
                <button
                  onClick={() => toggleModule(module.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-primary-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-100 text-sm font-bold text-text-primary">
                      {module.order}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-text-primary">
                        {module.title}
                      </p>
                      <p className="text-xs text-text-muted">
                        {moduleCompleted}/{moduleLessonsCount} lesson selesai
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
                {isExpanded && module.lessons && (
                  <div className="border-t border-border-secondary">
                    {module.lessons.map((lesson) => {
                      const LessonIcon =
                        lessonTypeIcons[lesson.lesson_type] || FileText;
                      const isLessonCompleted = userProgress[lesson.id]?.is_completed || lesson.is_completed;
                      return (
                        <Link
                          key={lesson.id}
                          href={isEnrolled ? `/courses/${id}/learn/${lesson.id}` : "#"}
                          onClick={(e) => {
                            if (!isEnrolled) {
                              e.preventDefault();
                              toast("error", "Error", "Kamu harus enroll course ini terlebih dahulu.");
                            }
                          }}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-primary-50 transition-colors border-b border-border-secondary last:border-0"
                        >
                          <div
                            className={cn(
                              "flex items-center justify-center w-7 h-7 rounded-lg flex-shrink-0",
                              isLessonCompleted
                                ? "bg-emerald-500/10 text-emerald-400"
                                : "bg-primary-100 text-text-muted"
                            )}
                          >
                            {isLessonCompleted ? (
                              <CheckCircle size={14} />
                            ) : (
                              <LessonIcon size={14} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className={cn(
                                "text-sm",
                                isLessonCompleted
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
