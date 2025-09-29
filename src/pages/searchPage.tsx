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
    searchResults, // Current search results from context
    setSearchResults, // Sets the search results in context
    searchQueryParams, // Current search parameters from the user
    setSearchQueryParams, // Sets the search parameters in context
    settings, // User's current settings from context
  } = useSearchContext();

  // Searching status
  let searching = false;
  const [fetchingAvailableSubjectCourses, setFetchingAvailableSubjectCourses] =
    useState(false);
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
          searching = false;
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
          searching = false;
          navigateToResults(data);
        } else {
          toaster.create({
            type: "error",
            title: "Error processing course data",
            description: "An unknown error occurred.",
            duration: 4000,
          });
          searching = false;
        }
      }
      if (action === "IPC_AVAILABLE_COURSES") {
        const { success, data } = event.data;
        if (success) {
          searching = false;
          setSearchQueryParams({
            ...searchQueryParams,
            availableCourseNumbers: data.available_courses_set,
            availableInstructorFirstNames: data.instructorFirstNameSet,
            availableInstructorLastNames: data.instructorLastNameSet,
          });
          setFetchingAvailableSubjectCourses(false);
        } else {
          searching = false;
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
  }, [searchQueryParams]);

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
      searchQueryParams.searchTerm.length < 1 ||
      searchQueryParams.searchTerm[0] === ""
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
                ...searchQueryParams,
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
    while (searching) {
      // Wait for any ongoing search to finish
      await new Promise((resolve) => {
        setTimeout(resolve, 100);
      });
    }
    searching = true;
    const url = `${redirectURL[university as keyof typeof redirectURL]}${classSearchEndpoint}?institution=${searchOptions.class_search_fields[0].INSTITUTION}&subject=${searchQueryParams.subject.length > 0 ? searchQueryParams.subject[0] : ""}&catalog_nbr=${searchQueryParams.courseCatalogNum.length > 0 ? searchQueryParams.courseCatalogNum[0] : ""}&start_time_ge=${searchQueryParams.startTime.length > 0 ? searchQueryParams.startTime[0] : ""}&end_time_le=${searchQueryParams.endTime.length > 0 ? searchQueryParams.endTime[0] : ""}&days=${searchQueryParams.dayOfTheWeek.length > 0 ? encodeURIComponent(searchQueryParams.dayOfTheWeek.join(",")) : ""}&instruction_mode=${searchQueryParams.instructMode.length > 0 ? searchQueryParams.instructMode[0] : ""}&crse_attr_value=${searchQueryParams.courseAttributes.length > 0 ? searchQueryParams.courseAttributes[0].replaceAll(" ", "+") : ""}&instructor_name=${searchQueryParams.instructorLastName.length > 0 ? searchQueryParams.instructorLastName[0] : ""}&instr_first_name=${searchQueryParams.instructorFirstName.length > 0 ? searchQueryParams.instructorFirstName[0] : ""}&units=${searchQueryParams.numberOfUnits.length > 0 ? searchQueryParams.numberOfUnits[0] : ""}&trigger_search=&term=${searchQueryParams.searchTerm.length > 0 ? searchQueryParams.searchTerm[0] : ""}`;
    courseProcessorWorker.postMessage({
      action: "fetchCourses",
      url,
      university,
      params: searchQueryParams,
      forSearch: performSearch,
      cacheEnabled: settings["Enable Caching"] === "true",
      ttl: parseInt(settings["Course Data Cache Duration"]) || 120,
    });
    if (performSearch) {
      searchHistoryWorker.postMessage({
        action: "saveSearch",
        params: searchParams,
      });
    } else {
      setFetchingAvailableSubjectCourses(true);
    }
  }, [searchQueryParams]);

  useEffect(() => {
    if (
      searchQueryParams.subject.length > 0 &&
      searchQueryParams.subject[0] !== ""
    ) {
      submitSearch(false);
    }
  }, [searchQueryParams.subject]);

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
    setSearchQueryParams({
      ...searchQueryParams,
      searchTerm: [currentTerm],
    });
  }, []);

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
  const handleSubjectChange = React.useCallback((value: string[]) => {
    if (value.length == 0 || value[0] === "") {
      setSearchQueryParams({
        ...searchQueryParams,
        availableCourseNumbers: [],
        availableInstructorFirstNames: [],
        availableInstructorLastNames: [],
        courseCatalogNum: [],
        instructorFirstName: [],
        instructorLastName: [],
        subject: [],
      });
    } else {
      setSearchQueryParams({
        ...searchQueryParams,
        subject: value,
      });
    }
  }, [searchQueryParams.subject]);

  const handleCourseCatalogNumChange = React.useCallback(
    (value: string[]) =>
      setSearchQueryParams({
        ...searchQueryParams,
        courseCatalogNum: value,
      }),
    [searchQueryParams.courseCatalogNum],
  );

  const handleCourseAttributesChange = React.useCallback(
    (value: string[]) =>
      setSearchQueryParams({
        ...searchQueryParams,
        courseAttributes: value,
      }),
    [searchQueryParams.courseAttributes],
  );

  const handleDayOfTheWeekChange = React.useCallback((value: string[]) => {
    if (value.includes("any")) {
      setSearchQueryParams({
        ...searchQueryParams,
        dayOfTheWeek: ["any"],
      });
    } else if (value.includes("MTWTF")) {
      setSearchQueryParams({
        ...searchQueryParams,
        dayOfTheWeek: ["MTWTF"],
      });
    } else {
      setSearchQueryParams({
        ...searchQueryParams,
        dayOfTheWeek: value,
      });
    }
  }, [searchQueryParams.dayOfTheWeek]);

  const handleSearchTermChange = React.useCallback(
    (value: string[]) =>
      setSearchQueryParams({
        ...searchQueryParams,
        searchTerm: value,
      }),
    [searchQueryParams.searchTerm],
  );
  const handleNumberOfUnitsChange = React.useCallback(
    (value: string[]) =>
      setSearchQueryParams({
        ...searchQueryParams,
        numberOfUnits: value,
      }),
    [searchQueryParams.numberOfUnits],
  );
  const handleStartTimeChange = React.useCallback(
    (value: string[]) =>
      setSearchQueryParams({
        ...searchQueryParams,
        startTime: value,
      }),
    [searchQueryParams.startTime],
  );
  const handleEndTimeChange = React.useCallback(
    (value: string[]) =>
      setSearchQueryParams({
        ...searchQueryParams,
        endTime: value,
      }),
    [searchQueryParams.endTime],
  );
  const handleInstructModeChange = React.useCallback(
    (value: string[]) =>
      setSearchQueryParams({
        ...searchQueryParams,
        instructMode: value,
      }),
    [searchQueryParams.instructMode],
  );

  const handleInstructorFirstNameChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setSearchQueryParams({
        ...searchQueryParams,
        instructorFirstName: [e.target.value],
      }),
    [searchQueryParams.instructorFirstName],
  );
  const handleInstructorLastNameChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setSearchQueryParams({
        ...searchQueryParams,
        instructorLastName: [e.target.value],
      }),
    [searchQueryParams.instructorLastName],
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
      setInvalidInstructorScore(false);
      setSearchQueryParams({
        ...searchQueryParams,
        instructorScore: e.target.value,
      });
    },
    [searchQueryParams.instructorScore, invalidInstructorScore],
  );

  return (
    <>
      {1 !== 1 ? (
        <Loading message={`Searching for courses... ${fetchProgress}%`} />
      ) : (availableTerms && availableTimes && subjectOptions && courseAttributeOptions && instructModeOptions && numberOfUnitsOptions ) && (
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
                  selectedValue={searchQueryParams.subject || [""]}
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
                  selectedValue={searchQueryParams.searchTerm}
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
                    setSelectedValue={(value) =>
                      setSearchQueryParams({
                        ...searchQueryParams,
                        instructorFirstName: value,
                      })
                    }
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
                    setSelectedValue={(value) =>
                      setSearchQueryParams({
                        ...searchQueryParams,
                        instructorLastName: value,
                      })
                    }
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
                  onClick={() => submitSearch(true)}
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
