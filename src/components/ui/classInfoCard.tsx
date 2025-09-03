import { Card, HStack, Stack, Icon, Text } from "@chakra-ui/react";
import { UniversityCourseResponse } from "../types";
import { MdComputer } from "react-icons/md";
import { FaChalkboardTeacher } from "react-icons/fa";
import { LuBuilding2 } from "react-icons/lu";
import { useTheme } from "next-themes";
import { Component } from "lucide-react";
import { IoIosCube } from "react-icons/io";
import { RiListCheck } from "react-icons/ri";
import { FaRegClock } from "react-icons/fa";
import DaysOfTheWeek from "../../assets/daysOfWeek.svg?react";
import { FaCalendarDay } from "react-icons/fa";

function formatTime(timeString: string): string | undefined {
  try {
    return timeString.replace(".", ":").replace(".", ":").split(".")[0];
  } catch {
    return undefined; // If failed to parse just return original string
  }
}

const ClassInfoCard = ({ course }: { course: UniversityCourseResponse }) => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  return (
    <Card.Root
      width={"100%"}
      boxShadow={isDarkMode ? "dark-lg" : "lg"}
      background={isDarkMode ? "gray.700" : "gray.100"}
    >
      <Card.Body gap={4}>
        <Card.Title
          flexDirection={"row"}
          display={"flex"}
          justifyContent={"space-between"}
          gap={4}
        >
          <Text>
            {`${course.subject} ${course.catalog_nbr} - ${course.descr}`}
          </Text>
          <Text textStyle="label" color={isDarkMode ? "white" : "black"}>
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
              width={{ base: "100%", md: "10%" }}
            >
              <Icon as={MdComputer} boxSize={{ base: 8, md: 16 }} />
              <Text
                textStyle="body"
                color={isDarkMode ? "white" : "black"}
              >{`${course.subject}`}</Text>
              <Text
                color={isDarkMode ? "white" : "black"}
              >{`${course.catalog_nbr}-${course.class_section}`}</Text>
              <Text
                color={isDarkMode ? "white" : "black"}
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
                  color={isDarkMode ? "white" : "black"}
                >{`${course.instructors.map((instr) => instr.name).join(", ")}`}</Text>
              </HStack>
              <HStack>
                <Icon as={LuBuilding2} boxSize={{ base: 8 }} />
                <Text textStyle="label" color={isDarkMode ? "white" : "black"}>
                  {course.meetings[0]?.facility_id === "TBA"
                    ? "TBA or Online"
                    : `${course.campus_descr} ${course.meetings[0]?.facility_descr}`}
                </Text>
              </HStack>
              <HStack>
                <Icon as={Component} boxSize={{ base: 8 }} />
                <Text
                  textStyle="label"
                  color={isDarkMode ? "white" : "black"}
                >{`${course.section_type}`}</Text>
              </HStack>
              <HStack>
                <Icon as={IoIosCube} boxSize={{ base: 8 }} />
                <Text
                  textStyle="label"
                  color={isDarkMode ? "white" : "black"}
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
                  color={isDarkMode ? "white" : "black"}
                >{`${course.instruction_mode_descr}`}</Text>
              </HStack>
              <HStack>
                <Icon as={FaRegClock} boxSize={{ base: 8 }} />
                <Text
                  textStyle="label"
                  color={isDarkMode ? "white" : "black"}
                >{`${formatTime(course.meetings[0]?.start_time) || ""} - ${formatTime(course.meetings[0]?.end_time) || ""}`}</Text>
              </HStack>
              <HStack>
                <Icon as={DaysOfTheWeek} boxSize={{ base: 8 }} />
                <Text
                  textStyle="label"
                  color={isDarkMode ? "white" : "black"}
                >{`${course.meetings[0]?.days.match(/([A-Z][a-z]{1,2})/g)?.join(" | ") || "N/A"}`}</Text>
              </HStack>
              <HStack>
                <Icon as={FaCalendarDay} boxSize={{ base: 8 }} />
                <Text
                  textStyle="label"
                  color={isDarkMode ? "white" : "black"}
                >{`${course.meetings[0]?.start_dt || ""} - ${course.meetings[0]?.end_dt || ""}`}</Text>
              </HStack>
            </Stack>
          </HStack>
        </div>
      </Card.Body>
    </Card.Root>
  );


export default ClassInfoCard;
