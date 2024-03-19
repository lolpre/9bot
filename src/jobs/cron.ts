import { CronJob } from "cron";

interface CronJobWithID extends CronJob {
  id: string;
}

// This array will hold all the cron jobs
const jobs: CronJobWithID[] = [];

/**
 * Schedule a new cron job.
 * @param id A unique identifier for the cron job.
 * @param cronTime The time to run the job, in cron format.
 * @param onTick The function to execute when the cron time is reached.
 */
export function scheduleJob(
  id: string,
  cronTime: string,
  onTick: () => void
): void {
  if (jobs.find((job) => job.id === id)) {
    console.error(`A job with the ID ${id} already exists.`);
    return;
  }

  const job = CronJob.from({
    cronTime,
    onTick,
    start: true,
    timeZone: "America/New_York",
  }) as CronJobWithID;
  job.id = id;
  jobs.push(job);
  console.log(`Job with ID ${id} has been scheduled.`);
}

/**
 * List all active cron jobs.
 */
export function listJobs(): CronJobWithID[] {
  return jobs;
}

/**
 * Delete a cron job by its unique identifier.
 * @param id The unique identifier of the job to delete.
 */
export function deleteJob(id: string): void {
  const jobIndex = jobs.findIndex((job) => job.id === id);
  if (jobIndex === -1) {
    console.error(`No job found with the ID ${id}.`);
    return;
  }

  jobs[jobIndex].stop();
  jobs.splice(jobIndex, 1);
  console.log(`Job with ID ${id} has been deleted.`);
}
