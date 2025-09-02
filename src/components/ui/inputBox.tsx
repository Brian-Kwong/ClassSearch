import { Input, Field, Spinner } from "@chakra-ui/react";
import React from "react";

type InputBoxProps = {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  loadingData?: boolean;


const InputBox = ({ label, value, onChange, loadingData }: InputBoxProps) => {
  return (
    <Field.Root
      width={{ base: "50vw", md: "15vw" }}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        height: "100%",
      }}
    >
      <Field.Label
        style={{
          display: "flex",
          flexDirection: "row",
          alignContent: "center",
          justifyContent: "center",
          width: "100%",
          gap: "8px",
        }}
      >
        {label}
        {loadingData && <Spinner size="sm" />}
      </Field.Label>
      <Input
        placeholder={`Enter the ${label}`}
        value={value}
        onChange={onChange}
      />
    </Field.Root>
  );


export default React.memo(InputBox);
