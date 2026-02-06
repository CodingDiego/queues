import { NextResponse } from "next/server";
import { send } from "@vercel/queue";
import { addTask, getTasks } from "@/lib/tasks-store";
import type { Task, QueueTaskPayload } from "@/lib/types";

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

    const payload: QueueTaskPayload = { taskId, label };
    await send("tasks", payload);

    const tasks = await getTasks();
    return NextResponse.json(tasks);
  } catch (error) {
    console.error("POST /api/tasks/send error:", error);
    return NextResponse.json(
      { error: "Failed to send task to queue or save task." },
      { status: 500 }
    );
  }
}
