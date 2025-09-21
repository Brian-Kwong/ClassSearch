import { Card, HStack, Stack, Icon, Text, Accordion } from "@chakra-ui/react";
import { useTheme } from "next-themes";
import { LuBuilding2 } from "react-icons/lu";
import { Box } from "@chakra-ui/react";
import { Component } from "lucide-react";
import { IoIosCube } from "react-icons/io";
import { RiListCheck } from "react-icons/ri";
import { FaRegClock, FaCalendarDay, FaChalkboardTeacher } from "react-icons/fa";
import { Icon as Iconify } from "@iconify/react";
import {
  TeacherRatings,
  UniversityCourseResponse,
  UniversityCourseDetailsResponse,
} from "../types";
import { useSearchContext } from "../context/contextFactory";
import DaysOfTheWeek from "../../assets/daysOfWeek.svg?react";
import React from "react";
import fetchClassDetails from "../classDetailFetcher";
import styles from "../../css-styles/classInfoCard.module.css";

function formatTime(timeString: string): string | undefined {
  try {
    return timeString.replace(".", ":").replace(".", ":").split(".")[0];
  } catch {
    return undefined; // If failed to parse just return original string
  }
}
const PREREQUISITE_REGEX = /Prerequisite: (.+?)\./;

const ClassInfoCard = ({
  university,
  course,
  iconName,
  professorRating,
}: {
  university: string;
  course: UniversityCourseResponse;
  iconName: { lib: string; name: string };
  professorRating?: TeacherRatings;
}) => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  const { searchOptions, searchQueryParams, settings } = useSearchContext();
  const [fetchingDetails, setFetchingDetails] = React.useState(false);
  const [fetchedDetails, setFetchedDetails] = React.useState(false);
  const [courseDetails, setCourseDetails] =
    React.useState<UniversityCourseDetailsResponse | null>(null);
  const textColor = isDarkMode ? "white" : "black";
  const getClassDetailsDebounceRef = React.useRef<NodeJS.Timeout | null>(null);

  const loadCourseDetails = React.useCallback(() => {
    getClassDetailsDebounceRef.current = setTimeout(
      async () => {
        if (fetchedDetails) return;
        if (fetchingDetails) return;
        setFetchingDetails(true);
        if (!university || !searchOptions || !searchQueryParams) return;
        const details = await fetchClassDetails(
          university,
          searchOptions.class_search_fields[0].INSTITUTION,
          searchQueryParams.searchTerm[0],
          course.class_nbr,
          parseInt(settings["Class Details Cache Duration"]) || 1,
        );
        if (details) {
          setFetchedDetails(true);
          setFetchingDetails(false);
          setCourseDetails(details);
        }
      },
      settings["Prefetch Details when Hovering"] === "true" ? 500 : 0,
    );
    return () => {
      if (getClassDetailsDebounceRef.current) {
        clearTimeout(getClassDetailsDebounceRef.current);
      }
    };
    // No need to redefine a static debounce function
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearClassDetailsDebounce = React.useCallback(() => {
    if (getClassDetailsDebounceRef.current) {
      clearTimeout(getClassDetailsDebounceRef.current);
    }
  }, []);

  return (
    <Accordion.Root collapsible>
      <Accordion.Item value={`${course.index}`}>
        <Accordion.ItemTrigger>
          <Card.Root
            marginTop={2}
            marginBottom={2}
            width={"100%"}
            boxShadow={isDarkMode ? "dark-lg" : "lg"}
            background={isDarkMode ? "gray.700" : "gray.100"}
            onMouseEnter={() => {
              if (settings["Prefetch Details when Hovering"] === "true") {
                loadCourseDetails();
              }
            }}
            onMouseLeave={() => {
              if (settings["Prefetch Details when Hovering"] === "true") {
                clearClassDetailsDebounce();
              }
            }}
            onClick={() => {
              if (settings["Prefetch Details when Hovering"] === "false") {
                loadCourseDetails();
              }
            }}
          >
            <Card.Body gap={4}>
              <Card.Title
                flexDirection={"row"}
                display={"flex"}
                justifyContent={"space-between"}
                gap={4}
                height={"max-content"}
              >
                <Text>
                  {`${course.subject} ${course.catalog_nbr} - ${course.descr}`}
                </Text>
                <Text
                  textStyle="label"
                  height={"100%"}
                  color={isDarkMode ? "white" : "black"}
                >
                  {`${course.enrollment_total}/${course.class_capacity}`}$
                  {`${course.wait_tot > 0 ? ` | Waitlist: ${course.wait_tot}` : ""}`}
                </Text>
              </Card.Title>
              <div>
                <HStack
                  flexWrap={"wrap"}
                  gap={4}
                  justifyContent={"space-between"}
                  width={"100%"}
                >
                  <Stack
                    alignItems={"center"}
                    gap={1}
                    width={{ base: "100%", md: "8%" }}
                  >
                    <Box
                      width={{ base: 12, md: 16 }}
                      height={{ base: 12, md: 16 }}
                    >
                      <Iconify
                        icon={`${iconName.lib}:${iconName.name}`}
                        width="100%"
                      />
                    </Box>
                    <Text
                      textStyle="body"
                      color={textColor}
                    >{`${course.subject}`}</Text>
                    <Text
                      color={textColor}
                    >{`${course.catalog_nbr}-${course.class_section}`}</Text>
                    <Text
                      color={textColor}
                      textAlign={"center"}
                      background={
                        course.enrl_stat_descr == "Open"
                          ? "green.500"
                          : course.enrl_stat_descr == "Closed"
                            ? "red.500"
                            : "yellow.500"
                      }
                      padding={1}
                      borderRadius={4}
                    >{`${course.enrl_stat_descr}`}</Text>
                  </Stack>
                  <Stack
                    alignItems={"start"}
                    gap={2}
                    width={{ base: "100%", md: "42%" }}
                  >
                    <HStack>
                      <Icon as={FaChalkboardTeacher} boxSize={{ base: 8 }} />
                      <Text
                        textStyle="label"
                        color={textColor}
                      >{`${course.instructors.map((instr) => instr.name).join(", ")}`}</Text>
                      {professorRating && (
                        <Text
                          textStyle="caption"
                          color={textColor}
                        >{`(${professorRating.avgRating.toFixed(
                          1,
                        )} ★ from ${professorRating.numRatings} ratings)`}</Text>
                      )}
                    </HStack>
                    <HStack>
                      <Icon as={LuBuilding2} boxSize={{ base: 8 }} />
                      <Text textStyle="label" color={textColor}>
                        {course.meetings[0]?.facility_id === "TBA"
                          ? "TBA or Online"
                          : `${course.campus_descr} ${course.meetings[0]?.facility_descr}`}
                      </Text>
                    </HStack>
                    <HStack>
                      <Icon as={Component} boxSize={{ base: 8 }} />
                      <Text
                        textStyle="label"
                        color={textColor}
                      >{`${course.section_type}`}</Text>
                    </HStack>
                    <HStack>
                      <Icon as={IoIosCube} boxSize={{ base: 8 }} />
                      <Text
                        textStyle="label"
                        color={textColor}
                      >{`${course.units} units`}</Text>
                    </HStack>
                  </Stack>
                  <Stack
                    alignItems={"start"}
                    gap={2}
                    width={{ base: "100%", md: "42%" }}
                  >
                    <HStack>
                      <Icon as={RiListCheck} boxSize={{ base: 8 }} />
                      <Text
                        textStyle="label"
                        color={textColor}
                      >{`${course.instruction_mode_descr}`}</Text>
                    </HStack>
                    <HStack>
                      <Icon as={FaRegClock} boxSize={{ base: 8 }} />
                      <Text
                        textStyle="label"
                        color={textColor}
                      >{`${formatTime(course.meetings[0]?.start_time) || ""} - ${formatTime(course.meetings[0]?.end_time) || ""}`}</Text>
                    </HStack>
                    <HStack>
                      <Icon as={DaysOfTheWeek} boxSize={{ base: 8 }} />
                      <Text
                        textStyle="label"
                        color={textColor}
                      >{`${course.meetings[0]?.days.match(/([A-Z][a-z]{1,2})/g)?.join(" | ") || "N/A"}`}</Text>
                    </HStack>
                    <HStack>
                      <Icon as={FaCalendarDay} boxSize={{ base: 8 }} />
                      <Text
                        textStyle="label"
                        color={textColor}
                      >{`${course.meetings[0]?.start_dt || ""} - ${course.meetings[0]?.end_dt || ""}`}</Text>
                    </HStack>
                  </Stack>
                </HStack>
              </div>
            </Card.Body>
          </Card.Root>
        </Accordion.ItemTrigger>
        <Accordion.ItemContent>
          <HStack
            flexWrap={"wrap"}
            padding={4}
            gap={4}
            width={"100%"}
            background={isDarkMode ? "gray.600" : "gray.200"}
          >
            {fetchedDetails && courseDetails ? (
              <>
                <Stack
                  alignItems={"start"}
                  gap={2}
                  width={{ base: "100%", md: "48%" }}
                >
                  <HStack className={styles.entry}>
                    <Text
                      fontWeight={"bold"}
                      className={styles.categoryLabel}
                      color={textColor}
                    >
                      Enrollment Dates:
                    </Text>
                    <Text className={styles.categoryData}>
                      {courseDetails?.section_info.enroll_dates?.open_date ||
                        "No enrollment dates available."}
                    </Text>
                  </HStack>
                  <HStack className={styles.entry}>
                    <Text
                      fontWeight={"bold"}
                      className={styles.categoryLabel}
                      color={textColor}
                    >
                      Grading Criteria:
                    </Text>
                    <Text className={styles.categoryData}>
                      {course?.grading_basis ||
                        "No grading criteria available."}
                    </Text>
                  </HStack>
                  <HStack className={styles.entry}>
                    <Text
                      fontWeight={"bold"}
                      className={styles.categoryLabel}
                      color={textColor}
                    >
                      Prerequisites:
                    </Text>
                    <Text className={styles.categoryData}>
                      {courseDetails?.section_info.enrollment_information.enroll_requirements.replace(
                        "Prerequisite: ",
                        "",
                      ) || "No prerequisites available."}
                    </Text>
                  </HStack>
                  <HStack className={styles.entry}>
                    <Text
                      fontWeight={"bold"}
                      className={styles.categoryLabel}
                      color={textColor}
                    >
                      Reserved Seats:
                    </Text>
                    <Text className={styles.categoryData}>
                      {courseDetails?.section_info.notes.class_notes ||
                        "No reserved seats in this course."}
                    </Text>
                  </HStack>
                </Stack>
                <Stack
                  alignItems={"start"}
                  gap={2}
                  width={{ base: "100%", md: "48%" }}
                >
                  <Text className={styles.categoryLabel} color={textColor}>
                    {courseDetails?.section_info.catalog_descr.crse_catalog_description.replace(
                      PREREQUISITE_REGEX,
                      "",
                    ) || "No course description available."}
                  </Text>
                </Stack>{" "}
              </>
            ) : (
              <Text color={textColor}>Loading additional class details...</Text>
            )}
          </HStack>
        </Accordion.ItemContent>
      </Accordion.Item>
    </Accordion.Root>
  );
};

export default React.memo(ClassInfoCard);
