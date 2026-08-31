"use client";

import DashboardLayout from "@/components/DashboardLayout";
import CourseCard from "@/components/CourseCard";
import ProgressBar from "@/components/ProgressBar";
import { getGreeting, formatPercentage } from "@/lib/utils";
import { mockCurrentUser, mockEnrollments } from "@/lib/mock-data";
import {
  BookOpen,
  CheckCircle,
  BarChart3,
  TrendingUp,
  ArrowRight,
  Clock,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const user = mockCurrentUser;
  const enrollments = mockEnrollments;
  const activeEnrollments = enrollments.filter(
    (e) => e.progress_percentage < 100
  );
  const lastCourse = activeEnrollments[0];

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Greeting */}
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-text-primary">
            {getGreeting()},{" "}
            <span className="text-gradient">{user.name.split(" ")[0]}</span> 👋
          </h1>
          <p className="text-text-muted mt-1">
            Lanjutkan perjalanan belajarmu hari ini
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
          {[
            {
              label: "Course Terdaftar",
              value: user.enrolled_courses_count,
              icon: BookOpen,
              color: "text-accent-400",
              bg: "bg-accent-500/10",
            },
            {
              label: "Course Selesai",
              value: user.completed_courses_count,
              icon: CheckCircle,
              color: "text-emerald-400",
              bg: "bg-emerald-500/10",
            },
            {
              label: "Lesson Selesai",
              value: user.total_lessons_completed,
              icon: TrendingUp,
              color: "text-amber-400",
              bg: "bg-amber-500/10",
            },
            {
              label: "Rata-rata Quiz",
              value: `${user.average_quiz_score}%`,
              icon: BarChart3,
              color: "text-rose-400",
              bg: "bg-rose-500/10",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="glass-card p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-xl ${stat.bg}`}
                >
                  <stat.icon size={20} className={stat.color} />
                </div>
              </div>
              <p className="text-2xl font-bold text-text-primary">
                {stat.value}
              </p>
              <p className="text-xs text-text-muted mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Continue Learning */}
        {lastCourse && lastCourse.course && (
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-accent-400" />
                <h2 className="text-lg font-semibold text-text-primary">
                  Lanjutkan Belajar
                </h2>
              </div>
              <Link
                href={`/courses/${lastCourse.course_id}`}
                className="text-sm text-accent-400 hover:text-accent-300 flex items-center gap-1 transition-colors"
              >
                Buka Course <ArrowRight size={14} />
              </Link>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <h3 className="text-base font-medium text-text-primary">
                  {lastCourse.course.title}
                </h3>
                <p className="text-sm text-text-muted mt-1">
                  {lastCourse.completed_lessons} dari {lastCourse.total_lessons}{" "}
                  lesson selesai
                </p>
              </div>
              <div className="w-full sm:w-48">
                <ProgressBar value={lastCourse.progress_percentage} />
              </div>
            </div>
          </div>
        )}

        {/* Enrolled Courses */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-text-primary">
              Course Saya
            </h2>
            <Link
              href="/courses"
              className="text-sm text-accent-400 hover:text-accent-300 flex items-center gap-1 transition-colors"
            >
              Lihat Semua <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger">
            {enrollments.slice(0, 3).map((enrollment) =>
              enrollment.course ? (
                <CourseCard
                  key={enrollment.id}
                  course={enrollment.course}
                  progress={enrollment.progress_percentage}
                />
              ) : null
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            Aktivitas Terkini
          </h2>
          <div className="space-y-4">
            {[
              {
                action: "Menyelesaikan lesson",
                target: "GPIO & Digital I/O",
                course: "IoT Fundamentals",
                time: "2 jam lalu",
              },
              {
                action: "Mengumpulkan assignment",
                target: "Linear Regression",
                course: "Machine Learning dengan Python",
                time: "1 hari lalu",
              },
              {
                action: "Menyelesaikan quiz",
                target: "Quiz: Pengantar IoT",
                course: "IoT Fundamentals",
                time: "3 hari lalu",
              },
            ].map((activity, i) => (
              <div
                key={i}
                className="flex items-start gap-3 pb-4 border-b border-border-secondary last:border-0 last:pb-0"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent-500/10 flex-shrink-0 mt-0.5">
                  <CheckCircle size={14} className="text-accent-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary">
                    {activity.action}:{" "}
                    <span className="font-medium">{activity.target}</span>
                  </p>
                  <p className="text-xs text-text-muted">{activity.course}</p>
                </div>
                <span className="text-xs text-text-muted whitespace-nowrap">
                  {activity.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
