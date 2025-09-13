import { parseFullName } from "parse-full-name";
import {
  UniversityCourseResponse,
  UserSearchRequestTypes,
} from "../components/types";
import { createAndOpenDB } from "../components/dbFactory";
const cacheTTL = 1000 * 60 * 120; // 120 minutes Cache TTL

self.postMessage({ status: "ready" });

self.onerror = (error) => {
  console.error("An error occurred in the course processor worker:", error);


const processData = (data: UniversityCourseResponse[]) => {
  const seen = new Set();
  const available_courses_set = data
    .map((course) => {
      if (!seen.has(course.catalog_nbr)) {
        seen.add(course.catalog_nbr);
        return {
          label: `${course.descr} (${course.subject}${course.catalog_nbr})`,
          value: course.catalog_nbr,
        
      }
      return null;
    })
    .filter(Boolean);
  seen.clear();
  const instructorFirstNameSet = new Map<
    string,
    { label: string; value: string }
  >();
  const instructorLastNameSet = new Map<
    string,
    { label: string; value: string }
  >();
  for (const course of data) {
    course.meetings.forEach((meeting) => {
      const { first, last } = parseFullName(meeting.instructor);
      if (first && !instructorFirstNameSet.has(first)) {
        instructorFirstNameSet.set(first, { label: first, value: first });
      }
      if (last && !instructorLastNameSet.has(last)) {
        instructorLastNameSet.set(last, { label: last, value: last });
      }
    });
  }
  return {
    available_courses_set,
    instructorFirstNameSet: Array.from(instructorFirstNameSet.values()),
    instructorLastNameSet: Array.from(instructorLastNameSet.values()),
  


const filterData = (
  data: UniversityCourseResponse[],
  searchParams: UserSearchRequestTypes,
) => {
  return data.filter((course) => {
    return (
      (searchParams.subject.length === 0 ||
        searchParams.subject[0] === "" ||
        searchParams.subject.includes(course.subject)) &&
      (searchParams.courseCatalogNum.length === 0 ||
        searchParams.courseCatalogNum[0] === "" ||
        searchParams.courseCatalogNum.includes(course.catalog_nbr)) &&
      (searchParams.courseAttributes.length === 0 ||
        searchParams.courseAttributes[0] === "" ||
        course.crse_attr_value
          .split(",")
          .some((attr) =>
            searchParams.courseAttributes.some((term) =>
              term.split(" ").every((searchAttr) => attr.includes(searchAttr)),
            ),
          )) &&
      (searchParams.dayOfTheWeek.length === 0 ||
        searchParams.dayOfTheWeek[0] === "" ||
        course.meetings.some((meeting) => {
          if (searchParams.dayOfTheWeek[0] === "any") return true;
          if (searchParams.dayOfTheWeek[0] === "MTWRF") {
            return (
              meeting.days.includes("M") ||
              meeting.days.includes("Tu") ||
              meeting.days.includes("W") ||
              meeting.days.includes("Th") ||
              meeting.days.includes("F")
            );
          }
          return searchParams.dayOfTheWeek.every((day) => {
            if (meeting.days.includes(day)) return true;
          });
        })) &&
      (searchParams.numberOfUnits.length === 0 ||
        searchParams.numberOfUnits[0] === "" ||
        searchParams.numberOfUnits.includes(course.units)) &&
      (searchParams.startTime.length === 0 ||
        searchParams.startTime[0] === "" ||
        course.meetings.some(
          (meeting) =>
            new Date(
              `1970-01-01T${searchParams.startTime[0].replace(".", ":")}:00Z`,
            ) <=
            new Date(
              `1970-01-01T${meeting.start_time.split(".").slice(0, 2).join(":")}:00Z`,
            ),
        )) &&
      (searchParams.endTime.length === 0 ||
        searchParams.endTime[0] === "" ||
        course.meetings.some(
          (meeting) =>
            new Date(
              `1970-01-01T${searchParams.endTime[0].replace(".", ":")}:00Z`,
            ) >=
            new Date(
              `1970-01-01T${meeting.end_time.split(".").slice(0, 2).join(":")}:00Z`,
            ),
        )) &&
      (searchParams.instructMode.length === 0 ||
        searchParams.instructMode[0] === "" ||
        searchParams.instructMode.includes(course.instruction_mode)) &&
      (searchParams.instructorFirstName.length === 0 ||
        searchParams.instructorFirstName[0] === "" ||
        course.instructors.some((instructor) =>
          instructor.name.includes(searchParams.instructorFirstName[0]),
        )) &&
      (searchParams.instructorLastName.length === 0 ||
        searchParams.instructorLastName[0] === "" ||
        course.instructors.some((instructor) =>
          instructor.name.includes(searchParams.instructorLastName[0]),
        ))
    );
  });


// Checks if param A is a subset of param B
// A subset is param A is when param A is more restrictive then param B
const isSubsetOfParams = (
  a: UserSearchRequestTypes,
  b: UserSearchRequestTypes,
) => {
  // Check if all properties in A are present and match in B
  for (const key in b) {
    // If b has the default value of [], "", or [""] then ignore it
    const bValue = b[key as keyof UserSearchRequestTypes];
    if (
      bValue === "" ||
      (Array.isArray(bValue) && bValue.length === 0) ||
      (Array.isArray(bValue) && bValue[0] === "")
    ) {
      continue;
    }
    // If a key in B doesn't exist in A then false
    if (!a[key as keyof UserSearchRequestTypes]) {
      return false;
    }
    if (typeof b[key as keyof UserSearchRequestTypes] === "string") {
      // If it's a string, check if it exists in the other param
      // Direct comparison they must match
      if (
        a[key as keyof UserSearchRequestTypes] !==
        b[key as keyof UserSearchRequestTypes]
      ) {
        return false;
      }
    }
    // If its an array then each element of b must be in A
    if (Array.isArray(b[key as keyof UserSearchRequestTypes])) {
      for (const value of b[key as keyof UserSearchRequestTypes]) {
        if (
          !a[key as keyof UserSearchRequestTypes] ||
          !a[key as keyof UserSearchRequestTypes].includes(value)
        ) {
          return false;
        }
      }
    }
  }
  return true;


self.onmessage = async (event) => {
  const { action, url, data, params, university, forSearch } = event.data;
  if (action === "fetchCourses") {
    const db = await createAndOpenDB;
    const cached = await db.get(
      "coursesSearches",
      `${university}-${params.subject}-${params.searchTerm}`,
    );
    if (
      cached &&
      Date.now() - cached.timestamp < cacheTTL &&
      isSubsetOfParams(params, cached.params)
    ) {
      if (forSearch)
        await db.put("searchHistory", {
          timestamp: Date.now(),
          params: params,
        });
      self.postMessage({
        action: "IPC_RESPONSE",
        success: true,
        searchParams: params,
        data:
          forSearch === true
            ? filterData(cached.data, params)
            : processData(cached.data),
      });
      return;
    } else if (cached) {
      await db.delete(
        "coursesSearches",
        `${university}-${params.subject}-${params.searchTerm}`,
      );
    }
    self.postMessage({ action: "IPC_REQUEST", url, searchParams: params });
  } else if (action === "processData" && data && data.classes) {
    const processedData = data.classes as UniversityCourseResponse[];
    const db = await createAndOpenDB;
    if (forSearch) {
      await db.put("searchHistory", {
        timestamp: Date.now(),
        params: params,
      });
    }
    await db.put("coursesSearches", {
      url: `${university}-${params.subject}-${params.searchTerm}`,
      timestamp: Date.now(),
      data: processedData,
      params: params,
    });
    self.postMessage({
      action: "IPC_RESPONSE",
      searchParams: params,
      success: true,
      data:
        forSearch === true
          ? filterData(processedData, params)
          : processData(processedData),
    });
  }

