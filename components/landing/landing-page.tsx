import Link from "next/link";
import "./landing.css";

const FEATURES = [
  {
    icon: "☷",
    title: "Prioritas jadi lebih jelas.",
    text: "Ubah ide besar menjadi tugas yang terarah. Tentukan penanggung jawab dan tenggat, tanpa ada yang terlewat.",
    label: "TUGAS & PRIORITAS",
    note: "Tahu apa yang perlu dikerjakan.",
  },
  {
    icon: "▣",
    title: "Kolaborasi tanpa jeda.",
    text: "Diskusi, bagikan berkas, dan beri masukan langsung di tugas. Semua konteks tetap dekat dengan pekerjaan.",
    label: "KOLABORASI TIM",
    note: "Lebih sedikit mencari, lebih banyak berkarya.",
  },
  {
    icon: "⌁",
    title: "Progres terlihat nyata.",
    text: "Lihat perkembangan proyek dalam sekali pandang. Kenali hambatan lebih awal dan jaga ritme kerja tim.",
    label: "PANTAU PROGRES",
    note: "Melangkah maju dengan lebih tenang.",
  },
];

function Logo() {
  return (
    <Link href="/" className="landing-logo" aria-label="Kolara home">
      <span className="landing-logo-mark">↗</span>
      <span>kolara</span>
    </Link>
  );
}

