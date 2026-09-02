"use client";
import { PageLoader } from "@/components/LoadingState";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/components/Toast";
import { User } from "@/types/user";
import { Users, Save, Check } from "lucide-react";
import Button from "@/components/Button";

export default function AdminGroupsPage() {
  const [mentors, setMentors] = useState<User[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMentor, setSelectedMentor] = useState<string>("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    // When a mentor is selected, automatically select the members currently assigned to them
    if (selectedMentor) {
      const assigned = members.filter(m => m.mentor_id === selectedMentor).map(m => m.id);
      setSelectedMembers(assigned);
    } else {
      setSelectedMembers([]);
    }
  }, [selectedMentor, members]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const users = await apiFetch<User[]>("/api/v1/users/");
      setMentors(users.filter(u => u.role === "MENTOR"));
      setMembers(users.filter(u => u.role === "MEMBER"));
    } catch (err) {
      toast("error", "Error", "Gagal memuat data user");
    } finally {
      setLoading(false);
    }
  };

  const toggleMember = (memberId: string) => {
    if (selectedMembers.includes(memberId)) {
      setSelectedMembers(prev => prev.filter(id => id !== memberId));
    } else {
      if (selectedMembers.length >= 6) {
        toast("error", "Batas Maksimal", "Satu mentor maksimal memiliki 6 member");
        return;
      }
      setSelectedMembers(prev => [...prev, memberId]);
    }
  };

  const handleSave = async () => {
    if (!selectedMentor) {
      toast("error", "Error", "Pilih mentor terlebih dahulu");
      return;
    }

    setSaving(true);
    try {
      // 1. Get current assigned members for this mentor from the state
      const currentlyAssigned = members.filter(m => m.mentor_id === selectedMentor).map(m => m.id);
      
      // 2. Members to remove mentor_id (they were assigned but now unselected)
      const toRemove = currentlyAssigned.filter(id => !selectedMembers.includes(id));
      
      // 3. Members to add mentor_id (they were not assigned to this mentor but now selected)
      const toAdd = selectedMembers.filter(id => !currentlyAssigned.includes(id));

      const promises: Promise<any>[] = [];

      for (const id of toRemove) {
        promises.push(
          apiFetch(`/api/v1/users/${id}/mentor`, {
            method: "PUT",
            body: JSON.stringify({ mentor_id: null })
          })
        );
      }

      for (const id of toAdd) {
        promises.push(
          apiFetch(`/api/v1/users/${id}/mentor`, {
            method: "PUT",
            body: JSON.stringify({ mentor_id: selectedMentor })
          })
        );
      }

      await Promise.all(promises);
      toast("success", "Berhasil", "Pemetaan grup berhasil disimpan");
      fetchUsers(); // Refresh data
    } catch (err: any) {
      toast("error", "Error", err.message || "Gagal menyimpan pemetaan");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="ADMIN">
        <PageLoader />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="ADMIN">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Group Mapping</h1>
            <p className="text-text-muted mt-1">Petakan member ke masing-masing mentor (Maks 6 member per mentor).</p>
          </div>
          <Button onClick={handleSave} disabled={saving} icon={<Save size={18} />}>
            {saving ? "Menyimpan..." : "Simpan Pemetaan"}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Mentor List */}
          <div className="col-span-1 bg-surface-secondary border border-border-secondary rounded-2xl p-5">
            <h2 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
              <Users size={18} className="text-accent-400" />
              Pilih Mentor
            </h2>
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
              {mentors.length === 0 ? (
                <p className="text-sm text-text-muted">Belum ada mentor.</p>
              ) : (
                mentors.map(mentor => (
                  <button
                    key={mentor.id}
                    onClick={() => setSelectedMentor(mentor.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                      selectedMentor === mentor.id
                        ? "bg-accent-500/10 border-accent-500 text-accent-400"
                        : "bg-white border-border-primary shadow-sm text-text-secondary hover:border-accent-500/50"
                    }`}
                  >
                    <p className="font-medium">{mentor.name}</p>
                    <p className="text-xs opacity-80 mt-1 truncate">{mentor.email}</p>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Member Selection */}
          <div className="col-span-1 md:col-span-2 bg-surface-secondary border border-border-secondary rounded-2xl p-5 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-text-primary flex items-center gap-2">
                <Users size={18} className="text-accent-400" />
                Pilih Member ({selectedMembers.length}/6)
              </h2>
            </div>
            
            {!selectedMentor ? (
              <div className="flex-1 flex items-center justify-center border-2 border-dashed border-border-secondary rounded-xl p-8">
                <p className="text-text-muted text-center">Silakan pilih mentor di sebelah kiri terlebih dahulu.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-2">
                {members.map(member => {
                  const isSelected = selectedMembers.includes(member.id);
                  const isAssignedToOther = member.mentor_id && member.mentor_id !== selectedMentor;
                  
                  return (
                    <div
                      key={member.id}
                      onClick={() => toggleMember(member.id)}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                        isAssignedToOther && !isSelected
                          ? "bg-surface-secondary border-border-secondary cursor-pointer hover:border-accent-500/50 opacity-60 grayscale"
                          : isSelected
                            ? "bg-accent-500/10 border-accent-500 cursor-pointer"
                            : "bg-white border-border-primary shadow-sm cursor-pointer hover:border-accent-500/50"
                      }`}
                    >
                      <div className="min-w-0">
                        <p className={`font-medium text-sm truncate ${isSelected ? "text-accent-400" : "text-text-primary"}`}>
                          {member.name}
                        </p>
                        <p className="text-xs text-text-muted mt-0.5 truncate">{member.email}</p>
                        {isAssignedToOther && (
                          <p className="text-[10px] text-red-400 mt-1">Sudah ikut mentor lain</p>
                        )}
                      </div>
                      {isSelected && <Check size={18} className="text-accent-500 flex-shrink-0" />}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
