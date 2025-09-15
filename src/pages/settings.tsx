"use client";
import {
  Accordion,
  HStack,
  Stack,
  Text,
  Dialog,
  Portal,
  createOverlay,
} from "@chakra-ui/react";
import { settingsCategories } from "../components/ui/settingOptions";
import React from "react";
import { useSearchContext } from "../components/context/contextFactory";
import { useTheme } from "next-themes";
import { createSettingControl } from "../components/settingComps";
import styles from "../css-styles/settingsPage.module.css";

export const Settings = createOverlay((props) => {
  const { ...rest } = props;
  const { settings: userSettings, setSettings: setUserSettings } =
    useSearchContext();
  const { theme, setTheme, resolvedTheme } = useTheme();

  React.useEffect(() => {
    console.log("User settings updated:", userSettings);
    if (userSettings["Dark Mode"] === "dark") {
      setTheme("dark");
    } else if (userSettings["Dark Mode"] === "light") {
      console.log("User prefers light mode");
      setTheme("light");
    } else {
      setTheme("system");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userSettings["Dark Mode"]]);

  return (
    <Dialog.Root
      {...rest}
      size={{
        base: "sm",
        md: "md",
        lg: "lg",
        xl: "xl",
      }}
      placement="center"
    >
      <Portal>
        <Dialog.Backdrop>
          <Dialog.Positioner>
            <Dialog.Content
              className={`${styles.settingsContainer}  ${theme === "system" ? (resolvedTheme === "dark" ? styles.dark : "") : theme === "dark" ? styles.dark : ""}`}
            >
              <Stack gap={4}>
                <Text fontSize="2xl" fontWeight="bold">
                  Settings
                </Text>
                <Accordion.Root collapsible>
                  {settingsCategories.map(({ category, options }) => (
                    <Accordion.Item
                      key={category}
                      value={category}
                      border="none"
                    >
                      <Accordion.ItemTrigger>
                        <Text fontSize="lg" fontWeight="semibold">
                          {category}
                        </Text>
                      </Accordion.ItemTrigger>
                      <Accordion.ItemContent>
                        <Stack gap={4} mt={2} mb={4}>
                          {options.map((option) => (
                            <HStack
                              key={option.setting}
                              justifyContent={"space-between"}
                              width="100%"
                            >
                              <Stack width={{ base: "100%", md: "70%" }}>
                                <Text fontSize="md" textAlign={"left"}>
                                  {option.setting}
                                </Text>
                                <Text
                                  fontStyle="sm"
                                  color={"gray.500"}
                                  textAlign={"left"}
                                >
                                  {option.description}
                                </Text>
                              </Stack>
                              <Stack
                                width={{ base: "100%", md: "30%" }}
                                alignItems={"flex-end"}
                                padding={1}
                              >
                                {
                                  /* Placeholder for setting control (e.g., switch, dropdown) */
                                  createSettingControl(
                                    option.settingType,
                                    option.setting,
                                    userSettings,
                                    setUserSettings,
                                    option?.options || undefined,
                                  )
                                }
                              </Stack>
                            </HStack>
                          ))}
                        </Stack>
                      </Accordion.ItemContent>
                    </Accordion.Item>
                  ))}
                </Accordion.Root>
              </Stack>
            </Dialog.Content>
          </Dialog.Positioner>
        </Dialog.Backdrop>
      </Portal>
    </Dialog.Root>
  );
});
