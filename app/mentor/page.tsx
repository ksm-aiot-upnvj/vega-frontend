"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import CourseCard from "@/components/CourseCard";
import Button from "@/components/Button";
import { getCourses, getCurrentUser } from "@/lib/api";
import type { Course } from "@/types/course";
import type { User } from "@/types/user";
import { useToast } from "@/components/Toast";
import { Plus, BookOpen, Users, Star, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function MentorDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    Promise.all([
      getCurrentUser(),
      getCourses().catch(() => [])
    ])
    .then(([user, allCourses]) => {
      setCurrentUser(user);
      // Filter courses where the mentor is the current user
      const myCourses = allCourses.filter(c => c.mentor_id === user.id);
      setCourses(myCourses);
    })
    .catch(() => {
      toast("error", "Error", "Gagal memuat data dashboard");
    })
    .finally(() => {
      setLoading(false);
    });
  }, [toast]);

  const mentorCourses = courses.slice(0, 4);
  const totalStudents = courses.reduce(
    (sum, c) => sum + (c.enrolled_count || 0),
    0
  );

  if (loading) {
    return (
      <DashboardLayout role="MENTOR">
        <div className="text-text-muted">Loading data...</div>
      </DashboardLayout>
    );
  }

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
        <div className="grid grid-cols-2 gap-4 stagger">
          {[
            {
              label: "Course Aktif",
              value: courses.length,
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
          {mentorCourses.length === 0 ? (
            <p className="text-sm text-text-muted">Kamu belum memiliki course. Mulai buat course barumu!</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger">
              {mentorCourses.slice(0, 3).map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            Aktivitas Siswa Terkini
          </h2>
          <div className="space-y-4">
            <p className="text-sm text-text-muted italic">Belum ada aktivitas siswa.</p>
            {/* Mocked activities are removed per user request */}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
