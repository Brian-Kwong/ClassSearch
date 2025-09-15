import React, { useEffect, useState } from "react";
import {
  SearchParamJson,
  UniversityCourseResponse,
  UserSearchRequestTypes,
} from "../types";
import { searchDataContext } from "./contextFactory";
import { defaultSettings } from "../ui/settingOptions";

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

  const [sortBy, setSortBy] = useState<string>(
    window.sessionStorage.getItem("sortBy")
      ? JSON.parse(window.sessionStorage.getItem("sortBy")!)
      : "courseNumber",
  );

  const [settings, setSettings] = useState<{ [key: string]: string }>(
    window.localStorage.getItem("settings")
      ? JSON.parse(window.localStorage.getItem("settings")!)
      : {},
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

  useEffect(() => {
    window.sessionStorage.setItem("sortBy", JSON.stringify(sortBy));
  }, [sortBy]);

  useEffect(() => {
    window.localStorage.setItem("settings", JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    if (Object.keys(settings).length === 0) {
      setSettings(defaultSettings);
    }
    // Check on initial load only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        sortBy,
        setSortBy: (sortBy: string) => setSortBy(sortBy),
        settings,
        setSettings,
      }}
    >
      {children}
    </searchDataContext.Provider>
  );

