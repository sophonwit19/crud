import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { auth } from "@/app/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ระบบจัดการข้อมูล",
  description: "ระบบจัดการข้อมูลนักศึกษาและสิทธิ์การใช้งาน",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ดึงข้อมูลการเข้าสู่ระบบของผู้ใช้งาน
  const session = await auth();

  return (
    <html
      lang="th"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="bg-gray-100 min-h-screen text-gray-900 flex flex-col font-sans">
        {/* ==================== แถบ Navbar บนสุด ==================== */}
        <nav className="bg-white shadow-md border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              
              {/* โลโก้ และ เมนูฝั่งซ้าย */}
              <div className="flex items-center space-x-8">
                <Link href="/" className="text-xl font-bold text-blue-600 hover:text-blue-700">
                  🎓 ระบบจัดการข้อมูล
                </Link>

                {/* เมนูนำทาง (แสดงเมื่อล็อกอินแล้ว) */}
                {session && (
                  <div className="flex space-x-4">
                    <Link
                      href="/students"
                      className="text-gray-700 hover:text-blue-600 font-medium px-3 py-2 rounded-md hover:bg-gray-50 transition"
                    >
                      จัดการนักศึกษา
                    </Link>

                    {/* เมนู Admin (แสดงเฉพาะสิทธิ์ ADMIN) */}
                    {session.user?.role === "ADMIN" && (
                      <Link
                        href="/admin"
                        className="text-gray-700 hover:text-blue-600 font-medium px-3 py-2 rounded-md hover:bg-gray-50 transition"
                      >
                        Admin Dashboard
                      </Link>
                    )}
                  </div>
                )}
              </div>

              {/* ฝั่งขวา: แสดงข้อมูลผู้ใช้เฉพาะเมื่อล็อกอินแล้วเท่านั้น */}
              <div>
                {session && (
                  <div className="flex items-center space-x-3 text-sm text-gray-700">
                    <span className="bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                      👤 <strong>{session.user?.name || session.user?.email}</strong> ({session.user?.role})
                    </span>
                  </div>
                )}
              </div>

            </div>
          </div>
        </nav>

        {/* ==================== เนื้อหาของแต่ละหน้า ==================== */}
        <main className="max-w-7xl mx-auto p-4 md:p-6 w-full flex-1">
          {children}
        </main>
      </body>
    </html>
  );
}