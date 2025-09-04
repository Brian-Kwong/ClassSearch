import {
  Portal,
  Combobox,
  useListCollection,
  useFilter,
  Tag,
} from "@chakra-ui/react";
import { useCallback } from "react";
import React from "react";

type SearchOptSelectorProps = {
  selectedValue: string[];
  setSelectedValue: (value: string[]) => void;
  options: Array<{ label: string; value: string }>;
  label: string;
  multiple: boolean;


const SearchOptSelector = ({
  selectedValue,
  setSelectedValue,
  options,
  label,
  multiple = true,
}: SearchOptSelectorProps) => {
  const { contains } = useFilter({ sensitivity: "base" });

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
      width={{ base: "50vw", md: "15vw" }}
      onValueChange={handleValueChange}
      value={selectedValue}
      onInputValueChange={handleInputValueChange}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        height: "100%",
      }}
    >
      <Combobox.Label>{label}</Combobox.Label>

      {multiple && (
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            gap: "4px",
          }}
        >
          {selectedValue.map((val) => {
            return (
              <Tag.Root key={val}>
                <Tag.Label
                  style={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {val}
                </Tag.Label>
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
          style={{
            paddingRight: "60px",
            textOverflow: "ellipsis",
            overflow: "hidden",
            whiteSpace: "nowrap",
          }}
        />
        <Combobox.IndicatorGroup>
          <Combobox.ClearTrigger onClick={() => setSelectedValue([""])} />
          <Combobox.Trigger />
        </Combobox.IndicatorGroup>
      </Combobox.Control>
      <Portal>
        <Combobox.Positioner>
          <Combobox.Content maxHeight="200px" overflowY="auto">
            <Combobox.Empty>No option found</Combobox.Empty>
            {optionsList.items.map((option) => (
              <Combobox.Item item={option} key={option.value}>
                {option.label}
                <Combobox.ItemIndicator />
              </Combobox.Item>
            ))}
          </Combobox.Content>
        </Combobox.Positioner>
      </Portal>
    </Combobox.Root>
  );


export default React.memo(SearchOptSelector);
