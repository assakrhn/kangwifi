# Praktik Konfigurasi SSID pada ONT (LKPD)

Website statis (HTML, CSS, JavaScript). Tanpa backend, database, atau login. Data hanya ada di memori browser selama halaman terbuka; password ONT tidak pernah masuk ke PDF atau disimpan.

## Menjalankan lokal
Buka `index.html` di browser, atau jalankan `python -m http.server 8000` lalu buka http://localhost:8000. Koneksi internet dibutuhkan untuk memuat jsPDF dari CDN.

## Upload ke GitHub
1. Buat repository baru di github.com (mis. `ont-ssid-practice`).
2. Klik **Add file > Upload files**, seret seluruh isi folder ini (`index.html`, `style.css`, `script.js`, `README.md`, folder `assets`), lalu **Commit changes**.

## Aktifkan GitHub Pages
**Settings > Pages > Source: Deploy from a branch > Branch: main, folder /(root) > Save.** Tunggu 1–2 menit; link akan muncul di halaman yang sama. Bagikan link itu ke siswa.

## Konfigurasi (bagian atas `script.js`)
```js
const CONFIG = {
  schoolName: "SMK Telkom Sandhy Putra Jakarta", // nama sekolah
  practiceTitle: "Praktik Konfigurasi SSID pada ONT",
  ssidSuffix: "Bahagia",       // SSID = [nama depan/panggilan] + suffix
  ssidPassword: "yaiyalah123", // password SSID baru
  tutorialUrl: "https://smktelkomjakarta.my.canva.site/kangwifi", // link tutorial di halaman Home
  submissionUrl: "https://drive.google.com/drive/folders/..."     // link pengumpulan tugas
};
```
- **Ganti nama sekolah:** ubah `schoolName` (juga tampil di footer PDF).
- **Ganti logo:** timpa `assets/logo.png` dengan logo sekolah (nama file sama). Jika file tidak ada, logo disembunyikan.
- **Ganti URL pengumpulan:** isi `submissionUrl`. Jika kosong, tombol Upload Tugas nonaktif.
- **Ganti password SSID:** ubah `ssidPassword`.

## Gambar contoh
Letakkan lima gambar contoh di folder `assets/` dengan nama persis (huruf kecil semua):
`contohont.png`, `contohssid.png`, `contohssidberhasil.png`, `contohpon.png`, `speedtest.png`.
Gambar tampil sebelum tiap kolom upload. Jika file belum ada, bagian contoh otomatis disembunyikan.
