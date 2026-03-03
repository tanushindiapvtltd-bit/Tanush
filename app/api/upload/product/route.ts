import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { cloudinary } from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let formData: FormData;
    try {
        formData = await req.formData();
    } catch {
        return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
    }

    const file = formData.get("file") as File | null;
    if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
        return NextResponse.json({ error: "Only images are allowed" }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: "File must be under 10MB" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            { folder: "tanush/products", resource_type: "image" },
            (error, result) => {
                if (error || !result) reject(error ?? new Error("Upload failed"));
                else resolve(result);
            }
        ).end(buffer);
    });

    return NextResponse.json({ url: result.secure_url });
}
