"use client";
import { PageLoader } from "@/components/LoadingState";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import DataTable from "@/components/DataTable";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Modal from "@/components/Modal";
import { useToast } from "@/components/Toast";
import { LEVEL_LABELS, LEVEL_COLORS, formatDateShort, cn } from "@/lib/utils";
import { Plus, Edit, Trash2, Users } from "lucide-react";
import type { Course } from "@/types/course";
import { getCourses, createCourse, getCategories, deleteCourse } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function MentorCoursesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [courseForm, setCourseForm] = useState({ title: "", description: "", level: "BEGINNER", category_id: "" });
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const { toast } = useToast();
  const router = useRouter();
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await getCourses();
      // Assuming backend already filters if needed, or we filter mentor's courses
      setCourses(data);
    } catch (err) {
      toast("error", "Error", "Gagal memuat course");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
      if (data.length > 0) {
        setCourseForm(prev => ({ ...prev, category_id: data[0].id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchCategories();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseForm.title.trim() || !courseForm.category_id) {
      toast("error", "Error", "Data wajib diisi");
      return;
    }
    try {
      const newCourse = await createCourse({
        title: courseForm.title,
        description: courseForm.description,
        level: courseForm.level as any,
        category_id: courseForm.category_id
      });
      toast("success", "Berhasil", "Course baru telah dibuat");
      setIsModalOpen(false);
      router.push(`/mentor/courses/${newCourse.id}`);
    } catch (err) {
      toast("error", "Error", "Gagal membuat course");
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus course ini?")) return;
    try {
      await deleteCourse(id);
      toast("success", "Berhasil", "Course berhasil dihapus");
      setCourses(courses.filter(c => c.id !== id));
    } catch (err) {
      toast("error", "Error", "Gagal menghapus course");
    }
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
      key: "status",
      header: "Status",
      render: (course: Course) => (
        <span
          className={cn(
            "px-2 py-0.5 rounded-md text-xs font-medium",
            course.status === "PUBLISHED"
              ? "bg-emerald-500/10 text-emerald-400"
              : course.status === "DRAFT"
              ? "bg-amber-500/10 text-amber-500"
              : "bg-surface-secondary border border-border-secondary text-text-muted"
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
          {course.created_at ? formatDateShort(course.created_at) : "-"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (course: Course) => (
        <div className="flex items-center gap-1">
          <button 
            onClick={() => router.push(`/mentor/courses/${course.id}`)}
            className="p-1.5 rounded-lg text-text-muted hover:text-accent-400 hover:bg-accent-500/10 transition-colors cursor-pointer"
          >
            <Edit size={14} />
          </button>
          <button onClick={() => handleDeleteCourse(course.id)} className="p-1.5 rounded-lg text-text-muted hover:text-error-400 hover:bg-error-500/10 transition-colors cursor-pointer">
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

        {loading ? (
          <PageLoader />
        ) : (
          <DataTable
            columns={columns}
            data={courses}
            keyExtractor={(c) => c.id}
            emptyMessage="Belum ada course"
          />
        )}

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Buat Course Baru">
          <form onSubmit={handleCreate} className="space-y-4">
            <Input
              label="Judul Course"
              placeholder="Masukkan judul course..."
              value={courseForm.title}
              onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
            />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-text-secondary">Deskripsi</label>
                <textarea
                  className="w-full bg-white border border-border-primary rounded-xl px-4 py-2.5 text-sm text-text-primary shadow-sm focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500 transition-all"
                rows={3}
                value={courseForm.description}
                onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-text-secondary">Kategori</label>
                <select
                  className="w-full bg-white border border-border-primary rounded-xl px-4 py-2.5 text-sm text-text-primary shadow-sm focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500 transition-all"
                  value={courseForm.category_id}
                  onChange={(e) => setCourseForm({ ...courseForm, category_id: e.target.value })}
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-text-secondary">Level</label>
                <select
                  className="w-full bg-white border border-border-primary rounded-xl px-4 py-2.5 text-sm text-text-primary shadow-sm focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500 transition-all"
                  value={courseForm.level}
                  onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value })}
                >
                  <option value="BEGINNER">Pemula</option>
                  <option value="INTERMEDIATE">Menengah</option>
                  <option value="ADVANCED">Mahir</option>
                </select>
              </div>
            </div>
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
