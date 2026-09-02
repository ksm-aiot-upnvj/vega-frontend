"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useToast } from "@/components/Toast";
import Button from "@/components/Button";
import DeadlineCalendar from "@/components/DeadlineCalendar";
import { getAnnouncements, createAnnouncement, Announcement } from "@/lib/api";

export default function MentorAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [targetAudience, setTargetAudience] = useState("ENROLLED_MEMBERS");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const fetchAnnouncements = () => {
    setLoading(true);
    getAnnouncements()
      .then((data) => setAnnouncements(data))
      .catch(() => toast("error", "Error", "Gagal memuat pengumuman"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) {
      toast("error", "Error", "Judul dan deskripsi harus diisi");
      return;
    }

    setIsSubmitting(true);
    try {
      await createAnnouncement({
        title,
        description,
        event_date: eventDate ? new Date(eventDate).toISOString() : undefined,
        target_audience: targetAudience
      });
      toast("success", "Sukses", "Pengumuman berhasil dibuat");
      setIsModalOpen(false);
      setTitle("");
      setDescription("");
      setEventDate("");
      setTargetAudience("ENROLLED_MEMBERS");
      fetchAnnouncements();
    } catch (err) {
      toast("error", "Error", "Gagal membuat pengumuman");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout role="MENTOR">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Pengumuman</h1>
            <p className="text-text-secondary mt-1">Buat dan kelola pengumuman untuk member atau mentor lainnya.</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>Buat Pengumuman</Button>
        </div>

        {loading ? (
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-surface-elevated rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-surface-elevated rounded"></div>
                <div className="h-4 bg-surface-elevated rounded w-5/6"></div>
              </div>
            </div>
          </div>
        ) : announcements.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <p className="text-text-muted">Belum ada pengumuman yang dibuat.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <div key={announcement.id} className="glass-card p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary">{announcement.title}</h3>
                    <p className="text-xs text-text-muted mt-1">
                      Target: {announcement.target_audience === "ENROLLED_MEMBERS" ? "Member Course" : announcement.target_audience === "MENTORS" ? "Mentor" : "Semua"} • 
                      Dibuat pada {new Date(announcement.created_at).toLocaleDateString("id-ID")}
                    </p>
                    {announcement.event_date && (
                      <p className="text-xs font-semibold text-accent-400 mt-1">
                        Tanggal Event: {new Date(announcement.event_date).toLocaleDateString("id-ID")}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-4 text-text-secondary whitespace-pre-wrap text-sm">
                  {announcement.description}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-text-primary mb-4">Buat Pengumuman Baru</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Judul</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-surface-secondary border border-border-primary rounded-xl px-4 py-2.5 text-text-primary focus:outline-none focus:border-accent-500 transition-colors"
                  placeholder="Judul pengumuman..."
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Target Audience</label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="w-full bg-surface-secondary border border-border-primary rounded-xl px-4 py-2.5 text-text-primary focus:outline-none focus:border-accent-500 transition-colors"
                >
                  <option value="ENROLLED_MEMBERS">Member di Course Saya</option>
                  <option value="MENTORS">Mentor Saja</option>
                  <option value="BOTH">Keduanya</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Tanggal Event (Opsional)</label>
                <div className="bg-surface-secondary border border-border-primary rounded-xl p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm text-text-primary font-medium">
                      {eventDate
                        ? new Date(eventDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
                        : "Pilih tanggal"}
                    </span>
                    {eventDate && (
                      <button 
                        type="button" 
                        onClick={() => setEventDate("")}
                        className="text-xs text-rose-400 hover:text-rose-300"
                      >
                        Hapus Tanggal
                      </button>
                    )}
                  </div>
                  <DeadlineCalendar
                    events={[]}
                    pickerMode={true}
                    pickedDate={eventDate || undefined}
                    onPickDate={(iso) => setEventDate(iso)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Deskripsi</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full h-32 bg-surface-secondary border border-border-primary rounded-xl px-4 py-2.5 text-text-primary focus:outline-none focus:border-accent-500 transition-colors resize-none"
                  placeholder="Ketik pengumuman di sini... (Link akan otomatis terdeteksi)"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border-secondary">
                <Button variant="outline" onClick={() => setIsModalOpen(false)} type="button">Batal</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Menyimpan..." : "Sebarkan"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
