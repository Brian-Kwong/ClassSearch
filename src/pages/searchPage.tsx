/* eslint-disable react-hooks/exhaustive-deps */
import { Button, Grid, GridItem, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import {
  UniversityCourseResponse,
  UserSearchRequestTypes,
} from "../components/types";
import { classSearchEndpoint, redirectURL } from "../components/csuLinks";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Toaster } from "../components/ui/toaster";
import { toaster } from "../components/ui/toastFactory";
import { useSearchContext } from "../components/context/contextFactory";
import {
  getProfessorRatings,
  findClosestTeacherRating,
} from "../components/rateMyProfessorFetcher";
import { IoIosSettings } from "react-icons/io";
import { useTheme } from "next-themes";
import { Mutex, MutexInterface } from "async-mutex";
import courseProcessorWorker from "../workers/courseProcessorWorkerFactory";
import searchHistoryWorker from "../workers/searchHistoryWorkerFactory";
import Settings from "../components/ui/settings";
import WarningDialog from "../components/ui/warning";
import Loading from "../components/ui/loading";
import SearchOptSelector from "../components/ui/searchComboBox";
import InputBox from "../components/ui/inputBox";
import HistoryDrawer from "../components/ui/searchHistoryDrawer";
import React from "react";
import styles from "../css-styles/searchPage.module.css";

const dayOfTheWeekOptions = [
  { label: "Any Day", value: "any" },
  { label: "All Weekdays", value: "MTWRF" },
  { label: "Monday", value: "M" },
  { label: "Tuesday", value: "Tu" },
  { label: "Wednesday", value: "W" },
  { label: "Thursday", value: "Th" },
  { label: "Friday", value: "F" },
  { label: "Saturday", value: "Sa" },
  { label: "Sunday", value: "Su" },
];

const generate_available_terms = (termType: "Semester" | "Quarter") => {
  const currentYear = new Date().getFullYear();
  const available_terms = [];
  for (let yearOffset = -10; yearOffset <= 2; yearOffset++) {
    if (termType === "Quarter") {
      available_terms.push({
        label: `Winter ${currentYear + yearOffset}`,
        value: `${+(Math.floor((currentYear + yearOffset) / 1000) * 100 + ((currentYear + yearOffset) % 100))}2`,
      });
      available_terms.push({
        label: `Spring ${currentYear + yearOffset}`,
        value: `${+(Math.floor((currentYear + yearOffset) / 1000) * 100 + ((currentYear + yearOffset) % 100))}4`,
      });
      available_terms.push({
        label: `Summer ${currentYear + yearOffset}`,
        value: `${+(Math.floor((currentYear + yearOffset) / 1000) * 100 + ((currentYear + yearOffset) % 100))}6`,
      });
      available_terms.push({
        label: `Fall ${currentYear + yearOffset}`,
        value: `${+(Math.floor((currentYear + yearOffset) / 1000) * 100 + ((currentYear + yearOffset) % 100))}8`,
      });
    } else {
      // Follows the standard CSU Semester System
      //NOTE : To determine the term use the format CCYYSSS where CC is the century (e.g., 20), YY is the year (e.g., 22 for 2022), and SSS is the semester type (1 for Winter/Intersession, 3 for Spring, 5 for Summer, and 7 for Fall)
      // 2263 ==> Spring 2026

      available_terms.push({
        label: `Winter/Intersession ${currentYear + yearOffset}`,
        value: `${+(Math.floor((currentYear + yearOffset) / 1000) * 100 + ((currentYear + yearOffset) % 100))}1`,
      });
      available_terms.push({
        label: `Spring ${currentYear + yearOffset}`,
        value: `${+(Math.floor((currentYear + yearOffset) / 1000) * 100 + ((currentYear + yearOffset) % 100))}3`,
      });
      available_terms.push({
        label: `Summer ${currentYear + yearOffset}`,
        value: `${+(Math.floor((currentYear + yearOffset) / 1000) * 100 + ((currentYear + yearOffset) % 100))}5`,
      });
      available_terms.push({
        label: `Fall ${currentYear + yearOffset}`,
        value: `${+(Math.floor((currentYear + yearOffset) / 1000) * 100 + ((currentYear + yearOffset) % 100))}7`,
      });
    }
  }
  return available_terms;
};

