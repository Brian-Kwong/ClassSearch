import { Button, Grid, GridItem, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import {
  redirectURL,
  SearchParamJson,
  UniversityCourseResponse,
} from "../components/types";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import SearchOptSelector from "../components/ui/searchOptSelector";
import InputBox from "../components/ui/inputBox";
import React from "react";
import { useSearchParams } from "react-router-dom";
import Worker from "../components/apiWorker.ts?worker";
import { Toaster } from "../components/ui/toaster";
import { toaster } from "../components/ui/toastFactory";

const dayOfTheWeekOptions = [
  { label: "Any Day", value: "any" },
  { label: "All Weekdays", value: "MTWTF" },
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
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const university = searchParams.get("university");
  const latestHistory = searchParams.get("latestHistory") === "true";
  const searchOptions = useMemo(
    () => (location.state.searchOptions as SearchParamJson) || {},
    [location.state.searchOptions],
  );
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
  const [courseCatalogNum, setCourseCatalogNum] = useState<string[]>([""]);
  const [courseAttributes, setCourseAttributes] = useState<string[]>([]);
  const [dayOfTheWeek, setDayOfTheWeek] = useState<string[]>([]);
  const [numberOfUnits, setNumberOfUnits] = useState<string[]>([]);
  const [startTime, setStartTime] = useState<string[]>([]);
  const [endTime, setEndTime] = useState<string[]>([]);
  const [instructMode, setInstructMode] = useState<string[]>([]);
  const [availableInstructorFirstNames, setAvailableInstructorFirstNames] =
    useState<{ label: string; value: string }[]>([]);
  const [instructorFirstName, setInstructorFirstName] = useState<string[]>([
    "",
  ]);
  const [availableInstructorLastNames, setAvailableInstructorLastNames] =
    useState<{ label: string; value: string }[]>([]);
  const [instructorLastName, setInstructorLastName] = useState<string[]>([""]);
  const [instructorScore, setInstructorScore] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string[]>([]);
  const [termType] = useState<"Semester" | "Quarter">("Quarter");
  const currentMonth = new Date().getMonth();
  const availableTimes = useMemo(
    () => [
      { label: `12:00 AM`, value: `12:00 AM` },
      ...Array.from({ length: 11 }, (_, i) => ({
        label: `${i + 1}:00 AM`,
        value: `${i + 1}:00 AM`,
      })),
      { label: "12:00 PM", value: "12:00 PM" },
      ...Array.from({ length: 11 }, (_, i) => ({
        label: `${i + 1}:00 PM`,
        value: `${i + 1}:00 PM`,
      })),
    ],
    [],
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

  const navigateToResults = useCallback(
    (data: UniversityCourseResponse[]) => {
      navigate(`/results?university=${university}`, {
        state: { searchResults: data, searchOptions },
      });
    },
    [navigate, university, searchOptions],
  );

  useEffect(() => {
    const dataWorker = new Worker();

    dataWorkerRef.current = dataWorker;
    dataWorker.onmessage = async (event) => {
      const { status, action, url } = event.data;
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
          params: event.data.searchParams,
          forSearch: performSearch,
        }); // send the data to the worker for processing
      }
      if (action === "HISTORY_RESPONSE" && latestHistory) {
        const { success, data } = event.data;
        if (success) {
          setSubject(data.params.subject || []);
          setCourseCatalogNum(data.params.catalog_nbr || []);
          setCourseAttributes(data.params.crse_attr_value || []);
          setDayOfTheWeek(data.params.days || []);
          setNumberOfUnits(data.params.units || []);
          setStartTime(data.params.start_time_ge || []);
          setEndTime(data.params.end_time_le || []);
          setInstructMode(data.params.instruction_mode || []);
          setInstructorFirstName(data.params.instr_first_name || []);
          setInstructorLastName(data.params.instructor_name || []);
          setInstructorScore(data.params.instructor_score || "");
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
        const { success, data } = event.data;
        if (performSearch) {
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
    
    const url = `${redirectURL[university as keyof typeof redirectURL]}?institution=${searchOptions.class_search_fields[0].INSTITUTION}&term=${searchParams.searchTerm.length > 0 ? searchParams.searchTerm[0] : ""}&subject=${searchParams.subject.length > 0 ? searchParams.subject[0] : ""}&catalog_nbr=${searchParams.courseCatalogNum.length > 0 ? searchParams.courseCatalogNum[0] : ""}&start_time_ge=${searchParams.startTime.length > 0 ? searchParams.startTime[0] : ""}&end_time_le=${searchParams.endTime.length > 0 ? searchParams.endTime[0] : ""}&days=${searchParams.dayOfTheWeek.length > 0 ? encodeURIComponent(searchParams.dayOfTheWeek.join(",")) : ""}&instruction_mode=${searchParams.instructMode.length > 0 ? searchParams.instructMode[0] : ""}&crse_attr_value=${encodeURIComponent(searchParams.courseAttributes.length > 0 ? searchParams.courseAttributes[0] : "")}&instructor_name=${searchParams.instructorLastName.length > 0 ? searchParams.instructorLastName[0] : ""}&instr_first_name=${searchParams.instructorFirstName.length > 0 ? searchParams.instructorFirstName[0] : ""}&units=${searchParams.numberOfUnits.length > 0 ? searchParams.numberOfUnits[0] : ""}&trigger_search=&page=1`;
    if (isWorkerReady && dataWorkerRef.current) {
      dataWorkerRef.current.postMessage({
        action: "fetchCourses",
        url,
        params: searchParams,
        forSearch: performSearch,
      });
      setFetchingAvailableSubjectCourses(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    if (subject.length > 0 && subject[0] !== "") {
      submitSearch();
    }
  }, [subject, submitSearch]);

  useEffect(() => {
    if (performSearch) {
      submitSearch();
    }
  }, [performSearch, submitSearch]);

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

  // useCallback handlers for all selectors
  const handleSubjectChange = React.useCallback((value: string[]) => {
    if (value.length == 0 || value[0] === "") {
      setAvailableCourseNumbers([]);
      setAvailableInstructorFirstNames([]);
      setAvailableInstructorLastNames([]);
      setCourseCatalogNum([""]);
      setInstructorFirstName([""]);
      setInstructorLastName([""]);
      setSubject([""]);
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
      toaster.create({
        type: "warning",
        title: "Instructor Score Feature not implemented yet",
        description: "This feature will be added in future releases.",
      });
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
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "20px",
          gap: "20px",
          maxWidth: "50vw",
        }}
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
                dayOfTheWeek.includes("any") || dayOfTheWeek.includes("MTWTF")
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
        <Button onClick={() => setPerformSearch(true)} bg="brand.300">
          Search
        </Button>
      </div>
      <Toaster />
    </>
  );


export default SearchPage;
