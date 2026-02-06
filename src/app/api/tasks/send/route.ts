import { NextResponse } from "next/server";
import { start } from "workflow/api";
import { addTask, getTasks } from "@/lib/tasks-store";
import { processTaskWorkflow } from "@/app/workflows/process-task";
import type { Task } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const label = typeof body?.label === "string" ? body.label.trim() : "";
    if (!label) {
      return NextResponse.json(
        { error: "Missing or invalid 'label'" },
        { status: 400 }
      );
    }

    const taskId = crypto.randomUUID();
    const sentAt = Date.now();
    const task: Task = {
      id: taskId,
      label,
      status: "queued",
      sentAt,
    };
    await addTask(task);

    await start(processTaskWorkflow, [taskId, label]);

    const tasks = await getTasks();
    return NextResponse.json(tasks);
  } catch (error) {
    console.error("POST /api/tasks/send error:", error);
    return NextResponse.json(
      { error: "Failed to start workflow or save task." },
      { status: 500 }
    );
  }
}
