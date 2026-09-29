const CONFIG = {
  schoolName: "SMK Telkom Sandhy Putra Jakarta",
  practiceTitle: "Praktik Konfigurasi SSID pada ONT",
  ssidSuffix: "Bahagia",
  ssidPassword: "yaiyalah123",
  tutorialUrl: "https://smktelkomjakarta.my.canva.site/kangwifi",
  submissionUrl: "https://drive.google.com/drive/folders/1pLG98cdx0gWvGdce2AmyOPBKD89DPMvQ?usp=sharing"
};
const SEC = ["Open","WEP","WPA-PSK","WPA2-PSK","WPA/WPA2-PSK","WPA3","WPA2/WPA3","Lainnya"];
const NAMES = ["Identitas","Identifikasi ONT","Konfigurasi Awal","Tambah SSID","Pengujian","Refleksi","Laporan"];
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
let S, cur = 0, pdfBlob = null, pdfName = "";

function fresh() {
  S = { f: { tgl: new Date().toISOString().slice(0, 10) }, img: {}, rows: [{ s: "", sec: "" }], edited: false, pEdited: false };
  pdfBlob = null;
}
const clean = v => (v || "").replace(/\s+/g, " ").trim();
const autoSsid = () => clean(S.f.panggilan) ? clean(S.f.panggilan) + " " + CONFIG.ssidSuffix : "";
const secOpts = () => '<option value="">Pilih…</option>' + SEC.map(x => `<option>${x}</option>`).join("");

function num(v) { const n = parseFloat(String(v || "").replace(",", ".")); return isFinite(n) ? n : null; }
function rxInfo(v) {
  const n = num(v); if (n === null) return null;
  if (n > 0) return { ok: false, t: "Nilai Rx biasanya negatif. Periksa apakah tanda minus (-) terlewat." };
  if (n > -8) return { ok: false, t: `Rx ${n} dBm: terlalu kuat (di atas -8 dBm). Cahaya berlebih dapat mengganggu ONT.` };
  if (n >= -25) return { ok: true, t: `Rx ${n} dBm: baik. Sinyal optik berada pada rentang normal (-8 sampai -25 dBm).` };
  if (n >= -27) return { ok: false, t: `Rx ${n} dBm: mendekati batas. Masih dapat bekerja, tetapi rentan bermasalah (-25 sampai -27 dBm).` };
  return { ok: false, t: `Rx ${n} dBm: terlalu lemah (di bawah -27 dBm). Kemungkinan ada gangguan pada kabel fiber atau konektor.` };
}
function rxShow() { const i = rxInfo(S.f.rx), e = $("#rxst"); e.hidden = !i; if (i) { e.textContent = (i.ok ? "✅ " : "⚠️ ") + i.t; } }
function show(msg) { const a = $("#alert"); a.hidden = !msg; a.innerHTML = msg || ""; }

