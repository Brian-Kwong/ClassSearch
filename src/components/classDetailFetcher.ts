import { createAndOpenDB } from "./dbFactory";
import { UniversityCourseDetailsResponse, redirectURL } from "./types";

const days = 1000 * 60 * 60 * 24;
const db = createAndOpenDB;

const fetchClassDetails = async (
  university: string,
  institutionId: string,
  term: string,
  classNbr: string,
  ttlDays: number = 1,
) => {
  try {
    const cached = await db.get("classDetails", classNbr);
    if (cached) {
      const isFresh = Date.now() - cached.timestamp < days * ttlDays;
      if (isFresh) {
        return cached.data;
      } else {
        db.delete("classDetails", classNbr);
      }
    }
    const url = `${redirectURL[university as keyof typeof redirectURL]}?institution=${institutionId}&term=${term}&class_nbr=${classNbr}`;
    const classDetails = await window.electronAPI.fetchCourseDetails(url);
    if (classDetails && classDetails.data) {
      db.put("classDetails", {
        classNbr,
        timestamp: Date.now(),
        data: classDetails.data as UniversityCourseDetailsResponse,
      });
      return classDetails.data as UniversityCourseDetailsResponse;
    }
  } catch (error) {
    console.error("Error fetching class details:", error);
  }


export default fetchClassDetails;
