import { Drawer, Portal, CloseButton, Text, Stack } from "@chakra-ui/react";
import { useTheme } from "next-themes";
import { Virtuoso } from "react-virtuoso";
import { UserSearchRequestTypes } from "../types";
import styles from "../../css-styles/historyDrawer.module.css";

type SearchHistoryDrawerProps = {
  openButton: React.ReactNode;
  searchHistory: {
    timestamp: number;
    params: UserSearchRequestTypes;
  }[];
  setSelectedSearchHistoryIndex?: (index: number | null) => void;
  university: string;
};

const HistoryDrawer = ({
  openButton,
  searchHistory,
  setSelectedSearchHistoryIndex,
  university,
}: SearchHistoryDrawerProps) => {
  const { theme, resolvedTheme } = useTheme();

  // Filter for any search history that are not this university
  const thisUniversityHistory = searchHistory.filter(
    (item) => item.params.university === university,
  );

  return (
    <Drawer.Root>
      <Drawer.Trigger asChild>{openButton}</Drawer.Trigger>
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content
            className={`${styles.historyDrawerContent} ${theme === "system" ? (resolvedTheme === "dark" ? styles.dark : "") : theme === "dark" ? styles.dark : ""}`}
          >
            <Drawer.Header>
              <Drawer.Title>Search History</Drawer.Title>
            </Drawer.Header>
            <Drawer.Body>
              <Virtuoso
                style={{ height: "85vh", width: "100%" }}
                totalCount={thisUniversityHistory.length}
                itemContent={(index) => {
                  // eslint-disable-next-line security/detect-object-injection
                  const item = thisUniversityHistory[index];
                  return (
                    <Stack
                      className={styles.historyRecordDiv}
                      gap={2}
                      onClick={() => {
                        if (setSelectedSearchHistoryIndex) {
                          setSelectedSearchHistoryIndex(item.timestamp);
                        }
                      }}
                      cursor={
                        setSelectedSearchHistoryIndex ? "pointer" : "default"
                      }
                    >
                      <Stack>
                        <Text>{new Date(item.timestamp).toLocaleString()}</Text>
                      </Stack>
                      <Stack>
                        <Text>
                          {Object.entries(item.params)
                            .filter(
                              ([, value]) =>
                                (value !== "" &&
                                  !(
                                    Array.isArray(value) && value.length === 0
                                  )) ||
                                (value.length === 1 && value[0] === ""),
                            )
                            .filter(
                              ([key]) =>
                                key !== "availableCourseNumbers" &&
                                key !== "availableInstructorFirstNames" &&
                                key !== "availableInstructorLastNames",
                            )
                            .map(([key, value]) => (
                              <span key={key}>
                                <strong>{key}:</strong> {String(value)}{" "}
                              </span>
                            ))}
                        </Text>
                      </Stack>
                    </Stack>
                  );
                }}
              />
            </Drawer.Body>
            <Drawer.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Drawer.CloseTrigger>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
};

export default HistoryDrawer;
