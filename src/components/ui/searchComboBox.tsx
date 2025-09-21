import {
  Portal,
  Combobox,
  useListCollection,
  useFilter,
  Tag,
} from "@chakra-ui/react";
import { useCallback } from "react";
import { useTheme } from "next-themes";
import React from "react";
import styles from "../../css-styles/inputBox.module.css";

type SearchOptSelectorProps = {
  selectedValue: string[];
  setSelectedValue: (value: string[]) => void;
  options: Array<{ label: string; value: string }>;
  label: string;
  multiple: boolean;
};

const SearchOptSelector = ({
  selectedValue,
  setSelectedValue,
  options,
  label,
  multiple = true,
}: SearchOptSelectorProps) => {
  const { contains } = useFilter({ sensitivity: "base" });
  const { theme, resolvedTheme } = useTheme();

  const { collection: optionsList, filter } = useListCollection({
    initialItems: options,
    filter: contains,
    limit: 100,
  });

  const handleValueChange = useCallback(
    (valueDetails: { value: string[] }) => {
      setSelectedValue(valueDetails.value);
    },
    [setSelectedValue],
  );

  const handleInputValueChange = useCallback(
    (e: { inputValue: string }) => {
      filter(e.inputValue);
    },
    [filter],
  );

  return (
    <Combobox.Root
      multiple={multiple}
      collection={optionsList}
      size="md"
      onValueChange={handleValueChange}
      value={selectedValue}
      onInputValueChange={handleInputValueChange}
      className={styles.inputBox}
    >
      <Combobox.Label>{label}</Combobox.Label>

      {multiple && (
        <div className={styles.tagsDiv}>
          {selectedValue.map((val) => {
            return (
              <Tag.Root key={val}>
                <Tag.Label className={styles.tagLabel}>{val}</Tag.Label>
                <Tag.EndElement>
                  <Tag.CloseTrigger
                    onClick={() =>
                      setSelectedValue(selectedValue.filter((v) => v !== val))
                    }
                  />
                </Tag.EndElement>
              </Tag.Root>
            );
          })}
        </div>
      )}
      <Combobox.Control>
        <Combobox.Input
          placeholder="Type to search..."
          className={`${styles.inputBoxInput} ${theme === "system" ? (resolvedTheme === "dark" ? styles.dark : "") : theme === "dark" ? styles.dark : ""}`}
        />
        <Combobox.IndicatorGroup>
          <Combobox.ClearTrigger onClick={() => setSelectedValue([""])} />
          <Combobox.Trigger />
        </Combobox.IndicatorGroup>
      </Combobox.Control>
      <Portal>
        <Combobox.Positioner>
          <Combobox.Content
            className={`${styles.inputBoxContainer} ${theme === "system" ? (resolvedTheme === "dark" ? styles.dark : "") : theme === "dark" ? styles.dark : ""}`}
          >
            <Combobox.Empty>No option found</Combobox.Empty>
            {optionsList.items.map((option, index) => (
              <Combobox.Item item={option} key={index}>
                {option.label}
                <Combobox.ItemIndicator />
              </Combobox.Item>
            ))}
          </Combobox.Content>
        </Combobox.Positioner>
      </Portal>
    </Combobox.Root>
  );
};

export default React.memo(SearchOptSelector);
