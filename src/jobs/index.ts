import * as jobs from "@/jobs/jobs";
import { scheduleJob } from "@/jobs/cron";

export function initJobs() {
  // run this job every 1st and 3rd week of the month on Sunday at 9:00 AM
  scheduleJob("createNextForm", "0 0 9 1-7,15-21 * sun", () => {
    jobs.jobWrapper("createNextForm", jobs.createNextForm);
  });

  // run this job every 1st and 3rd week of the month on Sunday at 12:00 AM
  scheduleJob("uploadCurrentIssue", "0 0 0 1-7,15-21 * sun", () => {
    jobs.jobWrapper("uploadCurrentIssue", jobs.uploadCurrentIssue);
  });

  // run this job twice a week on Monday and Thursday at 9:00 AM
  scheduleJob("reminder", "0 0 9 * * mon,thu", () => {
    jobs.jobWrapper("reminder", jobs.reminder);
  });

  // running this every 30 seconds to keep application online on Render
  scheduleJob("renderLog", "*  *  * * *", () => {
    jobs.jobWrapper("renderLog", jobs.renderLog);
  });
  scheduleJob("renderLog2", "*  *  * * *", () => {
    jobs.jobWrapper("renderLog2", jobs.renderLog2);
  });
}
