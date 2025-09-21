import { createAndOpenDB } from "./dbFactory";
import { TeacherRatings } from "./types";

const days = 1000 * 60 * 60 * 24;
const db = createAndOpenDB;

export const getProfessorRatings = async (
  university: string,
  cacheEnabled: boolean = true,
  ttlDays: number = 1,
) => {
  if (!university) return;
  try {
    // Check the db has the ratings and they are not stale
    const cached = await db.get("teacherRatings", university);
    let rmpInfo = null;
    if (
      cached &&
      cacheEnabled &&
      Date.now() - cached.timestamp < days * ttlDays &&
      cached.ratings
    ) {
      rmpInfo = { data: new Map(Object.entries(cached.ratings)) };
    } else {
      rmpInfo = await window.electronAPI.getRMPInfo(university);
      if (cacheEnabled && rmpInfo && rmpInfo.data) {
        await db.put("teacherRatings", {
          school: university,
          timestamp: Date.now(),
          ratings: rmpInfo.data ? Object.fromEntries(rmpInfo.data) : {},
        });
      }
    }
    if (rmpInfo) {
      return rmpInfo.data;
    } else {
      console.error("Failed to fetch RMP Info:");
    }
  } catch (error) {
    console.error("Error fetching RMP Info:", error);
  }
};

export const findClosestTeacherRating = (
  teacherRatingsList: Map<string, TeacherRatings> | null,
  name: string,
) => {
  if (!teacherRatingsList) return undefined;
  const exactMatch = teacherRatingsList.get(name);
  if (exactMatch) return exactMatch;
  for (const [key, rating] of teacherRatingsList.entries()) {
    if (name.split(" ").every((part) => key.includes(part))) {
      return rating;
    }
  }
  return undefined;
};