function ProductPreview() {
  const columns = [
    { title: "Akan dikerjakan", tone: "sand", cards: ["Kenali kebutuhan pengguna", "Susun cerita brand"] },
    { title: "Sedang berjalan", tone: "mint", cards: ["Eksplorasi halaman website", "Review konsep bersama tim"] },
    { title: "Selesai", tone: "lilac", cards: ["Tentukan arah proyek", "Moodboard & inspirasi"] },
  ];

  return (
    <div className="landing-preview-wrap">
      <div className="landing-preview">
        <aside className="preview-side">
          <div className="preview-brand"><span className="landing-logo-mark">↗</span> kolara</div>
          <div className="preview-workspace"><span>S</span><strong>Studio Kita</strong><small>⌃</small></div>
          <div className="preview-nav">
            <span>◈ &nbsp; Ringkasan</span>
            <span>◉ &nbsp; Tugas saya</span>
            <span className="selected">▣ &nbsp; Papan proyek</span>
            <span>◌ &nbsp; Kalender</span>
            <span>♧ &nbsp; Anggota tim</span>
          </div>
          <small className="preview-label">PROYEK FAVORIT</small>
          <span className="preview-favorite">● Website baru</span>
          <span className="preview-favorite">● Kampanye akhir tahun</span>
          <button type="button" className="preview-invite">♧ &nbsp; Undang anggota</button>
        </aside>
        <div className="preview-main">
          <div className="preview-crumb">Proyek / Website baru <span>⌕ &nbsp; ◌ &nbsp; ◉</span></div>
          <div className="preview-heading">
            <div><h3>Website baru, semangat baru.</h3><p>Ruang kolaborasi untuk ide besar tim kita.</p></div>
            <button type="button">＋ Tambah tugas</button>
          </div>
          <div className="preview-tabs"><b>Papan</b><span>Daftar</span><span>Linimasa</span></div>
          <div className="preview-columns">
            {columns.map((column) => (
              <div className="preview-column" key={column.title}>
                <h4><i className={column.tone} />{column.title}<small>{column.cards.length}</small></h4>
                {column.cards.map((card, index) => (
                  <div className="preview-card" key={card}>
                    <em className={column.tone}>{index % 2 ? "Konten" : "Riset"}</em>
                    <strong>{card}</strong>
                    <p>{index % 2 ? "Satu langkah untuk setiap tujuan." : "Ruang untuk ide dan wawasan tim."}</p>
                    <small>◷ &nbsp; {index + 12} Nov <b>{index % 2 ? "AR" : "NA"}</b></small>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      <p className="preview-caption">⌁ &nbsp; Satu tempat untuk melihat gambaran besar dan langkah kecil berikutnya.</p>
    </div>
  );
}

export function LandingPage() {
  return (
    <main className="landing">
      <header className="landing-header">
        <Logo />
        <nav className="landing-nav" aria-label="Landing navigation">
          <a href="#fitur">Fitur</a>
          <a href="#cara-kerja">Cara kerja</a>
          <a href="#untuk-siapa">Untuk tim</a>
        </nav>
        <div className="landing-actions">
          <Link href="/login" className="landing-login">Masuk</Link>
          <Link href="/register" className="landing-start">Daftar gratis <span>→</span></Link>
        </div>
      </header>

      <section className="landing-hero">
        <div className="landing-eyebrow">✣ &nbsp; Ruang untuk ide. Arah untuk tim.</div>
        <h1>Plan better,<br /><span>work smarter.</span></h1>
        <p>Satukan proyek, tugas, dan percakapan tim dalam satu tempat. Dengan Kolara, setiap langkah punya arah yang jelas.</p>
        <div className="landing-hero-actions">
          <Link href="/register" className="landing-primary">Mulai gratis <span>→</span></Link>
          <a href="#fitur" className="landing-secondary">Jelajahi Kolara</a>
        </div>
        <div className="landing-trust"><span>✓ Tanpa kartu kredit</span><span>✓ Siap dalam hitungan menit</span></div>
      </section>

      <ProductPreview />

      <section className="landing-features" id="fitur">
        <div className="landing-section-intro">
          <div><small>LEBIH RAPI, LEBIH BERARTI</small><h2>Kurangi keruwetan.<br />Beri ruang untuk kemajuan.</h2></div>
          <p>Bukan menambah pekerjaan baru. Kolara membantu tim fokus pada pekerjaan yang benar-benar penting.</p>
        </div>
        <div className="landing-feature-grid">
          {FEATURES.map((feature) => (
            <article key={feature.title} className="landing-feature">
              <div className="landing-feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
              <div className="landing-feature-note"><small>{feature.label}</small><span>{feature.note}</span></div>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-story" id="cara-kerja">
        <div className="landing-story-image" role="img" aria-label="Tim sedang berkolaborasi">
          <div className="story-person person-one" /><div className="story-person person-two" /><div className="story-person person-three" />
          <div className="story-window" /><div className="story-plant" />
          <div className="story-quote"><small>♧ &nbsp; DIBUAT UNTUK KERJA BERSAMA</small><strong>Ide terbaik tumbuh saat semua orang punya ruang untuk terlibat.</strong></div>
        </div>
        <div className="landing-story-copy">
          <small>LANGKAH KECIL, DAMPAK BESAR</small><h2>Dari rencana<br />ke hasil, bersama.</h2>
          <p>Tak perlu proses yang rumit untuk mulai bekerja lebih terarah. Bangun ritme tim dengan tiga langkah sederhana.</p>
          <ol><li><b>01</b><span><strong>Ciptakan ruang timmu</strong><small>Buat workspace dan undang orang-orang hebat di timmu.</small></span></li><li><b>02</b><span><strong>Rencanakan langkah berikutnya</strong><small>Susun proyek, bagi tugas, dan sepakati prioritas bersama.</small></span></li><li><b>03</b><span><strong>Rayakan setiap kemajuan</strong><small>Pantau progres dan tuntaskan target, satu per satu.</small></span></li></ol>
        </div>
      </section>

      <section className="landing-cta" id="untuk-siapa">
        <div><small>LANGKAH BESAR DIMULAI DI SINI</small><h2>Proyek berikutnya,<br /><span>mulai bersama Kolara.</span></h2><p>Beri ide dan timmu tempat untuk tumbuh. Gratis untuk memulai.</p></div>
        <div><Link href="/register" className="landing-cta-button">Daftar & mulai gratis <span>→</span></Link><small>Sudah punya akun? <Link href="/login">Masuk</Link></small></div>
      </section>

      <footer className="landing-footer">
        <div><Logo /><p>Lebih terarah dalam bekerja.<br />Lebih dekat dalam berkolaborasi.</p></div>
        <div className="landing-footer-links"><div><strong>Jelajahi</strong><a href="#fitur">Fitur</a><a href="#cara-kerja">Cara kerja</a><a href="#untuk-siapa">Untuk tim</a></div><div><strong>Dukungan</strong><a href="#">Pusat bantuan</a><a href="#">Hubungi kami</a><a href="#">halo@kolara.id</a></div><div><strong>Mulai bersama</strong><Link href="/register">Daftar gratis</Link><Link href="/login">Masuk</Link></div></div>
        <div className="landing-footer-bottom"><span>© 2026 Kolara. Tumbuh bersama, langkah lebih baik.</span><span>Kebijakan privasi &nbsp;&nbsp;&nbsp; Syarat penggunaan</span></div>
      </footer>
    </main>
  );
}
