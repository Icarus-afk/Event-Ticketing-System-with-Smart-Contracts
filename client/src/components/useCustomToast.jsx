import { useToast } from "@chakra-ui/react";

export const useCustomToast = () => {
  const toast = useToast();

  const showSuccessToast = (message) => {
    toast({
      title: message,
      status: "success",
      duration: 5000,
      isClosable: true,
    });
  };

  const showErrorToast = (message) => {
    toast({
      title: message,
      status: "error",
      duration: 5000,
      isClosable: true,
    });
  };

  return { showSuccessToast, showErrorToast };
};