import React, { useState } from "react";
import { SearchParamJson, UniversityCourseResponse } from "./components/types";
import { searchDataContext } from "./contextFactory";

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

