"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useToast } from "@/components/Toast";
import AnnouncementList from "@/components/AnnouncementList";
import { getAnnouncements, Announcement } from "@/lib/api";

export default function MemberAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    getAnnouncements()
      .then((data) => setAnnouncements(data))
      .catch(() => toast("error", "Error", "Gagal memuat pengumuman"))
      .finally(() => setLoading(false));
  }, [toast]);

  const handleNotifyToggle = (id: string, isNotified: boolean) => {
    setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, is_notified: isNotified } : a));
  };

  return (
    <DashboardLayout role="MEMBER">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Pengumuman</h1>
          <p className="text-text-secondary mt-1">Lihat pengumuman terbaru dari course dan mentor Anda.</p>
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
        ) : (
          <AnnouncementList 
            announcements={announcements} 
            onNotifyToggle={handleNotifyToggle} 
          />
        )}
      </div>
    </DashboardLayout>
  );
}
