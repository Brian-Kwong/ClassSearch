import { createAndOpenDB } from "./dbFactory";
import { UniversityCourseDetailsResponse, redirectURL } from "./types";

const TTL = 1000 * 60 * 60 * 24; // 1 day

const fetchClassDetails = async (
  university: string,
  institutionId: string,
  term: string,
  classNbr: string,
) => {
  try {
    const db = await createAndOpenDB;
    const cached = await db.get("classDetails", classNbr);
    if (cached) {
      const isFresh = Date.now() - cached.timestamp < TTL;
      if (isFresh) {
        return cached.data;
      } else {
        db.delete("classDetails", classNbr);
      }
    }
    const url = `${redirectURL[university as keyof typeof redirectURL]}?institution=${institutionId}&term=${term}&class_nbr=${classNbr}`;
    const classDetails = await window.electronAPI.fetchCourses(url);
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
