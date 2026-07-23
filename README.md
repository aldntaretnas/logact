# 📋 LogAct — Personal Activity Tracker

A personal activity & productivity dashboard built with Next.js and Supabase. Track daily personal activities, manage a work logbook, write journal entries, and export reports to PDF — all secured with Google OAuth so each user only sees their own data.

---

## ✨ Features

| Feature | Description |
|---|---|
| **Aktivitas Pribadi** | Log and review personal daily activities with category, duration, and timer |
| **Logbook Kerja** | Record daily work activities with week number, results, and documentation links |
| **Todo & Reminders** | Create todos with scheduled time reminders and alarm sounds |
| **Journal** | Write daily journal/diary entries |
| **Calendar View** | Visualize activities across a monthly calendar |
| **Timesheet** | View activities grouped by date in a timesheet format |
| **Export PDF** | Export aktivitas harian or logbook kerja to PDF with bordered tables and clickable documentation links |
| **Google OAuth** | Per-user data isolation via Google login — no sign-up needed |

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org) (App Router)
- **Database & Auth:** [Supabase](https://supabase.com) (PostgreSQL + Google OAuth)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com)
- **PDF Export:** [jsPDF](https://github.com/parallax/jsPDF) + jspdf-autotable
- **Deploy:** [Vercel](https://vercel.com)

---

## 📂 Project Structure

```
logact/
├── app/
│   ├── activities/         # All personal activity log + detail pages
│   ├── calendar/           # Monthly calendar view
│   ├── export/             # PDF export (aktivitas harian & logbook kerja)
│   ├── journal/            # Journal entries
│   ├── login/              # Google OAuth login page
│   ├── timesheet/          # Timesheet view
│   ├── todo/               # Todo list with reminders & wishlist
│   ├── worklog/            # Work logbook — all entries with week filter
│   ├── layout.js           # Root layout
│   └── page.js             # Dashboard / home (tab: Aktivitas Pribadi & Kerja)
├── components/
│   ├── ActivityCard.js     # Personal activity card with edit/delete
│   ├── ActivityForm.js     # Personal activity form
│   ├── WorkLogCard.js      # Work logbook card with doc link
│   ├── WorkLogForm.js      # Work logbook form (auto week number)
│   ├── ExportPDF.js        # PDF generators for both report types
│   ├── Sidebar.js          # Navigation sidebar
│   └── ...
├── lib/
│   ├── supabase.js         # Supabase client
│   ├── auth.js             # Auth context
│   └── utils.js            # Helpers incl. getInternshipWeek()
├── supabase/
│   ├── migration_v7.sql    # RLS per-user for all tables
│   └── migration_v8.sql    # work_logs table + RLS
├── public/                 # Static assets
├── .env.local              # Environment variables (not committed)
├── package.json
└── README.md
```

---

## 🚀 Quick Start

**1. Clone the repository:**
```bash
git clone https://github.com/aldntaretnas/logact.git
cd logact
```

**2. Install dependencies:**
```bash
npm install
```

**3. Set up environment variables:**

Create a `.env.local` file in the project root:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**4. Run database migrations:**

Open Supabase Dashboard → SQL Editor, then run each file in order:
```
supabase/migration_v7.sql
supabase/migration_v8.sql
```

**5. Run the development server:**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |

---

## 🔐 Authentication

This app uses **Google OAuth via Supabase Auth**. Each user's data is fully isolated — you can only see your own activities, logbook, todos, and journal entries. No sign-up form needed; just click **Login with Google**.

---

## 📄 Export PDF

Two export types are available under the **Export** menu:

- **Aktivitas Harian** — table with date, activity title, category, duration, and notes
- **Logbook Kerja** — landscape table with No, Tanggal, Pekan Ke, Kegiatan, Hasil Kegiatan, and a clickable Dokumentasi link. Periode Kerja is shown from the first entry date to the print date.

---

## 📝 License

This project is for personal use. Feel free to fork and adapt it for your own activity tracking needs.