/* ---------- UI build ---------- */
function build() {
  $("#tutorialLink").href = CONFIG.tutorialUrl || "#"; $("#tutorialCard").hidden = !CONFIG.tutorialUrl;
  $("#school").textContent = CONFIG.schoolName; $("#ptitle").textContent = CONFIG.practiceTitle;
  $("#steps").innerHTML = '<button type="button" data-go="0">00 Home</button>' + NAMES.map((n, i) => `<button type="button" data-go="${i + 1}">0${i + 1} ${n}</button>`).join("");
  $$(".sec").forEach(s => s.innerHTML = secOpts());
  $("#slotSel").innerHTML = '<option value="">Pilih…</option>' + [1,2,3,4,5,6,7,8].map(n => `<option>SSID ${n}</option>`).join("");
  $$(".up").forEach(u => {
    const k = u.dataset.k;
    u.innerHTML = `<b>${u.dataset.t}</b>${u.dataset.h ? `<small>${u.dataset.h}</small>` : ""}<div class="pv"></div>
      <input type="file" accept="image/*" ${u.dataset.cap ? 'capture="environment"' : ""} hidden>
      <button type="button" class="ghost pick"></button> <button type="button" class="ghost del" hidden>Hapus</button>`;
    const inp = $("input", u);
    $(".pick", u).onclick = () => inp.click();
    $(".del", u).onclick = () => { delete S.img[k]; inp.value = ""; renderUp(u); };
    inp.onchange = () => readImg(inp.files[0], k, u);
    renderUp(u);
  });
}
function renderUp(u) {
  const d = S.img[u.dataset.k];
  $(".pv", u).innerHTML = d ? `<img src="${d}" alt="Preview">` : "";
  $(".pick", u).textContent = d ? "Ganti gambar" : "Pilih / ambil gambar";
  $(".del", u).hidden = !d;
}
function readImg(file, k, u) {
  if (!file) return;
  if (!file.type.startsWith("image/")) return show("File harus berupa gambar.");
  const fr = new FileReader();
  fr.onerror = () => show("Gambar gagal dibaca. Coba pilih file lain.");
  fr.onload = () => {
    const im = new Image();
    im.onerror = () => show("Gambar tidak dapat ditampilkan. Gunakan format JPG atau PNG.");
    im.onload = () => { // perkecil agar PDF ringan
      const m = 1000, r = Math.min(1, m / Math.max(im.width, im.height)), c = document.createElement("canvas");
      c.width = im.width * r; c.height = im.height * r;
      const x = c.getContext("2d"); x.fillStyle = "#fff"; x.fillRect(0, 0, c.width, c.height); x.drawImage(im, 0, 0, c.width, c.height);
      S.img[k] = c.toDataURL("image/jpeg", .82); show(""); renderUp(u);
    };
    im.src = fr.result;
  };
  fr.readAsDataURL(file);
}
function renderRows() {
  $("#rows").innerHTML = S.rows.map((r, i) => `<tr><td>${i + 1}</td><td><input data-r="${i}" data-c="s" value="${r.s.replace(/"/g, "&quot;")}"></td>
    <td><select data-r="${i}" data-c="sec">${secOpts().replace(`<option>${r.sec}</option>`, `<option selected>${r.sec}</option>`)}</select></td>
    <td>${S.rows.length > 1 ? `<button type="button" class="ghost" data-x="${i}">✕</button>` : ""}</td></tr>`).join("");
}
function fillFields() {
  $$("[data-f]").forEach(el => {
    const v = S.f[el.dataset.f] || "";
    if (el.type === "radio") el.checked = el.value === v; else el.value = v;
  });
}

function loginHint() {
  const q = [clean(S.f.merk), clean(S.f.tipe)].filter(Boolean).join(" ");
  $("#loginHint").innerHTML = `🔎 Sebelum mengisi, cari alamat IP, username, dan password bawaan ONT di internet sesuai merk dan tipe ONT-mu. Contoh kata kunci: <b>${q ? q + " default username password" : "[merk] [tipe] default username password"}</b>. Jika tidak berhasil, cek label di badan ONT atau tanyakan pada orang tua/penyedia internet.`;
}

