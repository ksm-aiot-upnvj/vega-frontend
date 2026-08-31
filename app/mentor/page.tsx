"use client";

import DashboardLayout from "@/components/DashboardLayout";
import CourseCard from "@/components/CourseCard";
import Button from "@/components/Button";
import { mockCourses } from "@/lib/mock-data";
import { Plus, BookOpen, Users, Star, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function MentorDashboard() {
  const mentorCourses = mockCourses.slice(0, 4);
  const totalStudents = mentorCourses.reduce(
    (sum, c) => sum + c.enrolled_count,
    0
  );

  return (
    <DashboardLayout role="MENTOR">
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              Mentor <span className="text-gradient">Dashboard</span>
            </h1>
            <p className="text-text-muted mt-1">
              Kelola course dan pantau progress siswa
            </p>
          </div>
          <Link href="/mentor/courses">
            <Button icon={<Plus size={16} />}>Buat Course</Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 stagger">
          {[
            {
              label: "Course Aktif",
              value: mentorCourses.length,
              icon: BookOpen,
              color: "text-accent-400",
              bg: "bg-accent-500/10",
            },
            {
              label: "Total Siswa",
              value: totalStudents,
              icon: Users,
              color: "text-emerald-400",
              bg: "bg-emerald-500/10",
            },
            {
              label: "Rating",
              value: "4.8",
              icon: Star,
              color: "text-amber-400",
              bg: "bg-amber-500/10",
            },
          ].map((stat) => (
            <div key={stat.label} className="glass-card p-5">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-xl ${stat.bg} mb-3`}
              >
                <stat.icon size={20} className={stat.color} />
              </div>
              <p className="text-2xl font-bold text-text-primary">
                {stat.value}
              </p>
              <p className="text-xs text-text-muted mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* My Courses */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-text-primary">
              Course Saya
            </h2>
            <Link
              href="/mentor/courses"
              className="text-sm text-accent-400 hover:text-accent-300 flex items-center gap-1 transition-colors"
            >
              Lihat Semua <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger">
            {mentorCourses.slice(0, 3).map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            Aktivitas Siswa Terkini
          </h2>
          <div className="space-y-4">
            {[
              {
                student: "Aisyah Rahmawati",
                action: "Menyelesaikan lesson GPIO & Digital I/O",
                course: "IoT Fundamentals",
                time: "2 jam lalu",
              },
              {
                student: "Budi Santoso",
                action: "Mengumpulkan assignment Linear Regression",
                course: "Machine Learning",
                time: "5 jam lalu",
              },
              {
                student: "Cindy Putri",
                action: "Menyelesaikan Quiz Pengantar IoT",
                course: "IoT Fundamentals",
                time: "1 hari lalu",
              },
            ].map((activity, i) => (
              <div
                key={i}
                className="flex items-start gap-3 pb-4 border-b border-border-secondary last:border-0 last:pb-0"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary-600 text-xs font-medium text-secondary-100 flex-shrink-0">
                  {activity.student
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary">
                    <span className="font-medium">{activity.student}</span> —{" "}
                    {activity.action}
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
