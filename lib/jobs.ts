export type JobStatus =
  | "queued"
  | "researching"
  | "formatting"
  | "generating"
  | "complete"
  | "error"
  | "cancelled";

export interface Job {
  id: string;
  status: JobStatus;
  progress: string;
  percent: number;
  cancelled: boolean;
}

// In-memory store for real-time progress (cleared on server restart)
// The DB is the source of truth for completed audiobooks
const jobs = new Map<string, Job>();

export function createJob(id: string): Job {
  const job: Job = { id, status: "queued", progress: "Queued...", percent: 0, cancelled: false };
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

export function cancelJob(id: string) {
  const job = jobs.get(id);
  if (job) {
    job.cancelled = true;
    job.status = "cancelled";
  }
}

export function isJobCancelled(id: string): boolean {
  return jobs.get(id)?.cancelled ?? false;
}

export function getJob(id: string): Job | undefined {
  return jobs.get(id);
}

export function deleteJob(id: string) {
  jobs.delete(id);
}
