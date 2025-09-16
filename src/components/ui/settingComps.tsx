import { Button, ListCollection, Switch } from "@chakra-ui/react";
import { toaster } from "./toastFactory";
import InputBox from "./inputBox";
import Selector from "./selector";
import React from "react";
import styles from "../../css-styles/settingsPage.module.css";

export const createSettingControl = (
  type: string,
  settingKey: string,
  userSettings: {
    [key: string]: string;
  },
  setSettings: React.Dispatch<
    React.SetStateAction<{
      [key: string]: string;
    }>
  >,
  options?: ListCollection,
  validationFn?: (value: string) => boolean,
  errorMessage?: string,
) => {
  switch (type) {
    case "boolean":
      return (
        <Switch.Root
          colorPalette={"brand"}
          checked={
            userSettings[settingKey as keyof typeof userSettings] === "true"
          }
          onCheckedChange={(e) => {
            setSettings((prev) => ({
              ...prev,
              [settingKey]: String(e.checked),
            }));
          }}
        >
          <Switch.HiddenInput />
          <Switch.Control />
        </Switch.Root>
      );
    case "number":
      return (
        <InputBox
          label={""}
          value={
            userSettings[settingKey as keyof typeof userSettings] as string | ""
          }
          onChange={(value) => {
            if (validationFn) {
              if (
                !validationFn(value.target.value) &&
                value.target.value !== ""
              ) {
                toaster.create({
                  title: "Invalid Input",
                  description: errorMessage || "Please enter a valid value.",
                  type: "error",
                  duration: 3000,
                });
                return;
              }
            }
            setSettings((prev) => ({
              ...prev,
              [settingKey]: value.target.value,
            }));
          }}
        />
      );
    case "selection":
      return (
        <Selector
          selectedValue={
            (userSettings[settingKey as keyof typeof userSettings] as string) ||
            ""
          }
          setSelectedValue={(value: string) => {
            setSettings((prev) => ({ ...prev, [settingKey]: value }));
          }}
          options={options!}
        />
      );
    case "action":
      return (
        <Button
          size="sm"
          className={styles.button}
          onClick={() => {
            // Placeholder for action function
          }}
        >
          {settingKey}
        </Button>
      );
    default:
      return null;
  }

