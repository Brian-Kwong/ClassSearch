import React, { useEffect, useState } from "react";
import {
  SearchParamJSON,
  UniversityCourseResponse,
  UserSearchRequestTypes,
} from "../types";
import { searchDataContext } from "./contextFactory";
import { defaultSettings } from "../settingOptions";

export const SearchProvider = ({ children }: { children: React.ReactNode }) => {
  const [searchOptions, setSearchOptions] = useState<SearchParamJSON>(
    window.sessionStorage.getItem("searchOptions")
      ? JSON.parse(window.sessionStorage.getItem("searchOptions")!)
      : ({} as SearchParamJSON),
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
      : defaultSettings,
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
    // console.log(
    //   "AAA Updating searchQueryParams:",
    //   JSON.stringify(searchQueryParams, null, 2),
    // );
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

    // Update sortBy setting if changed
    if (settings["Default Sort Order"] !== sortBy) {
      setSortBy(settings["Default Sort Order"]);
    }

    // Only needs to update when setting changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        setSearchOptions: (options: SearchParamJSON) =>
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
};
