import * as jobs from "@/jobs/jobs";
import { deleteJob, scheduleJob } from "@/jobs/cron";

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

  // run monthly (on 5th) to refresh previous-day-reminder date
  scheduleJob("refreshPrevDayReminder", "0 0 20 5 * *", () => {
    jobs.jobWrapper("refreshPrevDayReminder", refreshPrevDayReminder);
  });
}

function getLastDayOfMonth(): number {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  return lastDayOfMonth.getDate();
}

async function refreshPrevDayReminder() {
  deleteJob("prevDayReminder");
  // scheduled to run at 8pm on 14th and last day of month
  scheduleJob("prevDayReminder", `0 0 20 14,${getLastDayOfMonth()} * *`, () => {
    jobs.jobWrapper("prevDayReminder", jobs.reminder);
  });
}
