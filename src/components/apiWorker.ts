import { UniversityCourseResponse, UserSearchRequestTypes } from "./types";
import { parseFullName } from "parse-full-name";
import { openDB, DBSchema } from "idb";

interface CourseDB extends DBSchema {
  coursesSearches: {
    key: string;
    value: {
      url: string;
      timestamp: number;
      data: UniversityCourseResponse[];
    
  
  searchHistory: {
    key: number;
    value: {
      timestamp: number;
      params: UserSearchRequestTypes;
    
  
}

const cacheTTL = 1000 * 60 * 120; // 120 minutes Cache TTL

const createAndOpenDB = openDB<CourseDB>("course-db", 1, {
  upgrade(db) {
    db.createObjectStore("coursesSearches", { keyPath: "url" });
    db.createObjectStore("searchHistory", { keyPath: "timestamp" });
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
  


const filterData = (data: UniversityCourseResponse[], searchParams: UserSearchRequestTypes) => {

  return data.filter((course) => {
    return (
      (searchParams.subject.length === 0 || searchParams.subject[0] === "" || searchParams.subject.includes(course.subject)) &&
      (searchParams.courseCatalogNum.length === 0 || searchParams.courseCatalogNum[0] === "" || searchParams.courseCatalogNum.includes(course.catalog_nbr)) &&
      (searchParams.courseAttributes.length === 0 || searchParams.courseAttributes[0] === "" || searchParams.courseAttributes.includes(course.crse_attr)) &&
      (searchParams.dayOfTheWeek.length === 0 || searchParams.dayOfTheWeek[0] === "" || course.meetings.some(meeting => searchParams.dayOfTheWeek.includes(meeting.days))) &&
      (searchParams.numberOfUnits.length === 0 || searchParams.numberOfUnits[0] === "" || searchParams.numberOfUnits.includes(course.units)) &&
      (searchParams.startTime.length === 0 || searchParams.startTime[0] === "" || searchParams.startTime.includes(course.start_dt)) &&
      (searchParams.endTime.length === 0 || searchParams.endTime[0] === "" || searchParams.endTime.includes(course.end_dt)) &&
      (searchParams.instructMode.length === 0 || searchParams.instructMode[0] === "" || searchParams.instructMode.includes(course.instruction_mode_descr)) &&
      (searchParams.instructorFirstName.length === 0 || searchParams.instructorFirstName[0] === "" || course.instructors.some(instructor => searchParams.instructorFirstName.includes(instructor.name))) &&
      (searchParams.instructorLastName.length === 0 || searchParams.instructorLastName[0] === "" || course.instructors.some(instructor => searchParams.instructorLastName.includes(instructor.name))) 
    );
  });


self.onmessage = async (event) => {
  const { action, url, data, params, forSearch, latestOnly } = event.data;
  if (action === "fetchCourses") {
    const db = await createAndOpenDB;
    const cached = await db.get("coursesSearches", url);
    if (cached && Date.now() - cached.timestamp < cacheTTL) {
      if(forSearch) await db.put("searchHistory", {
        timestamp: Date.now(),
        params: params,
      });
      self.postMessage({
        action: "IPC_RESPONSE",
        success: true,
        searchParams : params,
        data: forSearch === true ? filterData(cached.data, params) : processData(cached.data),
      });
      return;
    } else if (cached) {
      await db.delete("coursesSearches", url);
    }
    self.postMessage({ action: "IPC_REQUEST", url });
  } else if (action === "processData" && data && data.classes) {
    const processedData = data.classes as UniversityCourseResponse[];
    const db = await createAndOpenDB;
    if(forSearch) {
      await db.put("searchHistory", {
        timestamp: Date.now(),
        params: params,
      });
    }
    await db.put("coursesSearches", {
      url: url,
      timestamp: Date.now(),
      data: processedData,
    });
    self.postMessage({
      action: "IPC_RESPONSE",
      searchParams : params,
      success: true,
      data: forSearch === true ? filterData(processedData, params) : processData(processedData),
    });
  } else if (action === "getSearchHistory") {
    const db = await createAndOpenDB;
    if(latestOnly) {
      // Get the latest search result
      const searchHistory = (await db.getAll("searchHistory")).sort((a, b) => b.timestamp - a.timestamp)[0];
      self.postMessage({
        action: "HISTORY_RESPONSE",
        success: true,
        data: searchHistory,
      });
    } else {
      const searchHistory = await db.getAll("searchHistory");
      self.postMessage({
        action: "HISTORY_RESPONSE",
        success: true,
        data: searchHistory,
      });
    }
  }
}