/* ---------- Navigation ---------- */
function go(n) {
  cur = n; show("");
  $$("main > section").forEach(s => s.hidden = +s.dataset.s !== n);
  $("#nav").hidden = n === 0;
  $("#next").textContent = n === 7 ? "📄 GENERATE LAPORAN PDF" : "Lanjut →"; $("#next").disabled = false;
  $$("#steps button").forEach((b, i) => { b.classList.toggle("cur", i === n); b.classList.toggle("done", i > 0 && i < n); });
  $("#barfill").style.width = Math.round(n / 7 * 100) + "%";
  if (n === 4) { if (!S.edited) S.f.ssidNew = autoSsid(); $("#mSsid").textContent = autoSsid(); fillFields(); }
  if (n === 3) rxShow();
  if (n === 2) loginHint();
  if (n === 4) { const c = S.rows.filter(r => clean(r.s)).length;
    $("#slotHint").textContent = `Kamu mencatat ${c} SSID awal, jadi SSID baru kemungkinan berada di slot SSID ${c + 1}. Periksa pada menu Wi-Fi/WLAN ONT (biasanya SSID 1-4 untuk 2.4 GHz dan SSID 5-8 untuk 5 GHz), lalu pilih nomor yang benar-benar kamu gunakan.`; }
  if (n === 5) { const o = S.rows.filter(r => clean(r.s)).map(r => clean(r.s)).join(", ") || "(belum dicatat)";
    $("#hpHint").textContent = `Buka daftar Wi-Fi di HP/laptop. Screenshot harus menampilkan SSID lama (${o}) dan SSID baru (${clean(S.f.ssidNew)}) sekaligus dalam satu tampilan.`; }
  if (n === 5) trbl();
  if (n === 7) checklist();
  scrollTo({ top: 0 });
}
function trbl() {
  $("#trbl").hidden = !(S.f.found === "Tidak" || S.f.conn === "Tidak"); $("#spd").hidden = S.f.conn !== "Ya";
}

/* ---------- Validasi ---------- */
function missing(step) {
  const f = S.f, m = [], need = (k, t, s) => { if (!clean(f[k])) m.push([s, t, k]); }, img = (k, t, s) => { if (!S.img[k]) m.push([s, t]); };
  if (!step || step === 1) { need("nama", "Nama", 1); need("panggilan", "Nama depan / panggilan", 1); need("kelas", "Kelas", 1); need("nis", "NIS", 1); need("tgl", "Tanggal praktik", 1); }
  if (!step || step === 2) { need("merk", "Merk ONT", 2); need("tipe", "Tipe ONT", 2); img("ont", "Foto ONT", 2);
    need("ip", "Alamat IP / URL login", 2); need("user", "Username", 2); need("pass", "Password login sudah diisi", 2); }
  if (!step || step === 3) {
    if (!S.rows.some(r => clean(r.s))) m.push([3, "SSID awal sudah diidentifikasi"]);
    if (S.rows.some(r => clean(r.s) && !r.sec)) m.push([3, "Security SSID awal sudah diisi"]);
    img("cfg0", "Screenshot konfigurasi awal (Bukti konfigurasi belum diunggah)", 3);
    if (num(f.rx) === null) m.push([3, "Daya optik Rx (isi angka, contoh -19.5)"]);
    img("opt", "Screenshot informasi optik", 3);
  }
  if (!step || step === 4) { need("ssidNew", "SSID baru", 4); need("secNew", "Security SSID baru", 4); need("slot", "Nomor SSID pada ONT", 4);
    if (clean(f.ssidNew).length > 32) m.push([4, "SSID baru maksimal 32 karakter"]); img("cfg1", "Screenshot konfigurasi SSID baru", 4); }
  if (!step || step === 5) {
    if (!f.found || !f.conn) m.push([5, "Hasil pengujian"]);
    img("hp", "Screenshot daftar Wi-Fi di HP (SSID lama dan baru)", 5);
    if (f.conn === "Ya") { [["dl", "Download"], ["ul", "Upload"], ["ping", "Ping"]].forEach(([k, n]) => { if (num(f[k]) === null) m.push([5, `Speedtest: ${n} (isi angka)`]); }); img("speed", "Screenshot hasil speedtest", 5); }
    if (f.found === "Tidak" || f.conn === "Tidak") { need("t1", "Troubleshooting: masalah", 5); need("t2", "Troubleshooting: langkah", 5); }
  }
  if (!step || step === 6) { need("r1", "Refleksi 1", 6); need("r2", "Refleksi 2", 6); need("r3", "Refleksi 3", 6); }
  return m;
}
function mark(step) { // tandai field kosong
  $$(`section[data-s="${step + 0}"] [data-f]`).forEach(el => { if (el.type !== "radio") el.classList.toggle("bad", !clean(S.f[el.dataset.f]) && el.closest("[hidden]") === null); });
}
function checklist() {
  const m = missing(0), bad = [...new Set(m.map(x => x[1]))];
  const items = [["Identitas lengkap", x => x[0] === 1], ["Merk ONT", x => x[1] === "Merk ONT"], ["Tipe ONT", x => x[1] === "Tipe ONT"],
    ["Foto ONT", x => x[1] === "Foto ONT"], ["Alamat IP / URL login", x => x[1].startsWith("Alamat")], ["Username", x => x[1] === "Username"],
    ["Password login sudah diisi", x => x[1].startsWith("Password")], ["SSID awal dan security sudah diisi", x => x[1].includes("SSID awal") || x[1].startsWith("Security SSID awal")],
    ["Screenshot konfigurasi awal", x => x[1].startsWith("Screenshot konfigurasi awal")], ["Daya optik Rx ONT", x => x[1].startsWith("Daya optik")], ["Screenshot informasi optik", x => x[1] === "Screenshot informasi optik"],
    ["SSID baru (maks. 32 karakter)", x => x[1].startsWith("SSID baru")], ["Nomor SSID pada ONT", x => x[1].startsWith("Nomor SSID")],
    ["Security SSID baru", x => x[1] === "Security SSID baru"], ["Screenshot konfigurasi SSID baru", x => x[1].startsWith("Screenshot konfigurasi SSID")],
    ["Hasil pengujian dan troubleshooting", x => x[1] === "Hasil pengujian" || x[1].startsWith("Troubleshooting")],
    ["Screenshot daftar Wi-Fi di HP (SSID lama dan baru)", x => x[1].startsWith("Screenshot daftar")], ["Hasil speedtest dan screenshot (jika terhubung)", x => x[1].startsWith("Speedtest") || x[1] === "Screenshot hasil speedtest"], ["Refleksi", x => x[0] === 6]];
  $("#check").innerHTML = items.map(([t, fn]) => `<li class="${m.some(fn) ? "no" : ""}">${t}</li>`).join("");
  const ok = m.length === 0; $("#next").disabled = !ok;
  show(ok ? "" : "Masih ada bagian yang belum diselesaikan: " + bad.join(", ") + ".");
}

