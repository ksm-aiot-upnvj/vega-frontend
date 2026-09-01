"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { Plus, GripVertical, Image as ImageIcon, Type, CheckSquare, Trash2, ArrowLeft } from "lucide-react";
import { getCourseById } from "@/lib/api";
import type { CourseWithModules } from "@/types/course";
import { useToast } from "@/components/Toast";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CourseBuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const [course, setCourse] = useState<CourseWithModules | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  // Mock builder state
  const [modules, setModules] = useState([
    { id: "1", title: "Pengenalan Dasar", lessons: [
      { id: "l1", type: "text", title: "Apa itu VEGA?", content: "" }
    ]}
  ]);

  useEffect(() => {
    getCourseById(resolvedParams.id)
      .then(setCourse)
      .catch(() => toast("error", "Error", "Gagal memuat course"))
      .finally(() => setLoading(false));
  }, [resolvedParams.id, toast]);

  const addModule = () => {
    setModules([...modules, { id: Date.now().toString(), title: "Modul Baru", lessons: [] }]);
  };

  const addLesson = (moduleId: string, type: string) => {
    setModules(modules.map(m => {
      if (m.id === moduleId) {
        return {
          ...m,
          lessons: [...m.lessons, { id: Date.now().toString(), type, title: `Lesson ${type} baru`, content: "" }]
        };
      }
      return m;
    }));
  };

  const removeModule = (moduleId: string) => {
    setModules(modules.filter(m => m.id !== moduleId));
  };

  const removeLesson = (moduleId: string, lessonId: string) => {
    setModules(modules.map(m => {
      if (m.id === moduleId) {
        return { ...m, lessons: m.lessons.filter(l => l.id !== lessonId) };
      }
      return m;
    }));
  };

  if (loading) return <DashboardLayout role="MENTOR"><div className="text-text-muted">Loading...</div></DashboardLayout>;
  if (!course) return <DashboardLayout role="MENTOR"><div className="text-text-muted">Course tidak ditemukan</div></DashboardLayout>;

  return (
    <DashboardLayout role="MENTOR">
      <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
        <div className="flex items-center gap-4">
          <Link href="/mentor/courses" className="p-2 rounded-xl bg-primary-800 text-text-muted hover:text-text-primary transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-text-primary truncate">
              {course.title}
            </h1>
            <p className="text-text-muted mt-1 flex items-center gap-2">
              Course Builder
              <span className="px-2 py-0.5 rounded bg-accent-500/10 text-accent-400 text-xs font-medium">{course.status}</span>
            </p>
          </div>
          <Button onClick={() => {
            toast("success", "Tersimpan", "Course berhasil disimpan (Draft)");
            router.push("/mentor/courses");
          }}>
            Simpan Perubahan
          </Button>
        </div>

        <div className="space-y-6">
          {modules.map((mod, mIndex) => (
            <div key={mod.id} className="glass-card p-6 border border-border-secondary">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3 w-full">
                  <GripVertical size={20} className="text-text-muted cursor-grab" />
                  <Input 
                    value={mod.title}
                    onChange={(e) => setModules(modules.map(m => m.id === mod.id ? {...m, title: e.target.value} : m))}
                    className="flex-1 font-bold text-lg border-transparent hover:border-border-secondary focus:border-accent-500"
                  />
                </div>
                <button onClick={() => removeModule(mod.id)} className="text-error-400 p-2 hover:bg-error-500/10 rounded-lg ml-2">
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="space-y-3 pl-8">
                {mod.lessons.map((lesson, lIndex) => (
                  <div key={lesson.id} className="bg-primary-800 rounded-xl p-4 border border-border-secondary flex items-start gap-3 group">
                    <GripVertical size={16} className="text-text-muted mt-2 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2">
                        {lesson.type === 'text' && <Type size={16} className="text-accent-400" />}
                        {lesson.type === 'image' && <ImageIcon size={16} className="text-emerald-400" />}
                        {lesson.type === 'task' && <CheckSquare size={16} className="text-amber-400" />}
                        <Input 
                          value={lesson.title}
                          onChange={(e) => {
                            setModules(modules.map(m => m.id === mod.id ? {...m, lessons: m.lessons.map(l => l.id === lesson.id ? {...l, title: e.target.value} : l)} : m))
                          }}
                          className="flex-1 text-sm bg-transparent border-transparent hover:border-border-secondary focus:border-accent-500"
                        />
                      </div>
                      
                      {lesson.type === 'text' && (
                        <textarea className="w-full bg-surface-secondary border border-border-secondary rounded-lg p-3 text-sm focus:border-accent-500 outline-none" rows={3} placeholder="Tulis konten teks di sini..." />
                      )}
                      {lesson.type === 'image' && (
                        <div className="w-full h-32 border-2 border-dashed border-border-secondary rounded-lg flex items-center justify-center text-text-muted text-sm hover:border-accent-500 hover:text-accent-400 cursor-pointer transition-colors">
                          <ImageIcon size={24} className="mb-2" /><br/>Klik untuk upload gambar
                        </div>
                      )}
                      {lesson.type === 'task' && (
                        <Input placeholder="Tulis instruksi tugas di sini..." className="text-sm" />
                      )}
                    </div>
                    <button onClick={() => removeLesson(mod.id, lesson.id)} className="text-error-400 p-1.5 hover:bg-error-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}

                <div className="flex items-center gap-2 pt-2">
                  <span className="text-sm font-medium text-text-muted mr-2">Tambah:</span>
                  <button onClick={() => addLesson(mod.id, 'text')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-800 border border-border-secondary text-xs text-text-primary hover:border-accent-500 transition-colors">
                    <Type size={14} className="text-accent-400" /> Teks
                  </button>
                  <button onClick={() => addLesson(mod.id, 'image')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-800 border border-border-secondary text-xs text-text-primary hover:border-emerald-500 transition-colors">
                    <ImageIcon size={14} className="text-emerald-400" /> Gambar
                  </button>
                  <button onClick={() => addLesson(mod.id, 'task')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-800 border border-border-secondary text-xs text-text-primary hover:border-amber-500 transition-colors">
                    <CheckSquare size={14} className="text-amber-400" /> Tugas
                  </button>
                </div>
              </div>
            </div>
          ))}

          <Button variant="outline" className="w-full border-dashed border-border-secondary text-text-muted hover:text-text-primary" onClick={addModule} icon={<Plus size={16} />}>
            Tambah Modul Baru
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
