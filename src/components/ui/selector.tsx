import { Portal, Select, ListCollection } from "@chakra-ui/react";
import { useTheme } from "next-themes";
import styles from "../../css-styles/inputBox.module.css";

type SelectorProps = {
  options: ListCollection;
  selectedValue: string;
  setSelectedValue: (value: string) => void;
};

const Selector = ({
  selectedValue,
  setSelectedValue,
  options,
}: SelectorProps) => {
  const { theme, resolvedTheme } = useTheme();

  return (
    <Select.Root
      positioning={{ placement: "bottom", flip: true }}
      collection={options}
      size="sm"
      value={[selectedValue]}
      onValueChange={(value) => setSelectedValue(value.value[0])}
      minWidth={"100px"}
    >
      <Select.HiddenSelect />
      <Select.Control>
        <Select.Trigger
          className={`${styles.inputBoxInput} ${theme === "system" ? (resolvedTheme === "dark" ? styles.dark : "") : theme === "dark" ? styles.dark : ""}`}
        >
          <Select.ValueText placeholder="Select Your Option" />
        </Select.Trigger>
        <Select.IndicatorGroup>
          <Select.Indicator />
        </Select.IndicatorGroup>
      </Select.Control>
      <Portal>
        <Select.Positioner>
          <Select.Content
            className={`${styles.inputBoxContainer} ${theme === "system" ? (resolvedTheme === "dark" ? styles.dark : "") : theme === "dark" ? styles.dark : ""}`}
          >
            {options.items.map((option) => (
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
};

export default Selector;
