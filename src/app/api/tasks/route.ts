import { NextResponse } from "next/server";
import { getTasks } from "@/lib/tasks-store";

export async function GET() {
  try {
    const tasks = await getTasks();
    return NextResponse.json(tasks);
  } catch (error) {
    console.error("GET /api/tasks error:", error);
    return NextResponse.json(
      { error: "Failed to load tasks. Is Vercel KV configured?" },
      { status: 500 }
    );
  }
}
