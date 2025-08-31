import { defineTextStyles } from "@chakra-ui/react";

export const textStyles = defineTextStyles({
  heading: {
    value: {
      fontSize: {
        base: "2xl",
        md: "3xl",
        lg: "4xl",
        xl: "5xl",
      },
      lineHeight: "1.2",
      fontWeight: "semibold",
    },
  },
  subheading: {
    value: {
      fontSize: {
        base: "lg",
        md: "xl",
        lg: "2xl",
        xl: "3xl",
      },
      lineHeight: "1.3",
      fontWeight: "medium",
    },
  },
  body: {
    value: {
      fontSize: {
        base: "md",
        md: "lg",
        lg: "xl",
        xl: "2xl",
      },
      lineHeight: "1.5",
      fontWeight: "normal",
    },
  },
});

export default textStyles;
