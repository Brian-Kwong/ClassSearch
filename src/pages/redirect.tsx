import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
const { ipcRenderer } = window.require("electron");
import Error from "./error";
import { redirectURL, SearchParamJson } from "../components/types";
import { PulseLoader } from "react-spinners";

const Redirect = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
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
    ipcRenderer
      .invoke("first-login", { url })
      .then((result: SearchParamJson | null) => {
        setLoading(false);
        setUniversityInfo(result);
        isCreatingLoginWindow.current = false;
      });
  }, [university]);

  useEffect(() => {
    if (!universityInfo) return;
    // Handle universityInfo changes
    navigate(`/search?university=${university}`, {
      state: { searchOptions: universityInfo },
    });
  }, [university, universityInfo, navigate]);

  return (
    <>
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "100px" }} >
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
