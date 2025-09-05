import React, { useEffect, useState } from "react";
import {
  SearchParamJson,
  UniversityCourseResponse,
  UserSearchRequestTypes,
} from "./components/types";
import { searchDataContext } from "./contextFactory";

export const SearchProvider = ({ children }: { children: React.ReactNode }) => {
  const [searchOptions, setSearchOptions] = useState<SearchParamJson>(
    window.sessionStorage.getItem("searchOptions")
      ? JSON.parse(window.sessionStorage.getItem("searchOptions")!)
      : ({} as SearchParamJson),
  );

  const [searchResults, setSearchResults] = useState<
    UniversityCourseResponse[]
  >(
    window.sessionStorage.getItem("searchResults")
      ? JSON.parse(window.sessionStorage.getItem("searchResults")!)
      : ([] as UniversityCourseResponse[]),
  );

  const [searchQueryParams, setSearchQueryParams] = useState<
    UserSearchRequestTypes & {
      availableCourseNumbers: { label: string; value: string }[];
      availableInstructorFirstNames: { label: string; value: string }[];
      availableInstructorLastNames: { label: string; value: string }[];
    }
  >(
    window.sessionStorage.getItem("searchQueryParams")
      ? JSON.parse(window.sessionStorage.getItem("searchQueryParams")!)
      : {
          subject: [],
          courseCatalogNum: [],
          courseAttributes: [],
          dayOfTheWeek: [],
          numberOfUnits: [],
          startTime: [],
          endTime: [],
          instructMode: [],
          instructorFirstName: [],
          instructorLastName: [],
          instructorScore: "",
          searchTerm: [],
          availableCourseNumbers: [],
          availableInstructorFirstNames: [],
          availableInstructorLastNames: [],
        },
  );

  useEffect(() => {
    window.sessionStorage.setItem(
      "searchOptions",
      JSON.stringify(searchOptions),
    );
  }, [searchOptions]);

  useEffect(() => {
    window.sessionStorage.setItem(
      "searchResults",
      JSON.stringify(searchResults),
    );
  }, [searchResults]);

  useEffect(() => {
    window.sessionStorage.setItem(
      "searchQueryParams",
      JSON.stringify(searchQueryParams),
    );
  }, [searchQueryParams]);

  return (
    <searchDataContext.Provider
      value={{
        searchOptions,
        setSearchOptions: (options: SearchParamJson) =>
          setSearchOptions(options),
        setSearchResults: (results: UniversityCourseResponse[]) =>
          setSearchResults(results),
        searchResults,
        searchQueryParams,
        setSearchQueryParams: (
          params: UserSearchRequestTypes & {
            availableCourseNumbers: { label: string; value: string }[];
            availableInstructorFirstNames: { label: string; value: string }[];
            availableInstructorLastNames: { label: string; value: string }[];
          },
        ) => setSearchQueryParams(params),
      }}
    >
      {children}
    </searchDataContext.Provider>
  );

