import { useNavigate, useSearchParams } from "react-router-dom";
import ClassInfoCard from "../components/ui/classInfoCard";
import { Button, HStack, Stack, Text } from "@chakra-ui/react";
import { useSearchContext } from "../contextFactory";
import { useEffect, useState } from "react";
import { Virtuoso } from "react-virtuoso";
import { TeacherRatings } from "../components/types";
import {
  getProfessorRatings,
  findClosestTeacherRating,
} from "../rateMyProfessorFetcher";

const SearchResultsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const university = searchParams.get("university");
  const { searchResults, searchOptions } = useSearchContext();
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
      <Virtuoso
        data={searchResults}
        style={{ height: "80vh", scrollbarWidth: "none" }}
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
