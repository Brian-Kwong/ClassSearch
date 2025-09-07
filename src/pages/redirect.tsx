import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import Error from "./error";
import { redirectURL, SearchParamJson } from "../components/types";
import { PulseLoader } from "react-spinners";
import { useSearchContext } from "../contextFactory";

// Extend the Window interface to allow for the electronAPI (Secure IPC comms)
declare global {
  interface Window {
    electronAPI: {
      firstLogin: (url: string) => Promise<SearchParamJson | null>;
      fetchCourses: (
        url: string,
      ) => Promise<{ success: boolean; data?: unknown; error?: string }>;
      getModelPath: () => Promise<string | null>;
      semanticSearch: {
        performIconSearch: (query: {
          courses: { subject_descr: string }[];
        }) => Promise<{ lib: string; name: string }[]>;
        setup: () => Promise<void>;
      
    
  }
}

const Redirect = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setSearchOptions } = useSearchContext();
  const university = searchParams.get("university");
  const [universityInfo, setUniversityInfo] = useState<SearchParamJson | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const isCreatingLoginWindow = useRef(false);

  useEffect(() => {
    if (!university) return;
    if (isCreatingLoginWindow.current) return;
    isCreatingLoginWindow.current = true;
    const url = `${redirectURL[university as keyof typeof redirectURL]}`;
    window.electronAPI
      .firstLogin(url)
      .then((result: SearchParamJson | null) => {
        setLoading(false);
        setUniversityInfo(result);
        isCreatingLoginWindow.current = false;
      });
  }, [university]);

  useEffect(() => {
    if (!universityInfo) return;
    // Handle universityInfo changes
    setSearchOptions(universityInfo);
    navigate(`/search?university=${university}`);
  }, [university, universityInfo, navigate, setSearchOptions]);

  return (
    <>
      {loading ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "100px",
          }}
        >
          <PulseLoader color="#637d91" />
          <Text>Redirecting to {university}...</Text>
        </div>
      ) : universityInfo ? (
        <PulseLoader color="#637d91" />
      ) : (
        <Error message="Failed to load university information." />
      )}
    </>
  );


export default Redirect;
