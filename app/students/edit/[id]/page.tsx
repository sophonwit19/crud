import prisma from "@/app/lib/prisma";
import { redirect } from "next/navigation";
import { studentSchema } from "@/app/students/validation";
import EditStudentForm from "./edit-student-form";

type EditStudentPageProps = {
    params: Promise<{
        id: string;
    }>;
};

type FormState = {
    success: boolean;
    errors?: {
        studentCode?: string[];
        name?: string[];
        email?: string[];
        major?: string[];
        year?: string[];
    };
    values?: {
        studentCode: string;
        name: string;
        email: string;
        major: string;
        year: string;
    };
};

async function updateStudent(
    studentId: number,
    state: FormState,
    formData: FormData,
): Promise<FormState> {
    "use server";

    const values = {
        studentCode: String(formData.get("studentCode") ?? ""),
        name: String(formData.get("name") ?? ""),
        email: String(formData.get("email") ?? ""),
        major: String(formData.get("major") ?? ""),
        year: String(formData.get("year") ?? ""),
    };

    const result = studentSchema.safeParse({
        studentCode: values.studentCode,
        name: values.name,
        email: values.email,
        major: values.major,
        year: Number(values.year),
    });

    if (!result.success) {
        return {
            success: false,
            errors: result.error.flatten().fieldErrors,
            values,
        };
    }

    try {
        await prisma.student.update({
            where: {
                id: studentId,
            },

            data: {
                ...result.data,
                email: result.data.email || null,
            },
        });
    } catch {
        return {
            success: false,
            errors: {
                studentCode: ["รหัสนักศึกษานี้มีอยู่แล้ว"],
            },
            values,
        };
    }

    redirect("/students");
}

export default async function EditStudentPage({
    params,
}: EditStudentPageProps) {
    const { id } = await params;

    const studentId = Number(id);

    const student = await prisma.student.findUnique({
        where: {
            id: studentId,
        },
    });

    if (!student) {
        return (
            <main className="mx-auto max-w-2xl p-6">
                <h1 className="text-2xl font-bold text-red-600">
                    ไม่พบข้อมูลนักศึกษา
                </h1>
            </main>
        );
    }

    const action = updateStudent.bind(null, student.id);

    return (
        <main className="mx-auto max-w-2xl p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">
                    แก้ไขนักศึกษา
                </h1>

                <p className="mt-2 text-gray-600">
                    แก้ไขข้อมูลนักศึกษา ID: {student.id}
                </p>
            </div>

            <EditStudentForm
                action={action}
                student={{
                    studentCode: student.studentCode,
                    name: student.name,
                    email: student.email ?? "",
                    major: student.major,
                    year: student.year,
                }}
            />
        </main>
    );
}