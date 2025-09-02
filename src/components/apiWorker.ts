import { UniversityCourseResponse } from "./types";
import { parseFullName } from "parse-full-name";
import { openDB, DBSchema } from "idb";

interface CourseDB extends DBSchema {
  coursesSearches: {
    key: string;
    value: {
      url: string;
      timestamp: number;
      data: UniversityCourseResponse[];
    
  
}

const cacheTTL = 1000 * 60 * 5; // 5 minutes

const createAndOpenDB = openDB<CourseDB>("course-db", 1, {
  upgrade(db) {
    db.createObjectStore("coursesSearches", { keyPath: "url" });
  },
});

self.postMessage({ status: "ready" });

self.onerror = (error) => {
  console.error("An error occurred in the worker:", error);


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
  


self.onmessage = async (event) => {
  const { action, url, data } = event.data;
  if (action === "fetchCourses") {
    const db = await createAndOpenDB;
    const cached = await db.get("coursesSearches", url);
    if (cached && Date.now() - cached.timestamp < cacheTTL) {
      self.postMessage({
        action: "IPC_RESPONSE",
        success: true,
        data: processData(cached.data),
      });
      return;
    } else if (cached) {
      await db.delete("coursesSearches", url);
    }
    self.postMessage({ action: "IPC_REQUEST", url });
  } else if (action === "processData" && data && data.classes) {
    const processedData = data.classes as UniversityCourseResponse[];
    const db = await createAndOpenDB;
    await db.put("coursesSearches", {
      url: url,
      timestamp: Date.now(),
      data: processedData,
    });
    self.postMessage({
      action: "IPC_RESPONSE",
      success: true,
      data: processData(processedData),
    });
  }

