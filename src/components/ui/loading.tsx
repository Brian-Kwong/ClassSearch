import { PulseLoader } from "react-spinners";
import { Text } from "@chakra-ui/react";
import styles from "../../css-styles/loading.module.css";

export const Loading = ({ message }: { message: string }) => {
  return (
    <div className={styles.loadingContainer}>
      <PulseLoader color="#637d91" />
      <Text>{message}</Text>
    </div>
  );
};

export default Loading;
