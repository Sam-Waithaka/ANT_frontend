# 📖 52-Week Bible Reading Plan (React + TypeScript)

A beautifully designed, fully client-side React application that generates a **52-week Bible reading plan** and allows users to **download the entire schedule as a CSV file** (Excel-compatible).

Built with **React**, **TypeScript (TSX)**, **Vite**, and **Tailwind CSS v4**, this project focuses on clarity, simplicity, and a great reading experience — including **dark mode support**.

---

## ✨ Features

- 📅 **52-week structured reading plan**
- 📘 **Old Testament + New Testament readings per day**
- 🗓 **5 reading days per week**
- 🌗 **Light / Dark mode toggle**
- 📥 **One-click CSV export (Excel-ready)**
- 📊 **Scrollable full-year table with sticky headers**
- ⚡ **Fast build and dev experience using Vite**
- 🧠 **Fully client-side (no backend required)**

---

## 🧱 Tech Stack

| Technology | Purpose |
|---------|--------|
| **React** | UI rendering |
| **TypeScript (TSX)** | Type-safe components |
| **Vite** | Lightning-fast development & builds |
| **Tailwind CSS v4** | Utility-first styling |
| **lucide-react** | Icons |
| **CSV + Blob API** | File generation & download |

---

## 📸 UI Preview

Clean layout, accessible typography, and smooth transitions  
Optimized for both light and dark reading environments

*(Add screenshots here if deploying or publishing)*

---

## 🚀 Getting Started

### 1️⃣ Prerequisites

- **Node.js** (v18+ recommended)
- **npm**

Verify installation:

```
node -v
npm -v
```

---

### 2️⃣ Clone the Repository

```
git clone https://github.com/your-username/bible-reading-plan.git
cd bible-reading-plan
```

---

### 3️⃣ Install Dependencies

```
npm install
```

---

### 4️⃣ Run the Development Server

```
npm run dev
```

Open your browser at:

```
http://localhost:5173
```

---

## 🗂 Project Structure

```
src/
├── BibleReadingExcel.tsx   # Main reading plan + CSV logic
├── App.tsx                 # App entry component
├── main.tsx                # React root
├── index.css               # Tailwind directives
└── assets/
```

---

## 📥 CSV Export Details

- Generates a **UTF-8 encoded CSV**
- Compatible with **Microsoft Excel**, **Google Sheets**, and **LibreOffice**
- Each row represents:
  - Week number
  - Day 1 → Day 5 readings
- Proper escaping for commas, quotes, and line breaks

---

## 🌗 Dark Mode

- Toggle available in the UI
- Fully theme-aware styling
- Smooth color transitions
- No external libraries required

*(Persistence via `localStorage` can be added later)*

---

## 🎯 Design Goals

- ✔️ Zero backend
- ✔️ Zero external APIs
- ✔️ Instant file generation
- ✔️ Easy to read & extend
- ✔️ Beginner-friendly, production-ready structure

---

## 🔮 Future Enhancements

- 💾 Persist dark mode preference
- 📊 Export to `.xlsx` format
- 📱 PWA support
- 🧩 Component modularization
- 🔍 Search / filter readings
- 📆 Daily reading reminders

---

## 🧠 Learning Highlights

This project demonstrates:

- Modern React + TypeScript patterns
- Client-side file generation
- Tailwind CSS v4 without PostCSS
- Practical UI state management
- Clean project setup with Vite

---

## 📜 License

This project is open-source and available under the **MIT License**.

---

## 🙏 Acknowledgements

Inspired by structured Bible reading plans designed to encourage consistent daily study and reflection.

---

## ✍️ Author

**Samuel Waithaka**  
Full-Stack Developer | React | TypeScript | 

---

> “Your word is a lamp to my feet and a light to my path.” — Psalm 119:105
