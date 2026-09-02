"use client";
import { PageLoader } from "@/components/LoadingState";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import Button from "@/components/Button";
import Input from "@/components/Input";
import DeadlineCalendar from "@/components/DeadlineCalendar";
import { Plus, GripVertical, Type, CheckSquare, Trash2, ArrowLeft, Link as LinkIcon, FileText, HelpCircle, CalendarDays, X } from "lucide-react";
import { getCourseById, saveCourseBuilder } from "@/lib/api";
import type { CourseWithModules, Module } from "@/types/course";
import { useToast } from "@/components/Toast";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CourseBuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const [course, setCourse] = useState<CourseWithModules | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  // Builder state
  const [modules, setModules] = useState<any[]>([]);
  // Track which module has the calendar picker open
  const [openCalendarId, setOpenCalendarId] = useState<string | null>(null);

  useEffect(() => {
    getCourseById(resolvedParams.id)
      .then((data) => {
        setCourse(data);
        if (data.modules && data.modules.length > 0) {
          // Map backend schema to frontend builder state
          const mappedModules = data.modules.map((m: any) => ({
            id: m.id,
            title: m.title,
            deadline: m.deadline || "",
            lessons: m.lessons.map((l: any) => ({
              id: l.id,
              type: l.lesson_type.toLowerCase(),
              title: l.title,
              content: l.content || (l.lesson_type === 'QUIZ' ? "[]" : ""),
              task_code: l.task_code || ""
            }))
          }));
          setModules(mappedModules);
        } else {
          setModules([{ id: "1", title: "Pengenalan Dasar", deadline: "", lessons: [] }]);
        }
      })
      .catch(() => toast("error", "Error", "Gagal memuat course"))
      .finally(() => setLoading(false));
  }, [resolvedParams.id, toast]);

  const handleSave = async () => {
    try {
      const payload = {
        modules: modules.map((m, mIndex) => ({
          id: m.id.includes("-") ? m.id : undefined, // Check if it's a UUID or timestamp
          title: m.title,
          order: mIndex + 1,
          deadline: m.deadline || undefined,
          lessons: m.lessons.map((l: any, lIndex: number) => ({
            id: l.id.includes("-") ? l.id : undefined,
            title: l.title,
            content: l.content,
            lesson_type: l.type.toUpperCase(),
            order: lIndex + 1,
            task_code: l.type === 'task' ? l.task_code || "" : undefined
          }))
        }))
      };
      await saveCourseBuilder(resolvedParams.id, payload);
      toast("success", "Tersimpan", "Course berhasil disimpan");
      router.push("/mentor/courses");
    } catch (err) {
      toast("error", "Error", "Gagal menyimpan course");
    }
  };

  const handlePublish = async () => {
    try {
      // Import publishCourse dynamically or add to imports
      const { publishCourse } = await import("@/lib/api");
      await publishCourse(resolvedParams.id);
      toast("success", "Dipublish", "Course berhasil dipublish");
      router.push("/mentor/courses");
    } catch (err) {
      toast("error", "Error", "Gagal mempublish course");
    }
  };

  const addModule = () => {
    setModules([...modules, { id: Date.now().toString(), title: "Modul Baru", deadline: "", lessons: [] }]);
  };

  const addLesson = (moduleId: string, type: string) => {
    setModules(modules.map(m => {
      if (m.id === moduleId) {
        return {
          ...m,
          lessons: [...m.lessons, { id: Date.now().toString(), type, title: `Lesson ${type} baru`, content: type === 'quiz' ? "[]" : "", task_code: "" }]
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

  if (loading) return <DashboardLayout role="MENTOR"><PageLoader /></DashboardLayout>;
  if (!course) return <DashboardLayout role="MENTOR"><div className="text-text-muted">Course tidak ditemukan</div></DashboardLayout>;

  return (
    <DashboardLayout role="MENTOR">
      <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
        <div className="flex items-center gap-4">
          <Link href="/mentor/courses" className="p-2 rounded-xl bg-white border border-border-primary shadow-sm text-text-muted hover:text-text-primary transition-colors">
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
          <div className="flex gap-2">
            <Link href={`/mentor/courses/${resolvedParams.id}/submissions`}>
              <Button variant="ghost">
                Lihat Submission
              </Button>
            </Link>
            {course.status === "DRAFT" && (
              <Button variant="secondary" onClick={handlePublish}>
                Publish
              </Button>
            )}
            <Button onClick={handleSave}>
              Simpan Perubahan
            </Button>
          </div>
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
                <div className="flex items-center gap-2 ml-2">
                  {/* Calendar Deadline Picker */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setOpenCalendarId(openCalendarId === mod.id ? null : mod.id)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white shadow-sm border border-border-secondary text-xs text-text-secondary hover:border-amber-500 hover:text-amber-500 transition-colors"
                    >
                      <CalendarDays size={13} className="text-amber-400" />
                      <span className="text-xs font-semibold text-text-primary">
                        {mod.deadline
                          ? new Date(mod.deadline).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
                          : "Set Deadline"}
                      </span>
                      {mod.deadline && (
                        <span
                          onClick={(e) => { e.stopPropagation(); setModules(modules.map(m => m.id === mod.id ? { ...m, deadline: "" } : m)); }}
                          className="ml-1 text-text-muted hover:text-error-400"
                        >
                          <X size={11} />
                        </span>
                      )}
                    </button>
                    {openCalendarId === mod.id && (
                      <div className="absolute right-0 top-9 z-50 bg-surface-secondary border border-border-secondary rounded-xl shadow-xl p-3 w-64">
                        <DeadlineCalendar
                          events={[]}
                          pickerMode={true}
                          compact
                          pickedDate={mod.deadline || undefined}
                          onPickDate={(iso) => {
                            setModules(modules.map(m => m.id === mod.id ? { ...m, deadline: iso } : m));
                            setOpenCalendarId(null);
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <button onClick={() => removeModule(mod.id)} className="text-error-400 p-2 hover:bg-error-500/10 rounded-lg">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="space-y-3 pl-8">
                {mod.lessons.map((lesson, lIndex) => (
                  <div key={lesson.id} className="bg-surface-secondary rounded-xl p-4 border border-border-secondary flex items-start gap-3 group">
                    <GripVertical size={16} className="text-text-muted mt-2 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2">
                        {lesson.type === 'text' && <Type size={16} className="text-accent-400" />}
                        {lesson.type === 'file' && <FileText size={16} className="text-blue-400" />}
                        {lesson.type === 'link' && <LinkIcon size={16} className="text-purple-400" />}
                        {lesson.type === 'task' && <CheckSquare size={16} className="text-amber-400" />}
                        {lesson.type === 'quiz' && <HelpCircle size={16} className="text-rose-400" />}
                        <Input 
                          value={lesson.title}
                          onChange={(e) => {
                            setModules(modules.map(m => m.id === mod.id ? {...m, lessons: m.lessons.map(l => l.id === lesson.id ? {...l, title: e.target.value} : l)} : m))
                          }}
                          className="flex-1 text-sm bg-transparent border-transparent hover:border-border-secondary focus:border-accent-500"
                        />
                      </div>
                      
                      {lesson.type === 'text' && (
                        <textarea 
                          value={lesson.content || ""}
                          onChange={(e) => setModules(modules.map(m => m.id === mod.id ? {...m, lessons: m.lessons.map(l => l.id === lesson.id ? {...l, content: e.target.value} : l)} : m))}
                          className="w-full bg-surface-secondary border border-border-secondary rounded-lg p-3 text-sm focus:border-accent-500 outline-none" rows={3} placeholder="Tulis konten teks di sini..." 
                        />
                      )}
                      {(lesson.type === 'file' || lesson.type === 'link') && (
                        <Input 
                          placeholder="Masukkan URL / Link di sini..." 
                          className="text-sm w-full"
                          value={lesson.content || ""}
                          onChange={(e) => setModules(modules.map(m => m.id === mod.id ? {...m, lessons: m.lessons.map(l => l.id === lesson.id ? {...l, content: e.target.value} : l)} : m))}
                        />
                      )}
                      {lesson.type === 'task' && (
                        <div className="space-y-3 border-t border-border-secondary pt-3 mt-3">
                          <Input 
                            placeholder="Tulis instruksi absen di sini..." 
                            className="text-sm w-full"
                            value={lesson.content || ""}
                            onChange={(e) => setModules(modules.map(m => m.id === mod.id ? {...m, lessons: m.lessons.map(l => l.id === lesson.id ? {...l, content: e.target.value} : l)} : m))}
                          />
                          <Input 
                            placeholder="Kode Absen / Verifikasi (e.g. VEGA-123)" 
                            className="text-sm w-full border-amber-500/50 focus:border-amber-500"
                            value={lesson.task_code || ""}
                            onChange={(e) => setModules(modules.map(m => m.id === mod.id ? {...m, lessons: m.lessons.map(l => l.id === lesson.id ? {...l, task_code: e.target.value} : l)} : m))}
                          />
                        </div>
                      )}
                      {lesson.type === 'quiz' && (
                        <div className="space-y-3 border-t border-border-secondary pt-3 mt-3">
                          {(() => {
                            let qList: any[] = [];
                            try { qList = JSON.parse(lesson.content || "[]"); } catch (e) {}
                            
                            const updateQuiz = (newQList: any[]) => {
                              setModules(modules.map(m => m.id === mod.id ? {...m, lessons: m.lessons.map(l => l.id === lesson.id ? {...l, content: JSON.stringify(newQList)} : l)} : m));
                            };
                            return (
                              <div className="space-y-4">
                                {qList.map((q: any, i: number) => (
                                  <div key={i} className="p-3 bg-surface-secondary rounded border border-border-secondary relative">
                                    <button onClick={() => updateQuiz(qList.filter((_, idx) => idx !== i))} className="absolute top-2 right-2 text-text-muted hover:text-error-400"><Trash2 size={14}/></button>
                                    <div className="text-xs font-semibold text-text-muted mb-2">Pertanyaan {i + 1} ({q.type === 'mcq' ? 'Pilihan Ganda' : 'Isian Singkat'})</div>
                                    <Input value={q.question || ""} onChange={(e) => {
                                      const n = [...qList]; n[i].question = e.target.value; updateQuiz(n);
                                    }} placeholder="Masukkan pertanyaan..." className="mb-3" />
                                    
                                    {q.type === 'mcq' && (
                                      <div className="space-y-2 pl-4">
                                        {["A", "B", "C", "D", "E"].map((opt, optIdx) => (
                                          <div key={optIdx} className="flex items-center gap-2">
                                            <span className="text-xs font-bold w-4">{opt}.</span>
                                            <Input value={q.options?.[optIdx] || ""} onChange={(e) => {
                                              const n = [...qList]; 
                                              if(!n[i].options) n[i].options = ["","","","",""];
                                              n[i].options[optIdx] = e.target.value;
                                              updateQuiz(n);
                                            }} placeholder={`Opsi ${opt}`} className="flex-1 text-xs" />
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ))}
                                <div className="flex items-center gap-2">
                                  <Button size="sm" variant="secondary" onClick={() => updateQuiz([...qList, { type: 'mcq', question: '', options: ["","","","",""] }])}>+ Pilihan Ganda</Button>
                                  <Button size="sm" variant="secondary" onClick={() => updateQuiz([...qList, { type: 'short', question: '' }])}>+ Isian Singkat</Button>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                    <button onClick={() => removeLesson(mod.id, lesson.id)} className="text-error-400 p-1.5 hover:bg-error-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}

                <div className="flex items-center gap-2 pt-2">
                  <span className="text-sm font-medium text-text-muted mr-2">Tambah:</span>
                  <button onClick={() => addLesson(mod.id, 'text')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-border-primary shadow-sm text-xs text-text-secondary hover:border-accent-500 hover:text-accent-500 transition-colors">
                    <Type size={14} className="text-accent-400" /> Teks
                  </button>
                  <button onClick={() => addLesson(mod.id, 'file')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-border-primary shadow-sm text-xs text-text-secondary hover:border-blue-500 hover:text-blue-500 transition-colors">
                    <FileText size={14} className="text-blue-400" /> File
                  </button>
                  <button onClick={() => addLesson(mod.id, 'link')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-border-primary shadow-sm text-xs text-text-secondary hover:border-purple-500 hover:text-purple-500 transition-colors">
                    <LinkIcon size={14} className="text-purple-400" /> Link
                  </button>
                  <button onClick={() => addLesson(mod.id, 'task')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-border-primary shadow-sm text-xs text-text-secondary hover:border-amber-500 hover:text-amber-500 transition-colors">
                    <CheckSquare size={14} className="text-amber-400" /> Absen
                  </button>
                  <button onClick={() => addLesson(mod.id, 'quiz')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-border-primary shadow-sm text-xs text-text-secondary hover:border-rose-500 hover:text-rose-500 transition-colors">
                    <HelpCircle size={14} className="text-rose-400" /> Quiz
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
