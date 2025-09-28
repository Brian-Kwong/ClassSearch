import {
  Dialog,
  Portal,
  Button,
  CloseButton,
  createOverlay,
  Checkbox,
} from "@chakra-ui/react";
import { LuMessageCircleWarning } from "react-icons/lu";
import styles from "../../css-styles/warning.module.css";

const WarningDialog = createOverlay((props) => {
  const { title, description, onConfirm, ...rest } = props;
  return (
    <Dialog.Root {...rest} placement="center">
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content className={styles.warningContainer}>
            {title && (
              <Dialog.Header>
                <LuMessageCircleWarning
                  color="orange"
                  className={styles.icon}
                />
                <Dialog.Title>{title}</Dialog.Title>
              </Dialog.Header>
            )}
            <Dialog.Body spaceY="4">
              {description && (
                <Dialog.Description className={styles.bodyText}>
                  {description}
                </Dialog.Description>
              )}
              <Checkbox.Root
                colorPalette={"brand"}
                onCheckedChange={(checked) => {
                  if (checked.checked === true) {
                    localStorage.setItem("suppressMaxEntriesWarning", "true");
                  } else {
                    localStorage.removeItem("suppressMaxEntriesWarning");
                  }
                }}
              >
                <Checkbox.HiddenInput />
                <Checkbox.Control />
                <Checkbox.Label>Do not show this again</Checkbox.Label>
              </Checkbox.Root>
            </Dialog.Body>
            <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <Button
                  className={`${styles.button} ${styles.cancel}`}
                  onClick={() => {
                    localStorage.removeItem("suppressMaxEntriesWarning");
                    window.location.reload();
                  }}
                >
                  Cancel
                </Button>
              </Dialog.ActionTrigger>
              <Button
                className={`${styles.button} ${styles.confirm}`}
                onClick={() => onConfirm()}
              >
                Continue
              </Button>
            </Dialog.Footer>
            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
});

export default WarningDialog;
