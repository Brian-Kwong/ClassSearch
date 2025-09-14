import {
  UniversityCourseResponse,
  UserSearchRequestTypes,
  TeacherRatings,
  UniversityCourseDetailsResponse,
} from "../components/types";
import { openDB, DBSchema } from "idb";
export interface CourseDB extends DBSchema {
  coursesSearches: {
    key: string;
    value: {
      url: string;
      timestamp: number;
      data: UniversityCourseResponse[];
      params: UserSearchRequestTypes;
    
  
  searchHistory: {
    key: number;
    value: {
      timestamp: number;
      params: UserSearchRequestTypes;
    
  
  teacherRatings: {
    key: string;
    value: {
      school: string;
      timestamp: number;
      ratings: Record<string, TeacherRatings>;
    
  
  classDetails: {
    key: string;
    value: {
      classNbr: string;
      timestamp: number;
      data: UniversityCourseDetailsResponse;
    
  
}

export const createAndOpenDB = openDB<CourseDB>("course-db", 1, {
  upgrade(db) {
    db.createObjectStore("coursesSearches", { keyPath: "url" });
    db.createObjectStore("searchHistory", { keyPath: "timestamp" });
    db.createObjectStore("teacherRatings", { keyPath: "school" });
    db.createObjectStore("classDetails", { keyPath: "classNbr" });
  },
});
