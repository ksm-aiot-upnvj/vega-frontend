"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { Mail, Lock, User, Hash, Sparkles } from "lucide-react";
import { register as apiRegister } from "@/lib/api";
import { saveAuthData } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    nim: "",
    name: "",
    email: "",
    password: "",
    confirm_password: "",
    interest: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.nim) errs.nim = "NIM wajib diisi";
    if (!form.name) errs.name = "Nama wajib diisi";
    if (!form.email) errs.email = "Email wajib diisi";
    if (!form.password) errs.password = "Password wajib diisi";
    else if (form.password.length < 8)
      errs.password = "Password minimal 8 karakter";
    if (form.password !== form.confirm_password)
      errs.confirm_password = "Password tidak cocok";
    if (!form.interest) errs.interest = "Interest wajib diisi";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      const res = await apiRegister(form);
      saveAuthData(res.access_token, res.refresh_token, res.user);
      router.push("/dashboard");
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Registrasi gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-primary bg-gradient-hero relative py-12">
      <div className="absolute inset-0 grid-bg" />

      {/* Floating orbs */}
      <div className="absolute top-[10%] right-[20%] w-64 h-64 bg-accent-600/8 rounded-full blur-3xl" />
      <div className="absolute bottom-[10%] left-[20%] w-80 h-80 bg-secondary-700/8 rounded-full blur-3xl" />

      <div className="relative w-full max-w-md mx-4 animate-fade-in-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-4">
            <img src="/logo.png" alt="Vega Logo" className="w-12 h-12 object-contain drop-shadow-md" />
          </Link>
          <h1 className="text-2xl font-bold text-text-primary">
            Buat Akun Baru
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Bergabung dengan VEGA LMS
          </p>
        </div>

        {/* Register Card */}
        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {apiError && (
              <div className="p-3 rounded-xl bg-error-500/10 border border-error-500/20 text-error-400 text-sm text-center">
                {apiError}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="NIM"
                placeholder="2410001"
                icon={<Hash size={16} />}
                value={form.nim}
                onChange={(e) => setForm({ ...form, nim: e.target.value })}
                error={errors.nim}
              />
              <Input
                label="Nama Lengkap"
                placeholder="Nama kamu"
                icon={<User size={16} />}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                error={errors.name}
              />
            </div>

            <Input
              label="Email"
              type="email"
              placeholder="nama@email.com"
              icon={<Mail size={16} />}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              error={errors.email}
            />

            <Input
              label="Interest / Minat"
              placeholder="contoh: IoT, Machine Learning"
              icon={<Sparkles size={16} />}
              value={form.interest}
              onChange={(e) => setForm({ ...form, interest: e.target.value })}
              error={errors.interest}
            />

            <Input
              label="Password"
              type="password"
              placeholder="Minimal 8 karakter"
              icon={<Lock size={16} />}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              error={errors.password}
            />

            <Input
              label="Konfirmasi Password"
              type="password"
              placeholder="Ulangi password"
              icon={<Lock size={16} />}
              value={form.confirm_password}
              onChange={(e) =>
                setForm({ ...form, confirm_password: e.target.value })
              }
              error={errors.confirm_password}
            />

            <Button
              type="submit"
              loading={loading}
              className="w-full"
              size="lg"
            >
              Daftar
            </Button>
          </form>

          <p className="text-center text-sm text-text-muted mt-6">
            Sudah punya akun?{" "}
            <Link
              href="/login"
              className="text-accent-400 hover:text-accent-300 font-medium transition-colors"
            >
              Masuk
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
