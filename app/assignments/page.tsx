"use client";

import DashboardLayout from "@/components/DashboardLayout";
import EmptyState from "@/components/EmptyState";
import { mockAssignments } from "@/lib/mock-data";
import { STATUS_LABELS, cn, formatDateShort } from "@/lib/utils";
import {
  ClipboardList,
  Clock,
  CheckCircle,
  AlertCircle,
  RotateCcw,
  ExternalLink,
  GitBranch,
  File,
} from "lucide-react";
import type { SubmissionStatus } from "@/types/assignment";

const statusConfig: Record<
  SubmissionStatus,
  { icon: typeof Clock; color: string; bg: string }
> = {
  PENDING: { icon: Clock, color: "text-text-muted", bg: "bg-primary-700" },
  SUBMITTED: {
    icon: AlertCircle,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
  },
  GRADED: {
    icon: CheckCircle,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  REVISION_REQUESTED: {
    icon: RotateCcw,
    color: "text-rose-400",
    bg: "bg-rose-500/10",
  },
};

export default function AssignmentsPage() {
  const assignments = mockAssignments;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            <span className="text-gradient">Assignments</span>
          </h1>
          <p className="text-text-muted mt-1">
            Tugas dan project dari course yang kamu ikuti
          </p>
        </div>

        {assignments.length === 0 ? (
          <EmptyState
            icon={<ClipboardList className="h-7 w-7 text-text-muted" />}
            title="Belum ada assignment"
            description="Assignment akan muncul ketika kamu enroll di course yang memiliki tugas"
          />
        ) : (
          <div className="space-y-4 stagger">
            {assignments.map((assignment) => {
              const status = assignment.submission?.status || "PENDING";
              const config = statusConfig[status];
              const StatusIcon = config.icon;

              return (
                <div key={assignment.id} className="glass-card p-6 space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-text-muted">
                          {assignment.course_title}
                        </span>
                      </div>
                      <h3 className="text-base font-semibold text-text-primary">
                        {assignment.title}
                      </h3>
                      <p className="text-sm text-text-muted mt-1 line-clamp-2">
                        {assignment.description}
                      </p>
                    </div>
                    <div
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap",
                        config.bg,
                        config.color
                      )}
                    >
                      <StatusIcon size={13} />
                      {STATUS_LABELS[status]}
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted">
                    {assignment.due_date && (
                      <span className="flex items-center gap-1">
                        <Clock size={13} />
                        Deadline: {formatDateShort(assignment.due_date)}
                      </span>
                    )}
                    <span>Maks. Nilai: {assignment.max_score}</span>
                    <span className="flex items-center gap-1">
                      Format:{" "}
                      {assignment.accepted_types.map((t) => t).join(", ")}
                    </span>
                  </div>

                  {/* Submission Info */}
                  {assignment.submission && (
                    <div className="p-4 rounded-xl bg-primary-800/50 border border-border-secondary space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-text-secondary">
                          Submission
                        </span>
                        <span className="text-xs text-text-muted">
                          {formatDateShort(assignment.submission.submitted_at)}
                        </span>
                      </div>

                      {assignment.submission.github_url && (
                        <a
                          href={assignment.submission.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-accent-400 hover:text-accent-300 transition-colors"
                        >
                          <GitBranch size={14} />
                          {assignment.submission.github_url}
                          <ExternalLink size={12} />
                        </a>
                      )}

                      {assignment.submission.file_url && (
                        <div className="flex items-center gap-2 text-sm text-text-secondary">
                          <File size={14} />
                          {assignment.submission.file_url.split("/").pop()}
                        </div>
                      )}

                      {assignment.submission.score !== undefined && (
                        <div className="flex items-center justify-between pt-2 border-t border-border-secondary">
                          <span className="text-sm font-medium text-text-primary">
                            Nilai: {assignment.submission.score}/
                            {assignment.max_score}
                          </span>
                        </div>
                      )}

                      {assignment.submission.feedback && (
                        <div className="pt-2 border-t border-border-secondary">
                          <p className="text-xs text-text-muted mb-1">
                            Feedback mentor:
                          </p>
                          <p className="text-sm text-text-secondary italic">
                            &ldquo;{assignment.submission.feedback}&rdquo;
                          </p>
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
