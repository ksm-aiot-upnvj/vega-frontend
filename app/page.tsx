import Link from "next/link";
import {
  BookOpen,
  BarChart3,
  GraduationCap,
  Users,
  ArrowRight,
  Zap,
  Target,
  Shield,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface-primary">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 flex items-center justify-between h-16 px-6 lg:px-12 bg-surface-primary/80 backdrop-blur-md border-b border-border-secondary">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-accent-600 to-accent-500 shadow-md">
            <span className="text-white font-bold text-sm">V</span>
          </div>
          <span className="text-xl font-bold text-gradient">VEGA</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            Masuk
          </Link>
          <Link
            href="http://localhost:3000"
            className="px-5 py-2 text-sm font-medium rounded-xl bg-gradient-to-r from-accent-600 to-accent-500 text-white hover:from-accent-500 hover:to-accent-400 transition-all shadow-md hover:shadow-glow"
          >
            Daftar
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute inset-0 grid-bg" />

        {/* Floating orbs */}
        <div className="absolute top-20 left-[10%] w-72 h-72 bg-accent-600/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-[10%] w-96 h-96 bg-secondary-700/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />

        <div className="relative max-w-6xl mx-auto px-6 lg:px-12 py-24 lg:py-36">
          <div className="text-center max-w-3xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-500/10 border border-accent-500/20 text-accent-300 text-sm font-medium mb-8 animate-fade-in">
              <Zap size={14} />
              KSM IoT & AI Learning Platform
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 animate-fade-in-up">
              <span className="text-text-primary">Belajar.</span>{" "}
              <span className="text-gradient">Berkembang.</span>{" "}
              <span className="text-text-primary">Berinovasi.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg lg:text-xl text-text-muted max-w-2xl mx-auto mb-10 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              VEGA adalah platform pembelajaran terstruktur untuk anggota KSM IoT & AI.
              Ikuti learning path, kuasai materi, dan kembangkan skill-mu bersama mentor terbaik.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              <Link
                href="http://localhost:3000"
                className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold rounded-xl bg-gradient-to-r from-accent-600 to-accent-500 text-white hover:from-accent-500 hover:to-accent-400 transition-all shadow-lg hover:shadow-glow-lg group"
              >
                Mulai Belajar
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-medium rounded-xl border border-border-primary text-text-secondary hover:text-text-primary hover:bg-primary-700 hover:border-border-accent transition-all"
              >
                Lihat Course
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6 mt-20 animate-fade-in-up" style={{ animationDelay: "0.35s" }}>
            {[
              { label: "Courses", value: "12+", icon: BookOpen },
              { label: "Anggota Aktif", value: "60+", icon: Users },
              { label: "Materi", value: "100+", icon: GraduationCap },
              { label: "Quiz & Tugas", value: "50+", icon: BarChart3 },
            ].map((stat) => (
              <div
                key={stat.label}
                className="glass-card p-5 text-center"
              >
                <div className="flex justify-center mb-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent-500/10 text-accent-400">
                    <stat.icon size={20} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
                <p className="text-xs text-text-muted mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 lg:px-12 border-t border-border-secondary">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-text-primary mb-4">
              Semua yang kamu butuhkan untuk{" "}
              <span className="text-gradient">berkembang</span>
            </h2>
            <p className="text-text-muted max-w-xl mx-auto">
              Platform lengkap dengan materi terstruktur, quiz interaktif, dan mentorship langsung
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 stagger">
            {[
              {
                icon: BookOpen,
                title: "Materi Terstruktur",
                description:
                  "Course dibagi dalam modul dan lesson yang jelas. Belajar step-by-step dari dasar hingga mahir.",
              },
              {
                icon: Target,
                title: "Quiz & Assessment",
                description:
                  "Uji pemahamanmu dengan quiz interaktif. Dapatkan feedback instan dan track progress-mu.",
              },
              {
                icon: Shield,
                title: "Mentorship",
                description:
                  "Belajar langsung dari mentor berpengalaman. Submit assignment dan dapatkan review personal.",
              },
            ].map((feature) => (
              <div key={feature.title} className="glass-card p-7 group">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-accent-500/10 border border-accent-500/20 text-accent-400 mb-5 group-hover:scale-110 transition-transform">
                  <feature.icon size={24} />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-text-muted leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Learning Path Preview */}
      <section className="py-24 px-6 lg:px-12 border-t border-border-secondary bg-gradient-hero">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-text-primary mb-4">
              Learning <span className="text-gradient">Journey</span>
            </h2>
            <p className="text-text-muted max-w-xl mx-auto">
              Proses belajar yang terstruktur dan terukur
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-0">
            {[
              { step: "01", title: "Daftar & Login", desc: "Buat akun VEGA" },
              { step: "02", title: "Pilih Course", desc: "Browse & enroll" },
              { step: "03", title: "Belajar", desc: "Ikuti materi" },
              { step: "04", title: "Kerjakan Quiz", desc: "Uji pemahaman" },
              { step: "05", title: "Selesai!", desc: "Complete course" },
            ].map((item, i) => (
              <div key={item.step} className="flex items-center">
                <div className="glass-card p-5 text-center min-w-[140px]">
                  <span className="block text-xs font-bold text-accent-400 mb-1">
                    STEP {item.step}
                  </span>
                  <h3 className="text-sm font-semibold text-text-primary">
                    {item.title}
                  </h3>
                  <p className="text-xs text-text-muted mt-1">{item.desc}</p>
                </div>
                {i < 4 && (
                  <ArrowRight
                    size={20}
                    className="text-text-muted mx-2 hidden md:block"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 lg:px-12 border-t border-border-secondary">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-text-primary mb-4">
            Siap untuk <span className="text-gradient">memulai?</span>
          </h2>
          <p className="text-text-muted mb-8 max-w-xl mx-auto">
            Bergabung dengan anggota KSM lainnya dan mulai perjalanan belajarmu di VEGA.
          </p>
          <Link
            href="http://localhost:3000"
            className="inline-flex items-center gap-2 px-10 py-4 text-base font-semibold rounded-xl bg-gradient-to-r from-accent-600 to-accent-500 text-white hover:from-accent-500 hover:to-accent-400 transition-all shadow-lg hover:shadow-glow-lg group"
          >
            Daftar Sekarang
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 lg:px-12 border-t border-border-secondary">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-accent-600 to-accent-500">
              <span className="text-white font-bold text-xs">V</span>
            </div>
            <span className="text-sm font-semibold text-text-secondary">
              VEGA LMS
            </span>
          </div>
          <p className="text-xs text-text-muted">
            &copy; {new Date().getFullYear()} KSM IoT & AI. Virtual Education & Growth Academy.
          </p>
        </div>
      </footer>
    </div>
  );
}
