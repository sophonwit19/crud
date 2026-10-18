
import { auth } from "@/app/auth";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await auth();

  // ถ้ายังไม่ได้เข้าสู่ระบบ ให้ไปหน้า Login
  if (!session?.user) {
    redirect("/login");
  }

  // ถ้าไม่ใช่ ADMIN ให้ไปหน้าแจ้งเตือน
  if (session.user.role !== "ADMIN") {
    redirect("/unauthorized");
  }

  // แสดงหน้า Dashboard เมื่อมีสิทธิ์ ADMIN เท่านั้น
  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow">
        <h1 className="text-3xl font-bold text-gray-800">
          Admin Dashboard
        </h1>

        <p className="mt-4 text-gray-600">
          ยินดีต้อนรับเข้าสู่ระบบผู้ดูแลระบบ
        </p>

        <p className="mt-2 text-gray-600">
          หน้านี้อนุญาตเฉพาะผู้ใช้ที่มีสิทธิ์ ADMIN
        </p>
      </div>
    </main>
  );
}
