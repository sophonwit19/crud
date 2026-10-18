import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { auth } from "@/app/auth";
import { studentSchema } from "@/app/students/validation";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

// แปลง id จาก URL เป็นตัวเลข ถ้าไม่ใช่เลขจำนวนเต็มบวกจะได้ null
function parseId(id: string): number | null {
  return /^\d+$/.test(id) ? Number(id) : null;
}

// ข้อความตอบกลับเมื่อ id ไม่ถูกต้อง
function invalidIdResponse() {
  return NextResponse.json(
    { message: "Student ID ไม่ถูกต้อง" },
    { status: 400 }
  );
}

// 1. GET: ดึงข้อมูลนักศึกษารายคนตาม ID
export async function GET(
  request: Request,
  context: RouteContext
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { message: "กรุณาเข้าสู่ระบบก่อนใช้งาน API" },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const studentId = parseId(id);

    if (studentId === null) {
      return invalidIdResponse();
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId }
    });

    if (!student) {
      return NextResponse.json(
        { message: "ไม่พบข้อมูลนักศึกษา" },
        { status: 404 }
      );
    }

    return NextResponse.json(student);
  } catch (error) {
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาดในการดึงข้อมูล" },
      { status: 500 }
    );
  }
}

// 2. PUT: แก้ไขข้อมูลนักศึกษาตาม ID
export async function PUT(
  request: Request,
  context: RouteContext
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { message: "กรุณาเข้าสู่ระบบก่อนใช้งาน API" },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const studentId = parseId(id);

    if (studentId === null) {
      return invalidIdResponse();
    }

    const body = await request.json();

    // ตรวจสอบความถูกต้องด้วย Zod
    const validationResult = studentSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          message: "ข้อมูลไม่ถูกต้อง",
          errors: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const updatedStudent = await prisma.student.update({
      where: { id: studentId },
      data: validationResult.data,
    });

    return NextResponse.json({
      message: "แก้ไขข้อมูลนักศึกษาสำเร็จ",
      data: updatedStudent,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาดในการแก้ไขข้อมูล" },
      { status: 500 }
    );
  }
}

// 3. DELETE: ลบข้อมูลนักศึกษาตาม ID
export async function DELETE(
  request: Request,
  context: RouteContext
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { message: "กรุณาเข้าสู่ระบบก่อนใช้งาน API" },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const studentId = parseId(id);

    if (studentId === null) {
      return invalidIdResponse();
    }

    await prisma.student.delete({
      where: { id: studentId },
    });

    return NextResponse.json({
      message: "ลบข้อมูลนักศึกษาสำเร็จ",
    });
  } catch (error) {
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาดในการลบข้อมูล" },
      { status: 500 }
    );
  }
}