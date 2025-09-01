import { UniversityCourseResponse } from "./types";
self.postMessage({ status: "ready" });

self.onerror = (error) => {
  console.error("An error occurred in the worker:", error);


self.onmessage = async (event) => {
  const { action, url, data } = event.data;
  if (action === "fetchCourses") {
    self.postMessage({ action: "IPC_REQUEST", url });
  } else if (action === "processData" && data && data.classes) {
    const processedData = data.classes as UniversityCourseResponse[];
    const seen = new Set();
    const available_courses_set = processedData
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
    self.postMessage({
      action: "IPC_RESPONSE",
      success: true,
      data: available_courses_set,
    });
  }

