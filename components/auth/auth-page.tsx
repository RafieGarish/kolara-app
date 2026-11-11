"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { Icon } from "@/components/icon";
import { notify } from "@/lib/toast";
import "./auth.css";

type AuthMode = "login" | "register";

const COPY: Record<AuthMode, {
  title: string;
  subtitle: string;
  sideTitle: React.ReactNode;
  sideText: string;
  switchText: string;
  switchLabel: string;
}> = {
  login: {
    title: "Selamat datang kembali",
    subtitle: "Masuk untuk melanjutkan progres timmu.",
    sideTitle: <>Plan better,<br /><span>work smarter.</span></>,
    sideText: "Kembali ke ruang tempat ide, tugas, dan tim bergerak ke arah yang sama.",
    switchText: "Belum punya akun?",
    switchLabel: "Daftar gratis",
  },
  register: {
    title: "Buat akun Kolara",
    subtitle: "Mulai kelola proyek dan tumbuh bersama tim.",
    sideTitle: <>Plan better,<br /><span>work smarter.</span></>,
    sideText: "Dari ide pertama hingga proyek selesai, bangun ritme kerja yang lebih baik bersama Kolara.",
    switchText: "Sudah punya akun?",
    switchLabel: "Masuk",
  },
};

function Logo() {
  return (
    <Link href="/" className="auth-logo" aria-label="Kembali ke Kolara">
      <span className="auth-logo-mark">↗</span>
      <span>kolara</span>
    </Link>
  );
}

function ProjectCard() {
  return (
    <div className="auth-project-card">
      <div className="auth-project-top">
        <div><small>PROYEK TIM</small><strong>Website baru</strong><span>Satu tim. Satu tujuan.</span></div>
        <em>Berjalan lancar</em>
      </div>
      <div className="auth-project-divider" />
      <div className="auth-project-task is-done"><i>✓</i>Susun ide dan rencana</div>
      <div className="auth-project-task is-done"><i>✓</i>Bagikan tugas ke tim</div>
      <div className="auth-project-task"><i />Wujudkan langkah berikutnya</div>
    </div>
  );
}

function AuthForm({ mode }: { mode: AuthMode }) {
  const copy = COPY[mode];
  const isLogin = mode === "login";
  const [showPassword, setShowPassword] = useState(false);

  const continueWithGoogle = async () => {
    try {
      await signIn("google", { callbackUrl: "/overview" });
    } catch (error) {
      console.error("Google sign-in failed", error);
      notify("Google login tidak dapat dimulai. Cek terminal untuk detail.");
    }
  };

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    notify(isLogin ? "Login siap dihubungkan ke autentikasi." : "Pendaftaran siap dihubungkan ke autentikasi.");
  };

  return (
    <main className="auth-page">
      <section className="auth-story">
        <Logo />
        <div className="auth-story-copy">
          <small>RUANG UNTUK IDE. ARAH UNTUK TIM.</small>
          <h1>{copy.sideTitle}</h1>
          <p>{copy.sideText}</p>
          <ProjectCard />
          <h2>Lebih sedikit keruwetan.<br />Lebih banyak kemajuan.</h2>
        </div>
        <span className="auth-copyright">© 2026 Kolara</span>
      </section>

      <section className="auth-panel">
        <div className="auth-panel-top">
          <Link href="/" className="auth-back"><Icon name="arrow-left" />Kembali ke beranda</Link>
          <span>{copy.switchText} <Link href={isLogin ? "/register" : "/login"}>{copy.switchLabel}</Link></span>
        </div>

        <div className="auth-form-wrap">
          <h2>{copy.title}</h2>
          <p className="auth-subtitle">{copy.subtitle}</p>
          <button type="button" className="auth-google" onClick={continueWithGoogle}>
            <span className="auth-google-mark">G</span>{isLogin ? "Masuk dengan Google" : "Daftar dengan Google"}
          </button>
          <div className="auth-divider"><span>atau {isLogin ? "masuk" : "daftar"} dengan email</span></div>

          <form onSubmit={submit} className="auth-form">
            {!isLogin && (
              <label>Nama lengkap<input type="text" name="name" placeholder="Masukkan nama lengkap" required /></label>
            )}
            <label>Alamat email<input type="email" name="email" placeholder="nama@perusahaan.com" required /></label>
            <label>Kata sandi
              <span className="auth-password">
                <input type={showPassword ? "text" : "password"} name="password" placeholder={isLogin ? "Masukkan kata sandi" : "Buat kata sandi"} minLength={8} required />
                <button type="button" aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"} onClick={() => setShowPassword((value) => !value)}><Icon name={showPassword ? "eye-off" : "eye"} /></button>
              </span>
            </label>
            {!isLogin && <small className="auth-hint">Gunakan minimal 8 karakter.</small>}
            {isLogin ? (
              <div className="auth-options"><label className="auth-check"><input type="checkbox" /> <span>Ingat saya</span></label><button type="button" onClick={() => notify("Fitur reset kata sandi siap dihubungkan.")}>Lupa kata sandi?</button></div>
            ) : (
              <label className="auth-check auth-terms"><input type="checkbox" required /> <span>Saya menyetujui <a href="#">Syarat & Ketentuan</a> serta<br /><a href="#">Kebijakan Privasi</a> Kolara.</span></label>
            )}
            <button type="submit" className="auth-submit">{isLogin ? "Masuk" : "Buat akun gratis"}</button>
          </form>
          <p className="auth-note">{isLogin ? "Ruang kerja lebih terarah, bersama Kolara." : "Tanpa kartu kredit. Siap dalam hitungan menit."}</p>
        </div>

        <footer className="auth-footer"><a href="#">Kebijakan Privasi</a><span>·</span><a href="#">Syarat & Ketentuan</a></footer>
      </section>
    </main>
  );
}

export function LoginPage() {
  return <AuthForm mode="login" />;
}

export function RegisterPage() {
  return <AuthForm mode="register" />;
}
