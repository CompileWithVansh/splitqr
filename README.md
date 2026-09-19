# SplitQR — Smart Zero-MDR UPI Payment Splitter (PWA)

[![PWA Ready](https://img.shields.io/badge/PWA-Installable-blue.svg)](https://web.dev/progressive-web-apps/)
[![Zero MDR](https://img.shields.io/badge/UPI-Zero%20MDR%20Compliant-emerald.svg)](https://www.npci.org.in/)
[![Zero Backend](https://img.shields.io/badge/Architecture-100%25%20Serverless%20PWA-cyan.svg)](https://vitejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**SplitQR** is an installable, touch-first POS and utility Progressive Web App (PWA) created for merchants, cafes, food trucks, and personal store counters across India.

---

## 💡 The Problem it Solves
In India, NPCI introduced Merchant Discount Rates (MDR) / interchange fees on PPI wallet transactions above ₹2,000, and large transactions often face higher scrutiny or network failure rates. 

When a cashier enters an amount above the threshold (default **₹1,999**), **SplitQR automatically divides the total into compliant sub-₹2,000 dynamic NPCI UPI QR codes** (e.g. ₹2,500 ➔ ₹1,999 + ₹501; ₹6,000 ➔ 3 × ₹1,999 + ₹3, or balanced 4 × ₹1,500), while mathematically guaranteeing that the total sum strictly equals the bill amount.

---

## 🚀 Key Features

- 🏪 **Multi-Store & Multi-User Support**:
  - Add and manage multiple store profiles on the same device (e.g. *"Main Counter"*, *"Chaat Stall"*, *"Juice Bar"*).
  - 1-click store switcher from the top header.
  - Isolated transaction history and custom split caps per store.
  - ⚡ **"Try Instant Demo" mode** for first-time visitors to test with zero friction.
  - 📥 **Backup & Export / Import**: 1-click JSON backup to export or transfer stores and history to another phone or tablet.
- 📱 **100% Serverless & Free Forever**:
  - **Zero API keys needed**: Generates official NPCI UPI deep links (`upi://pay?pa=...`) that scan in Google Pay, PhonePe, Paytm, and BHIM.
  - **Zero database maintenance**: Every merchant's data is stored securely on their device in LocalStorage/IndexedDB.
  - **100% Offline Capability**: Functions seamlessly in basements and markets with zero network connectivity via Service Workers.
- 🔢 **High-Speed ATM Touchpad**: Large tactile buttons with quick-add chips (`+100`, `+500`, `+1k`, `+2k`, `+5k`), instant 1999 cap shortcut, and audio feedback synthesized via the Web Audio API.
- ⚡ **Real-Time Split Preview**: Displays instant preview pills (e.g. `⚡ Split into 3 QR Codes • ₹1,999 + ₹1,999 + ₹3 • 0% MDR Compliant`).
- 🗂️ **Dual Mobile & Desktop Presentation**:
  - **Mobile**: Touch-swipeable carousel with dots indicator, slide counter (`Part 1 of 3`), and Next/Prev controls.
  - **Desktop**: Responsive side-by-side card grid.
- 👁️ **Focus Mode (1-by-1)**: Toggle to display only one QR code at a time to prevent customers from scanning the wrong card.
- 🙈 **Hide Paid Toggle**: Automatically collapses or hides settled QR codes, keeping the screen clean for pending transactions.
- ✅ **Individual "Mark as Paid" Toggles**: Each QR card features its own paid toggle, glowing green overlay, copy UPI link, WhatsApp bill sharing, and sound chimes.
- 🎚️ **Two Splitting Strategies**:
  - **Greedy Max (Default)**: Packs the maximum allowed chunks of ₹1,999 (e.g. ₹6,000 ➔ ₹1,999 × 3 + ₹3).
  - **Balanced Equal Split**: Generates equal round numbers under the limit (e.g. ₹6,000 ➔ 4 × ₹1,500).
- 🔄 **Multi-Account UPI Routing**: Optionally rotate split chunks across two separate UPI accounts (Primary & Secondary) to balance daily bank transaction volume.
- 🔒 **Optional Cashier PIN Lock**: Secure POS terminal with a 4-digit numeric PIN.

---

## 💻 Getting Started (Local Development)

### Prerequisites
- Node.js v18 or higher
- npm v9 or higher

### Installation & Run
```bash
cd splitqr
npm install
npm run dev
```

Visit **http://localhost:5174** in your browser.

---

## 🚀 Public Deployment ($0 Forever)

Because SplitQR is 100% serverless, you can deploy it for free on any static hosting platform in 1 minute:

### Deploy to Vercel
```bash
npm install -g vercel
vercel
```

### Deploy to Netlify
Drag and drop the `dist/` folder into [Netlify Drop](https://app.netlify.com/drop), or connect your GitHub repo.

### Deploy to GitHub Pages or Render
Set build command: `npm run build`  
Set publish directory: `dist`

---

## 📄 License
MIT License
