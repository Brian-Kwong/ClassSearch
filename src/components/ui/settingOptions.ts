import { createListCollection, ListCollection } from "@chakra-ui/react";

export type SettingOption = {
  setting: string;
  description: string;
  settingType: string;
  validationFn?: (value: string) => boolean;
  errorMessage?: string;
  actionFn?: () => void;
  options?: ListCollection;


const defaultSettings: { [key: string]: string } = {
  "Enable Caching": "true",
  "Course Data Cache Duration": "60",
  "Professor Ratings Cache Duration": "60",
  "Class Details Cache Duration": "60",
  "Search History Cache Duration": "1440",
  "Results Per Page": "20",
  "Default Sort Order": "availability",
  "Prefetch Details when Hovering": "true",
  "Dark Mode": "system",
  "Check for Updates on Startup": "true",


const cacheSettingsOptions: SettingOption[] = [
  {
    setting: "Enable Caching",
    description: "Cache results to improve reoccurring searches",
    settingType: "boolean",
  },
  {
    setting: "Course Data Cache Duration",
    description:
      "Set the duration for how course data is cached.  A longer duration improves performance but at the cost of showing outdated data. Higher cache value may also require increased storage.",
    settingType: "number",
    validationFn: (value: string) => {
      try {
        return parseInt(value) >= 0 && parseInt(value) <= 1440;
      } catch {
        return false;
      }
    },
    errorMessage: "Cache duration must be between 0 and 1440 minutes.",
  },
  {
    setting: "Professor Ratings Cache Duration",
    description:
      "Set the duration for how professor ratings are cached. A longer duration improves performance but at the cost of showing outdated data. Higher cache value may also require increased storage.",
    settingType: "number",
    validationFn: (value: string) => {
      try {
        return parseInt(value) >= 0 && parseInt(value) <= 1440;
      } catch {
        return false;
      }
    },
    errorMessage: "Cache duration must be between 0 and 1440 minutes.",
  },
  {
    setting: "Class Details Cache Duration",
    description:
      "Set the duration for how class details are cached. A longer duration improves performance but at the cost of showing outdated data. Higher cache value may also require increased storage.",
    settingType: "number",
    validationFn: (value: string) => {
      try {
        return parseInt(value) >= 0 && parseInt(value) <= 1440;
      } catch {
        return false;
      }
    },
    errorMessage: "Cache duration must be between 0 and 1440 minutes.",
  },
  {
    setting: "Search History Cache Duration",
    description:
      "Set the duration for how search history is cached. A longer duration improves performance but at the cost of showing outdated data. Higher cache value may also require increased storage.",
    settingType: "number",
    validationFn: (value: string) => {
      try {
        return parseInt(value) >= 0 && parseInt(value) <= 43200;
      } catch {
        return false;
      }
    },
    errorMessage: "Cache duration must be between 0 and 43200 minutes.",
  },
  {
    setting: "Clear Cache",
    description: "Clear all cached data immediately.",
    settingType: "action",
    actionFn: () => {
      // This function should be implemented to clear the cache
    },
  },
];

const sortByList = createListCollection({
  items: [
    { label: "Availability", value: "availability" },
    { label: "Course Name A-Z", value: "courseNameAZ" },
    { label: "Course Name Z-A", value: "courseNameZA" },
    { label: "Course Number", value: "courseNumber" },
    { label: "Time", value: "time" },
    { label: "Professor Name A-Z", value: "professorNameAZ" },
    { label: "Professor Name Z-A", value: "professorNameZA" },
    { label: "Professor Rating", value: "professorRating" },
    { label: "Units", value: "units" },
  ],
});

const resultsPerPageOptions = createListCollection({
  items: [
    { label: "10", value: "10" },
    { label: "20", value: "20" },
    { label: "50", value: "50" },
    { label: "75", value: "75" },
    { label: "100", value: "100" },
    { label: "200", value: "200" },
    { label: "500", value: "500" },
    { label: "All", value: "-1" },
  ],
});

const appearanceOptions = createListCollection({
  items: [
    { label: "Light", value: "light" },
    { label: "Dark", value: "dark" },
    { label: "System Default", value: "system" },
  ],
});

const viewSettingsOptions: SettingOption[] = [
  {
    setting: "Results Per Page",
    description:
      "Set the number of search results displayed per page. Setting this to -1 will display all results on a single page.",
    settingType: "selection",
    options: resultsPerPageOptions,
  },
  {
    setting: "Default Sort Order",
    description: "Set the default sort order for search results.",
    settingType: "selection",
    options: sortByList,
  },
  {
    setting: "Prefetch Details when Hovering",
    description:
      "Enable or disable prefetching of course details when hovering over a course in the search results.",
    settingType: "boolean",
  },
];

const otherSettingsOptions: SettingOption[] = [
  {
    setting: "Dark Mode",
    description: "Enable or disable dark mode for the application.",
    settingType: "selection",
    options: appearanceOptions,
  },
  {
    setting: "Check for Updates on Startup",
    description:
      "Enable or disable automatic update checks when the application starts.",
    settingType: "boolean",
  },
];

const settingsCategories = [
  { category: "Cache Settings", options: cacheSettingsOptions },
  { category: "View Settings", options: viewSettingsOptions },
  { category: "Other Settings", options: otherSettingsOptions },
];

export {
  settingsCategories,
  sortByList,
  resultsPerPageOptions,
  appearanceOptions,
  defaultSettings,

