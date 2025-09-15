import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";
import { textStyles } from ".//text-styles";

const config = defineConfig({
  theme: {
    textStyles,
    tokens: {
      colors: {
        transparent: { value: "transparent" },
        primaryDark: { value: "#1a202c" },
        primaryLight: { value: "#f7fafc" },
        brand: {
          50: { value: "#f0f4f8" },
          100: { value: "#dde6ef" },
          200: { value: "#b7ccdf" },
          300: { value: "#8fb2ce" },
          400: { value: "#7997af" },
          500: { value: "#637d91" },
          600: { value: "#4c6171" },
          700: { value: "#394955" },
          800: { value: "#26323b" },
          900: { value: "#151c23" },
          950: { value: "#0c1216" },
        },
      },
    },
    semanticTokens: {
      colors: {
        brand: {
          solid: { value: "{colors.brand.500}" },
          contrast: {
            value: {
              _light: "{colors.brand.900}",
              _dark: "{colors.brand.50}",
            },
          },
          fg: { value: "{colors.brand.700}" },
          muted: { value: "{colors.brand.100}" },
          subtle: { value: "{colors.brand.200}" },
          emphasized: { value: "{colors.brand.300}" },
          focusRing: { value: "{colors.brand.500}" },
        },
        background: {
          _light: { value: "{colors.primaryLight}" },
          _dark: { value: "{colors.primaryDark}" },
        },
        border: {
          _light: { value: "{colors.brand.200}" },
          _dark: { value: "{colors.brand.800}" },
        },
        placeholder: {
          _light: { value: "{colors.brand.100}" },
          _dark: { value: "{colors.brand.100}" },
        },
        primaryDiv: {
          _light: { value: "{colors.brand.500}" },
          _dark: { value: "{colors.brand.900}" },
        },
      },
    },
  },
  globalCss: {
    body: {
      bg: { _light: "background._light", _dark: "background._dark" },
    },
  },
});

export const system = createSystem(defaultConfig, config);
export default system;
