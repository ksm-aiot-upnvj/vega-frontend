"use client";
import { PageLoader } from "@/components/LoadingState";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/components/Toast";
import { User } from "@/types/user";
import { Users, Link as LinkIcon, Image as ImageIcon, Code, Crown } from "lucide-react";

interface Project {
  id: string;
  title: string;
  description?: string;
  whatsapp_link?: string;
  github_link?: string;
  image_url?: string;
  created_at: string;
}

export default function MemberGroupPage() {
  const [mentor, setMentor] = useState<User | null>(null);
  const [peers, setPeers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // If the user doesn't have a mentor, API might return 404, we catch it gracefully
      let fetchedMentor = null;
      let fetchedPeers: User[] = [];
      let fetchedProjects: Project[] = [];

      try {
        fetchedMentor = await apiFetch<User>("/api/v1/projects/my-mentor");
        [fetchedPeers, fetchedProjects] = await Promise.all([
          apiFetch<User[]>("/api/v1/projects/my-peers"),
          apiFetch<Project[]>("/api/v1/projects/my-group")
        ]);
      } catch (e: any) {
        // If there is any error fetching mentor (e.g. 404 No mentor assigned), 
        // we just gracefully ignore it and leave mentor as null.
        console.warn("Failed to fetch mentor or group info:", e);
      }

      setMentor(fetchedMentor);
      setPeers(fetchedPeers);
      setProjects(fetchedProjects);
    } catch (err) {
      toast("error", "Error", "Gagal memuat data grup");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="MEMBER">
        <PageLoader />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="MEMBER">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Grup Mentoring</h1>
          <p className="text-text-muted mt-1">Lihat anggota grup Anda dan project yang dibagikan mentor.</p>
        </div>

        {!mentor ? (
          <div className="flex flex-col items-center justify-center py-20 bg-surface-secondary border border-border-secondary rounded-2xl">
            <Users size={48} className="text-border-primary mb-4" />
            <h2 className="text-lg font-semibold text-text-primary mb-2">Belum Memiliki Grup</h2>
            <p className="text-sm text-text-muted text-center max-w-md">
              Anda belum dialokasikan ke mentor manapun. Silakan hubungi admin untuk dimasukkan ke dalam grup mentoring.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Group Members (Mentor & Peers) */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-surface-secondary border border-border-secondary rounded-2xl p-6">
                  <h2 className="font-semibold text-lg text-text-primary mb-4 flex items-center gap-2">
                    <Crown size={18} className="text-accent-400" />
                    Mentor Anda
                  </h2>
                  <div className="flex items-center gap-4 p-4 bg-white border border-border-primary shadow-sm rounded-xl">
                    <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0 text-accent-500 font-bold text-lg border border-border-secondary">
                      {mentor.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-sm text-text-primary truncate">{mentor.name}</p>
                      <p className="text-xs text-accent-400/80 truncate">Lead Mentor</p>
                    </div>
                  </div>
                </div>

                <div className="bg-surface-secondary border border-border-secondary rounded-2xl p-6">
                  <h2 className="font-semibold text-lg text-text-primary mb-4 flex items-center gap-2">
                    <Users size={18} className="text-text-secondary" />
                    Teman Grup ({peers.length}/6)
                  </h2>
                  <div className="space-y-3">
                    {peers.map(peer => (
                      <div key={peer.id} className="flex items-center gap-3 p-3 bg-white border border-border-primary shadow-sm rounded-xl">
                        <div className="w-9 h-9 rounded-full bg-primary-50 border border-border-secondary flex items-center justify-center flex-shrink-0 text-accent-500 font-bold text-sm">
                          {peer.name.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm text-text-primary truncate">{peer.name}</p>
                          <p className="text-xs text-text-muted truncate">Member</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Projects Section */}
              <div className="lg:col-span-2">
                <h2 className="font-semibold text-xl text-text-primary mb-6">Project Mentoring</h2>
                {projects.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-border-secondary rounded-2xl bg-surface-secondary/50">
                    <p className="text-text-muted">Mentor belum membagikan project apapun.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {projects.map(project => (
                      <div key={project.id} className="bg-surface-secondary border border-border-secondary rounded-2xl overflow-hidden flex flex-col hover:border-border-primary transition-colors">
                        {project.image_url && (
                          <div className="h-48 sm:h-64 w-full bg-surface-secondary">
                            <img src={project.image_url} alt={project.title} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="p-5 sm:p-6 flex-1 flex flex-col">
                          <h3 className="font-bold text-xl text-text-primary mb-3">{project.title}</h3>
                          
                          {project.description && (
                            <p className="text-sm text-text-secondary leading-relaxed mb-6 whitespace-pre-wrap">
                              {project.description}
                            </p>
                          )}
                          
                          <div className="mt-auto pt-4 flex flex-wrap gap-3 border-t border-border-secondary">
                            {project.whatsapp_link && (
                              <a href={project.whatsapp_link.startsWith('http') ? project.whatsapp_link : `https://${project.whatsapp_link}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-medium bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-xl hover:bg-emerald-500/20 transition-colors">
                                <LinkIcon size={16} /> Grup WhatsApp
                              </a>
                            )}
                            {project.github_link && (
                              <a href={project.github_link.startsWith('http') ? project.github_link : `https://${project.github_link}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-medium bg-indigo-500/10 text-indigo-400 px-4 py-2 rounded-xl hover:bg-indigo-500/20 transition-colors">
                                <Code size={16} /> Repository Github
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
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