const filterByInstructorScore = async (
  university: string | null,
  courses: UniversityCourseResponse[],
  minScore: number | null,
) => {
  if (minScore === null || isNaN(minScore) || minScore < 1 || minScore > 5) {
    return courses;
  }
  return await getProfessorRatings(university || "").then((ratings) => {
    if (ratings) {
      return courses.filter((course: UniversityCourseResponse) => {
        const rating = findClosestTeacherRating(
          ratings,
          course.meetings[0]?.instructor || "",
        );
        return rating && rating.avgRating >= minScore;
      });
    }
  });
};

const SearchPage = () => {
  const { theme, resolvedTheme } = useTheme();

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const university = searchParams.get("university");

  const [termType] = useState<"Semester" | "Quarter">(
    university === "California Polytechnic State University, San Luis Obispo"
      ? "Quarter"
      : "Semester",
  );

  const {
    searchOptions, // Available search options fetched from the university
    setSearchResults, // Sets the search results in context
    searchQueryParams, // Current search parameters from the user
    setSearchQueryParams, // Sets the search parameters in context
    settings, // User's current settings from context
  } = useSearchContext();

  const searchQueryParamsRef = React.useRef(searchQueryParams);

  // Searching status
  const mutex = useMemo(() => new Mutex(), []);
  const lockRef = React.useRef<MutexInterface.Releaser | null>(null);
  const [fetchingAvailableSubjectCourses, setFetchingAvailableSubjectCourses] =
    useState(false);
  const [searchingResults, setSearchingResults] = useState(false);
  const [fetchProgress, setFetchProgress] = useState(0);

  // Warning and error states
  const [triggerWarning, setTriggerWarning] = useState(true);
  const [invalidInstructorScore, setInvalidInstructorScore] = useState(false);
  const suppressMaxEntriesWarning =
    searchParams.get("suppressMaxEntriesWarning") === "true" ||
    localStorage.getItem("suppressMaxEntriesWarning") === "true";

  // Search history
  const [searchHistoryList, setSearchHistoryList] = useState<
    {
      timestamp: number;
      params: UserSearchRequestTypes;
    }[]
  >([]);

  const [selectedSearchHistoryIndex, setSelectedSearchHistoryIndex] = useState<
    number | null
  >(null);

  // Navigate to results page with data
  const navigateToResults = useCallback((data: UniversityCourseResponse[]) => {
    setSearchResults(data);
    navigate(`/results?university=${university}`);
  }, []);

  useEffect(() => {
    courseProcessorWorker.onmessage = async (event) => {
      const { action, url, searchParams, forSearch } = event.data;
      if (action === "IPC_REQUEST") {
        const { success, data, error } = await window.electronAPI.fetchCourses(
          url,
          suppressMaxEntriesWarning,
        );
        if (success === false) {
          if (error === "Max retries reached") {
            WarningDialog.open("max-entries-warning", {
              title: "Warning",
              description:
                "The requested query returns more than the recommended number of results.  It is suggested to narrow down your search parameters to improve performance and ensure a smoother experience. Do you wish to proceed with this search?",
              onConfirm: () => {
                navigate(
                  `/search?university=${university}&suppressMaxEntriesWarning=true`,
                );
              },
            });
          } else {
            toaster.create({
              type: "error",
              title: "Error fetching course data",
              description: error || "An unknown error occurred.",
              duration: 4000,
            });
          }
          if (lockRef.current) {
            lockRef.current();
          }
          setSearchingResults(false);
          setFetchingAvailableSubjectCourses(false);
          return;
        }
        courseProcessorWorker.postMessage({
          action: "processData",
          url,
          data,
          params: searchParams,
          forSearch: forSearch,
          university: university,
          cacheEnabled: settings["Enable Caching"] === "true",
          ttl: parseInt(settings["Course Data Cache Duration"]) || 120,
        }); // send the data to the worker for processing
      }

      if (action === "IPC_COURSE_SEARCH") {
        // eslint-disable-next-line prefer-const
        let { success, data } = event.data;
        if (success) {
          if (
            searchQueryParams.instructorScore &&
            searchQueryParams.instructorScore !== ""
          ) {
            data = await filterByInstructorScore(
              university,
              data,
              parseFloat(searchQueryParams.instructorScore),
            );
          }
          if (lockRef.current) {
            lockRef.current();
          }
          navigateToResults(data);
        } else {
          toaster.create({
            type: "error",
            title: "Error processing course data",
            description: "An unknown error occurred.",
            duration: 4000,
          });
          if (lockRef.current) {
            lockRef.current();
          }
        }
      }
      if (action === "IPC_AVAILABLE_COURSES") {
        const { success, data } = event.data;
        if (success) {
          if (lockRef.current) {
            lockRef.current();
          }
          searchQueryParamsRef.current = {
            ...searchQueryParamsRef.current,
            availableCourseNumbers: data.available_courses_set,
            availableInstructorFirstNames: data.instructorFirstNameSet,
            availableInstructorLastNames: data.instructorLastNameSet,
          };
          setSearchQueryParams({
            ...searchQueryParamsRef.current,
          });
          setFetchingAvailableSubjectCourses(false);
        } else {
          if (lockRef.current) {
            lockRef.current();
          }
          toaster.create({
            type: "error",
            title: "Error fetching available subject courses",
            description: "An unknown error occurred.",
            duration: 4000,
          });
          setFetchingAvailableSubjectCourses(false);
        }
      }
    };
  }, []);

  useEffect(() => {
    searchHistoryWorker.onmessage = (event) => {
      const { status, action, data } = event.data;
      if (status === "ready") {
        return;
      }
      if (action === "SEARCH_HISTORY_DATA") {
        setSearchHistoryList(data);
        return;
      }
      if (action === "SEARCH_HISTORY_RECORD") {
        // TO BE DONE in future release if needed
        return;
      }
      if (action === "SAVE_SEARCH_COMPLETE") {
        // No action needed for save complete
        return;
      }
    };
  }, []);

  const submitSearch = useCallback(async (performSearch: boolean) => {
    if (
      searchQueryParamsRef.current.searchTerm.length < 1 ||
      searchQueryParamsRef.current.searchTerm[0] === ""
    ) {
      if (triggerWarning || performSearch) {
        toaster.create({
          type: performSearch ? "error" : "warning",
          title: "No term selected",
          description: performSearch
            ? "Please select a term and try again."
            : "Some autocomplete features will be disabled until a term is selected.",
          duration: 2000,
          action: {
            label: "Select Default Term",
            onClick: () => {
              setSearchQueryParams({
                ...searchQueryParamsRef.current,
                searchTerm: [searchOptions.selected_term],
                availableCourseNumbers: [],
                availableInstructorFirstNames: [],
                availableInstructorLastNames: [],
              });
            },
          },
        });
        setTriggerWarning(performSearch ? true : false);
      }
      return;
    }
    lockRef.current = await mutex.acquire();
    const url = `${redirectURL[university as keyof typeof redirectURL]}${classSearchEndpoint}?institution=${searchOptions.class_search_fields[0].INSTITUTION}&subject=${searchQueryParamsRef.current.subject.length > 0 ? searchQueryParamsRef.current.subject[0] : ""}&catalog_nbr=${searchQueryParamsRef.current.courseCatalogNum.length > 0 ? searchQueryParamsRef.current.courseCatalogNum[0] : ""}&start_time_ge=${searchQueryParamsRef.current.startTime.length > 0 ? searchQueryParamsRef.current.startTime[0] : ""}&end_time_le=${searchQueryParamsRef.current.endTime.length > 0 ? searchQueryParamsRef.current.endTime[0] : ""}&days=${searchQueryParamsRef.current.dayOfTheWeek.length > 0 ? encodeURIComponent(searchQueryParamsRef.current.dayOfTheWeek.join(",")) : ""}&instruction_mode=${searchQueryParamsRef.current.instructMode.length > 0 ? searchQueryParamsRef.current.instructMode[0] : ""}&crse_attr_value=${searchQueryParamsRef.current.courseAttributes.length > 0 ? searchQueryParamsRef.current.courseAttributes[0].replaceAll(" ", "+") : ""}&instructor_name=${searchQueryParamsRef.current.instructorLastName.length > 0 ? searchQueryParamsRef.current.instructorLastName[0] : ""}&instr_first_name=${searchQueryParamsRef.current.instructorFirstName.length > 0 ? searchQueryParamsRef.current.instructorFirstName[0] : ""}&units=${searchQueryParamsRef.current.numberOfUnits.length > 0 ? searchQueryParamsRef.current.numberOfUnits[0] : ""}&trigger_search=&term=${searchQueryParamsRef.current.searchTerm.length > 0 ? searchQueryParamsRef.current.searchTerm[0] : ""}`;
    courseProcessorWorker.postMessage({
      action: "fetchCourses",
      url,
      university,
      params: searchQueryParamsRef.current,
      forSearch: performSearch,
      cacheEnabled: settings["Enable Caching"] === "true",
      ttl: parseInt(settings["Course Data Cache Duration"]) || 120,
    });
    if (performSearch) {
      searchHistoryWorker.postMessage({
        action: "saveSearch",
        params: searchQueryParamsRef.current,
      });
    } else {
      setFetchingAvailableSubjectCourses(true);
    }
  }, []);

  useEffect(() => {
    if (selectedSearchHistoryIndex !== null) {
      const historyParams =
        searchHistoryList.find(
          (item) => item.timestamp === selectedSearchHistoryIndex,
        )?.params || searchQueryParams;
      setSearchQueryParams({
        ...historyParams,
        availableCourseNumbers: [],
        availableInstructorFirstNames: [],
        availableInstructorLastNames: [],
      });
    }
  }, [selectedSearchHistoryIndex]);

  useEffect(() => {
    if (selectedSearchHistoryIndex !== null) {
      window.location.reload();
    }
  }, [searchQueryParams]);

  const availableTimes = useMemo(
    () => [
      { label: `12:00 AM`, value: `0.00` },
      ...Array.from({ length: 11 }, (_, i) => ({
        label: `${i + 1}:00 AM`,
        value: `${(i + 1).toString().padStart(2, "0")}.00`,
      })),
      { label: "12:00 PM", value: "12.00" },
      ...Array.from({ length: 11 }, (_, i) => ({
        label: `${i + 1}:00 PM`,
        value: `${(i + 1 + 12).toString().padStart(2, "0")}.00`,
      })),
    ],
    [],
  );

  const availableTerms = useMemo(
    () => generate_available_terms(termType),
    [termType],
  );

  const subjectOptions = useMemo(
    () =>
      searchOptions.subjects?.map((subject) => ({
        label: subject.descr + " (" + subject.subject + ")",
        value: subject.subject,
      })) || [],
    [searchOptions.subjects],
  );

  const courseAttributeOptions = useMemo(
    () =>
      searchOptions.crse_attrs?.flatMap((attributeGroup) => {
        if (
          Array.isArray(attributeGroup.values) &&
          attributeGroup.values.length > 0
        ) {
          return attributeGroup.values.map((attr) => ({
            label: attr.descr,
            value: attr.crse_attr_value,
          }));
        } else {
          return [
            {
              label: attributeGroup.descr,
              value: attributeGroup.crse_attr,
            },
          ];
        }
      }) || [],
    [searchOptions.crse_attrs],
  );

  const instructModeOptions = useMemo(
    () =>
      searchOptions.instruct_modes?.map((modes) => ({
        label: modes.descr,
        value: modes.instruction_mode,
      })) || [],
    [searchOptions.instruct_modes],
  );

  const numberOfUnitsOptions = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => ({
        label: `${i + 1} Unit${i === 0 ? "" : "s"}`,
        value: String(i + 1),
      })),
    [],
  );

  useEffect(() => {
    const currentMonth = new Date().getMonth();
    const currentTerm = searchOptions.selected_term
      ? searchOptions.selected_term
      : currentMonth > 8
        ? "Fall"
        : currentMonth > 6
          ? "Summer"
          : termType === "Semester"
            ? "Spring"
            : currentMonth > 3
              ? "Spring"
              : "Winter";
    searchQueryParamsRef.current = {
      ...searchQueryParamsRef.current,
      searchTerm: [currentTerm],
    };
    setSearchQueryParams({
      ...searchQueryParamsRef.current,
    });
  }, [availableTerms]);

  useEffect(() => {
    const removeListener = window.electronAPI.onFetchProgress(
      (_event: unknown, progress: number) => {
        setFetchProgress(Math.round(progress * 100));
      },
    );
    return () => {
      removeListener();
    };
  }, []);

  // useCallback handlers for all selectors
  const handleSubjectChange = React.useCallback(
    (value: string[]) => {
      if (value.length == 0 || value[0] === "") {
        searchQueryParamsRef.current = {
          ...searchQueryParamsRef.current,
          availableCourseNumbers: [],
          availableInstructorFirstNames: [],
          availableInstructorLastNames: [],
          courseCatalogNum: [],
          instructorFirstName: [],
          instructorLastName: [],
          subject: [],
        };
        setSearchQueryParams({
          ...searchQueryParamsRef.current,
        });
      } else {
        searchQueryParamsRef.current = {
          ...searchQueryParamsRef.current,
          subject: value,
        };
        setSearchQueryParams({
          ...searchQueryParamsRef.current,
        });
        submitSearch(false);
      }
    },
    [searchQueryParamsRef],
  );

  const handleCourseCatalogNumChange = React.useCallback((value: string[]) => {
    searchQueryParamsRef.current = {
      ...searchQueryParamsRef.current,
      courseCatalogNum: value,
    };
    setSearchQueryParams({
      ...searchQueryParamsRef.current,
    });
  }, []);

  const handleCourseAttributesChange = React.useCallback((value: string[]) => {
    searchQueryParamsRef.current = {
      ...searchQueryParamsRef.current,
      courseAttributes: value,
    };
    setSearchQueryParams({
      ...searchQueryParamsRef.current,
    });
  }, []);

  const handleDayOfTheWeekChange = React.useCallback((value: string[]) => {
    if (value.includes("any")) {
      searchQueryParamsRef.current = {
        ...searchQueryParamsRef.current,
        dayOfTheWeek: ["any"],
      };
      setSearchQueryParams({
        ...searchQueryParamsRef.current,
      });
    } else if (value.includes("MTWTF")) {
      searchQueryParamsRef.current = {
        ...searchQueryParamsRef.current,
        dayOfTheWeek: ["MTWTF"],
      };
      setSearchQueryParams({
        ...searchQueryParamsRef.current,
      });
    } else {
      searchQueryParamsRef.current = {
        ...searchQueryParamsRef.current,
        dayOfTheWeek: value,
      };
      setSearchQueryParams({
        ...searchQueryParamsRef.current,
      });
    }
  }, []);

  const handleSearchTermChange = React.useCallback((value: string[]) => {
    searchQueryParamsRef.current = {
      ...searchQueryParamsRef.current,
      searchTerm: value,
    };
    setSearchQueryParams({
      ...searchQueryParamsRef.current,
    });
  }, []);

  const handleNumberOfUnitsChange = React.useCallback((value: string[]) => {
    searchQueryParamsRef.current = {
      ...searchQueryParamsRef.current,
      numberOfUnits: value,
    };
    setSearchQueryParams({
      ...searchQueryParamsRef.current,
    });
  }, []);

  const handleStartTimeChange = React.useCallback((value: string[]) => {
    searchQueryParamsRef.current = {
      ...searchQueryParamsRef.current,
      startTime: value,
    };
    setSearchQueryParams({
      ...searchQueryParamsRef.current,
    });
  }, []);

  const handleEndTimeChange = React.useCallback((value: string[]) => {
    searchQueryParamsRef.current = {
      ...searchQueryParamsRef.current,
      endTime: value,
    };
    setSearchQueryParams({
      ...searchQueryParamsRef.current,
    });
  }, []);

  const handleInstructModeChange = React.useCallback((value: string[]) => {
    searchQueryParamsRef.current = {
      ...searchQueryParamsRef.current,
      instructMode: value,
    };
    setSearchQueryParams({
      ...searchQueryParamsRef.current,
    });
  }, []);

  const handleInstructorFirstNameChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      searchQueryParamsRef.current = {
        ...searchQueryParamsRef.current,
        instructorFirstName: [e.target.value],
      };
      setSearchQueryParams({
        ...searchQueryParamsRef.current,
      });
    },
    [],
  );

  const handleInstructorLastNameChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      searchQueryParamsRef.current = {
        ...searchQueryParamsRef.current,
        instructorLastName: [e.target.value],
      };
      setSearchQueryParams({
        ...searchQueryParamsRef.current,
      });
    },
    [],
  );
  const handleInstructorScoreChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (
        e.target.value !== "" &&
        isNaN(Number(e.target.value)) &&
        !invalidInstructorScore
      ) {
        toaster.create({
          type: "error",
          title: "Instructor Score must be a number",
        });
        setInvalidInstructorScore(true);
        return;
      }
      if (
        e.target.value !== "" &&
        (Number(e.target.value) < 1 || Number(e.target.value) > 5) &&
        !invalidInstructorScore
      ) {
        toaster.create({
          type: "error",
          title: "Instructor Score must be between 1 and 5",
        });
        setInvalidInstructorScore(true);
        return;
      }
      if (invalidInstructorScore) {
        return;
      }
      searchQueryParamsRef.current = {
        ...searchQueryParamsRef.current,
        instructorScore: e.target.value,
      };
      setSearchQueryParams({
        ...searchQueryParamsRef.current,
      });
      setInvalidInstructorScore(false);
    },
    [searchQueryParamsRef, invalidInstructorScore],
  );

  return (
    <>
      {searchingResults ? (
        <Loading message={`Searching for courses... ${fetchProgress}%`} />
      ) : (
        <>
          <div
            className={`${styles.searchFiltersContainer} ${theme === "system" ? (resolvedTheme === "dark" ? styles.dark : "") : theme === "dark" ? styles.dark : ""}`}
          >
            <Text fontSize="4xl" fontWeight="bold">
              Course Search
            </Text>
            <Grid
              templateColumns={{
                base: "1fr",
                md: "repeat(2, 1fr)",
                lg: "repeat(3, 1fr)",
              }}
              gap={4}
            >
              <GridItem colSpan={1}>
                <SearchOptSelector
                  selectedValue={searchQueryParamsRef.current.subject || [""]}
                  setSelectedValue={handleSubjectChange}
                  options={subjectOptions}
                  label="Subject"
                  multiple={false}
                />
              </GridItem>
              <GridItem colSpan={1}>
                {searchQueryParams.availableCourseNumbers &&
                searchQueryParams.availableCourseNumbers.length > 0 ? (
                  <SearchOptSelector
                    selectedValue={searchQueryParams.courseCatalogNum || [""]}
                    setSelectedValue={handleCourseCatalogNumChange}
                    options={searchQueryParams.availableCourseNumbers}
                    label="Course Catalog Number"
                    multiple={false}
                  />
                ) : (
                  <InputBox
                    label="Course Catalog Number"
                    value={searchQueryParams.courseCatalogNum[0] || ""}
                    onChange={(e) =>
                      handleCourseCatalogNumChange([e.target.value])
                    }
                    loadingData={fetchingAvailableSubjectCourses}
                  />
                )}
              </GridItem>
              <GridItem colSpan={1}>
                <SearchOptSelector
                  selectedValue={searchQueryParams.courseAttributes || [""]}
                  setSelectedValue={handleCourseAttributesChange}
                  options={courseAttributeOptions}
                  label="Course Attributes"
                  multiple={false}
                />
              </GridItem>
              <GridItem colSpan={1}>
                <SearchOptSelector
                  selectedValue={searchQueryParams.dayOfTheWeek || [""]}
                  setSelectedValue={handleDayOfTheWeekChange}
                  options={dayOfTheWeekOptions}
                  label="Day of the Week"
                  multiple={
                    searchQueryParams.dayOfTheWeek.includes("any") ||
                    searchQueryParams.dayOfTheWeek.includes("MTWTF")
                      ? false
                      : true
                  }
                />
              </GridItem>
              <GridItem colSpan={1}>
                <SearchOptSelector
                  selectedValue={searchQueryParams.searchTerm || [""]}
                  setSelectedValue={handleSearchTermChange}
                  options={availableTerms}
                  label="Term"
                  multiple={false}
                />
              </GridItem>
              <GridItem colSpan={1}>
                <SearchOptSelector
                  selectedValue={searchQueryParams.numberOfUnits || [""]}
                  setSelectedValue={handleNumberOfUnitsChange}
                  options={numberOfUnitsOptions}
                  label="Number of Units"
                  multiple={false}
                />
              </GridItem>
              <GridItem colSpan={1}>
                <SearchOptSelector
                  selectedValue={searchQueryParams.startTime || [""]}
                  setSelectedValue={handleStartTimeChange}
                  options={availableTimes}
                  label="Start Time"
                  multiple={false}
                />
              </GridItem>
              <GridItem colSpan={1}>
                <SearchOptSelector
                  selectedValue={searchQueryParams.endTime || [""]}
                  setSelectedValue={handleEndTimeChange}
                  options={availableTimes}
                  label="End Time"
                  multiple={false}
                />
              </GridItem>
              <GridItem colSpan={1}>
                <SearchOptSelector
                  selectedValue={searchQueryParams.instructMode || [""]}
                  setSelectedValue={handleInstructModeChange}
                  options={instructModeOptions}
                  label="Instruction Mode"
                  multiple={false}
                />
              </GridItem>
              <GridItem colSpan={1}>
                {searchQueryParams.availableInstructorFirstNames &&
                searchQueryParams.availableInstructorFirstNames.length > 0 ? (
                  <SearchOptSelector
                    selectedValue={
                      searchQueryParams.instructorFirstName || [""]
                    }
                    setSelectedValue={(value) => {
                      searchQueryParamsRef.current = {
                        ...searchQueryParamsRef.current,
                        instructorFirstName: value,
                      };
                    }}
                    options={searchQueryParams.availableInstructorFirstNames}
                    label="Instructor First Name"
                    multiple={false}
                  />
                ) : (
                  <InputBox
                    label="Instructor First Name"
                    value={searchQueryParams.instructorFirstName[0] || ""}
                    onChange={handleInstructorFirstNameChange}
                    loadingData={fetchingAvailableSubjectCourses}
                  />
                )}
              </GridItem>
              <GridItem colSpan={1}>
                {searchQueryParams.availableInstructorLastNames &&
                searchQueryParams.availableInstructorLastNames.length > 0 ? (
                  <SearchOptSelector
                    selectedValue={searchQueryParams.instructorLastName || [""]}
                    setSelectedValue={(value) => {
                      searchQueryParamsRef.current = {
                        ...searchQueryParamsRef.current,
                        instructorLastName: value,
                      };
                    }}
                    options={searchQueryParams.availableInstructorLastNames}
                    label="Instructor Last Name"
                    multiple={false}
                  />
                ) : (
                  <InputBox
                    label="Instructor Last Name"
                    value={searchQueryParams.instructorLastName[0] || ""}
                    onChange={handleInstructorLastNameChange}
                    loadingData={fetchingAvailableSubjectCourses}
                  />
                )}
              </GridItem>
              <GridItem colSpan={1}>
                <InputBox
                  label="Instructor Score"
                  value={searchQueryParams.instructorScore}
                  onChange={handleInstructorScoreChange}
                />
              </GridItem>
            </Grid>
            <Grid
              templateColumns={{
                base: "1fr",
                md: "repeat(2, 1fr)",
              }}
              gap={4}
            >
              <GridItem colSpan={1}>
                <HistoryDrawer
                  openButton={
                    <Button
                      onClick={() =>
                        searchHistoryWorker.postMessage({
                          action: "getSearchHistory",
                          maxNumberOfEntries:
                            parseInt(
                              settings["Maximum Search History Entries"],
                            ) || 1024,
                        })
                      }
                      className={styles.button}
                      width="100%"
                    >
                      Previous Searches
                    </Button>
                  }
                  searchHistory={searchHistoryList}
                  setSelectedSearchHistoryIndex={setSelectedSearchHistoryIndex}
                />
              </GridItem>
              <GridItem colSpan={1}>
                <Button
                  onClick={() => {
                    submitSearch(true);
                    setSearchingResults(true);
                  }}
                  className={styles.button}
                  width="100%"
                >
                  Search
                </Button>
              </GridItem>
            </Grid>
          </div>
          <IoIosSettings
            className={styles.settingIcon}
            onClick={() => Settings.open("settings", {})}
          />
          <Toaster />
          <Settings.Viewport />
          <WarningDialog.Viewport />
        </>
      )}
    </>
  );
};

export default SearchPage;