/* ---------- PDF ---------- */
function makePdf() {
  if (!window.jspdf) return show("Browser Anda tidak mendukung fitur ini atau pustaka PDF gagal dimuat. Periksa koneksi internet lalu coba lagi.");
  try {
    const { jsPDF } = window.jspdf, d = new jsPDF({ unit: "mm", format: "a4" }), f = S.f, W = 210, M = 18, CW = W - 2 * M;
    let y = 20;
    const room = h => { if (y + h > 272) { d.addPage(); y = 20; } };
    const text = (t, size = 11, bold = false, gap = 5.5) => {
      d.setFont("helvetica", bold ? "bold" : "normal"); d.setFontSize(size);
      d.splitTextToSize(String(t || "-"), CW).forEach(l => { room(gap); d.text(l, M, y); y += gap; });
    };
    const head = t => { y += 4; room(14); d.setFillColor(14, 143, 138); d.rect(M, y - 5, CW, 8, "F"); d.setTextColor(255); d.setFont("helvetica", "bold"); d.setFontSize(12); d.text(t, M + 2, y + .7); d.setTextColor(0); y += 10; };
    const kv = (k, v) => { d.setFont("helvetica", "bold"); d.setFontSize(11); room(6); d.text(k, M, y); d.setFont("helvetica", "normal"); const ls = d.splitTextToSize(": " + (v || "-"), CW - 50); ls.forEach((l, i) => { if (i) room(5.5); d.text(l, M + 50, y); y += 5.5; }); };
    const pic = (k, cap) => {
      const s = S.img[k]; if (!s) return; const p = d.getImageProperties(s); let w = Math.min(CW, 120), h = w * p.height / p.width;
      if (h > 95) { h = 95; w = h * p.width / p.height; }
      room(h + 10); d.setFont("helvetica", "italic"); d.setFontSize(9); d.text(cap, M, y); y += 2; d.addImage(s, "JPEG", M, y, w, h); d.setDrawColor(180); d.rect(M, y, w, h); y += h + 5;
    };
    d.setFont("helvetica", "bold"); d.setFontSize(14); d.splitTextToSize("LAPORAN PRAKTIK KONFIGURASI SSID PADA ONT", CW).forEach(l => { d.text(l, W / 2, y, { align: "center" }); y += 7; });
    y += 3; kv("Nama", clean(f.nama)); kv("Kelas", clean(f.kelas)); kv("NIS", clean(f.nis)); kv("Tanggal Praktik", f.tgl);
    head("A. Identifikasi Perangkat"); kv("Merk ONT", clean(f.merk)); kv("Tipe/Model ONT", clean(f.tipe)); y += 2; pic("ont", "Foto perangkat ONT");
    head("B. Konfigurasi Awal"); kv("Alamat IP/URL login", clean(f.ip)); kv("Username", clean(f.user)); y += 2;
    room(10); d.setFont("helvetica", "bold"); d.text("No", M + 2, y); d.text("SSID", M + 15, y); d.text("Security", M + 110, y); d.line(M, y + 1.5, M + CW, y + 1.5); y += 6.5;
    S.rows.filter(r => clean(r.s)).forEach((r, i) => { room(7); d.setFont("helvetica", "normal"); d.text(String(i + 1), M + 2, y); d.text(d.splitTextToSize(clean(r.s), 90)[0], M + 15, y); d.text(r.sec || "-", M + 110, y); y += 6; });
    y += 2; pic("cfg0", "Screenshot konfigurasi awal");
    const ri = rxInfo(f.rx); kv("Rx Power ONT", clean(f.rx) + " dBm"); if (ri) kv("Penilaian", ri.t); y += 2; pic("opt", "Screenshot informasi optik (Rx Power)");
    head("C. Penambahan SSID"); kv("SSID baru", clean(f.ssidNew)); kv("Security", f.secNew); kv("Nomor SSID pada ONT", f.slot); kv("Password", "Tidak ditampilkan dalam laporan"); y += 2; pic("cfg1", "Screenshot SSID baru pada konfigurasi ONT");
    head("D. Pengujian"); kv("SSID ditemukan", f.found); kv("Berhasil terhubung", f.conn);
    if (f.conn === "Ya") { kv("Speedtest Download", clean(f.dl) + " Mbps"); kv("Speedtest Upload", clean(f.ul) + " Mbps"); kv("Speedtest Ping", clean(f.ping) + " ms"); }
    y += 2; pic("hp", "Screenshot daftar Wi-Fi di HP: SSID lama dan SSID baru"); if (f.conn === "Ya") pic("speed", "Screenshot hasil speedtest");
    head("E. Troubleshooting");
    if (f.found === "Tidak" || f.conn === "Tidak") { text("Masalah yang ditemukan:", 11, true); text(f.t1); text("Langkah penyelesaian:", 11, true); text(f.t2); }
    else text("Tidak ada masalah pada pengujian. SSID ditemukan dan berhasil terhubung.");
    head("F. Refleksi");
    [["1. Informasi terpenting dari ONT", f.r1], ["2. Kendala saat menambahkan SSID", f.r2], ["3. Yang dipelajari dari praktik ini", f.r3]].forEach(([q, a]) => { text(q, 11, true); text(a); y += 2; });
    const n = d.getNumberOfPages(), made = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
    for (let i = 1; i <= n; i++) {
      d.setPage(i); d.setDrawColor(150); d.line(M, 280, W - M, 280); d.setFont("helvetica", "normal"); d.setFontSize(8); d.setTextColor(90);
      d.text(`${CONFIG.schoolName} | Praktik Konfigurasi ONT`, M, 284); d.text(`${clean(f.nama)} | ${clean(f.kelas)}`, M, 288);
      d.text(`Halaman ${i} dari ${n}`, W - M, 284, { align: "right" }); d.text(`Dibuat: ${made}`, W - M, 288, { align: "right" });
    }
    const safe = v => clean(v).replace(/\s/g, "-").replace(/[^A-Za-z0-9_-]/g, "");
    pdfName = `Laporan_ONT_${safe(f.nama)}_${safe(f.kelas)}.pdf`; pdfBlob = d.output("blob");
    download(); $("#done").hidden = false; show("");
    const u = $("#btnUp"); if (CONFIG.submissionUrl) { u.href = CONFIG.submissionUrl; u.classList.remove("dis"); $("#upNote").textContent = "Folder Google Drive akan terbuka di tab baru. Unggah file PDF laporanmu di sana."; }
    else { u.classList.add("dis"); $("#upNote").textContent = "Link pengumpulan belum dikonfigurasi oleh guru."; }
    $("#done").scrollIntoView({ behavior: "smooth" });
  } catch (e) { console.error(e); show("PDF belum berhasil dibuat. Pastikan semua gambar sudah selesai dimuat lalu coba kembali."); }
}
function download() {
  if (!pdfBlob) return;
  const a = document.createElement("a"); a.href = URL.createObjectURL(pdfBlob); a.download = pdfName; document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
}

