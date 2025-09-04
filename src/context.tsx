import React, { createContext, useState, useContext } from "react";
import { SearchParamJson, UniversityCourseResponse } from "./components/types";

interface SearchDataContextType {
  searchOptions: SearchParamJson;
  setSearchOptions: (options: SearchParamJson) => void;
  setSearchResults: (results: UniversityCourseResponse[]) => void;
  searchResults: UniversityCourseResponse[];
}

const searchDataContext = createContext<SearchDataContextType | undefined>(
  undefined,
);

export const SearchProvider = ({ children }: { children: React.ReactNode }) => {
  const [searchOptions, setSearchOptions] = useState<SearchParamJson>(
    {} as SearchParamJson,
  );
  const [searchResults, setSearchResults] = useState<
    UniversityCourseResponse[]
  >([]);

  return (
    <searchDataContext.Provider
      value={{
        searchOptions,
        setSearchOptions: (options: SearchParamJson) =>
          setSearchOptions(options),
        setSearchResults: (results: UniversityCourseResponse[]) =>
          setSearchResults(results),
        searchResults,
      }}
    >
      {children}
    </searchDataContext.Provider>
  );


export const useSearchContext = () => {
  const context = useContext(searchDataContext);
  if (!context) {
    throw new Error("useSearchContext must be used within a SearchProvider");
  }
  return context;

