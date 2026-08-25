# 🚀 IlmHub Saqla Bot — Production Version

> **IlmHub — Ilmlilar yetishib chiqadigan maskan !**  
> Zamonaviy, xavfsiz va yuqori tezlikdagi YouTube & YouTube Shorts video downloader tizimi.

---

## 📋 Mundarija (Table of Contents)

1. [Loyiha haqida (Overview)](#1-loyiha-haqida-overview)
2. [Arxitektura (Architecture)](#2-arxitektura-architecture)
3. [Asosiy imkoniyatlar (Features)](#3-asosiy-imkoniyatlar-features)
4. [Tizim talablari (Requirements)](#4-tizim-talablari-requirements)
5. [yt-dlp va FFmpeg o'rnatish](#5-yt-dlp-va-ffmpeg-ornatish)
   - [Windows (PowerShell)](#windows-powershell)
   - [Linux (Ubuntu/Debian)](#linux-ubuntudebian)
   - [macOS (Homebrew)](#macos-homebrew)
6. [Mahalliy ishga tushirish (Local Development)](#6-mahalliy-ishga-tushirish-local-development)
7. [Muhit o'zgaruvchilari (Environment Variables)](#7-muhit-ozgaruvchilari-environment-variables)
8. [Vercel orqali Frontend Deploy qilish](#8-vercel-orqali-frontend-deploy-qilish)
9. [Backend Serverni Deploy qilish (VPS / Docker / Railway)](#9-backend-serverni-deploy-qilish)
10. [API Hujjatlari (Endpoints)](#10-api-hujjatlari-endpoints)
11. [Xavfsizlik choralari (Security)](#11-xavfsizlik-choralari-security)
12. [Muammolarni bartaraf etish (Troubleshooting)](#12-muammolarni-bartaraf-etish-troubleshooting)

---

## 1. Loyiha haqida (Overview)

**IlmHub Saqla Bot** — bu YouTube va YouTube Shorts videolarini 4K, 2K, 1080p Full HD, 720p HD va faqat audio (MP3) formatlarida haqiqiy `yt-dlp` va `FFmpeg` dvigateli orqali yuklab olish imkonini beruvchi to'liq production tizimidir.

Loyiha 4 ta tilda (🇺🇿 O‘zbek, 🇷🇺 Русский, 🇬🇧 English, 🟦 Ўзбекча) va Yorug‘/Qorong‘i (Light/Dark) rejimlarida to‘liq ishlaydi.

---

## 2. Arxitektura (Architecture)

```text
                         INTERNET
                            │
                            ▼
                  ┌─────────────────────┐
                  │       VERCEL        │
                  │                     │
                  │ React 19+ TypeScript│
                  │ Vite + Tailwind CSS │
                  │                     │
                  │ IlmHub Frontend     │
                  └──────────┬──────────┘
                             │
                             │ HTTPS REST API
                             ▼
                  ┌─────────────────────┐
                  │   DOWNLOAD SERVER   │
                  │                     │
                  │ Node.js / Express   │
                  │ TypeScript          │
                  │ yt-dlp binary       │
                  │ FFmpeg engine       │
                  │                     │
                  │ Downloader Backend  │
                  └──────────┬──────────┘
                             │
                             ▼
                       FILE STORAGE
                  (Streamed to Browser)
```

> ⚠️ **Muhim Eslatma:** `yt-dlp` va `FFmpeg` jarayonlari Vercel Serverless funksiyalarida (timeout va binary cheklovlari sababli) ishlamaydi. Shu sababli Frontend Vercel'da, Backend esa doimiy ishlovchi Node.js serverida (VPS, Railway, Render, Fly.io yoki Docker) ishlaydi.

---

## 3. Asosiy imkoniyatlar (Features)

- ✅ **Haqiqiy YouTube & Shorts tahlili:** Haqiqiy formatlar, davomiyligi, ko‘rishlar soni va sifat variantlari.
- ✅ **Haqiqiy progress va tezlik:** yt-dlp dan olingan aniq foiz (%), tezlik (MB/s), qolgan vaqt (ETA) va yuklangan hajm.
- ✅ **FFmpeg audio+video birlashtirish:** 1080p/2K/4K DASH oqimlari avtomatik tarzda MP4 formatiga birlashtiriladi.
- ✅ **Haqiqiy bekor qilish (Cancel):** Jarayonni to‘xtatadi va vaqtinchalik qoldiq fayllarni tozalaydi.
- ✅ **Playlist himoyasi:** Tasodifiy ko‘p yuklamalarni oldini oladi.
- ✅ **4 tilda to‘liq lokalizatsiya:** O‘zbek (lotin), Rus, Ingliz, O‘zbek (kirill).
- ✅ **Light / Dark tema:** Tizim yoki foydalanuvchi tanloviga qarab saqlanadi.
- ✅ **Mahalliy tarix:** Oxirgi 50 ta yuklangan videolarni saqlash va tozalash imkoniyati.
- ✅ **Xavfsiz fayl oqimi (Streaming):** RAM xotirasini to‘ldirmasdan to‘g‘ridan-to‘g‘ri brauzerga uzatish.
- ✅ **Avtomatik tozalash:** 24 soatdan oshgan vaqtinchalik fayllar avtomatik o‘chiriladi.

---

## 4. Tizim talablari (Requirements)

- **Node.js:** `v18.0.0` yoki undan yuqori
- **npm** yoki **bun** / **yarn**
- **yt-dlp:** Eng so‘nggi versiya
- **FFmpeg:** v4.4+ yoki v6+

---

## 5. yt-dlp va FFmpeg o'rnatish

### Windows (PowerShell)

1. **yt-dlp o'rnatish:**
```powershell
# winget yordamida:
winget install yt-dlp

# Yoki to'g'ridan-to'g'ri yuklab olish:
Invoke-WebRequest -Uri "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe" -OutFile "C:\Windows\System32\yt-dlp.exe"

# Tekshirish:
yt-dlp --version
```

2. **FFmpeg o'rnatish:**
```powershell
# winget yordamida:
winget install Gyan.FFmpeg

# Tekshirish:
ffmpeg -version
```

---

### Linux (Ubuntu/Debian)

```bash
# FFmpeg o'rnatish:
sudo apt update && sudo apt install -y ffmpeg curl

# yt-dlp o'rnatish:
sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp
sudo chmod a+rx /usr/local/bin/yt-dlp

# Tekshirish:
yt-dlp --version
ffmpeg -version
```

---

### macOS (Homebrew)

```bash
brew install yt-dlp ffmpeg
```

---

## 6. Mahalliy ishga tushirish (Local Development)

Loyihani to'liq yuklab oling va quyidagi buyruqlarni bajaring:

```bash
# 1. Bog'liqliklarni o'rnatish
npm install

# 2. To'liq serverni (Backend + Frontend) ishga tushirish
npm run dev
```

Brauzerda oching: `http://localhost:8080`

---

## 7. Muhit o'zgaruvchilari (Environment Variables)

`.env.example` faylidan `.env` nusxa oling:

### Frontend uchun (`.env`):
```env
# Agar Frontend Vercel'da bo'lsa, Backend server manzili:
VITE_API_URL=https://your-backend-api.com
```

### Backend uchun (`.env`):
```env
PORT=8080
NODE_ENV=production
FRONTEND_URL=https://your-vercel-app.vercel.app
MAX_CONCURRENT_DOWNLOADS=2
DOWNLOAD_TIMEOUT_MS=1800000
DOWNLOAD_RETENTION_HOURS=24
```

---

## 8. Vercel orqali Frontend Deploy qilish

1. Loyihani **GitHub** repozitoriysiga yuklang.
2. [Vercel Dashboard](https://vercel.com) ga kiring va **Add New Project** tugmasini bosing.
3. Repozitoriyani import qiling.
4. **Project Settings** da quyidagilarni sozlang:
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build:client` (yoki `vite build`)
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
5. **Environment Variables** bo'limiga qo'shing:
   - `VITE_API_URL` = `https://your-backend-server.com`
6. **Deploy** tugmasini bosing.

`vercel.json` fayli allaqachon sozlangan bo'lib, SPA sahifa yangilanganda 404 xatolik bermaydi.

---

## 9. Backend Serverni Deploy qilish (Google Cloud Run / VPS / Docker)

Backend serverni persistent yoki containerized muhitda (Google Cloud Run, VPS, Railway, Render, Fly.io) ishga tushirish tavsiya etiladi.

### Google Cloud Run orqali deploy qilish:

Loyihada ishlab chiqilgan `Dockerfile` Google Cloud Run talablariga to'liq javob beradi:

```bash
# 1. Google Cloud loyihasini tanlang
gcloud config set project YOUR_PROJECT_ID

# 2. Container image quring va Cloud Run ga yuboring
gcloud run deploy ilmhub-backend \
  --source . \
  --platform managed \
  --region asia-southeast1 \
  --allow-unauthenticated \
   --port 8080 \
  --memory 1Gi \
  --cpu 1 \
   --set-env-vars NODE_ENV=production,MAX_CONCURRENT_DOWNLOADS=2,FRONTEND_URL=https://your-frontend.vercel.app
```

### VPS (Ubuntu 22.04 / 24.04) orqali:
```bash
git clone <repo_url> ilmhub-saqla
cd ilmhub-saqla
sudo apt update && sudo apt install -y ffmpeg python3 curl
sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp && sudo chmod a+rx /usr/local/bin/yt-dlp
npm install
npm run build:server
pm2 start dist/server.cjs --name "ilmhub-backend"
```

### Docker orqali:
```bash
docker build -t ilmhub-saqla-backend .
docker run -p 8080:8080 -e NODE_ENV=production ilmhub-saqla-backend
```

---

## 10. API Hujjatlari (Endpoints)

| Metod | Yo‘l | Tavsif |
|---|---|---|
| `GET` | `/api/health` | Server holati, yt-dlp va FFmpeg tekshiruvi |
| `POST` | `/api/analyze` | YouTube / Shorts havolasini tahlil qilish |
| `POST` | `/api/download` | Yangi yuklash topshirig'ini navbatga qo'yish |
| `GET` | `/api/download/:id/progress` | Haqiqiy vaqtli progress va tezlik ma'lumotlari |
| `GET` | `/api/download/:id/status` | Vazifa holati |
| `POST` | `/api/download/:id/cancel` | Yuklashni to‘xtatish va tozalash |
| `GET` | `/api/download/:id/file` | Tayyor faylni oqimli yuklab olish |

---

## 11. Xavfsizlik choralari (Security)

- **Command Injection Prevention:** Barcha `yt-dlp` chaqiruvlari shell orqali emas, xavfsiz argument massivlari bilan `spawn()` yordamida bajariladi.
- **Path Traversal Protection:** Fayl yuklab olishda faqat UUID bilan bog'langan fayllar tekshirilib uzatiladi (`../` xurujlari bloklangan).
- **Concurrency Limiting:** Server resurslarini ortiqcha yuklamaslik uchun bir vaqtning o'zida maksimal 2 ta yuklash bajariladi, qolganlari navbatga turadi.
- **Auto Cleanup:** 24 soatdan oshgan vaqtinchalik fayllar xotiradan tozalanadi.

---

## 12. Muammolarni bartaraf etish (Troubleshooting)

- **`yt-dlp: not found`**: `yt-dlp` tizim PATH da mavjudligini tekshiring yoki `.env` da `YTDLP_PATH` ni ko'rsating.
- **`FFmpeg missing`**: FFmpeg o'rnatilmagan bo'lsa, audio va video birlashtirilmaydi. FFmpeg o'rnating.
- **CORS Error**: Backend `.env` faylida `FRONTEND_URL` ga Frontend domenini to'g'ri kiriting.

---

## 📜 Litsenziya va Huquqiy eslatma

*Foydalanuvchi faqat yuklab olishga haqli bo‘lgan kontentdan foydalanishi kerak.*

© 2026 IlmHub Saqla Bot. Barcha huquqlar himoyalangan.
