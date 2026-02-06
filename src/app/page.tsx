"use client";

import { useCallback, useEffect, useState } from "react";
import type { Task, TaskStatus } from "@/lib/types";

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function statusLabel(s: TaskStatus): string {
  switch (s) {
    case "queued":
      return "Queued";
    case "processing":
      return "Processing…";
    case "completed":
      return "Completed";
    default:
      return s;
  }
}

function StatusBadge({ status }: { status: TaskStatus }) {
  const styles: Record<TaskStatus, string> = {
    queued: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
    processing:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200",
    completed:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}
    >
      {statusLabel(status)}
    </span>
  );
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [label, setLabel] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch("/api/tasks");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? `HTTP ${res.status}`);
      }
      const data: Task[] = await res.json();
      setTasks(Array.isArray(data) ? data : []);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load tasks");
    }
  }, []);

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 2000);
    return () => clearInterval(interval);
  }, [fetchTasks]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = label.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/tasks/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: trimmed }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? `HTTP ${res.status}`);
      }
      const updated: Task[] = await res.json();
      setTasks(Array.isArray(updated) ? updated : []);
      setLabel("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send task");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">
            Vercel Queues demo
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Add tasks below. They’re sent to the queue, processed in the
            background, and this list updates when they complete.
          </p>
        </header>

        <section className="mb-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label htmlFor="task-label" className="sr-only">
                Task label
              </label>
              <input
                id="task-label"
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. Send welcome email"
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-900 dark:placeholder:text-zinc-500"
                disabled={sending}
              />
            </div>
            <button
              type="submit"
              disabled={sending || !label.trim()}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 dark:focus:ring-offset-zinc-900"
            >
              {sending ? "Sending…" : "Send to queue"}
            </button>
          </form>
          {error && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400" role="alert">
              {error}
            </p>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Tasks
          </h2>
          {tasks.length === 0 ? (
            <p className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50/50 py-8 text-center text-sm text-zinc-500 dark:border-zinc-600 dark:bg-zinc-900/50 dark:text-zinc-400">
              No tasks yet. Add one above to see them here; status and duration
              update automatically.
            </p>
          ) : (
            <ul className="space-y-2">
              {tasks
                .slice()
                .sort((a, b) => b.sentAt - a.sentAt)
                .map((task) => (
                  <li
                    key={task.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-700 dark:bg-zinc-900"
                  >
                    <div className="min-w-0 flex-1">
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">
                        {task.label}
                      </span>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                        <span>
                          Sent {new Date(task.sentAt).toLocaleTimeString()}
                        </span>
                        {task.completedAt != null && (
                          <span>
                            · Duration{" "}
                            {formatDuration(task.completedAt - task.sentAt)}
                          </span>
                        )}
                      </div>
                    </div>
                    <StatusBadge status={task.status} />
                  </li>
                ))}
            </ul>
          )}
        </section>

        <p className="mt-6 text-xs text-zinc-400 dark:text-zinc-500">
          Requires Vercel KV and Queues (Beta). Polling every 2s.
        </p>
      </main>
    </div>
  );
}
