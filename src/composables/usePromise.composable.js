import { ref } from 'vue';

const defaultConfig = {
  throwOnError: false,
  onError: async (err) => console.error(err),
};

export const usePromise = (promise, options = defaultConfig) => {
  const { onError, throwOnError } = options;

  const loading = ref(false);
  const isRejected = ref(false);
  const error = ref(null);
  const data = ref(null);

  const execute = async (...params) => {
    if (loading.value) return;

    loading.value = true;
    isRejected.value = false;
    error.value = null;

    try {
      const result = await promise(...params);
      data.value = result;
      return result;
    } catch (err) {
      isRejected.value = true;
      error.value = err;
      await onError(err);
      if (throwOnError) throw err;
    } finally {
      loading.value = false;
    }
  };

  return { data, error, isRejected, loading, execute };
};

export default usePromise;
