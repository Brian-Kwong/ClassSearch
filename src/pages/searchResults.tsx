import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useMemo } from "react";
import { SearchParamJson, UniversityCourseResponse } from "../components/types";
import ClassInfoCard from "../components/ui/classInfoCard";
import { Button, HStack, Stack, Text } from "@chakra-ui/react";

const SearchResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const university = searchParams.get("university");
  const searchResults = useMemo(() => {
    return (location.state.searchResults as UniversityCourseResponse[]) || [];
  }, [location.state.searchResults]);
  const searchOptions = useMemo(() => {
    return (location.state.searchOptions as SearchParamJson) || {
  }, [location.state.searchOptions]);

  return (
    <Stack>
      <HStack justifyContent={"space-between"} padding={2} flexWrap={"wrap"}>
        {searchResults ? (
          <Text textStyle="heading">
            Search Results ({searchResults.length} results)
          </Text>
        ) : null}
        <Button
          colorPalette="brand"
          onClick={() => {
            navigate(`/search?university=${university}&latestHistory=${true}`, {
              state: { searchOptions },
            });
          }}
        >
          Revise Search Parameters
        </Button>
      </HStack>
      {searchResults ? (
        searchResults.map((course) => (
          <ClassInfoCard key={course.index} course={course} />
        ))
      ) : (
        <Text>No results found</Text>
      )}
    </Stack>
  );


export default SearchResultsPage;
