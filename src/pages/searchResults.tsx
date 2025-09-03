import { useLocation } from "react-router-dom";
import { useMemo } from "react";
import { UniversityCourseResponse } from "../components/types";
import ClassInfoCard from "../components/ui/classInfoCard";
import { Button, HStack, Stack, Text } from "@chakra-ui/react";

const SearchResultsPage = () => {
  const location = useLocation();
  const searchResults = useMemo(
    () => (location.state.searchResults as UniversityCourseResponse[]) || [],
    [location.state.searchResults],
  );
  return (
    <Stack>
      <HStack justifyContent={"space-between"} padding={2} flexWrap={"wrap"}>
        <Text textStyle="heading">
          Search Results ({searchResults.length} results)
        </Text>
        <Button colorPalette="brand" onClick={() => window.history.back()}>
          Revise Search Parameters
        </Button>
      </HStack>
      {searchResults.map((course) => (
        <ClassInfoCard key={course.crse_id} course={course} />
      ))}
    </Stack>
  );


export default SearchResultsPage;
