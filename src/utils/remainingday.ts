export function calculateDaysUntil1stOr15th(currentDate: Date): number {
  const currentDay = currentDate.getDate();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const firstOfMonth = new Date(currentYear, currentMonth, 1);
  const fifteenthOfMonth = new Date(currentYear, currentMonth, 15);

  // Check if it's already past or is 15th
  if (currentDay >= 15) {
    return calculateDaysUntilNext(1, currentDate);
  }

  // Check if it's already past or is 1st
  if (currentDay >= 1) {
    return calculateDaysUntilNext(15, currentDate);
  }

  // Otherwise, calculate days until nearest of 1st or 15th
  const daysUntil1st = Math.ceil(
    (firstOfMonth.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const daysUntil15th = Math.ceil(
    (fifteenthOfMonth.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  return Math.min(daysUntil1st, daysUntil15th);
}

function calculateDaysUntilNext(targetDay: number, currentDate: Date): number {
  const currentDay = currentDate.getDate();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const targetDate = new Date(currentYear, currentMonth, targetDay);

  // If the target day is in the past, calculate days until the target day in the next month
  if (currentDate > targetDate) {
    targetDate.setMonth(targetDate.getMonth() + 1);
  }

  const differenceInDays = Math.ceil(
    (targetDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  return differenceInDays;
}

if (module === require.main) {
  const currentDate = new Date();
  const daysUntil1stOr15th = calculateDaysUntil1stOr15th(currentDate);
  console.log("Days until 1st or 15th:", daysUntil1stOr15th);
}
