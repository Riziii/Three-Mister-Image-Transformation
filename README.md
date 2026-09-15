# Three Mister Image Transformation

Aplikasi web studio transformasi gambar artistik menggunakan AI.

## Panduan Deploy ke GitHub Pages (100% Berhasil)

Aplikasi ini menggunakan **Vite + React + TypeScript**. Untuk menampilkan aplikasi di GitHub Pages, GitHub Actions harus menjalankan proses build (`npm run build`) dan menyajikan folder `./dist`.

### Langkah-langkah di GitHub.com:

1. Buka repositori Anda di [GitHub.com](https://github.com/).
2. Masuk ke **Settings** ➔ **Pages**.
3. Di bagian **Build and deployment**, ubah **Source** menjadi **GitHub Actions**.
4. Buka file `.github/workflows/static.yml` (atau buat file baru `.github/workflows/deploy.yml`).
5. Ganti seluruh isinya dengan konfigurasi berikut:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: ["main", "master"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build-and-deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: npm install

      - name: Build Vite application
        env:
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
        run: npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v5

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v5
```

6. Klik tombol **Commit changes...**.
7. Buka tab **Actions** di GitHub untuk melihat progres kompilasi otomatis. Setelah tanda centang hijau muncul, web Anda sudah live dan dapat diakses!
