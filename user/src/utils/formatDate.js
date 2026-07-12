/**
 * Date formatting utilities.
 * Safe against null/undefined/invalid input — always returns a string,
 * never throws, so it's safe to use directly in JSX.
 */

const isValidDate = (d) => d instanceof Date && !isNaN(d.getTime());

const toDate = (input) => {
  if (!input) return null;
  const d = input instanceof Date ? input : new Date(input);
  return isValidDate(d) ? d : null;
};

/**
 * formatDate(new Date()) -> "12 Jul 2026"
 * Options let you opt into a longer month name or include the year differently.
 */
export const formatDate = (input, { month = "short", year = "numeric" } = {}) => {
  const d = toDate(input);
  if (!d) return "—";

  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month,
    year,
  });
};

/**
 * formatDateTime(new Date()) -> "12 Jul 2026, 4:45 PM"
 */
export const formatDateTime = (input) => {
  const d = toDate(input);
  if (!d) return "—";

  return d.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

/**
 * formatTime(new Date()) -> "4:45 PM"
 */
export const formatTime = (input) => {
  const d = toDate(input);
  if (!d) return "—";

  return d.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

/**
 * formatRelativeDate(new Date()) -> "Today", "Yesterday", or "12 Jul 2026"
 * Useful for order timelines / activity feeds.
 */
export const formatRelativeDate = (input) => {
  const d = toDate(input);
  if (!d) return "—";

  const now = new Date();
  const startOfDay = (date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const diffDays = Math.round(
    (startOfDay(now) - startOfDay(d)) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays > 1 && diffDays < 7) return `${diffDays} days ago`;

  return formatDate(d);
};

export default formatDate;