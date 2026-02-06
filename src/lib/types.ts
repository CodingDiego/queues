export type TaskStatus = "queued" | "processing" | "completed";

export interface Task {
  id: string;
  label: string;
  status: TaskStatus;
  sentAt: number;
  completedAt?: number;
}

export interface QueueTaskPayload {
  taskId: string;
  label: string;
}

export const TASKS_KV_KEY = "queue-demo:tasks";
