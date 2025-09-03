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
  const latestHistory = true;
  const searchOptions = useMemo(
    () => (location.state.searchOptions as SearchParamJson) || {},
    [location.state.searchOptions],
  );
  const [isWorkerReady, setIsWorkerReady] = useState(false);
  const dataWorkerRef = useRef<Worker | null>(null);
  const [performSearch, setPerformSearch] = useState(false);
  const [fetchingAvailableSubjectCourses, setFetchingAvailableSubjectCourses] =
    useState(false);
  const [searchState, setSearchState] = useState<{
    subject: string[];
    availableCourseNumbers: { label: string; value: string }[];
    courseCatalogNum: string[];
    courseAttributes: string[];
    dayOfTheWeek: string[];
    numberOfUnits: string[];
    startTime: string[];
    endTime: string[];
    instructMode: string[];
    availableInstructorFirstNames: { label: string; value: string }[];
    instructorFirstName: string[];
    availableInstructorLastNames: { label: string; value: string }[];
    instructorLastName: string[];
    instructorScore: string;
    searchTerm: string[];
  }>({
    subject: [],
    availableCourseNumbers: [],
    courseCatalogNum: [""],
    courseAttributes: [],
    dayOfTheWeek: [],
    numberOfUnits: [],
    startTime: [],
    endTime: [],
    instructMode: [],
    availableInstructorFirstNames: [],
    instructorFirstName: [""],
    availableInstructorLastNames: [],
    instructorLastName: [""],
    instructorScore: "",
    searchTerm: [],
  });
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
    if (searchState.searchTerm[0] !== currentTerm) {
      setSearchState((prev) => ({ ...prev, searchTerm: [currentTerm] }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      if(action === "HISTORY_RESPONSE" && latestHistory) {
        const { success, data } = event.data;
        if (success) {
          setSearchState((prev) => ({
            ...prev,
            subject: data.params.subject || [],
            courseCatalogNum: data.params.catalog_nbr || [],
            courseAttributes: data.params.crse_attr_value || [],
            dayOfTheWeek: data.params.days || [],
            numberOfUnits: data.params.units || [],
            startTime: data.params.start_time_ge || [],
            endTime: data.params.end_time_le || [],
            instructMode: data.params.instruction_mode || [],
            instructorFirstName: data.params.instr_first_name || [],
            instructorLastName: data.params.instructor_name || [],
            instructorScore: data.params.instructor_score || "",
            searchTerm: (data.params.searchTerm && data.params.searchTerm.length > 0 && data.params.searchTerm[0] != prev.searchTerm[0]) ? data.params.searchTerm : prev.searchTerm,
          }));
        }
      }
      if (action === "IPC_RESPONSE") {
        const { success, data,  } = event.data;
        if (performSearch) {
          navigateToResults(data);
        }
        if (success) {
          setSearchState((prev) => ({
            ...prev,
            availableCourseNumbers: data.available_courses_set,
            availableInstructorFirstNames: data.instructorFirstNameSet,
            availableInstructorLastNames: data.instructorLastNameSet,
          }));
          setFetchingAvailableSubjectCourses(false);
        } else {
          console.error("Failed to process data.");
        }
      }
    
    return () => {
      if (dataWorkerRef.current) {
        dataWorkerRef.current.terminate();
      }
    
  }, [performSearch, navigateToResults, latestHistory, searchState.searchTerm]);

  const submitSearch = useCallback(() => {
  if (searchState.searchTerm.length < 1 || searchState.searchTerm[0] === "") {
      return toaster.create({
        type: performSearch ? "error" : "warning",
        title: "No term selected",
        description: performSearch
          ? "Please select a term and try again."
          : "Some autocomplete features will be disabled until a term is selected.",
        duration: 2000,
        action: {
          label: "Select Default Term",
          onClick: () => {
            setSearchState((prev) => ({ ...prev, searchTerm: [searchOptions.selected_term] }));
          },
        },
      });
    }
    const searchParams = {
  subject: searchState.subject,
  courseCatalogNum: searchState.courseCatalogNum,
  courseAttributes: searchState.courseAttributes,
  dayOfTheWeek: searchState.dayOfTheWeek,
  numberOfUnits: searchState.numberOfUnits,
  startTime: searchState.startTime,
  endTime: searchState.endTime,
  instructMode: searchState.instructMode,
  instructorFirstName: searchState.instructorFirstName,
  instructorLastName: searchState.instructorLastName,
  instructorScore: searchState.instructorScore,
  searchTerm: searchState.searchTerm
    
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
  }, [
    searchState.subject,
    searchState.courseCatalogNum,
    searchState.courseAttributes,
    searchState.dayOfTheWeek,
    searchState.numberOfUnits,
    searchState.startTime,
    searchState.endTime,
    searchState.instructMode,
    searchState.instructorFirstName,
    searchState.instructorLastName,
    searchState.instructorScore,
    searchState.searchTerm,
    university,
    searchOptions,
    isWorkerReady,
    dataWorkerRef,
    performSearch,
  ]);

  useEffect(() => {
    if (searchState.subject.length > 0 && searchState.subject[0] !== "") {
      submitSearch();
    }
  }, [searchState.subject, submitSearch]);

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


  const handleSubjectChange = React.useCallback((value: string[]) => {
    if (value.length === 0 || value[0] === "") {
      setSearchState((prev) => ({
        ...prev,
        availableCourseNumbers: [],
        availableInstructorFirstNames: [],
        availableInstructorLastNames: [],
        courseCatalogNum: [""],
        instructorFirstName: [""],
        instructorLastName: [""],
        subject: [""]
      }));
    } else {
      setSearchState((prev) => ({ ...prev, subject: value }));
    }
  }, []);

  useEffect(() => {
    if(latestHistory && isWorkerReady && dataWorkerRef.current) {
      dataWorkerRef.current.postMessage({
        action: "getSearchHistory",
        latestOnly: true,
      });
    }
  }, [latestHistory, isWorkerReady])

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
              selectedValue={searchState.subject || [""]}
              setSelectedValue={handleSubjectChange}
              options={subjectOptions}
              label="Subject"
              multiple={false}
            />
          </GridItem>
          <GridItem colSpan={1}>
            {searchState.availableCourseNumbers && searchState.availableCourseNumbers.length > 0 ? (
              <SearchOptSelector
                selectedValue={searchState.courseCatalogNum || [""]}
                setSelectedValue={(value) => setSearchState((prev) => ({ ...prev, courseCatalogNum: value }))}
                options={searchState.availableCourseNumbers}
                label="Course Catalog Number"
                multiple={false}
              />
            ) : (
              <InputBox
                label="Course Catalog Number"
                value={searchState.courseCatalogNum[0] || ""}
                onChange={(e) => setSearchState((prev) => ({ ...prev, courseCatalogNum: [e.target.value] }))}
                loadingData={fetchingAvailableSubjectCourses}
              />
            )}
          </GridItem>
          <GridItem colSpan={1}>
            <SearchOptSelector
              selectedValue={searchState.courseAttributes || [""]}
              setSelectedValue={(value) => setSearchState((prev) => ({ ...prev, courseAttributes: value }))}
              options={courseAttributeOptions}
              label="Course Attributes"
              multiple={true}
            />
          </GridItem>
          <GridItem colSpan={1}>
            <SearchOptSelector
              selectedValue={searchState.dayOfTheWeek || [""]}
              setSelectedValue={(value) => setSearchState((prev) => ({ ...prev, dayOfTheWeek: value }))}
              options={dayOfTheWeekOptions}
              label="Day of the Week"
              multiple={
                searchState.dayOfTheWeek.includes("any") || searchState.dayOfTheWeek.includes("MTWTF")
                  ? false
                  : true
              }
            />
          </GridItem>
          <GridItem colSpan={1}>
            <SearchOptSelector
              selectedValue={searchState.searchTerm || [""]}
              setSelectedValue={(value) => setSearchState((prev) => ({ ...prev, searchTerm: value }))}
              options={availableTerms}
              label="Term"
              multiple={false}
            />
          </GridItem>
          <GridItem colSpan={1}>
            <SearchOptSelector
              selectedValue={searchState.numberOfUnits || [""]}
              setSelectedValue={(value) => setSearchState((prev) => ({ ...prev, numberOfUnits: value }))}
              options={numberOfUnitsOptions}
              label="Number of Units"
              multiple={false}
            />
          </GridItem>
          <GridItem colSpan={1}>
            <SearchOptSelector
              selectedValue={searchState.startTime || [""]}
              setSelectedValue={(value) => setSearchState((prev) => ({ ...prev, startTime: value }))}
              options={availableTimes}
              label="Start Time"
              multiple={false}
            />
          </GridItem>
          <GridItem colSpan={1}>
            <SearchOptSelector
              selectedValue={searchState.endTime || [""]}
              setSelectedValue={(value) => setSearchState((prev) => ({ ...prev, endTime: value }))}
              options={availableTimes}
              label="End Time"
              multiple={false}
            />
          </GridItem>
          <GridItem colSpan={1}>
            <SearchOptSelector
              selectedValue={searchState.instructMode || [""]}
              setSelectedValue={(value) => setSearchState((prev) => ({ ...prev, instructMode: value }))}
              options={instructModeOptions}
              label="Instruction Mode"
              multiple={false}
            />
          </GridItem>
          <GridItem colSpan={1}>
            {searchState.availableInstructorFirstNames && searchState.availableInstructorFirstNames.length > 0 ? (
              <SearchOptSelector
                selectedValue={searchState.instructorFirstName || [""]}
                setSelectedValue={(value) => setSearchState((prev) => ({ ...prev, instructorFirstName: value }))}
                options={searchState.availableInstructorFirstNames}
                label="Instructor First Name"
                multiple={false}
              />
            ) : (
              <InputBox
                label="Instructor First Name"
                value={searchState.instructorFirstName[0] || ""}
                onChange={(e) => setSearchState((prev) => ({ ...prev, instructorFirstName: [e.target.value] }))}
                loadingData={fetchingAvailableSubjectCourses}
              />
            )}
          </GridItem>
          <GridItem colSpan={1}>
            {searchState.availableInstructorLastNames && searchState.availableInstructorLastNames.length > 0 ? (
              <SearchOptSelector
                selectedValue={searchState.instructorLastName || [""]}
                setSelectedValue={(value) => setSearchState((prev) => ({ ...prev, instructorLastName: value }))}
                options={searchState.availableInstructorLastNames}
                label="Instructor Last Name"
                multiple={false}
              />
            ) : (
              <InputBox
                label="Instructor Last Name"
                value={searchState.instructorLastName[0] || ""}
                onChange={(e) => setSearchState((prev) => ({ ...prev, instructorLastName: [e.target.value] }))}
                loadingData={fetchingAvailableSubjectCourses}
              />
            )}
          </GridItem>
          <GridItem colSpan={1}>
            <InputBox
              label="Instructor Score"
              value={searchState.instructorScore}
              onChange={(e) => setSearchState((prev) => ({ ...prev, instructorScore: e.target.value }))}
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
