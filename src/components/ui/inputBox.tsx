import { Input, Field, Spinner } from "@chakra-ui/react";
import React from "react";
import styles from "../../css-styles/inputBox.module.css";

type InputBoxProps = {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  loadingData?: boolean;


const InputBox = ({ label, value, onChange, loadingData }: InputBoxProps) => {
  return (
    <Field.Root
      width={{ base: "50vw", md: "15vw" }}
      className={styles.inputBox}
    >
      <Field.Label className={styles.inputBoxLabel}>
        {label}
        {loadingData && <Spinner size="sm" />}
      </Field.Label>
      <Input
        placeholder={`Enter the ${label}`}
        value={value}
        onChange={onChange}
        className={styles.inputBoxInput}
      />
    </Field.Root>
  );


export default React.memo(InputBox);
