"use client";

import { use } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import { ChevronLeft, Award, Clock } from "lucide-react";

export default function QuizPage({
  params,
}: {
  params: Promise<{ id: string; quizId: string }>;
}) {
  const { id } = use(params);

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto animate-fade-in-up">
        <Link
          href={`/courses/${id}`}
          className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-primary mb-6 transition-colors"
        >
          <ChevronLeft size={14} /> Kembali ke Course
        </Link>

        <div className="glass-card p-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-accent-500/10 border border-accent-500/20">
              <Award size={32} className="text-accent-400" />
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              Quiz Belum Tersedia
            </h1>
            <p className="text-text-muted mt-2">
              Fitur Quiz saat ini masih dalam tahap pengembangan dan belum dapat diakses.
            </p>
          </div>

          <div className="flex justify-center gap-6 text-sm text-text-muted">
            <span className="flex items-center gap-1.5">
              <Clock size={15} />
              Segera Hadir
            </span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
