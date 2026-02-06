import { handleCallback } from "@vercel/queue";
import { updateTask } from "@/lib/tasks-store";
import type { QueueTaskPayload } from "@/lib/types";

// Simulate work (2–5 seconds) so we can see "processing" and duration in the UI
function simulateWork(): Promise<void> {
  const ms = 2000 + Math.random() * 3000;
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const POST = handleCallback({
  tasks: {
    worker: async (message) => {
      const { taskId } = message as QueueTaskPayload;
      await updateTask(taskId, { status: "processing" });
      await simulateWork();
      await updateTask(taskId, { status: "completed", completedAt: Date.now() });
    },
  },
});
