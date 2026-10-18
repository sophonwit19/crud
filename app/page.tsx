
import Link from "next/link";
import { auth, signOut } from "@/app/auth";

export default async function Home() {
  const session = await auth();

  return (
    <main className="min-h-screen bg-gray-100 px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-2xl bg-white p-8 shadow">
          <h1 className="text-3xl font-bold text-gray-800">
            ระบบจัดการข้อมูล
          </h1>

          {session?.user ? (
            <div className="mt-6 space-y-4">
              <p className="text-green-700">
                คุณเข้าสู่ระบบแล้ว
              </p>

              <div className="rounded-lg bg-gray-50 p-4">
                <p>
                  <span className="font-semibold">ชื่อ:</span>{" "}
                  {session.user.name || "ไม่ได้ระบุชื่อ"}
                </p>

                <p className="mt-2">
                  <span className="font-semibold">อีเมล:</span>{" "}
                  {session.user.email}
                </p>

                <p className="mt-2">
                  <span className="font-semibold">สิทธิ์:</span>{" "}
                  {session.user.role}
                </p>
              </div>

              {/* แสดงปุ่มนี้เฉพาะ ADMIN */}
              {session.user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="inline-block rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
                >
                  เข้าสู่ Admin Dashboard
                </Link>
              )}

              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/login" });
                }}
              >
                <button
                  type="submit"
                  className="rounded-lg bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700"
                >
                  ออกจากระบบ
                </button>
              </form>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              <p className="text-gray-600">
                คุณยังไม่ได้เข้าสู่ระบบ
              </p>

              <div className="flex gap-3">
                <Link
                  href="/login"
                  className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
                >
                  เข้าสู่ระบบ
                </Link>

                <Link
                  href="/signup"
                  className="rounded-lg border border-gray-300 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50"
                >
                  สมัครสมาชิก
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
