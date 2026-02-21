# 🏭 Helix Factory Material Register — PWA

A **Progressive Web App** that works on mobile, tablet, and desktop.  
Can be **installed on Android or iPhone home screen** like a native app.  
Works **offline** — data saved locally, synced to Google Sheets when online.

---

## 📁 Files in this folder

| File | What it does |
|------|-------------|
| `index.html` | The main app (open this in a browser) |
| `manifest.json` | Tells the browser the app is installable |
| `sw.js` | Service Worker — enables offline support |
| `icon-192.png` | App icon (used on Android home screen) |
| `icon-512.png` | App icon (larger, used for splash screen) |

---

## 🚀 How to deploy (make it work as a real PWA)

**A PWA must be served over HTTPS** to work properly (service workers require it).  
You cannot just open `index.html` from your computer — it needs a web server.

### Option 1: GitHub Pages (FREE, easiest)

1. Create a free account at [github.com](https://github.com)
2. Create a new repository (e.g. `helix-register`)
3. Upload all files from this folder to the repository
4. Go to **Settings → Pages → Source → Deploy from main branch**
5. Your app will be live at `https://yourusername.github.io/helix-register/`

### Option 2: Netlify (FREE, drag-and-drop)

1. Go to [netlify.com](https://netlify.com) and sign up free
2. Drag-and-drop the entire `helix-pwa` folder onto the Netlify dashboard
3. Your app gets a URL like `https://your-app-name.netlify.app`

### Option 3: Any web hosting

Upload all files to your hosting's `public_html` folder via FTP.  
Must be HTTPS (most modern hosts include SSL for free).

---

## 📱 Installing on Android (Chrome)

1. Open the app URL in Chrome on Android
2. A banner will appear: **"Install Helix Register"** → tap **Install**
3. Or: tap the 3-dot menu → **Add to Home Screen**
4. The app icon appears on your home screen — tap it to open like any app

## 📱 Installing on iPhone (Safari)

1. Open the app URL in Safari on iPhone
2. Tap the **Share button** (box with arrow pointing up)
3. Tap **Add to Home Screen**
4. Tap **Add** in the top right
5. App icon appears on your home screen

---

## ⚙️ Google Sheets Setup (for cloud sync)

1. Open your Google Sheet
2. Click **Extensions → Apps Script**
3. Delete all existing code
4. Copy the Apps Script code shown inside the app (⚙ Google Sheets button)
5. Paste it and click **Save (💾)**
6. Click **Deploy → New Deployment → Web App**
7. Set:
   - **Execute as:** Me
   - **Who has access:** Anyone
8. Click **Deploy**, copy the **Web App URL**
9. In the app, tap **⚙ Google Sheets → paste URL → Save URL**

After this, every Save in the app will:
- Save locally (always, even offline)
- Sync to Google Sheets automatically (when online)
- Create separate tabs: **Inward**, **Outward**, **Dispatch - Mukesh**, **Dispatch - Subhash**, **Dispatch - Anandaram**

---

## 🔄 Offline behaviour

| Feature | Online | Offline |
|---------|--------|---------|
| Fill forms | ✅ | ✅ |
| Save entries | ✅ | ✅ (stored on device) |
| View records | ✅ | ✅ |
| Export Excel | ✅ | ✅ (if SheetJS was cached) |
| Sync to Google Sheets | ✅ | ❌ (queued for next connection) |

When you come back online, new entries will be synced to Sheets on the next save.

---

## 🔧 Updating the app

To update (e.g. change dropdown values, add vehicles):
1. Edit `index.html` — find the `SECTION 1 — MASTER DATA` comment
2. Update the arrays there
3. Open `sw.js`, change `"helix-register-v1"` to `"helix-register-v2"` (this forces the new files to be cached)
4. Re-upload all files to your host
