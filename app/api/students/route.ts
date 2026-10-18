import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { auth } from "@/app/auth";
import { studentSchema } from "@/app/students/validation";

// GET: ดึงข้อมูลนักศึกษาทั้งหมด พร้อมรองรับ Search & Filter
export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { message: "กรุณาเข้าสู่ระบบก่อนใช้งาน API" },
        { status: 401 }
      );
    }

    // 1. ดึง Query Parameters จาก URL
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || searchParams.get("query") || "";
    const major = searchParams.get("major") || "";
    const year = searchParams.get("year");

    // 2. สร้างเงื่อนไขการค้นหา/กรอง (Where Clause)
    const whereConditions: Record<string, any>[] = [];

    // ค้นหาคำค้นจาก ชื่อ, รหัสนักศึกษา หรือ อีเมล
    if (search.trim()) {
      whereConditions.push({
        OR: [
          { name: { contains: search.trim() } },
          { studentCode: { contains: search.trim() } },
          { email: { contains: search.trim() } },
        ],
      });
    }

    // กรองตามสาขาวิชา (Major)
    if (major.trim()) {
      whereConditions.push({
        major: { equals: major.trim() },
      });
    }

    // กรองตามชั้นปี (Year)
    if (year) {
      const yearNumber = Number(year);
      if (!isNaN(yearNumber)) {
        whereConditions.push({
          year: yearNumber,
        });
      }
    }

    // 3. ดึงข้อมูลจากฐานข้อมูล Prisma
    const students = await prisma.student.findMany({
      where: whereConditions.length > 0 ? { AND: whereConditions } : {},
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
        email: data.email?.trim() || null,
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
      (error as { code: string }).code === "P2002"
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