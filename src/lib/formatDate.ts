export function formatDateLocal(date: string | Date) {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    timeZone: "UTC", // 👈 forces it to stay the same day globally
  });
}
