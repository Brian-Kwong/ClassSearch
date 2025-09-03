import { Portal, Select, createListCollection } from "@chakra-ui/react";

type CSUSelectorProps = {
  selectedValue: string;
  setSelectedValue: (value: string) => void;


const CSUSelector = ({ selectedValue, setSelectedValue }: CSUSelectorProps) => {
  return (
    <Select.Root
      positioning={{ placement: "bottom", flip: true }}
      collection={csuList}
      size="sm"
      value={[selectedValue]}
      onValueChange={(value) => setSelectedValue(value.value[0])}
    >
      <Select.HiddenSelect />
      <Select.Control>
        <Select.Trigger>
          <Select.ValueText placeholder="Select Your Institution" />
        </Select.Trigger>
        <Select.IndicatorGroup>
          <Select.Indicator />
        </Select.IndicatorGroup>
      </Select.Control>
      <Portal>
        <Select.Positioner>
          <Select.Content>
            {csuList.items.map((university) => (
              <Select.Item item={university} key={university.value}>
                {university.label}
                <Select.ItemIndicator />
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Positioner>
      </Portal>
    </Select.Root>
  );


const csuList = createListCollection({
  items: [
    {
      label: "California State University, Bakersfield",
      value: "California State University, Bakersfield",
    },
    {
      label: "California State University Channel Islands",
      value: "California State University Channel Islands",
    },
    {
      label: "California State University, Chico",
      value: "California State University, Chico",
    },
    {
      label: "California State University, Dominguez Hills",
      value: "California State University, Dominguez Hills",
    },
    {
      label: "California State University, East Bay",
      value: "California State University, East Bay",
    },
    {
      label: "California State University, Fresno",
      value: "California State University, Fresno",
    },
    {
      label: "California State University, Fullerton",
      value: "California State University, Fullerton",
    },
    {
      label: "California State Polytechnic University, Humboldt",
      value: "California State Polytechnic University, Humboldt",
    },
    {
      label: "California State University, Long Beach",
      value: "California State University, Long Beach",
    },
    {
      label: "California State University, Los Angeles",
      value: "California State University, Los Angeles",
    },
    {
      label: "California State University, Monterey Bay",
      value: "California State University, Monterey Bay",
    },
    {
      label: "California State University, Northridge",
      value: "California State University, Northridge",
    },
    {
      label: "California State Polytechnic University, Pomona",
      value: "California State Polytechnic University, Pomona",
    },
    {
      label: "California State University, Sacramento",
      value: "California State University, Sacramento",
    },
    {
      label: "California State University, San Bernardino",
      value: "California State University, San Bernardino",
    },
    {
      label: "San Diego State University",
      value: "San Diego State University",
    },
    {
      label: "San Francisco State University",
      value: "San Francisco State University",
    },
    { label: "San José State University", value: "San José State University" },
    {
      label: "California Polytechnic State University, San Luis Obispo",
      value: "California Polytechnic State University, San Luis Obispo",
    },
    {
      label: "California State University San Marcos",
      value: "California State University San Marcos",
    },
    { label: "Sonoma State University", value: "Sonoma State University" },
    {
      label: "California State University, Stanislaus",
      value: "California State University, Stanislaus",
    },
  ],
});

export default CSUSelector;
