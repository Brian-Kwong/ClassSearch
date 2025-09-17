import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Button,
  HStack,
  Stack,
  Text,
  Group,
  Pagination,
  ButtonGroup,
  IconButton,
} from "@chakra-ui/react";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { useSearchContext } from "../components/context/contextFactory";
import { useEffect, useState } from "react";
import { Virtuoso } from "react-virtuoso";
import { TeacherRatings } from "../components/types";
import {
  getProfessorRatings,
  findClosestTeacherRating,
} from "../components/rateMyProfessorFetcher";
import { sortByList } from "../components/settingOptions";
import ClassInfoCard from "../components/ui/classInfoCard";
import Loading from "../components/ui/loading";
import Selector from "../components/ui/selector";
import sortCoursesBy from "../components/sortBy";
import styles from "../css-styles/searchResults.module.css";

const SearchResultsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const university = searchParams.get("university");
  const {
    searchResults,
    setSearchResults,
    searchOptions,
    sortBy,
    setSortBy,
    settings,
  } = useSearchContext();
  const [modelLoaded, setModelLoaded] = useState(false);
  const [icons, setIcons] = useState<Array<{ lib: string; name: string }>>([]);
  const [teacherRatingsList, setTeacherRatingsList] = useState<Map<
    string,
    TeacherRatings
  > | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagedResults, setPagedResults] = useState(searchResults || []);
  const resultsPerPage = parseInt(settings["Results Per Page"]) || 10;

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
    getProfessorRatings(
      university || "",
      settings["Enable Caching"] === "true",
      parseInt(settings["Professor Ratings Cache Duration"]) || 1,
    ).then((ratings) => {
      if (ratings) {
        setTeacherRatingsList(ratings);
      }
    });
  }, [university, settings]);

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

  useEffect(() => {
    if (searchResults) {
      const totalPages = Math.ceil(searchResults.length / resultsPerPage);
      if (currentPage > totalPages) {
        setCurrentPage(totalPages);
      } else if (currentPage < 1) {
        setCurrentPage(1);
      } else {
        const startIdx = (currentPage - 1) * resultsPerPage;
        const endIdx = startIdx + resultsPerPage;
        setPagedResults(searchResults.slice(startIdx, endIdx));
      }
    }
  }, [searchResults, currentPage, resultsPerPage]);

  return (
    <Stack height={"100vh"}>
      <HStack
        gap={{
          base: 5,
        }}
        justifyContent={"space-between"}
        flexWrap={"wrap"}
        height={"fit-content"}
      >
        <Stack alignItems={"flex-start"} gap={0}>
          <Text fontSize="2xl" fontWeight="bold">
            Search Results
          </Text>
          <Text fontSize="md" color="gray.500">
            {searchResults.length} results found
          </Text>
        </Stack>
        <Group
          align={{ base: "space-between", md: "center" }}
          width={{ base: "100%", md: "fit-content" }}
          minWidth={{
            base: "100%",
            md: "400px",
          }}
          gap={2}
        >
          <Selector
            selectedValue={sortBy}
            setSelectedValue={setSortBy}
            options={sortByList}
          />
          <Button
            colorPalette="brand"
            width={"fit-content"}
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
        data={pagedResults}
        className={styles.searchResultsList}
        itemContent={(index, course) => (
          <ClassInfoCard
            key={index}
            university={university || ""}
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
      <Pagination.Root
        height={"120px"}
        count={searchResults.length}
        pageSize={resultsPerPage}
        defaultPage={1}
        onPageChange={(page) => setCurrentPage(page.page)}
      >
        <ButtonGroup variant="ghost" size="sm">
          <Pagination.PrevTrigger asChild>
            <IconButton>
              <LuChevronLeft />
            </IconButton>
          </Pagination.PrevTrigger>

          <Pagination.Items
            render={(page) => (
              <IconButton variant={{ base: "ghost", _selected: "outline" }}>
                {page.value}
              </IconButton>
            )}
          />

          <Pagination.NextTrigger asChild>
            <IconButton>
              <LuChevronRight />
            </IconButton>
          </Pagination.NextTrigger>
        </ButtonGroup>
      </Pagination.Root>
    </Stack>
  );


export default SearchResultsPage;
