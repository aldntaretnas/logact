# 📋 LogActivity - Personal Activity Tracker

A personal activity & productivity dashboard built with Next.js and Supabase. Track your daily activities, manage todos with reminders, log journal entries, and export timesheets - all secured with Google OAuth so each user only sees their own data.

---

## ✨ Features

| Feature | Description |
|---|---|
| **Activity Log** | Record and review daily work activities with timestamps |
| **Todo & Reminders** | Create todos with scheduled reminders and alarm sounds |
| **Journal** | Write daily journal/diary entries |
| **Calendar View** | Visualize activities across a monthly calendar |
| **Timesheet** | View activities grouped by date in a timesheet format |
| **Export** | Export your activity data to PDF |
| **Google OAuth** | Per-user data isolation via Google login |

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
│   ├── activities/         # Activity log + detail pages
│   ├── calendar/           # Calendar view
│   ├── export/             # PDF export
│   ├── journal/            # Journal entries
│   ├── login/              # Google OAuth login page
│   ├── timesheet/          # Timesheet view
│   ├── todo/               # Todo list with reminders
│   ├── layout.js           # Root layout
│   └── page.js             # Dashboard / home
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

**4. Run the development server:**
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

This app uses **Google OAuth via Supabase Auth**. Each user's data is fully isolated - you can only see your own activities, todos, and journal entries. No sign-up form needed; just click **Login with Google**.

---

## 📝 License

This project is for personal use. Feel free to fork and adapt it for your own activity tracking needs.
