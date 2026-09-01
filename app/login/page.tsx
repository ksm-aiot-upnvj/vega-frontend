"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { Mail, Lock } from "lucide-react";
import { login as apiLogin } from "@/lib/api";
import { saveAuthData } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.email) errs.email = "Email wajib diisi";
    if (!form.password) errs.password = "Password wajib diisi";
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
      const res = await apiLogin(form);
      saveAuthData(res.access_token, res.refresh_token, res.user);
      if (res.user.role === "ADMIN") {
        router.push("/admin");
      } else if (res.user.role === "MENTOR") {
        router.push("/mentor");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Login gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-primary bg-gradient-hero relative">
      <div className="absolute inset-0 grid-bg" />

      {/* Floating orbs */}
      <div className="absolute top-[20%] left-[15%] w-64 h-64 bg-accent-600/8 rounded-full blur-3xl" />
      <div className="absolute bottom-[20%] right-[15%] w-80 h-80 bg-secondary-700/8 rounded-full blur-3xl" />

      <div className="relative w-full max-w-md mx-4 animate-fade-in-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-accent-600 to-accent-500 shadow-lg shadow-accent-500/20">
              <span className="text-white font-bold text-xl">V</span>
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-text-primary">
            Selamat Datang Kembali
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Masuk ke akun VEGA-mu
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {apiError && (
              <div className="p-3 rounded-xl bg-error-500/10 border border-error-500/20 text-error-400 text-sm text-center">
                {apiError}
              </div>
            )}

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
              label="Password"
              type="password"
              placeholder="••••••••"
              icon={<Lock size={16} />}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              error={errors.password}
            />

            <Button
              type="submit"
              loading={loading}
              className="w-full"
              size="lg"
            >
              Masuk
            </Button>
          </form>

          <p className="text-center text-sm text-text-muted mt-6">
            Belum punya akun?{" "}
            <Link
              href="http://localhost:3000"
              className="text-accent-400 hover:text-accent-300 font-medium transition-colors"
            >
              Daftar sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
