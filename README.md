# Three Mister Image Transformation

Aplikasi web modern berbasis React dan Vite untuk transformasi foto artistik menggunakan Gemini AI.

---

## 🚀 Panduan Sinkronisasi & Deploy ke GitHub

> **Catatan Solusi Insufficient Permissions:**
> GitHub membatasi aplikasi pihak ketiga (seperti AI Studio GitHub App) untuk membuat atau mengubah file di dalam folder `.github/workflows/` demi alasan keamanan (kecuali izin *Workflows* diberikan secara khusus). 
> Template workflow telah dipindahkan ke `workflows-template/deploy.yml` agar sinkronisasi/push dari Google AI Studio ke GitHub berjalan **100% lancar tanpa error izin**.

### 1. Hubungkan & Push ke GitHub

Anda dapat langsung menggunakan fitur **Export to GitHub** atau **Push to GitHub** di Google AI Studio (di menu Settings / Export) tanpa kendala permission lagi.

Atau jika menggunakan git lokal di komputer Anda:

```bash
# Tambahkan remote repository GitHub Anda jika belum ada
git remote add origin https://github.com/<USERNAME-GITHUB-ANDA>/<NAMA-REPO>.git

# Push ke branch main
git push -u origin main
```

---

### ⚠️ Mengapa Muncul Halaman Kosong Putih (Blank White Page) di GitHub Pages?

Halaman putih kosong di GitHub Pages pada proyek React/Vite hampir selalu disebabkan oleh salah satu dari 2 hal berikut:

1. **GitHub Pages Menggunakan Pengaturan "Deploy from a branch" ke Branch `main` (Paling Sering Terjadi)**:
   - Jika pengaturan GitHub Pages Anda diatur ke **Source: Deploy from a branch** (Branch: `main` / `root`), GitHub Pages hanya menyajikan file mentah repositori, yaitu `index.html` yang merujuk ke `/src/main.tsx`.
   - Browser **tidak dapat mengeksekusi file TypeScript/JSX (`.tsx`)** secara langsung dan file belum dibundle. Akibatnya browser menampilkan halaman putih kosong!
   - **Solusi**: Di GitHub -> **Settings** -> **Pages**, ubah **Source** menjadi **GitHub Actions** (atau gunakan `npm run deploy` via branch `gh-pages`).

2. **Jalur Relative / Base Path**:
   - Jika website diakses tanpa garis miring penutup (`/`), aset `./assets/` bisa gagal dimuat (404). Kami telah menambahkan skrip auto-redirect di `index.html` dan konfigurasi base path dinamis di `vite.config.ts`.
   - Ditambahkan file `.nojekyll` di folder `public/` agar GitHub Pages tidak memfilter aset Vite.

---

### 2. Cara Deploy (Pilih Salah Satu)

#### Opsi A: Otomatis via GitHub Actions (Sangat Disarankan)

1. Buka repositori Anda di website **GitHub**.
2. Klik tombol **Add file** > **Create new file**.
3. Di kolom nama file, ketik:
   `.github/workflows/deploy.yml`
4. Salin (copy) seluruh isi file dari `workflows-template/deploy.yml` dan tempelkan (paste) ke editor GitHub.
5. Klik **Commit changes...** dan simpan ke branch `main`.
6. Di GitHub, buka **Settings** > **Pages** > pada bagian **Source**, pilih **GitHub Actions**.

#### Opsi B: Deploy Cepat via `gh-pages` Branch dari Terminal Lokal

Jika Anda mengkloning repo ke laptop/komputer Anda:
```bash
# Install dependencies
npm install

# Deploy otomatis hasil build ke branch gh-pages
npm run deploy
```
Lalu di GitHub **Settings** > **Pages**, pastikan **Source** adalah **Deploy from a branch** dan pilih branch **`gh-pages`** (folder `/ (root)`).

---

### 3. Konfigurasi GitHub Secrets (API Key Gemini)

Agar fitur transformasi gambar AI tetap berfungsi di GitHub Pages:

1. Buka repositori Anda di GitHub.
2. Masuk ke menu **Settings** > **Secrets and variables** > **Actions**.
3. Klik tombol **New repository secret**.
4. Isi data:
   - **Name**: `GEMINI_API_KEY`
   - **Secret**: Masukkan Google Gemini API Key Anda.
5. Klik **Add secret**.

> Kunci ini akan otomatis diinjeksi oleh GitHub Actions pada proses `npm run build` sebelum dideploy ke GitHub Pages.

---

### 3. Aktifkan GitHub Pages

1. Di repositori GitHub Anda, buka tab **Settings**.
2. Pada menu navigasi sebelah kiri, pilih **Pages** (di bawah bagian *Code and automation*).
3. Di bagian **Build and deployment** > **Source**, ubah pilihan dari *Deploy from a branch* menjadi:
   👉 **GitHub Actions**
4. Selesai! GitHub Actions workflow (`.github/workflows/deploy.yml`) akan otomatis menjalankan build dan menerbitkan website Anda.
5. URL website Anda akan muncul di bagian atas halaman GitHub Pages, contoh:
   `https://<username>.github.io/<nama-repo>/`

---

## 🛠️ Pengembangan Lokal (Local Development)

```bash
# Install dependencies
npm install

# Jalankan dev server
npm run dev

# Build untuk produksi
npm run build

# Preview build lokal
npm run preview
```
