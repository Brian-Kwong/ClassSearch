import "../src/css-styles/App.css";
import { RouterProvider, createHashRouter } from "react-router-dom";
import React from "react";
import { PulseLoader } from "react-spinners";
import { SearchProvider } from "./components/context/context";

function App() {
  const Redirect = React.lazy(() => import("./pages/redirect"));
  const SearchPage = React.lazy(() => import("./pages/searchPage"));
  const SelectCSU = React.lazy(() => import("./pages/selectcsu"));
  const Results = React.lazy(() => import("./pages/searchResults"));

  const routes = createHashRouter([
    {
      path: "/",
      element: (
        <React.Suspense fallback={<PulseLoader color="#637d91" />}>
          <SelectCSU />
        </React.Suspense>
      ),
    },
    {
      path: "/redirect?",
      element: (
        <React.Suspense fallback={<PulseLoader color="#637d91" />}>
          <Redirect />
        </React.Suspense>
      ),
    },
    {
      path: "/search",
      element: (
        <React.Suspense fallback={<PulseLoader color="#637d91" />}>
          <SearchPage />
        </React.Suspense>
      ),
    },
    {
      path: "/results",
      element: (
        <React.Suspense fallback={<PulseLoader color="#637d91" />}>
          <Results />
        </React.Suspense>
      ),
    },
  ]);

  return (
    <>
      <SearchProvider>
        <RouterProvider router={routes} />
      </SearchProvider>
    </>
  );
}

export default App;
