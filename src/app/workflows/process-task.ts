import { updateTask } from "@/lib/tasks-store";

// Simulate work (2–5 seconds) so the UI can show "processing" and duration
function simulateWork(): Promise<void> {
  const ms = 2000 + Math.random() * 3000;
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function processTaskStep(taskId: string) {
  "use step";

  await updateTask(taskId, { status: "processing" });
  await simulateWork();
  await updateTask(taskId, { status: "completed", completedAt: Date.now() });
}

export async function processTaskWorkflow(taskId: string, _label: string) {
  "use workflow";

  await processTaskStep(taskId);
  return { taskId, status: "completed" as const };
}