/* ---------- Events ---------- */
function init() {
  fresh(); build(); renderRows(); fillFields(); $("#done").hidden = true; go(0);
}
document.addEventListener("click", e => {
  const t = e.target;
  if (t.dataset.go) go(+t.dataset.go);
  if (t.classList.contains("tgl")) { const i = t.previousElementSibling; i.type = i.type === "password" ? "text" : "password"; t.textContent = i.type === "password" ? "Tampilkan" : "Sembunyikan"; }
  if (t.dataset.x) { S.rows.splice(+t.dataset.x, 1); renderRows(); }
});
document.addEventListener("input", e => {
  const t = e.target;
  if (t.dataset.f) { S.f[t.dataset.f] = t.value; t.classList.remove("bad"); if (t.dataset.f === "ssidNew") S.edited = true;
    if (t.dataset.f === "nama" && !S.pEdited) { S.f.panggilan = clean(t.value).split(" ")[0] || ""; $('[data-f="panggilan"]').value = S.f.panggilan; }
    if (t.dataset.f === "panggilan") S.pEdited = !!clean(t.value);
    if ((t.dataset.f === "nama" || t.dataset.f === "panggilan") && !S.edited) S.f.ssidNew = autoSsid(); if (t.dataset.f === "found" || t.dataset.f === "conn") trbl(); if (t.dataset.f === "rx") rxShow(); if (t.dataset.f === "merk" || t.dataset.f === "tipe") loginHint(); }
  if (t.dataset.r !== undefined) S.rows[+t.dataset.r][t.dataset.c] = t.value;
});
$("#addRow").onclick = () => { S.rows.push({ s: "", sec: "" }); renderRows(); };
$("#tglMp").onclick = () => { const p = $("#mPass"), h = p.textContent.includes("•"); p.textContent = h ? CONFIG.ssidPassword : "••••••••••••"; $("#tglMp").textContent = h ? "Sembunyikan Password" : "Tampilkan Password"; };
$("#prev").onclick = () => go(Math.max(0, cur - 1));
$("#next").onclick = () => {
  if (cur === 7) return makePdf();
  const m = missing(cur);
  if (m.length) { mark(cur); return show("Lengkapi dulu: " + m.map(x => x[1]).join(", ") + "."); }
  go(cur + 1);
};
$("#btnDl").onclick = download;
$("#btnReset").onclick = () => $("#modal").hidden = false;
$("#mNo").onclick = () => $("#modal").hidden = true;
$("#mYes").onclick = () => { $("#modal").hidden = true; $$("input[type=file]").forEach(i => i.value = ""); init(); };
window.addEventListener("beforeunload", () => { S = null; pdfBlob = null; });
window.addEventListener("error", () => show("Terjadi kesalahan. Muat ulang halaman atau gunakan Chrome/Edge versi terbaru."));
init();
