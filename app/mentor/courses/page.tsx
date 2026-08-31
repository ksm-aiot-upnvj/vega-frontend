"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import DataTable from "@/components/DataTable";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Modal from "@/components/Modal";
import { useToast } from "@/components/Toast";
import { mockCourses } from "@/lib/mock-data";
import { LEVEL_LABELS, LEVEL_COLORS, formatDateShort, cn } from "@/lib/utils";
import { Plus, Edit, Trash2, Users } from "lucide-react";
import type { Course } from "@/types/course";

export default function MentorCoursesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [courseTitle, setCourseTitle] = useState("");
  const { toast } = useToast();
  const courses = mockCourses;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseTitle.trim()) {
      toast("error", "Error", "Judul course tidak boleh kosong");
      return;
    }
    toast("success", "Berhasil", "Course baru telah dibuat");
    setIsModalOpen(false);
    setCourseTitle("");
  };

  const columns = [
    {
      key: "title",
      header: "Course",
      render: (course: Course) => (
        <div>
          <p className="text-sm font-medium text-text-primary">
            {course.title}
          </p>
          <p className="text-xs text-text-muted">
            {course.category?.name}
          </p>
        </div>
      ),
    },
    {
      key: "level",
      header: "Level",
      render: (course: Course) => (
        <span
          className={cn(
            "text-xs font-medium",
            LEVEL_COLORS[course.level]
          )}
        >
          {LEVEL_LABELS[course.level]}
        </span>
      ),
    },
    {
      key: "students",
      header: "Siswa",
      render: (course: Course) => (
        <span className="text-sm text-text-secondary flex items-center gap-1">
          <Users size={13} /> {course.enrolled_count}
        </span>
      ),
    },
    {
      key: "lessons",
      header: "Lesson",
      render: (course: Course) => (
        <span className="text-sm text-text-secondary">
          {course.total_lessons}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (course: Course) => (
        <span
          className={cn(
            "px-2 py-0.5 rounded-md text-xs font-medium",
            course.status === "PUBLISHED"
              ? "bg-emerald-500/10 text-emerald-400"
              : course.status === "DRAFT"
              ? "bg-amber-500/10 text-amber-400"
              : "bg-primary-700 text-text-muted"
          )}
        >
          {course.status}
        </span>
      ),
    },
    {
      key: "created",
      header: "Dibuat",
      render: (course: Course) => (
        <span className="text-xs text-text-muted">
          {formatDateShort(course.created_at)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: () => (
        <div className="flex items-center gap-1">
          <button className="p-1.5 rounded-lg text-text-muted hover:text-accent-400 hover:bg-accent-500/10 transition-colors cursor-pointer">
            <Edit size={14} />
          </button>
          <button className="p-1.5 rounded-lg text-text-muted hover:text-error-400 hover:bg-error-500/10 transition-colors cursor-pointer">
            <Trash2 size={14} />
          </button>
        </div>
      ),
      className: "w-20",
    },
  ];

  return (
    <DashboardLayout role="MENTOR">
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              Kelola <span className="text-gradient">Course</span>
            </h1>
            <p className="text-text-muted mt-1">
              Buat dan kelola course yang kamu ampu
            </p>
          </div>
          <Button icon={<Plus size={16} />} onClick={() => setIsModalOpen(true)}>
            Buat Course Baru
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={courses}
          keyExtractor={(c) => c.id}
          emptyMessage="Belum ada course"
        />

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Buat Course Baru">
          <form onSubmit={handleCreate} className="space-y-4">
            <Input
              label="Judul Course"
              placeholder="Masukkan judul course..."
              value={courseTitle}
              onChange={(e) => setCourseTitle(e.target.value)}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                Batal
              </Button>
              <Button type="submit">
                Buat Draft
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
