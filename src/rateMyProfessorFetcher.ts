import { createAndOpenDB } from "./components/courseProcessorWorker";
import { TeacherRatings } from "./components/types";
export const getProfessorRatings = async (university: string) => {
  if (!university) return;
  try {
    const db = await createAndOpenDB;
    // Check the db has the ratings and they are not stale
    const cached = await db.get("teacherRatings", university);
    const cacheTTL = 1000 * 60 * 120; // 120 minutes Cache TTL
    let rmpInfo = null;
    if (cached && Date.now() - cached.timestamp < cacheTTL && cached.ratings) {
      rmpInfo = { data: new Map(Object.entries(cached.ratings)) 
    } else {
      rmpInfo = await window.electronAPI.getRMPInfo(university);
      db.put("teacherRatings", {
        school: university,
        timestamp: Date.now(),
        ratings: rmpInfo.data ? Object.fromEntries(rmpInfo.data) : {},
      });
    }
    if (rmpInfo) {
      return rmpInfo.data;
    } else {
      console.error("Failed to fetch RMP Info:");
    }
  } catch (error) {
    console.error("Error fetching RMP Info:", error);
  }


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

