
import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { auth } from "@/app/auth";
import { studentSchema } from "@/app/students/validation";

// GET: ดึงข้อมูลนักศึกษาทั้งหมด
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { message: "กรุณาเข้าสู่ระบบก่อนใช้งาน API" },
        { status: 401 }
      );
    }

    const students = await prisma.student.findMany({
      orderBy: { id: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: students,
    });
  } catch (error) {
    console.error("GET /api/students error:", error);

    return NextResponse.json(
      { message: "ไม่สามารถดึงข้อมูลนักศึกษาได้" },
      { status: 500 }
    );
  }
}

// POST: เพิ่มข้อมูลนักศึกษาใหม่
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { message: "กรุณาเข้าสู่ระบบก่อนใช้งาน API" },
        { status: 401 }
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { message: "รูปแบบ JSON ไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    // ตรวจสอบข้อมูลด้วย Zod
    const validation = studentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          message: "ข้อมูลไม่ถูกต้อง",
          errors: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const data = validation.data;

    const student = await prisma.student.create({
      data: {
        studentCode: data.studentCode.trim(),
        name: data.name.trim(),
        email: data.email.trim() || null,
        major: data.major.trim(),
        year: data.year,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "เพิ่มข้อมูลนักศึกษาสำเร็จ",
        data: student,
      },
      { status: 201 }
    );
  } catch (error) {
    // รหัสนักศึกษาซ้ำกับข้อมูลเดิม
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { message: "รหัสนักศึกษานี้มีอยู่ในระบบแล้ว" },
        { status: 409 }
      );
    }

    console.error("POST /api/students error:", error);

    return NextResponse.json(
      { message: "ไม่สามารถเพิ่มข้อมูลนักศึกษาได้" },
      { status: 500 }
    );
  }
}
