import { Group, Text, Button } from "@chakra-ui/react";
import CSUSelector from "../components/ui/csuSelector";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

const SelectCSU = () => {
  const [selectedUniversity, setSelectedUniversity] = useState<string>("");
  const navigator = useNavigate();

  const onLogin = async () => {
    if (!selectedUniversity) {
      alert("Please select an institution before continuing");
      return;
    }
    await localStorage.setItem("selectedUniversity", selectedUniversity);
    navigator(`/redirect?university=${selectedUniversity}`);
  

  useEffect(() => {
    const storedUniversity = localStorage.getItem("selectedUniversity");
    if (storedUniversity) {
      setSelectedUniversity(storedUniversity);
    }
  }, []);

  return (
    <div className="primaryDiv">
      <Text fontSize="4xl" fontWeight="bold">
        Welcome to ClassSearch
      </Text>
      <Group>
        <CSUSelector
          selectedValue={selectedUniversity}
          setSelectedValue={setSelectedUniversity}
        />
        <Button
          type="submit"
          size="sm"
          onClick={onLogin}
          bg={selectedUniversity ? "brand.300" : "gray.300"}
        >
          Login
        </Button>
      </Group>
    </div>
  );


export default SelectCSU;
