"use client";
import { PageLoader } from "@/components/LoadingState";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/components/Toast";
import { User } from "@/types/user";
import { Users, Plus, Pencil, Trash2, Link as LinkIcon, Image as ImageIcon, Code } from "lucide-react";
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import Input from "@/components/Input";
import Textarea from "@/components/Textarea";

interface Project {
  id: string;
  title: string;
  description?: string;
  whatsapp_link?: string;
  github_link?: string;
  image_url?: string;
  created_at: string;
}

export default function MentorGroupPage() {
  const [members, setMembers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [whatsappLink, setWhatsappLink] = useState("");
  const [githubLink, setGithubLink] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [fetchedMembers, fetchedProjects] = await Promise.all([
        apiFetch<User[]>("/api/v1/projects/my-members"),
        apiFetch<Project[]>("/api/v1/projects/")
      ]);
      setMembers(fetchedMembers);
      setProjects(fetchedProjects);
    } catch (err) {
      toast("error", "Error", "Gagal memuat data grup dan project");
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditId(null);
    setTitle("");
    setDescription("");
    setWhatsappLink("");
    setGithubLink("");
    setImageUrl("");
    setIsModalOpen(true);
  };

  const openEditModal = (p: Project) => {
    setEditId(p.id);
    setTitle(p.title);
    setDescription(p.description || "");
    setWhatsappLink(p.whatsapp_link || "");
    setGithubLink(p.github_link || "");
    setImageUrl(p.image_url || "");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const payload = {
        title,
        description: description || undefined,
        whatsapp_link: whatsappLink || undefined,
        github_link: githubLink || undefined,
        image_url: imageUrl || undefined,
      };

      if (editId) {
        await apiFetch(`/api/v1/projects/${editId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        toast("success", "Berhasil", "Project berhasil diubah");
      } else {
        await apiFetch("/api/v1/projects/", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast("success", "Berhasil", "Project baru berhasil dibuat");
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      toast("error", "Error", err.message || "Gagal menyimpan project");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus project ini?")) return;
    
    try {
      await apiFetch(`/api/v1/projects/${id}`, { method: "DELETE" });
      toast("success", "Berhasil", "Project dihapus");
      fetchData();
    } catch (err: any) {
      toast("error", "Error", err.message || "Gagal menghapus project");
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="MENTOR">
        <PageLoader />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="MENTOR">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Grup & Project Anda</h1>
          <p className="text-text-muted mt-1">Kelola anggota grup dan project yang sedang berjalan.</p>
        </div>

        {/* Member List */}
        <div className="bg-surface-secondary border border-border-secondary rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-accent-500/10 flex items-center justify-center">
              <Users size={20} className="text-accent-400" />
            </div>
            <div>
              <h2 className="font-semibold text-lg text-text-primary">Anggota Grup ({members.length}/6)</h2>
              <p className="text-xs text-text-muted">Member yang telah dialokasikan oleh Admin ke Anda.</p>
            </div>
          </div>
          
          {members.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-border-secondary rounded-xl">
              <p className="text-text-muted">Belum ada member yang dialokasikan ke Anda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {members.map(member => (
                <div key={member.id} className="flex items-center gap-3 p-4 bg-white border border-border-primary shadow-sm rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-primary-50 border border-border-secondary flex items-center justify-center flex-shrink-0 text-accent-500 font-bold">
                    {member.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm text-text-primary truncate">{member.name}</p>
                    <p className="text-xs text-text-muted truncate">{member.email}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Projects Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-xl text-text-primary">Project Grup</h2>
            <Button onClick={openAddModal} icon={<Plus size={16} />}>
              Buat Project
            </Button>
          </div>

          {projects.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-border-secondary rounded-2xl">
              <p className="text-text-muted">Belum ada project yang dibuat.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map(project => (
                <div key={project.id} className="bg-surface-secondary border border-border-secondary rounded-2xl overflow-hidden flex flex-col hover:border-accent-500/30 transition-colors">
                  {project.image_url && (
                    <div className="h-40 w-full bg-surface-secondary">
                      <img src={project.image_url} alt={project.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="font-bold text-lg text-text-primary">{project.title}</h3>
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEditModal(project)} className="p-1.5 text-text-muted hover:text-accent-400 hover:bg-accent-500/10 rounded-lg transition-colors">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => handleDelete(project.id)} className="p-1.5 text-text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    {project.description && (
                      <p className="text-sm text-text-secondary line-clamp-3 mb-4 whitespace-pre-wrap">{project.description}</p>
                    )}
                    
                    <div className="mt-auto pt-4 flex flex-wrap gap-2 border-t border-border-secondary">
                      {project.whatsapp_link && (
                        <a href={project.whatsapp_link.startsWith('http') ? project.whatsapp_link : `https://${project.whatsapp_link}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-medium bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-full hover:bg-emerald-500/20 transition-colors">
                          <LinkIcon size={12} /> WhatsApp
                        </a>
                      )}
                      {project.github_link && (
                        <a href={project.github_link.startsWith('http') ? project.github_link : `https://${project.github_link}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-medium bg-indigo-500/10 text-indigo-400 px-3 py-1.5 rounded-full hover:bg-indigo-500/20 transition-colors">
                          <Code size={12} /> GitHub
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      <Modal isOpen={isModalOpen} onClose={() => !isSubmitting && setIsModalOpen(false)} title={editId ? "Edit Project" : "Buat Project Baru"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Judul Project *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Aplikasi Smart Home IoT"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Deskripsi</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan mengenai project ini..."
              rows={4}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Link WhatsApp Group (Opsional)</label>
            <Input
              value={whatsappLink}
              onChange={(e) => setWhatsappLink(e.target.value)}
              placeholder="https://chat.whatsapp.com/..."
              icon={<LinkIcon size={16} />}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Link GitHub (Opsional)</label>
            <Input
              value={githubLink}
              onChange={(e) => setGithubLink(e.target.value)}
              placeholder="https://github.com/..."
              icon={<Code size={16} />}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">URL Gambar Poster/Banner (Opsional)</label>
            <Input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.png"
              icon={<ImageIcon size={16} />}
            />
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Menyimpan..." : "Simpan Project"}
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
