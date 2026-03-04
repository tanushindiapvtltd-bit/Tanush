/**
 * Calculate Estimated Delivery Date (EDD) from today, skipping Sundays.
 * @param estimatedDays - number of business days
 * @returns formatted string like "Get it by Mon, 10 Mar"
 */
export function calculateEDD(estimatedDays: number): string {
    const date = new Date();
    let daysAdded = 0;
    while (daysAdded < estimatedDays) {
        date.setDate(date.getDate() + 1);
        if (date.getDay() !== 0) {
            // Skip Sundays (0)
            daysAdded++;
        }
    }
    return `Get it by ${date.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
    })}`;
}

/**
 * Returns EDD as a Date object (for storing or formatting differently)
 */
export function getEDDDate(estimatedDays: number): Date {
    const date = new Date();
    let daysAdded = 0;
    while (daysAdded < estimatedDays) {
        date.setDate(date.getDate() + 1);
        if (date.getDay() !== 0) {
            daysAdded++;
        }
    }
    return date;
}
