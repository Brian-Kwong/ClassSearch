import { Portal, Select, createListCollection } from "@chakra-ui/react";

type SortBySelectorProps = {
  sortBy: string;
  setSortBy: (value: string) => void;


const SortBySelector = ({ sortBy, setSortBy }: SortBySelectorProps) => {
  return (
    <Select.Root
      positioning={{ placement: "bottom", flip: true }}
      collection={sortByList}
      size="md"
      value={[sortBy]}
      onValueChange={(value) => setSortBy(value.value[0])}
      width={{
        base: "50vw",
        md: "15vw",
      }}
    >
      <Select.HiddenSelect />
      <Select.Control>
        <Select.Trigger>
          <Select.ValueText placeholder="Sort By" />
        </Select.Trigger>
        <Select.IndicatorGroup>
          <Select.Indicator />
        </Select.IndicatorGroup>
      </Select.Control>
      <Portal>
        <Select.Positioner>
          <Select.Content>
            {sortByList.items.map((option) => (
              <Select.Item item={option} key={option.value}>
                {option.label}
                <Select.ItemIndicator />
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Positioner>
      </Portal>
    </Select.Root>
  );

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

export default SortBySelector;
