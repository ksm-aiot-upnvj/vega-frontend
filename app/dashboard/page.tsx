"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import CourseCard from "@/components/CourseCard";
import ProgressBar from "@/components/ProgressBar";
import DeadlineCalendar, { DeadlineEvent } from "@/components/DeadlineCalendar";
import { getGreeting } from "@/lib/utils";
import { getCurrentUser, getMyEnrollments, getCourses, getDeadlines } from "@/lib/api";
import type { User } from "@/types/user";
import type { Enrollment, Course } from "@/types/course";
import { useToast } from "@/components/Toast";
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
  const [user, setUser] = useState<User | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [mentorCourses, setMentorCourses] = useState<Course[]>([]);
  const [deadlineEvents, setDeadlineEvents] = useState<DeadlineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    Promise.all([
      getCurrentUser(),
      getMyEnrollments().catch(() => []),
      getCourses().catch(() => []),
      getDeadlines().catch(() => []),
    ])
    .then(([userData, enrollmentsData, coursesData, deadlinesData]) => {
      setUser(userData);
      setEnrollments(enrollmentsData);
      if (userData.role === 'MENTOR') {
        setMentorCourses(coursesData.filter(c => c.mentor_name === userData.name));
      }
      setDeadlineEvents(deadlinesData);
    })
    .catch(() => {
      toast("error", "Error", "Gagal memuat data dashboard");
    })
    .finally(() => {
      setLoading(false);
    });
  }, [toast]);

  if (loading || !user) {
    return (
      <DashboardLayout>
        <div className="text-text-muted">Loading data...</div>
      </DashboardLayout>
    );
  }

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
              value: enrollments.length,
              icon: BookOpen,
              color: "text-accent-400",
              bg: "bg-accent-500/10",
            },
            {
              label: "Course Selesai",
              value: enrollments.filter(e => e.progress_percentage === 100).length,
              icon: CheckCircle,
              color: "text-emerald-400",
              bg: "bg-emerald-500/10",
            },
            {
              label: "Lesson Selesai",
              value: enrollments.reduce((sum, e) => sum + (e.completed_lessons || 0), 0),
              icon: TrendingUp,
              color: "text-amber-400",
              bg: "bg-amber-500/10",
            },
            {
              label: "Rata-rata Quiz",
              value: user.average_quiz_score ? `${user.average_quiz_score}%` : "-",
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

        {/* Course Saya + Kalender Deadline — side by side */}
        <div className="flex flex-col lg:flex-row gap-5">
          {/* Left: Course list (50%) */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary">
                {user.role === 'MENTOR' ? 'Course Buatanku' : 'Course Saya'}
              </h2>
              <Link
                href={user.role === 'MENTOR' ? "/mentor/courses" : "/courses"}
                className="text-sm text-accent-400 hover:text-accent-300 flex items-center gap-1 transition-colors"
              >
                Lihat Semua <ArrowRight size={14} />
              </Link>
            </div>

            {/* Horizontal scrollable course strip */}
            {user.role === 'MENTOR' ? (
              mentorCourses.length === 0 ? (
                <p className="text-sm text-text-muted">Kamu belum membuat course apapun.</p>
              ) : (
                <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory">
                  {mentorCourses.map((course) => (
                    <div key={course.id} className="snap-start flex-shrink-0 w-64">
                      <CourseCard course={course} mentorEditMode={true} />
                    </div>
                  ))}
                </div>
              )
            ) : (
              enrollments.length === 0 ? (
                <p className="text-sm text-text-muted">Kamu belum terdaftar di course apapun.</p>
              ) : (
                <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory">
                  {enrollments.map((enrollment) =>
                    enrollment.course ? (
                      <div key={enrollment.id} className="snap-start flex-shrink-0 w-64">
                        <CourseCard
                          course={enrollment.course}
                          progress={enrollment.progress_percentage}
                        />
                      </div>
                    ) : null
                  )}
                </div>
              )
            )}
          </div>

          {/* Right: Deadline Calendar (50%) */}
          <div className="lg:w-72 xl:w-80 flex-shrink-0">
            <DeadlineCalendar events={deadlineEvents} />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            Aktivitas Terkini
          </h2>
          <div className="space-y-4">
            <p className="text-sm text-text-muted italic">Belum ada aktivitas.</p>
            {/* Mocked activities are removed per user request */}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
