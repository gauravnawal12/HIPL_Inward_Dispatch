# 🏭 HELIX INDUSTRIES — MATERIAL REGISTER
## Complete Deployment Guide

---

## 📁 Files in this Package

| File | Purpose |
|------|---------|
| `index.html` | The entire application — all code in one file |
| `sw.js` | Service Worker — makes app work offline & installable |
| `manifest.json` | Tells browser the app can be installed on phone |
| `icon-192.png` | App icon (shown on home screen, 192×192 px) |
| `icon-512.png` | App icon (used for splash screen, 512×512 px) |
| `DEPLOY.md` | This guide |

---

## 🖥️ Option A — Use as a Standalone File (Simplest)

**No internet, no server, no setup needed.**

1. Copy `index.html` to any computer or phone
2. Double-click to open in any browser
3. Data is saved in the browser automatically

> ⚠️ In this mode, the PWA install feature and offline caching won't work.
> For those features, you need to host it on a web server (Option B or C below).

---

## 🌐 Option B — Deploy on GitHub Pages (FREE, Recommended)

GitHub Pages gives you a free HTTPS web address. HTTPS is required for the
PWA install feature and service worker to work.

### Step-by-Step:

**1. Create a GitHub account**
- Go to [github.com](https://github.com) → click "Sign up" (it's free)

**2. Create a new repository**
- Click the **+** button → "New repository"
- Name it: `helix-register` (or anything you like)
- Make it **Public** (required for free GitHub Pages)
- Click **Create repository**

**3. Upload the files**
- On the repository page, click **"uploading an existing file"**
- Drag and drop ALL 6 files from this folder
- Click **Commit changes**

**4. Enable GitHub Pages**
- Go to **Settings** (tab at the top of the repository)
- Scroll down to **Pages** in the left sidebar
- Under **Source**, select **"Deploy from a branch"**
- Choose **main** branch → **/ (root)** folder
- Click **Save**

**5. Your app is live!**
- After ~1 minute, your URL will be:
  `https://YOUR-USERNAME.github.io/helix-register/`
- Open this URL on your phone — you'll see an "Install" prompt

---

## 🌐 Option C — Deploy on Netlify (FREE, Drag-and-Drop)

Even simpler than GitHub — drag a folder and get a URL in 30 seconds.

**1.** Go to [netlify.com](https://netlify.com) → Sign up free

**2.** On the dashboard, you'll see a big box that says
   **"Drag and drop your site folder here"**

**3.** Drag the entire `helix-final` folder into that box

**4.** Netlify gives you a URL like `https://wonderful-name-abc123.netlify.app`

**5.** (Optional) Go to **Site settings → Change site name** to get a nicer URL

---

## 📱 Installing the App on Phones

### Android (Chrome browser)
1. Open the app URL in **Chrome**
2. An **"Install Helix Register"** banner appears at the bottom
3. Tap **Install** → Tap **Install** again in the dialog
4. The app icon appears on your home screen
5. Tap it — it opens full-screen, like a native app

### iPhone (Safari browser)
Safari doesn't support the automatic install banner, but you can still add it:
1. Open the app URL in **Safari** (must be Safari, not Chrome on iPhone)
2. Tap the **Share button** (the box with an arrow pointing up, at the bottom)
3. Scroll down and tap **"Add to Home Screen"**
4. Change the name if you want → tap **Add**
5. The icon appears on your home screen

---

## ⚙️ Google Sheets Setup (One-Time)

This makes every Save in the app automatically send data to your Google Sheet.

### Step 1: Prepare your Google Sheet
1. Open [sheets.google.com](https://sheets.google.com)
2. Open your existing sheet (ID: `1C4heyLELF7CJsFqC-c53SJwcpIxQPBZm6EYdjBl-cdg`)
   — or create a new sheet and update the ID in the code

### Step 2: Add the Apps Script
1. In your Google Sheet, click **Extensions → Apps Script**
2. A code editor opens. **Delete all existing code** in the editor
3. In the app, tap **⚙ Sheets** (top right)
4. Expand **"Show Apps Script code to copy"**
5. Click **COPY** to copy the code
6. Paste it into the Google Apps Script editor
7. Click the **Save** button (💾 icon) in the editor toolbar

### Step 3: Deploy as Web App
1. In the Apps Script editor, click **Deploy → New deployment**
2. Click the gear icon ⚙ next to "Select type" → choose **Web app**
3. Set the following:
   - **Description:** Helix Register Sync (or anything)
   - **Execute as:** Me (your Google account)
   - **Who has access:** Anyone
4. Click **Deploy**
5. Google will ask you to authorize — click through and allow

### Step 4: Copy the Web App URL
1. After deploying, you'll see a **"Web app URL"** — it looks like:
   `https://script.google.com/macros/s/AKfyc.../exec`
2. Copy this entire URL

### Step 5: Connect the App to Google Sheets
1. Open the Helix Register app
2. Tap **⚙ Sheets** in the header
3. Paste the URL into the input box
4. Tap **Save URL**
5. Tap **Test** — you should see "Connection successful!"

### What happens after this?
Every time you tap Save in the app:
- Data is saved to the phone first (instant, works offline)
- Then sent to Google Sheets automatically
- The following tabs are created/updated in your sheet:
  - **Inward** — all raw material arrivals
  - **Outward** — all dispatch records combined
  - **Dispatch - Mukesh** — Mukesh's dispatches only
  - **Dispatch - Subhash** — Subhash's dispatches only
  - **Dispatch - Anandaram** — Anandaram's dispatches only

---

## 🔄 How to Update the App Later

If you want to change something (add a new vehicle, supplier, design, etc.):

1. Open `index.html` in any text editor (Notepad, TextEdit, VS Code, etc.)
2. Find the comment `SECTION 1 — MASTER DATA` near the top of the JavaScript
3. Edit the arrays — e.g. add a new vehicle to `SV`, a new supplier to `SM`, etc.
4. Open `sw.js` in a text editor
5. Find `var CACHE_NAME = "helix-v1";` and change it to `"helix-v2"` (or v3, v4…)
   — this forces everyone's phones to download the updated files
6. Re-upload both files to GitHub Pages or Netlify
7. On phones, close and reopen the app — it will pick up the changes automatically

---

## 🔒 Data Privacy & Security

- All form data is saved **locally on the device** in browser localStorage
- Data is only sent to Google Sheets if you configure the URL (Step 5 above)
- The Google Apps Script runs under **your Google account** — no third party sees the data
- The app does not connect to any other external servers
- Uninstalling the app removes all locally stored data

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| App doesn't install on iPhone | Use Safari, not Chrome. Tap Share → Add to Home Screen |
| "Sync Failed" shown after saving | Check internet connection. Data is still saved locally. |
| Google Sheets not updating | Re-test the URL. Try re-deploying the Apps Script. |
| App looks outdated after update | Close completely and reopen. On phone: long-press the icon → close |
| Lost data | Data is in browser localStorage. Don't clear browser data/cache. |
| Install banner not showing on Android | Must be on HTTPS. Must have opened the app at least twice. |
