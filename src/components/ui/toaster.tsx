"use client";

import {
  Toaster as ChakraToaster,
  Portal,
  Stack,
  Toast,
  Progress,
} from "@chakra-ui/react";
import { FaRegCheckCircle } from "react-icons/fa";
import { MdErrorOutline } from "react-icons/md";
import { LuMessageCircleWarning } from "react-icons/lu";
import { toaster } from "./toastFactory";

export const Toaster = () => {
  return (
    <Portal>
      <ChakraToaster toaster={toaster} insetInline={{ mdDown: "4" }}>
        {(toast) => (
          <Toast.Root
            width={{ md: "xs" }}
            bg={
              toast.type === "success"
                ? "green.100"
                : toast.type === "error"
                  ? "red.100"
                  : toast.type === "warning"
                    ? "orange.100"
                    : {
                        _light: "primaryLight",
                        _dark: "primaryDark",
                      }
            }
            border={
              toast.type === "success"
                ? "1px solid green"
                : toast.type === "error"
                  ? "1px solid red"
                  : "1px solid gray"
            }
          >
            <Stack gap="1" maxWidth="100%">
              {toast.type === "loading" && (
                <Progress.Root
                  maxW="240px"
                  value={null}
                  transition="width 5s linear"
                >
                  <Progress.Track>
                    <Progress.Range />
                  </Progress.Track>
                </Progress.Root>
              )}
              <Stack gap="4" direction="row">
                {toast.type === "success" && (
                  <FaRegCheckCircle
                    color="green"
                    style={{
                      width: "2.5em",
                      height: "2.5em",
                    }}
                  />
                )}
                {toast.type === "warning" && (
                  <LuMessageCircleWarning
                    color="orange"
                    style={{
                      width: "2.5em",
                      height: "2.5em",
                    }}
                  />
                )}
                {toast.type === "error" && (
                  <MdErrorOutline
                    color="red"
                    style={{
                      width: "2.5em",
                      height: "2.5em",
                    }}
                  />
                )}
                <Stack gap="3" direction="column">
                  {toast.title && (
                    <Toast.Title
                      color={
                        toast.type === "success"
                          ? "green.800"
                          : toast.type === "error"
                            ? "red.800"
                            : toast.type === "warning"
                              ? "orange.800"
                              : "gray.800"
                      }
                    >
                      {toast.title}
                    </Toast.Title>
                  )}
                  {toast.description && (
                    <Toast.Description
                      color={
                        toast.type === "success"
                          ? "green.600"
                          : toast.type === "error"
                            ? "red.600"
                            : toast.type === "warning"
                              ? "orange.600"
                              : "gray.600"
                      }
                    >
                      {toast.description}
                    </Toast.Description>
                  )}
                </Stack>
              </Stack>
            </Stack>
            {toast.action && (
              <Toast.ActionTrigger color="brand.300">
                {toast.action.label}
              </Toast.ActionTrigger>
            )}
            {toast.closable && (
              <Toast.CloseTrigger
                color={
                  toast.type === "success"
                    ? "green.600"
                    : toast.type === "error"
                      ? "red.600"
                      : toast.type === "warning"
                        ? "orange.600"
                        : "gray.600"
                }
              />
            )}
          </Toast.Root>
        )}
      </ChakraToaster>
    </Portal>
  );

