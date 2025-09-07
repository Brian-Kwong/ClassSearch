import { useNavigate, useSearchParams } from "react-router-dom";
import ClassInfoCard from "../components/ui/classInfoCard";
import { Button, HStack, Stack, Text } from "@chakra-ui/react";
import { useSearchContext } from "../contextFactory";
import { useEffect, useState } from "react";
import { SearchParamJson } from "../components/types";

// Add a type declaration for window.electron
declare global {
  interface Window {
    electronAPI: {
      firstLogin: (url: string) => Promise<SearchParamJson | null>;
      fetchCourses: (
        url: string,
      ) => Promise<{ success: boolean; data?: unknown; error?: string }>;
      getModelPath: () => Promise<string | null>;
      semanticSearch: {
        performIconSearch: (query: {
          courses: { subject_descr: string }[];
        }) => Promise<{ lib: string; name: string }[]>;
        setup: () => Promise<void>;
      
    
  }
}

const SearchResultsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const university = searchParams.get("university");
  const { searchResults, searchOptions } = useSearchContext();
  const [modelLoaded, setModelLoaded] = useState(false);
  const [icons, setIcons] = useState<Array<{ lib: string; name: string }>>([]);

  useEffect(() => {
    async function loadModel() {
      try {
        await window.electronAPI.semanticSearch.setup();
        setModelLoaded(true);
      } catch (error) {
        console.error("Error loading model:", error);
      }
    }
    loadModel();
  }, []);

  useEffect(() => {
    const fetchIcons = async () => {
      if (!modelLoaded || !searchResults) return;
      try {
        const courses = searchResults.map((course) => ({
          // Removes all Roman numerical suffixes from the description
          subject_descr: course.descr
            .replace(/ *\b(I|II|III|IV|V|VI|VII|VIII|IX|X)\b */g, "")
            .trim(),
        }));
        const results =
          await window.electronAPI.semanticSearch.performIconSearch({
            courses,
          });
        setIcons(results);
      } catch (error) {
        console.error("Error performing semantic search:", error);
      }
    
    fetchIcons();
  }, [modelLoaded, searchResults]);

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
        searchResults.map((course, index) => (
          <ClassInfoCard
            key={index}
            course={course}
            iconName={icons.at(index) || { lib: "mdi", name: "book" }}
          />
        ))
      ) : (
        <Text>No results found</Text>
      )}
    </Stack>
  );


export default SearchResultsPage;
