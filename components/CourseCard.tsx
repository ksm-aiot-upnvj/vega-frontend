import Link from "next/link";
import { cn, formatDuration, getInitials, truncate } from "@/lib/utils";
import { LEVEL_LABELS, LEVEL_COLORS } from "@/lib/utils";
import ProgressBar from "./ProgressBar";
import { Clock, Users, BookOpen } from "lucide-react";
import type { Course } from "@/types/course";

interface CourseCardProps {
  course: Course;
  progress?: number; // 0-100, undefined means not enrolled
  className?: string;
  mentorEditMode?: boolean;
}

export default function CourseCard({
  course,
  progress,
  className,
  mentorEditMode = false,
}: CourseCardProps) {
  const isEnrolled = progress !== undefined;

  return (
    <Link
      href={mentorEditMode ? `/mentor/courses/${course.id}` : `/courses/${course.id}`}
      className={cn("glass-card group block p-0 overflow-hidden", className)}
    >
      {/* Thumbnail */}
      <div className="relative h-40 bg-gradient-purple overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Level badge */}
        <div className="absolute top-3 left-3">
          <span
            className={cn(
              "inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-white/90 text-primary-900 border border-white/20 shadow-sm",
              LEVEL_COLORS[course.level]
            )}
          >
            {LEVEL_LABELS[course.level]}
          </span>
        </div>

        {/* Category */}
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-white/90 text-accent-700 shadow-sm">
            {course.category?.name || "Umum"}
          </span>
        </div>

        {/* Course icon */}
        <div className="absolute bottom-4 left-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/20 border border-white/30 group-hover:scale-110 transition-transform duration-300">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-3">
        <h3 className="text-base font-semibold text-text-primary group-hover:text-accent-600 transition-colors line-clamp-1">
          {course.title}
        </h3>
        <p className="text-sm text-text-muted line-clamp-2">
          {truncate(course.description, 100)}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-4 text-xs text-text-muted">
          <span className="flex items-center gap-1">
            <Clock size={13} />
            {formatDuration(course.estimated_duration)}
          </span>
          <span className="flex items-center gap-1">
            <BookOpen size={13} />
            {course.total_lessons} materi
          </span>
          <span className="flex items-center gap-1">
            <Users size={13} />
            {course.enrolled_count}
          </span>
        </div>

        {/* Mentor */}
        <div className="flex items-center gap-2 pt-1">
          <div className="flex items-center justify-center h-6 w-6 rounded-full bg-secondary-600 text-xs font-medium text-secondary-100">
            {getInitials(course.mentor_name)}
          </div>
          <span className="text-xs text-text-secondary">
            {course.mentor_name}
          </span>
        </div>

        {/* Progress bar (if enrolled) */}
        {isEnrolled && (
          <div className="pt-2 border-t border-border-secondary">
            <ProgressBar value={progress} size="sm" />
          </div>
        )}
      </div>
    </Link>
  );
}
