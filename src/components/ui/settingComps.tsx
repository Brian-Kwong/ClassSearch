import {
  Button,
  ListCollection,
  Switch,
  Portal,
  Dialog,
} from "@chakra-ui/react";
import { toaster } from "./toastFactory";
import InputBox from "./inputBox";
import Selector from "./selector";
import React from "react";
import styles from "../../css-styles/settingsPage.module.css";

export const createSettingControl = (
  theme: string,
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
  actionFn?: () => void,
  confirm: boolean = false,
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
      return confirm ? (
        <Dialog.Root placement={"center"}>
          <Dialog.Trigger asChild>
            <Button size="sm" className={styles.button}>
              {settingKey}
            </Button>
          </Dialog.Trigger>
          <Portal>
            <Dialog.Backdrop />
            <Dialog.Positioner>
              <Dialog.Content
                className={`${styles.confirmDialog} ${theme === "dark" ? styles.dark : ""}`}
              >
                <Dialog.Header>
                  <Dialog.Title>
                    Are you sure you like to {settingKey.toLowerCase()}?
                  </Dialog.Title>
                </Dialog.Header>
                <Dialog.Footer>
                  <Dialog.ActionTrigger asChild>
                    <Button variant="outline">Cancel</Button>
                  </Dialog.ActionTrigger>
                  <Button
                    onClick={() => {
                      if (actionFn) actionFn();
                    }}
                    className={styles.button}
                  >
                    Confirm
                  </Button>
                </Dialog.Footer>
              </Dialog.Content>
            </Dialog.Positioner>
          </Portal>
        </Dialog.Root>
      ) : (
        <Button
          size="sm"
          className={styles.button}
          onClick={() => {
            if (actionFn) actionFn();
          }}
        >
          {settingKey}
        </Button>
      );
    default:
      return null;
  }

