import { Group, Text, Button, createListCollection } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Selector from "../components/ui/selector";

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
  };

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
        <Selector
          options={csuList}
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
};

export default SelectCSU;
