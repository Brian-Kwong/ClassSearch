import { createContext, useContext } from "react";
import { SearchParamJson, UniversityCourseResponse } from "./components/types";

export interface SearchDataContextType {
  searchOptions: SearchParamJson;
  setSearchOptions: (options: SearchParamJson) => void;
  setSearchResults: (results: UniversityCourseResponse[]) => void;
  searchResults: UniversityCourseResponse[];
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

