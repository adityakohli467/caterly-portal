/**
 * Utility functions for handling date and time in Australia/Sydney timezone
 */

/**
 * Returns the current date and time in Sydney
 */
export const getSydneyNow = (): Date => {
  // Using toLocaleString to get the current time in Sydney
  // Note: browser support for Intl.DateTimeFormat with timeZone is excellent
  const sydneyString = new Date().toLocaleString("en-US", {
    timeZone: "Australia/Sydney"
  });
  return new Date(sydneyString);
};

/**
 * Returns the current date in Sydney in YYYY-MM-DD format
 */
export const getSydneyTodayString = (): string => {
  const sydneyNow = getSydneyNow();
  const year = sydneyNow.getFullYear();
  const month = String(sydneyNow.getMonth() + 1).padStart(2, "0");
  const day = String(sydneyNow.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Checks if a specific time slot has already passed in Sydney, plus an optional buffer
 * 
 * @param dateStr Date in YYYY-MM-DD format
 * @param timeStr Time in "h:mm AM/PM" format (e.g., "10:30 AM")
 * @param bufferHours Hours of lead time required (default 2 hours)
 */
export const isTimeSlotPassed = (
  dateStr: string,
  timeStr: string,
  bufferHours: number = 0
): boolean => {
  const sydneyNow = getSydneyNow();
  const todayStr = getSydneyTodayString();

  // If the selected date is in the future, it's not passed
  if (dateStr > todayStr) return false;
  // If the selected date is in the past, it's definitely passed
  if (dateStr < todayStr) return true;

  // If it's today, we check the time
  try {
    const [time, ampm] = timeStr.split(" ");
    let [hours, minutes] = time.split(":").map(Number);
    
    if (ampm === "PM" && hours < 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0;

    const slotTime = new Date(sydneyNow);
    slotTime.setHours(hours, minutes, 0, 0);

    // Add buffer time to the "Now" time to see if we've crossed the cutoff
    const cutoffTime = new Date(sydneyNow);
    cutoffTime.setHours(cutoffTime.getHours() + bufferHours);

    return slotTime < cutoffTime;
  } catch (error) {
    console.error("Error parsing time for slot check:", error);
    return false;
  }
};
