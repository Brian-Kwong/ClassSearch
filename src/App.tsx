import "./App.css";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import React from "react";
import { PulseLoader } from "react-spinners";

function App() {

  const Redirect = React.lazy(() => import("./pages/redirect"));
  const SearchPage = React.lazy(() => import("./pages/searchPage"));
  const SelectCSU = React.lazy(() => import("./pages/selectcsu"));

  const routes = createBrowserRouter([
    {
      path: "/",
      element: <React.Suspense fallback={<PulseLoader color="#637d91" />}>
        <SelectCSU />
      </React.Suspense>,
    },
    {
      path: "/redirect?",
      element: <React.Suspense fallback={<PulseLoader color="#637d91" />}>
        <Redirect />
      </React.Suspense>,
    },
    {
      path: "/search",
      element: <React.Suspense fallback={<PulseLoader color="#637d91" />}>
        <SearchPage />
      </React.Suspense>,
    },
  ]);

  return (
    <>
      <RouterProvider router={routes} />
    </>
  );
}

export default App;
