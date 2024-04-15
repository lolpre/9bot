import * as jobs from "@/jobs/jobs";
import { scheduleJob } from "@/jobs/cron";

export function initJobs() {
  // run this job on the 1st and 15th of each month at 10:00 AM
  scheduleJob("createNextForm", "0 0 10 1,15 * *", () => {
    jobs.jobWrapper("createNextForm", jobs.createNextForm);
  });

  // run this job on the 1st and 15th of each month at 9:00 AM
  scheduleJob("uploadCurrentIssue", "0 0 9 1,15 * *", () => {
    jobs.jobWrapper("uploadCurrentIssue", jobs.uploadCurrentIssue);
  });

  // run this job twice a week on Monday and Thursday at 8:00 AM
  scheduleJob("reminder", "0 0 8 * * mon,thu", () => {
    jobs.jobWrapper("reminder", jobs.reminder);
  });
}
