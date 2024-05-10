import { useToast } from "@chakra-ui/react";

export const useCustomToast = () => {
  const toast = useToast();

  const showSuccessToast = (message) => {
    return toast({
      title: message,
      status: "success",
      duration: 5000,
      isClosable: true,
    });
  };

  const showErrorToast = (message) => {
    console.log(message);
    return toast({
      title: message,
      status: "error",
      duration: 5000,
      isClosable: true,
    });
  };

  const showPromiseToast = (promise, successMessage, errorMessage) => {
    return toast.promise(promise, {
      loading: { title: 'Loading...', description: 'Please wait' },
      success: { title: successMessage, description: 'Success!' },
      error: { title: errorMessage, description: 'Error' },
    });
  };

  return { showSuccessToast, showErrorToast, showPromiseToast };
};