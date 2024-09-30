import {useEffect, useState} from 'react';
import Toast from 'react-native-toast-message';

const useErrors = (errors = []) => {
  useEffect(() => {
    errors.forEach(({isError, error, fallback}) => {
      if (isError) {
        if (fallback) fallback();
        else {
          Toast.show({
            bottomOffset: 100,
            type: 'error',
            text1: 'Error',
            text2: error?.data?.message || 'Something went wrong',
          });
        }
      }
    });
  }, [errors]);
};

const useAsyncMutation = mutationHook => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState(null);

  const [mutate] = mutationHook();

  const executeMutation = async (toastMessage, ...args) => {
    setIsLoading(true);
    Toast.show({
      bottomOffset: 100,
      type: 'info',
      text1: 'Loading',
      text2: toastMessage || 'Updating data...',
      position: 'bottom',
    });

    try {
      const res = await mutate(...args);
      if (res.data) {
        Toast.show({
          bottomOffset: 100,
          type: 'success',
          text1: 'Success',
          text2: res.data.message || 'Updated data successfully',
          position: 'bottom',
        });
        setData(res.data);
      } else {
        Toast.show({
          bottomOffset: 100,
          type: 'error',
          text1: 'Error',
          text2: res?.error?.data?.message || 'Something went wrong',
          position: 'bottom',
        });
      }
    } catch (error) {
      Toast.show({
        bottomOffset: 100,
        type: 'error',
        text1: 'Error',
        text2: 'Something went wrong',
        position: 'bottom',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return [executeMutation, isLoading, data];
};

const useSocketEvents = (socket, handlers) => {
  useEffect(() => {
    Object.entries(handlers).forEach(([event, handler]) => {
      socket.on(event, handler);
    });

    return () => {
      Object.entries(handlers).forEach(([event, handler]) => {
        socket.off(event, handler);
      });
    };
  }, [socket, handlers]);
};

export {useErrors, useAsyncMutation, useSocketEvents};
