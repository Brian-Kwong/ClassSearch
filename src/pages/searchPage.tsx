import { Button, Text } from "@chakra-ui/react";
import { useLocation } from "react-router-dom";
import { redirectURL, SearchParamJson } from "../components/types";
import { useState, useEffect, useMemo, useRef } from "react";
import SearchOptSelector from "../components/ui/search-opt-selector";
import InputBox from "../components/ui/inputBox";
import React from "react";
import { useSearchParams } from "react-router-dom";
import Worker from "../components/apiWorker.ts?worker";

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
  const [searchParams] = useSearchParams();
  const university = searchParams.get("university");
  const searchOptions = (location.state.searchOptions as SearchParamJson) || {
  const [isWorkerReady, setIsWorkerReady] = useState(false);
  const dataWorkerRef = useRef<Worker | null>(null);
  const [subject, setSubject] = useState<string[]>([]);
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
  const [instructorFirstName, setInstructorFirstName] = useState<string>("");
  const [instructorLastName, setInstructorLastName] = useState<string>("");
  const [instructorScore, setInstructorScore] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string[]>([]);
  const [termType] = useState<"Semester" | "Quarter">("Quarter");
  const currentMonth = new Date().getMonth();
  const availableTimes = useMemo(
    () =>
      [{ label: `12:00 AM`, value: `12:00 AM` }].concat(
        Array.from({ length: 11 }, (_, i) => ({
          label: `${i + 1}:00 AM`,
          value: `${i + 1}.00`,
        }))
          .concat({ label: "12:00 PM", value: "12:00 PM" })
          .concat(
            Array.from({ length: 11 }, (_, i) => ({
              label: `${i + 1}:00 PM`,
              value: `${i + (i % 12) + 12}.00`,
            })),
          ),
      ),
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subject]);

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
        dataWorker.postMessage({ action: "processData", ...result });
      }
      if (action === "IPC_RESPONSE") {
        const { success, data } = event.data;
        if (success) {
          setAvailableCourseNumbers(data);
        } else {
          console.error("Failed to process data.");
        }
      }
    
    return () => {
      if (dataWorkerRef.current) {
        dataWorkerRef.current.terminate();
      }
    
  }, []);

  const submitSearch = () => {
    const searchParams = {
      subject: subject.length > 0 ? subject[0] : "",
      courseCatalogNum: courseCatalogNum.length > 0 ? courseCatalogNum[0] : "",
      courseAttributes: courseAttributes.length > 0 ? courseAttributes[0] : "",
      dayOfTheWeek: dayOfTheWeek.length > 0 ? dayOfTheWeek[0] : "",
      numberOfUnits: numberOfUnits.length > 0 ? numberOfUnits[0] : "",
      startTime: startTime.length > 0 ? startTime[0] : "",
      endTime: endTime.length > 0 ? endTime[0] : "",
      instructMode: instructMode.length > 0 ? instructMode[0] : "",
      instructorFirstName:
        instructorFirstName.length > 0 ? instructorFirstName : "",
      instructorLastName:
        instructorLastName.length > 0 ? instructorLastName : "",
      instructorScore: instructorScore.length > 0 ? instructorScore : "",
      searchTerm: searchTerm.length > 0 ? searchTerm[0] : "",
    
    const url = `${redirectURL[university as keyof typeof redirectURL]}?institution=${searchOptions.class_search_fields[0].INSTITUTION}&term=${searchParams.searchTerm}&subject=${searchParams.subject}&catalog_nbr=${searchParams.courseCatalogNum}&start_time_ge=${searchParams.startTime}&end_time_le=${searchParams.endTime}&days=${searchParams.dayOfTheWeek}&instruction_mode=${searchParams.instructMode}&crse_attr_value=${encodeURIComponent(searchParams.courseAttributes)}&instructor_name=${searchParams.instructorLastName}&instr_first_name=${searchParams.instructorFirstName}&units=${searchParams.numberOfUnits}&trigger_search=&page=1`;
    if (isWorkerReady && dataWorkerRef.current) {
      dataWorkerRef.current.postMessage({ action: "fetchCourses", url });
    }
  

  const availableTerms = useMemo(
    () => generate_available_terms(termType),
    [termType],
  );

  // Memoized options for performance
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
  const handleSubjectChange = React.useCallback(
    (value: string[]) => setSubject(value),
    [],
  );
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
      setInstructorFirstName(e.target.value),
    [],
  );
  const handleInstructorLastNameChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setInstructorLastName(e.target.value),
    [],
  );
  const handleInstructorScoreChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setInstructorScore(e.target.value),
    [],
  );

  return (
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
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          gap: "10px",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <div style={{ flex: "0 0 auto" }}>
          <SearchOptSelector
            selectedValue={subject || [""]}
            setSelectedValue={handleSubjectChange}
            options={subjectOptions}
            label="Subject"
            multiple={false}
          />
        </div>
        <div style={{ flex: "0 0 auto" }}>
          {availableCourseNumbers.length > 0 ? (
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
            />
          )}
        </div>
        <div style={{ flex: "0 0 auto" }}>
          <SearchOptSelector
            selectedValue={courseAttributes || [""]}
            setSelectedValue={handleCourseAttributesChange}
            options={courseAttributeOptions}
            label="Course Attributes"
            multiple={true}
          />
        </div>
        <div style={{ flex: "0 0 auto" }}>
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
        </div>
        <div style={{ flex: "0 0 auto" }}>
          <SearchOptSelector
            selectedValue={searchTerm || [""]}
            setSelectedValue={handleSearchTermChange}
            options={availableTerms}
            label="Term"
            multiple={false}
          />
        </div>
        <div style={{ flex: "0 0 auto" }}>
          <SearchOptSelector
            selectedValue={numberOfUnits || [""]}
            setSelectedValue={handleNumberOfUnitsChange}
            options={numberOfUnitsOptions}
            label="Number of Units"
            multiple={false}
          />
        </div>
        <div style={{ flex: "0 0 auto" }}>
          <SearchOptSelector
            selectedValue={startTime || [""]}
            setSelectedValue={handleStartTimeChange}
            options={availableTimes}
            label="Start Time"
            multiple={false}
          />
        </div>
        <div style={{ flex: "0 0 auto" }}>
          <SearchOptSelector
            selectedValue={endTime || [""]}
            setSelectedValue={handleEndTimeChange}
            options={availableTimes}
            label="End Time"
            multiple={false}
          />
        </div>
        <div style={{ flex: "0 0 auto" }}>
          <SearchOptSelector
            selectedValue={instructMode || [""]}
            setSelectedValue={handleInstructModeChange}
            options={instructModeOptions}
            label="Instruction Mode"
            multiple={false}
          />
        </div>
        <div style={{ flex: "0 0 auto" }}>
          <InputBox
            label="Instructor First Name"
            value={instructorFirstName}
            onChange={handleInstructorFirstNameChange}
          />
        </div>
        <div style={{ flex: "0 0 auto" }}>
          <InputBox
            label="Instructor Last Name"
            value={instructorLastName}
            onChange={handleInstructorLastNameChange}
          />
        </div>
        <div style={{ flex: "0 0 auto" }}>
          <InputBox
            label="Instructor Score"
            value={instructorScore}
            onChange={handleInstructorScoreChange}
          />
        </div>
      </div>
      <Button onClick={() => submitSearch()} bg="brand.300">
        Search
      </Button>
    </div>
  );


export default SearchPage;
