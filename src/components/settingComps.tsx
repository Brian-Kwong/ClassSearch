import { Button, ListCollection, Switch } from "@chakra-ui/react";
import InputBox from "./ui/inputBox";
import Selector from "./ui/selector";
import React from "react";
import styles from "../css-styles/settingsPage.module.css";

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
          Execute
        </Button>
      );
    default:
      return null;
  }

