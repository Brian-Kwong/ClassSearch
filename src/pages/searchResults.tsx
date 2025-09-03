import { useLocation, useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { UniversityCourseResponse } from "../components/types";
import ClassInfoCard from "../components/ui/classInfoCard";
import { Button, HStack, Stack, Text } from "@chakra-ui/react";

const SearchResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchResults = useMemo(() => {
    return (location.state.searchResults as UniversityCourseResponse[]) || [];
  }, [location.state.searchResults]);

  return (
    <Stack>
      <HStack justifyContent={"space-between"} padding={2} flexWrap={"wrap"}>
        {searchResults ? <Text textStyle="heading">
          Search Results ({  searchResults.length  } results)
        </Text> : null}
        <Button colorPalette="brand" onClick={() => {
          navigate(-2);
        }}>
          Revise Search Parameters
        </Button>
      </HStack>
      {searchResults ? searchResults.map((course) => (
        <ClassInfoCard key={course.index} course={course} />
      )) : (
        <Text>No results found</Text>
      )}
    </Stack>
  );


export default SearchResultsPage;
