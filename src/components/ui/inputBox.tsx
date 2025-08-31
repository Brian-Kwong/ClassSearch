import { Input, Field } from "@chakra-ui/react";
import React from "react";

type InputBoxProps = {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;


const InputBox = ({ label, value, onChange }: InputBoxProps) => {
  return (
    <Field.Root width={{ base: "50vw", md: "15vw" }}>
      <Field.Label
        style={{
          display: "flex",
          flexDirection: "column",
          alignContent: "center",
          justifyContent: "center",
          width: "100%",
        }}
      >
        {label}
      </Field.Label>
      <Input
        placeholder={`Enter the ${label}`}
        value={value}
        onChange={onChange}
      />
    </Field.Root>
  );


export default React.memo(InputBox);
