import { useNavigate, useSearchParams } from "react-router-dom";
import { Button, HStack, Stack, Text, Group } from "@chakra-ui/react";
import { useSearchContext } from "../contextFactory";
import { useEffect, useState } from "react";
import { Virtuoso } from "react-virtuoso";
import { TeacherRatings } from "../components/types";
import {
  getProfessorRatings,
  findClosestTeacherRating,
} from "../rateMyProfessorFetcher";
import ClassInfoCard from "../components/ui/classInfoCard";
import SortBySelector from "../components/ui/sortBySelector";
import sortCoursesBy from "../sortBy";
import styles from "../css-styles/searchResults.module.css";

const SearchResultsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const university = searchParams.get("university");
  const { searchResults, setSearchResults, searchOptions, sortBy, setSortBy } =
    useSearchContext();
  const [modelLoaded, setModelLoaded] = useState(false);
  const [icons, setIcons] = useState<Array<{ lib: string; name: string }>>([]);
  const [teacherRatingsList, setTeacherRatingsList] = useState<Map<
    string,
    TeacherRatings
  > | null>(null);

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
    getProfessorRatings(university || "").then((ratings) => {
      if (ratings) {
        setTeacherRatingsList(ratings);
      }
    });
  }, [university]);

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

  useEffect(() => {
    if (sortBy && searchResults) {
      const sorted = sortCoursesBy(
        searchResults,
        teacherRatingsList || new Map(),
        sortBy,
      );
      if (JSON.stringify(sorted) !== JSON.stringify(searchResults)) {
        setSearchResults(sorted);
      }
    }
    // Unnecessary renders if all dependencies are included
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy]);

  return (
    <Stack>
      <HStack
        gap={{
          base: 5,
        }}
        justifyContent={"space-between"}
        flexWrap={"wrap"}
      >
        {searchResults ? (
          <Stack alignItems={"flex-start"} gap={0}>
            <Text fontSize="2xl" fontWeight="bold">
              Search Results
            </Text>
            <Text fontSize="md" color="gray.500">
              {searchResults.length} results found
            </Text>
          </Stack>
        ) : null}
        <Group>
          <SortBySelector sortBy={sortBy} setSortBy={setSortBy} />
          <Button
            colorPalette="brand"
            onClick={() => {
              navigate(
                `/search?university=${university}&latestHistory=${true}`,
                {
                  state: { searchOptions },
                },
              );
            }}
          >
            Revise Search Parameters
          </Button>
        </Group>
      </HStack>
      <Virtuoso
        data={searchResults}
        className={styles.searchResultsList}
        itemContent={(index, course) => (
          <ClassInfoCard
            key={index}
            course={course}
            iconName={icons.at(index) || { lib: "mdi", name: "book" }}
            professorRating={
              teacherRatingsList
                ? findClosestTeacherRating(
                    teacherRatingsList,
                    course.meetings[0]?.instructor || "",
                  )
                : undefined
            }
          />
        )}
      />
    </Stack>
  );


export default SearchResultsPage;
