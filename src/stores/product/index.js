import { defineStore } from 'pinia';
import state from './state';
import getters from './getters';

export const useProductStore = defineStore('product', {
  state,
  getters,
  actions: {
    reset() {
      this.$reset();
    },
  },

  persist: true,
});
