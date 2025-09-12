import { UniversityCourseResponse, TeacherRatings } from "./components/types";
import { findClosestTeacherRating } from "./rateMyProfessorFetcher";

/* The following sort options are available     

        { label: "Availability", value: "availability" },
        { label: "Course Name A-Z", value: "courseNameAZ" },
        { label: "Course Name Z-A", value: "courseNameZA" },
        { label: "Course Number", value: "courseNumber" },
        { label: "Time", value: "time" },
        { label: "Professor Name A-Z", value: "professorNameAZ" },
        { label: "Professor Name Z-A", value: "professorNameZA" },
        { label: "Professor Rating", value: "professorRating" },
        { label: "Units", value: "units" },

*/

const sortCoursesBy = (
  courses: UniversityCourseResponse[],
  professorRatings: Map<string, TeacherRatings>,
  sortBy: string,
) => {
  const sortedCourses = [...courses];
  switch (sortBy) {
    case "courseNumber":
      sortedCourses.sort((a, b) => {
        const courseA = a.catalog_nbr || "";
        const courseB = b.catalog_nbr || "";
        return courseA.localeCompare(courseB, undefined, { numeric: true });
      });
      break;
    case "courseNameAZ":
      sortedCourses.sort((a, b) => {
        const titleA = a.descr || "";
        const titleB = b.descr || "";
        return titleA.localeCompare(titleB);
      });
      break;
    case "courseNameZA":
      sortedCourses.sort((a, b) => {
        const titleA = a.descr || "";
        const titleB = b.descr || "";
        return titleB.localeCompare(titleA);
      });
      break;
    case "availability":
      sortedCourses.sort((a, b) => {
        const isOpenA = a.enrl_stat_descr;
        const isOpenB = b.enrl_stat_descr;
        // Prefer open then waitlist, then closed
        if (isOpenA === "Open" && isOpenB !== "Open") return -1;
        if (isOpenA !== "Open" && isOpenB === "Open") return 1;
        if (isOpenA === "Waitlist" && isOpenB !== "Waitlist") return -1;
        if (isOpenA !== "Waitlist" && isOpenB === "Waitlist") return 1;
        // If both are the same status, sort by percentage of availability
        const availabilityA = a.enrollment_total / a.class_capacity;
        const availabilityB = b.enrollment_total / b.class_capacity;
        return availabilityB - availabilityA;
      });
      break;
    case "professorNameAZ":
      sortedCourses.sort((a, b) => {
        const instructorA =
          a.instructors && a.meetings.length > 0
            ? a.meetings[0].instructor
            : "";
        const instructorB =
          b.instructors && b.meetings.length > 0
            ? b.meetings[0].instructor
            : "";
        return instructorA.localeCompare(instructorB);
      });
      break;
    case "professorNameZA":
      sortedCourses.sort((a, b) => {
        const instructorA =
          a.instructors && a.meetings.length > 0
            ? a.meetings[0].instructor
            : "";
        const instructorB =
          b.instructors && b.meetings.length > 0
            ? b.meetings[0].instructor
            : "";
        return instructorB.localeCompare(instructorA);
      });
      break;
    case "units":
      sortedCourses.sort((a, b) => {
        const unitsA = parseInt(a.units) || 0;
        const unitsB = parseInt(b.units) || 0;
        return unitsA - unitsB;
      });
      break;
    case "time":
      sortedCourses.sort((a, b) => {
        const timeA =
          a.meetings && a.meetings.length > 0
            ? a.meetings[0].start_time
            : "00:00";
        const timeB =
          b.meetings && b.meetings.length > 0
            ? b.meetings[0].start_time
            : "00:00";
        return timeA.localeCompare(timeB);
      });
      break;
    case "professorRating":
      sortedCourses.sort((a, b) => {
        const instructorA =
          a.instructors && a.meetings.length > 0
            ? a.meetings[0].instructor
            : "";
        const instructorB =
          b.instructors && b.meetings.length > 0
            ? b.meetings[0].instructor
            : "";
        const ratingA = findClosestTeacherRating(professorRatings, instructorA);
        const ratingB = findClosestTeacherRating(professorRatings, instructorB);
        // If the rating is tied use number of ratings to break the tie
        if (ratingA?.avgRating === ratingB?.avgRating) {
          const numRatingsA = ratingA?.numRatings || 0;
          const numRatingsB = ratingB?.numRatings || 0;
          return numRatingsB - numRatingsA;
        }
        return (ratingB?.avgRating || 0) - (ratingA?.avgRating || 0);
      });
      break;
    default:
      // If sortBy is unrecognized, return unsorted
      break;
  }
  return sortedCourses;


export default sortCoursesBy;
