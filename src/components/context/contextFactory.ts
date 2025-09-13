import { createContext, useContext } from "react";
import {
  SearchParamJson,
  UniversityCourseResponse,
  UserSearchRequestTypes,
} from "../types";

export interface SearchDataContextType {
  searchOptions: SearchParamJson;
  setSearchOptions: (options: SearchParamJson) => void;
  setSearchResults: (results: UniversityCourseResponse[]) => void;
  searchResults: UniversityCourseResponse[];
  searchQueryParams: UserSearchRequestTypes & {
    availableCourseNumbers: { label: string; value: string }[];
    availableInstructorFirstNames: { label: string; value: string }[];
    availableInstructorLastNames: { label: string; value: string }[];
  
  setSearchQueryParams: (
    params: UserSearchRequestTypes & {
      availableCourseNumbers: { label: string; value: string }[];
      availableInstructorFirstNames: { label: string; value: string }[];
      availableInstructorLastNames: { label: string; value: string }[];
    },
  ) => void;
  sortBy: string;
  setSortBy: (sortBy: string) => void;
}

export const searchDataContext = createContext<
  SearchDataContextType | undefined
>(undefined);

export const useSearchContext = () => {
  const context = useContext(searchDataContext);
  if (!context) {
    throw new Error("useSearchContext must be used within a SearchProvider");
  }
  return context;

