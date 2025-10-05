function formatTime(
  timeString: string,
  format: "24hr" | "12hr" = "12hr",
): string | undefined {
  if (!timeString) return "N/A";
  try {
    const [hours, minutes] = timeString
      .replace(".", ":")
      .replace(".", ":")
      .split(":");
    if (format === "24hr") {
      return `${hours}:${minutes}`;
    } else {
      const period = parseInt(hours) >= 12 ? "PM" : "AM";
      let adjustedHours = period === "PM" ? parseInt(hours) % 12 : hours;
      if (adjustedHours === "0") adjustedHours = "12";
      return `${adjustedHours}:${minutes} ${period}`;
    }
  } catch {
    return timeString; // If failed to parse just return original string
  }
}

export default formatTime;
