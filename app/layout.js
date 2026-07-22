import { Josefin_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const josefinSans = Josefin_Sans({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Log Activity - Daily Recap",
  description: "Personal daily activity logger",
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${josefinSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-slate-50" suppressHydrationWarning>
        <Sidebar />
        <main className="md:ml-64 min-h-screen">
          <div className="pt-16 px-4 pb-8 md:pt-8 md:px-8 md:pb-8 max-w-4xl mx-auto md:mx-0">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
