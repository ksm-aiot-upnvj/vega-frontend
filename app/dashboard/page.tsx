"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProgressBar from "@/components/ProgressBar";
import DeadlineCalendar, { DeadlineEvent } from "@/components/DeadlineCalendar";
import AnnouncementList from "@/components/AnnouncementList";
import { getGreeting } from "@/lib/utils";
import { getCurrentUser, getMyEnrollments, getCourses, getDeadlines, getAnnouncements, Announcement } from "@/lib/api";
import type { User } from "@/types/user";
import type { Enrollment, Course } from "@/types/course";
import { BellRing } from "lucide-react";
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
import CourseCard from "@/components/CourseCard";

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [mentorCourses, setMentorCourses] = useState<Course[]>([]);
  const [deadlineEvents, setDeadlineEvents] = useState<DeadlineEvent[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    Promise.all([
      getCurrentUser(),
      getMyEnrollments().catch(() => []),
      getCourses().catch(() => []),
      getDeadlines().catch(() => []),
      getAnnouncements().catch(() => []),
    ])
    .then(([userData, enrollmentsData, coursesData, deadlinesData, announcementsData]) => {
      setUser(userData);
      setEnrollments(enrollmentsData);
      setCourses(coursesData);
      if (userData.role === 'MENTOR') {
        setMentorCourses(coursesData.filter(c => c.mentor_name === userData.name));
      }
      setDeadlineEvents(deadlinesData);
      setAnnouncements(announcementsData);
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

  const handleNotifyToggle = (id: string, isNotified: boolean) => {
    setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, is_notified: isNotified } : a));
  };

  // Find active notifications (H-3 to D-day)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const activeNotifications = announcements.filter(a => {
    if (!a.is_notified || !a.event_date) return false;
    const eventDate = new Date(a.event_date);
    eventDate.setHours(0, 0, 0, 0);
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 3;
  });

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
            <span className="text-gradient">{user.name.split(" ")[0]}</span>
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
              color: "text-accent-600",
              bg: "bg-accent-500/10",
            },
            {
              label: "Course Selesai",
              value: enrollments.filter(e => e.progress_percentage === 100).length,
              icon: CheckCircle,
              color: "text-emerald-600",
              bg: "bg-emerald-500/10",
            },
            {
              label: "Lesson Selesai",
              value: enrollments.reduce((sum, e) => sum + (e.completed_lessons || 0), 0),
              icon: TrendingUp,
              color: "text-amber-600",
              bg: "bg-amber-500/10",
            },
            {
              label: "Rata-rata Quiz",
              value: user.average_quiz_score ? `${user.average_quiz_score}%` : "-",
              icon: BarChart3,
              color: "text-rose-600",
              bg: "bg-rose-500/10",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="glass-card p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-md ${stat.bg}`}
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

        {/* Announcements and Calendar Row */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Announcements (80%) */}
          <section className="glass-card p-6 lg:w-4/5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-text-primary">Pengumuman</h2>
              <Link href="/dashboard/announcements">
                <span className="text-sm text-accent-600 hover:text-accent-700 flex items-center gap-1 transition-colors">
                  Lihat Semua <ArrowRight size={14} />
                </span>
              </Link>
            </div>
            <AnnouncementList 
              announcements={announcements.slice(0, 3)} 
              onNotifyToggle={handleNotifyToggle} 
            />
          </section>

          {/* Calendar (20%) */}
          <div className="lg:w-1/5 min-w-[280px]">
            <DeadlineCalendar 
              events={[
                ...deadlineEvents,
                ...announcements
                  .filter(a => a.is_notified && a.event_date)
                  .map(a => ({
                    id: `ann-${a.id}`,
                    date: a.event_date!,
                    title: a.title,
                    course_title: "Pengumuman",
                    type: "announcement" as const
                  }))
              ]} 
            />
          </div>
        </div>

        {/* Notifications */}
        {activeNotifications.length > 0 && (
          <div className="flex flex-col gap-2">
            {activeNotifications.map(notification => {
              const eventDate = new Date(notification.event_date!);
              eventDate.setHours(0, 0, 0, 0);
              const diffTime = eventDate.getTime() - today.getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              const dayLabel = diffDays === 0 ? "Hari ini" : `H-${diffDays}`;
              
              return (
                <div key={`notif-${notification.id}`} className="glass-card bg-amber-500/10 border-amber-500/30 p-4 flex items-start gap-4 animate-in fade-in slide-in-from-top-2">
                  <div className="p-2 rounded-md bg-amber-500/20 text-amber-600">
                    <BellRing size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-amber-600">Pengingat: {notification.title} ({dayLabel})</h3>
                    <p className="text-xs text-text-secondary mt-1">Acara akan berlangsung pada {new Date(notification.event_date!).toLocaleString("id-ID")}. Jangan sampai ketinggalan!</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Course Saya */}
        <div className="w-full">
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary">
                {user.role === 'MENTOR' ? 'Course Buatanku' : 'Course Saya'}
              </h2>
              <Link
                href={user.role === 'MENTOR' ? "/mentor/courses" : "/courses"}
                className="text-sm text-accent-600 hover:text-accent-700 flex items-center gap-1 transition-colors"
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
          </section>
        </div>
        {/* Footer Aktivitas Terkini */}
        <footer className="pt-6 border-t border-border-primary">
          <h2 className="text-sm font-semibold text-text-secondary mb-2">
            Aktivitas Terkini
          </h2>
          <p className="text-xs text-text-muted italic">Belum ada aktivitas.</p>
        </footer>
      </div>
    </DashboardLayout>
  );
}
