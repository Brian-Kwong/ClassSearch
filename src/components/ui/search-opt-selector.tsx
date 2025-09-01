import {
  Portal,
  Combobox,
  useListCollection,
  useFilter,
} from "@chakra-ui/react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef, useCallback, useState, useEffect } from "react";
import { flushSync } from "react-dom";
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
  const [searchInput, setSearchInput] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const { collection: optionsList, filter } = useListCollection({
    initialItems: options,
    filter: contains,
  });

  const virtualizer = useVirtualizer({
    count: optionsList.items.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => 100,
    overscan: 5,
    scrollPaddingEnd: 32,
  });

  const handleScrollToIndexFn = (details: { index: number }) => {
    flushSync(() => {
      virtualizer.scrollToIndex(details.index, {
        align: "center",
        behavior: "auto",
      });
    });
  

  // Memoize setSelectedValue handler
  const handleValueChange = useCallback(
    (valueDetails: { value: string[] }) => {
      setSelectedValue(valueDetails.value);
    },
    [setSelectedValue],
  );

  useEffect(() => {
    if (multiple) {
      setSearchInput(selectedValue.join(", "));
    }
  }, [multiple, selectedValue, virtualizer]);

  const handleInputValueChange = useCallback(
    (e: { inputValue: string }) => {
      filter(e.inputValue);
      setSearchInput(e.inputValue.substring(0, 17));
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
      scrollToIndexFn={handleScrollToIndexFn}
    >
      <Combobox.Label>{label}</Combobox.Label>
      <Combobox.Control>
        <Combobox.Input placeholder="Type to search..." value={searchInput} />
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
