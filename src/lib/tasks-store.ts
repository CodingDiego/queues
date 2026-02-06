import { kv } from "@vercel/kv";
import type { Task } from "./types";
import { TASKS_KV_KEY } from "./types";

export async function getTasks(): Promise<Task[]> {
  const raw = await kv.get<Task[]>(TASKS_KV_KEY);
  return Array.isArray(raw) ? raw : [];
}

export async function addTask(task: Task): Promise<void> {
  const tasks = await getTasks();
  tasks.push(task);
  await kv.set(TASKS_KV_KEY, tasks);
}

export async function updateTask(
  taskId: string,
  update: Partial<Pick<Task, "status" | "completedAt">>
): Promise<void> {
  const tasks = await getTasks();
  const index = tasks.findIndex((t) => t.id === taskId);
  if (index === -1) return;
  tasks[index] = { ...tasks[index], ...update };
  await kv.set(TASKS_KV_KEY, tasks);
}
