"use client";

import { useState } from "react";
import { Megaphone, Bell, BellRing } from "lucide-react";
import { Announcement, toggleAnnouncementNotify } from "@/lib/api";
import { useToast } from "@/components/Toast";
import { cn } from "@/lib/utils";

interface AnnouncementListProps {
  announcements: Announcement[];
  onNotifyToggle: (id: string, isNotified: boolean) => void;
  showNotifyToggle?: boolean;
}

// Simple regex to detect URLs
const URL_REGEX = /(https?:\/\/[^\s]+)/g;

function Linkify({ text }: { text: string }) {
  const parts = text.split(URL_REGEX);
  return (
    <>
      {parts.map((part, i) => {
        if (part.match(URL_REGEX)) {
          return (
            <a
              key={i}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-400 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {part}
            </a>
          );
        }
        return part;
      })}
    </>
  );
}

export default function AnnouncementList({ announcements, onNotifyToggle, showNotifyToggle = true }: AnnouncementListProps) {
  const { toast } = useToast();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleToggle = async (id: string, currentNotified: boolean) => {
    setLoadingId(id);
    try {
      const res = await toggleAnnouncementNotify(id, !currentNotified);
      onNotifyToggle(id, res.is_notified);
      toast("success", "Berhasil", res.is_notified ? "Pengingat diaktifkan" : "Pengingat dimatikan");
    } catch (err) {
      toast("error", "Error", "Gagal mengubah status pengingat");
    } finally {
      setLoadingId(null);
    }
  };

  if (announcements.length === 0) {
    return (
      <div className="glass-card p-6 flex flex-col items-center justify-center text-center">
        <Megaphone size={32} className="text-text-muted/50 mb-3" />
        <p className="text-sm font-medium text-text-primary">Tidak ada pengumuman</p>
        <p className="text-xs text-text-muted mt-1">Belum ada pengumuman baru untuk Anda.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {announcements.map((a) => (
        <div key={a.id} className="glass-card p-5 relative overflow-hidden group">
          {/* Subtle gradient background if it has an event date */}
          {a.event_date && (
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-500/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
          )}
          
          <div className="flex justify-between items-start gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-accent-400 bg-accent-500/10 px-2 py-0.5 rounded-full">
                  Pengumuman
                </span>
                <span className="text-xs text-text-muted">
                  {new Date(a.created_at).toLocaleDateString("id-ID")} • Oleh <span className="font-medium text-text-primary">{a.author_name}</span>
                </span>
              </div>
              <h3 className="text-base font-semibold text-text-primary">{a.title}</h3>
              {a.event_date && (
                <p className="text-xs font-medium text-amber-400 mt-1">
                  Tanggal Acara: {new Date(a.event_date).toLocaleString("id-ID")}
                </p>
              )}
            </div>
            
            {showNotifyToggle && (
              <button
                onClick={() => handleToggle(a.id, a.is_notified)}
                disabled={loadingId === a.id}
                className={cn(
                  "flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300",
                  a.is_notified 
                    ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 ring-1 ring-amber-500/50" 
                    : "bg-surface-elevated text-text-muted hover:bg-primary-700 hover:text-text-primary",
                  loadingId === a.id && "opacity-50 cursor-not-allowed"
                )}
                title={a.is_notified ? "Matikan pengingat" : "Hidupkan pengingat"}
              >
                {a.is_notified ? <BellRing size={16} /> : <Bell size={16} />}
              </button>
            )}
          </div>
          
          <div className="mt-3 text-sm text-text-secondary whitespace-pre-wrap leading-relaxed">
            <Linkify text={a.description} />
          </div>
        </div>
      ))}
    </div>
  );
}
