export type JobStatus =
  | "queued"
  | "researching"
  | "formatting"
  | "generating"
  | "complete"
  | "error";

export interface Job {
  id: string;
  status: JobStatus;
  progress: string;
  percent: number;
}

// In-memory store for real-time progress (cleared on server restart)
// The DB is the source of truth for completed audiobooks
const jobs = new Map<string, Job>();

export function createJob(id: string): Job {
  const job: Job = { id, status: "queued", progress: "Queued...", percent: 0 };
  jobs.set(id, job);
  return job;
}

export function updateJob(
  id: string,
  status: JobStatus,
  progress: string,
  percent: number
) {
  const job = jobs.get(id);
  if (job) {
    job.status = status;
    job.progress = progress;
    job.percent = percent;
  }
}

export function getJob(id: string): Job | undefined {
  return jobs.get(id);
}

export function deleteJob(id: string) {
  jobs.delete(id);
}
