import { ChakraProvider } from "@chakra-ui/react";
import { ThemeProvider } from "next-themes";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./css-styles/index.css";
import system from "../chakra.config.ts";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider attribute="class" disableTransitionOnChange>
      <ChakraProvider value={system}>
        <App />
      </ChakraProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
