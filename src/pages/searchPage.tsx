/* eslint-disable react-hooks/exhaustive-deps */
import { Button, Grid, GridItem, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { redirectURL, UniversityCourseResponse } from "../components/types";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import SearchOptSelector from "../components/ui/searchOptSelector";
import InputBox from "../components/ui/inputBox";
import React from "react";
import { useSearchParams } from "react-router-dom";
import Worker from "../components/courseProcessorWorker.ts?worker";
import { Toaster } from "../components/ui/toaster";
import { toaster } from "../components/ui/toastFactory";
import { useSearchContext } from "../contextFactory";
import {
  getProfessorRatings,
  findClosestTeacherRating,
} from "../rateMyProfessorFetcher";
import Loading from "../components/ui/loading";
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
        label: `${currentYear + yearOffset} Winter`,
        value: `${+(Math.floor((currentYear + yearOffset) / 1000) * 100 + ((currentYear + yearOffset) % 100))}2`,
      });
      available_terms.push({
        label: `${currentYear + yearOffset} Spring`,
        value: `${+(Math.floor((currentYear + yearOffset) / 1000) * 100 + ((currentYear + yearOffset) % 100))}4`,
      });
      available_terms.push({
        label: `${currentYear + yearOffset} Summer`,
        value: `${+(Math.floor((currentYear + yearOffset) / 1000) * 100 + ((currentYear + yearOffset) % 100))}6`,
      });
      available_terms.push({
        label: `${currentYear + yearOffset} Fall`,
        value: `${+(Math.floor((currentYear + yearOffset) / 1000) * 100 + ((currentYear + yearOffset) % 100))}8`,
      });
    } else {
      // Follows the standard CSU Semester System
      //NOTE : To determine the term use the format CCYYSSS where CC is the century (e.g., 20), YY is the year (e.g., 22 for 2022), and SSS is the semester type (1 for Winter/Intersession, 3 for Spring, 5 for Summer, and 7 for Fall)
      // 2263 ==> Spring 2026

      available_terms.push({
        label: `${currentYear + yearOffset} Winter/Intersession`,
        value: `${+(Math.floor((currentYear + yearOffset) / 100) * 100 + (yearOffset % 100))}1`,
      });
      available_terms.push({
        label: `${currentYear + yearOffset} Spring`,
        value: `${+(Math.floor((currentYear + yearOffset) / 100) * 100 + ((currentYear + yearOffset) % 100)) + 3}`,
      });
      available_terms.push({
        label: `${currentYear + yearOffset} Summer`,
        value: `${+(Math.floor((currentYear + yearOffset) / 100) * 100 + ((currentYear + yearOffset) % 100)) + 5}`,
      });
      available_terms.push({
        label: `${currentYear + yearOffset} Fall`,
        value: `${+(Math.floor((currentYear + yearOffset) / 100) * 100 + ((currentYear + yearOffset) % 100)) + 7}`,
      });
    }
  }

  return available_terms;


const SearchPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const university = searchParams.get("university");
  const latestHistory = false;
  const {
    searchOptions,
    setSearchResults,
    searchQueryParams,
    setSearchQueryParams,
  } = useSearchContext();
  const [triggerWarning, setTriggerWarning] = useState(true);
  const [isWorkerReady, setIsWorkerReady] = useState(false);
  const dataWorkerRef = useRef<Worker | null>(null);
  const [performSearch, setPerformSearch] = useState(false);
  const [subject, setSubject] = useState<string[]>([]);
  const [fetchingAvailableSubjectCourses, setFetchingAvailableSubjectCourses] =
    useState(false);
  const [availableCourseNumbers, setAvailableCourseNumbers] = useState<
    { label: string; value: string }[]
  >([]);
  const [courseCatalogNum, setCourseCatalogNum] = useState<string[]>([]);
  const [courseAttributes, setCourseAttributes] = useState<string[]>([]);
  const [dayOfTheWeek, setDayOfTheWeek] = useState<string[]>([]);
  const [numberOfUnits, setNumberOfUnits] = useState<string[]>([]);
  const [startTime, setStartTime] = useState<string[]>([]);
  const [endTime, setEndTime] = useState<string[]>([]);
  const [instructMode, setInstructMode] = useState<string[]>([]);
  const [availableInstructorFirstNames, setAvailableInstructorFirstNames] =
    useState<{ label: string; value: string }[]>([]);
  const [instructorFirstName, setInstructorFirstName] = useState<string[]>([]);
  const [availableInstructorLastNames, setAvailableInstructorLastNames] =
    useState<{ label: string; value: string }[]>([]);
  const [instructorLastName, setInstructorLastName] = useState<string[]>([]);
  const [instructorScore, setInstructorScore] = useState<string>("");
  const [invalidInstructorScore, setInvalidInstructorScore] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string[]>([]);
  const [termType] = useState<"Semester" | "Quarter">("Quarter");
  const currentMonth = new Date().getMonth();

  const navigateToResults = useCallback(
    (data: UniversityCourseResponse[]) => {
      setSearchResults(data);
      navigate(`/results?university=${university}`);
    },
    [navigate, university, searchOptions],
  );

  useEffect(() => {
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
    setSearchTerm([currentTerm]);
  }, [currentMonth, searchOptions.selected_term, termType]);

  useEffect(() => {
    const dataWorker = new Worker();

    dataWorkerRef.current = dataWorker;
    dataWorker.onmessage = async (event) => {
      const { status, action, url, searchParams } = event.data;
      if (status === "ready") {
        setIsWorkerReady(true);
        return;
      }
      if (action === "IPC_REQUEST") {
        const result = await window.electronAPI.fetchCourses(url);
        dataWorker.postMessage({
          action: "processData",
          url,
          ...result,
          params: searchParams,
          forSearch: performSearch,
          university: university,
        }); // send the data to the worker for processing
      }
      if (action === "HISTORY_RESPONSE" && latestHistory) {
        const { success, data } = event.data;
        if (success) {
          setSubject(data.params.subject || []);
          setCourseAttributes(data.params.courseAttributes || []);
          setDayOfTheWeek(data.params.dayOfTheWeek || []);
          setNumberOfUnits(data.params.numberOfUnits || []);
          setStartTime(data.params.startTime || []);
          setEndTime(data.params.endTime || []);
          setInstructMode(data.params.instructMode || []);
          setInstructorScore(data.params.instructorScore || "");
          setTimeout(() => {
            // Any dynamically loaded data should wait for the fetch
            setCourseCatalogNum(data.params.courseCatalogNum || []);
            setInstructorFirstName(data.params.instructorFirstName || []);
            setInstructorLastName(data.params.instructorLastName || []);
          }, 2000);
          if (
            data.params.searchTerm &&
            data.params.searchTerm.length > 0 &&
            data.params.searchTerm[0] != searchTerm[0]
          ) {
            setSearchTerm(data.params.searchTerm);
          }
        }
      }
      if (action === "IPC_RESPONSE") {
        // eslint-disable-next-line prefer-const
        let { success, data } = event.data;
        if (performSearch) {
          if (instructorScore && instructorScore !== "") {
            const score = parseFloat(instructorScore);
            data = await getProfessorRatings(university || "").then(
              (ratings) => {
                if (ratings) {
                  return data.filter((course: UniversityCourseResponse) => {
                    const rating = findClosestTeacherRating(
                      ratings,
                      course.meetings[0]?.instructor || "",
                    );
                    return rating && rating.avgRating >= score;
                  });
                }
              },
            );
          }
          navigateToResults(data);
        }
        if (success) {
          setAvailableCourseNumbers(data.available_courses_set);
          setAvailableInstructorFirstNames(data.instructorFirstNameSet);
          setAvailableInstructorLastNames(data.instructorLastNameSet);
          setFetchingAvailableSubjectCourses(false);
        } else {
          console.error("Failed to process data.");
        }
      }
    
    return () => {
      if (dataWorkerRef.current) {
        dataWorkerRef.current.terminate();
      }
    
  }, [latestHistory, navigateToResults, performSearch, searchTerm]);

  const submitSearch = useCallback(() => {
    if (searchTerm.length < 1 || searchTerm[0] === "") {
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
              setSearchTerm([searchOptions.selected_term]);
            },
          },
        });
        setTriggerWarning(performSearch ? true : false);
      }
      return;
    }
    const searchParams = {
      subject: subject,
      courseCatalogNum: courseCatalogNum,
      courseAttributes: courseAttributes,
      dayOfTheWeek: dayOfTheWeek,
      numberOfUnits: numberOfUnits,
      startTime: startTime,
      endTime: endTime,
      instructMode: instructMode,
      instructorFirstName: instructorFirstName,
      instructorLastName: instructorLastName,
      instructorScore: instructorScore,
      searchTerm: searchTerm,
    
    const url = `${redirectURL[university as keyof typeof redirectURL]}?institution=${searchOptions.class_search_fields[0].INSTITUTION}&subject=${searchParams.subject.length > 0 ? searchParams.subject[0] : ""}&catalog_nbr=${searchParams.courseCatalogNum.length > 0 ? searchParams.courseCatalogNum[0] : ""}&start_time_ge=${searchParams.startTime.length > 0 ? searchParams.startTime[0] : ""}&end_time_le=${searchParams.endTime.length > 0 ? searchParams.endTime[0] : ""}&days=${searchParams.dayOfTheWeek.length > 0 ? encodeURIComponent(searchParams.dayOfTheWeek.join(",")) : ""}&instruction_mode=${searchParams.instructMode.length > 0 ? searchParams.instructMode[0] : ""}&crse_attr_value=${searchParams.courseAttributes.length > 0 ? searchParams.courseAttributes[0].replaceAll(" ", "+") : ""}&instructor_name=${searchParams.instructorLastName.length > 0 ? searchParams.instructorLastName[0] : ""}&instr_first_name=${searchParams.instructorFirstName.length > 0 ? searchParams.instructorFirstName[0] : ""}&units=${searchParams.numberOfUnits.length > 0 ? searchParams.numberOfUnits[0] : ""}&trigger_search=&term=${searchParams.searchTerm.length > 0 ? searchParams.searchTerm[0] : ""}`;
    if (isWorkerReady && dataWorkerRef.current) {
      dataWorkerRef.current.postMessage({
        action: "fetchCourses",
        url,
        university,
        params: searchParams,
        forSearch: performSearch,
      });
      setFetchingAvailableSubjectCourses(true);
    }
  }, [
    courseAttributes,
    courseCatalogNum,
    dayOfTheWeek,
    endTime,
    instructMode,
    instructorFirstName,
    instructorLastName,
    instructorScore,
    isWorkerReady,
    numberOfUnits,
    performSearch,
    searchOptions.class_search_fields,
    searchOptions.selected_term,
    startTime,
    subject,
    university,
  ]);

  useEffect(() => {
    setSearchQueryParams({
      subject,
      courseCatalogNum,
      courseAttributes,
      dayOfTheWeek,
      numberOfUnits,
      startTime,
      endTime,
      instructMode,
      instructorFirstName,
      instructorLastName,
      instructorScore,
      searchTerm,
      availableCourseNumbers,
      availableInstructorFirstNames,
      availableInstructorLastNames,
    });
  }, [
    subject,
    courseCatalogNum,
    courseAttributes,
    dayOfTheWeek,
    numberOfUnits,
    startTime,
    endTime,
    instructMode,
    instructorFirstName,
    instructorLastName,
    instructorScore,
    searchTerm,
    availableCourseNumbers,
    availableInstructorFirstNames,
    availableInstructorLastNames,
  ]);

  useEffect(() => {
    if (subject.length > 0 && subject[0] !== "") {
      submitSearch();
    }
  }, [subject, submitSearch]);

  useEffect(() => {
    if (performSearch) {
      submitSearch();
    }
  }, [performSearch, submitSearch]);

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
    setSubject(
      searchQueryParams.subject.length > 0 ? searchQueryParams.subject : [],
    );
  }, [subjectOptions]);

  useEffect(() => {
    setTimeout(
      () =>
        setCourseCatalogNum(
          searchQueryParams.courseCatalogNum.length > 0
            ? searchQueryParams.courseCatalogNum
            : [],
        ),
      1000,
    );
  }, []);

  useEffect(() => {
    if (
      searchQueryParams.searchTerm.length > 0 &&
      searchQueryParams.searchTerm[0] !== ""
    ) {
      setSearchTerm(searchQueryParams.searchTerm);
    }
  }, [availableTerms]);

  useEffect(() => {
    setStartTime(
      searchQueryParams.startTime.length > 0 ? searchQueryParams.startTime : [],
    );
    setEndTime(
      searchQueryParams.endTime.length > 0 ? searchQueryParams.endTime : [],
    );
  }, [availableTimes]);

  useEffect(() => {
    setCourseAttributes(
      searchQueryParams.courseAttributes.length > 0
        ? searchQueryParams.courseAttributes
        : [],
    );
  }, [courseAttributeOptions]);

  useEffect(() => {
    setInstructMode(
      searchQueryParams.instructMode.length > 0
        ? searchQueryParams.instructMode
        : [],
    );
  }, [instructModeOptions]);

  useEffect(() => {
    setNumberOfUnits(
      searchQueryParams.numberOfUnits.length > 0
        ? searchQueryParams.numberOfUnits
        : [],
    );
  }, [numberOfUnitsOptions]);

  useEffect(() => {
    setTimeout(
      () =>
        setInstructorFirstName(
          searchQueryParams.instructorFirstName.length > 0
            ? searchQueryParams.instructorFirstName
            : [],
        ),
      1000,
    );
  }, []);

  useEffect(() => {
    setTimeout(
      () =>
        setInstructorLastName(
          searchQueryParams.instructorLastName.length > 0
            ? searchQueryParams.instructorLastName
            : [],
        ),
      1000,
    );
  }, []);

  useEffect(() => {
    setDayOfTheWeek(
      searchQueryParams.dayOfTheWeek.length > 0
        ? searchQueryParams.dayOfTheWeek
        : [],
    );
  }, [dayOfTheWeekOptions]);

  useEffect(() => {
    setInstructorScore(searchQueryParams.instructorScore || "");
  }, []);

  // useCallback handlers for all selectors
  const handleSubjectChange = React.useCallback((value: string[]) => {
    if (value.length == 0 || value[0] === "") {
      setAvailableCourseNumbers([]);
      setAvailableInstructorFirstNames([]);
      setAvailableInstructorLastNames([]);
      setCourseCatalogNum([]);
      setInstructorFirstName([]);
      setInstructorLastName([]);
      setSubject([]);
    } else {
      setSubject(value);
    }
  }, []);

  const handleCourseAttributesChange = React.useCallback(
    (value: string[]) => setCourseAttributes(value),
    [],
  );
  const handleDayOfTheWeekChange = React.useCallback((value: string[]) => {
    if (value.includes("any")) {
      setDayOfTheWeek(["any"]);
    } else if (value.includes("MTWTF")) {
      setDayOfTheWeek(["MTWTF"]);
    } else {
      setDayOfTheWeek(value);
    }
  }, []);
  const handleSearchTermChange = React.useCallback(
    (value: string[]) => setSearchTerm(value),
    [],
  );
  const handleNumberOfUnitsChange = React.useCallback(
    (value: string[]) => setNumberOfUnits(value),
    [],
  );
  const handleStartTimeChange = React.useCallback(
    (value: string[]) => setStartTime(value),
    [],
  );
  const handleEndTimeChange = React.useCallback(
    (value: string[]) => setEndTime(value),
    [],
  );
  const handleInstructModeChange = React.useCallback(
    (value: string[]) => setInstructMode(value),
    [],
  );
  const handleInstructorFirstNameChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setInstructorFirstName([e.target.value]),
    [],
  );
  const handleInstructorLastNameChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setInstructorLastName([e.target.value]),
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
      setInvalidInstructorScore(false);
      setInstructorScore(e.target.value);
    },
    [],
  );

  useEffect(() => {
    if (latestHistory && isWorkerReady && dataWorkerRef.current) {
      dataWorkerRef.current.postMessage({
        action: "getSearchHistory",
        latestOnly: true,
      });
    }
  }, [latestHistory, isWorkerReady]);

  return (
    <>
      {performSearch ? (
        <Loading message="Searching for courses..." />
      ) : (
        <>
          <div className={styles.searchFiltersContainer}>
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
                  selectedValue={subject || [""]}
                  setSelectedValue={handleSubjectChange}
                  options={subjectOptions}
                  label="Subject"
                  multiple={false}
                />
              </GridItem>
              <GridItem colSpan={1}>
                {availableCourseNumbers && availableCourseNumbers.length > 0 ? (
                  <SearchOptSelector
                    selectedValue={courseCatalogNum || [""]}
                    setSelectedValue={setCourseCatalogNum}
                    options={availableCourseNumbers}
                    label="Course Catalog Number"
                    multiple={false}
                  />
                ) : (
                  <InputBox
                    label="Course Catalog Number"
                    value={courseCatalogNum[0] || ""}
                    onChange={(e) => setCourseCatalogNum([e.target.value])}
                    loadingData={fetchingAvailableSubjectCourses}
                  />
                )}
              </GridItem>
              <GridItem colSpan={1}>
                <SearchOptSelector
                  selectedValue={courseAttributes || [""]}
                  setSelectedValue={handleCourseAttributesChange}
                  options={courseAttributeOptions}
                  label="Course Attributes"
                  multiple={true}
                />
              </GridItem>
              <GridItem colSpan={1}>
                <SearchOptSelector
                  selectedValue={dayOfTheWeek || [""]}
                  setSelectedValue={handleDayOfTheWeekChange}
                  options={dayOfTheWeekOptions}
                  label="Day of the Week"
                  multiple={
                    dayOfTheWeek.includes("any") ||
                    dayOfTheWeek.includes("MTWTF")
                      ? false
                      : true
                  }
                />
              </GridItem>
              <GridItem colSpan={1}>
                <SearchOptSelector
                  selectedValue={searchTerm || [""]}
                  setSelectedValue={handleSearchTermChange}
                  options={availableTerms}
                  label="Term"
                  multiple={false}
                />
              </GridItem>
              <GridItem colSpan={1}>
                <SearchOptSelector
                  selectedValue={numberOfUnits || [""]}
                  setSelectedValue={handleNumberOfUnitsChange}
                  options={numberOfUnitsOptions}
                  label="Number of Units"
                  multiple={false}
                />
              </GridItem>
              <GridItem colSpan={1}>
                <SearchOptSelector
                  selectedValue={startTime || [""]}
                  setSelectedValue={handleStartTimeChange}
                  options={availableTimes}
                  label="Start Time"
                  multiple={false}
                />
              </GridItem>
              <GridItem colSpan={1}>
                <SearchOptSelector
                  selectedValue={endTime || [""]}
                  setSelectedValue={handleEndTimeChange}
                  options={availableTimes}
                  label="End Time"
                  multiple={false}
                />
              </GridItem>
              <GridItem colSpan={1}>
                <SearchOptSelector
                  selectedValue={instructMode || [""]}
                  setSelectedValue={handleInstructModeChange}
                  options={instructModeOptions}
                  label="Instruction Mode"
                  multiple={false}
                />
              </GridItem>
              <GridItem colSpan={1}>
                {availableInstructorFirstNames &&
                availableInstructorFirstNames.length > 0 ? (
                  <SearchOptSelector
                    selectedValue={instructorFirstName || [""]}
                    setSelectedValue={setInstructorFirstName}
                    options={availableInstructorFirstNames}
                    label="Instructor First Name"
                    multiple={false}
                  />
                ) : (
                  <InputBox
                    label="Instructor First Name"
                    value={instructorFirstName[0] || ""}
                    onChange={handleInstructorFirstNameChange}
                    loadingData={fetchingAvailableSubjectCourses}
                  />
                )}
              </GridItem>
              <GridItem colSpan={1}>
                {availableInstructorLastNames &&
                availableInstructorLastNames.length > 0 ? (
                  <SearchOptSelector
                    selectedValue={instructorLastName || [""]}
                    setSelectedValue={setInstructorLastName}
                    options={availableInstructorLastNames}
                    label="Instructor Last Name"
                    multiple={false}
                  />
                ) : (
                  <InputBox
                    label="Instructor Last Name"
                    value={instructorLastName[0] || ""}
                    onChange={handleInstructorLastNameChange}
                    loadingData={fetchingAvailableSubjectCourses}
                  />
                )}
              </GridItem>
              <GridItem colSpan={1}>
                <InputBox
                  label="Instructor Score"
                  value={instructorScore}
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
                {/* <Button onClick={() => setPerformSearch(true)} bg="brand.500" style={{ color: "white" }} _hover={{ bg: "brand.400" }} isDisabled={fetchingAvailableSubjectCourses || subject.length === 0 || subject[0] === ""} width="100%">
              Previous Searches
            </Button> */}
              </GridItem>
              <GridItem colSpan={1}>
                <Button
                  onClick={() => setPerformSearch(true)}
                  className={styles.button}
                  width="100%"
                >
                  Search
                </Button>
              </GridItem>
            </Grid>
          </div>
          <Toaster />
        </>
      )}
    </>
  );


export default SearchPage;
