This is a [Next.js](https://nextjs.org) project with a **Vercel Queues** demo: a small UI to send tasks to a queue and see them move from queued → processing → completed with duration.

## Queue demo

- **UI**: List of tasks, form to add a task (sent to the queue), and live-updating status (queued / processing / completed) with duration.
- **APIs**: `GET /api/tasks` (list), `POST /api/tasks/send` (enqueue a task). Consumer runs in `src/app/api/queue/route.ts` (triggered by Vercel when messages are available).
- **Storage**: Task list is stored in **Vercel KV** so the queue worker can update status when it finishes.

### Setup (required for queue + status)

1. **Vercel KV**  
   In the [Vercel dashboard](https://vercel.com/dashboard), add a KV store (e.g. Redis/Upstash from the integrations). Connect it to this project so `KV_REST_API_URL` and `KV_REST_API_TOKEN` are set.

2. **Vercel Queues (Beta)**  
   Ensure your project has access to [Vercel Queues](https://vercel.com/changelog/vercel-queues-is-now-in-limited-beta). The queue trigger is configured in `vercel.json` (topic: `tasks`, consumer: `worker`).

3. **Local dev**  
   Pull env vars so KV (and queue) work locally:
   ```bash
   vc env pull
   bun run dev
   ```

Then open [http://localhost:3000](http://localhost:3000): add tasks and watch them move to “Processing…” and then “Completed” with duration. The page polls every 2 seconds.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
