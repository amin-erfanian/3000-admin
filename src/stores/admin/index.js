import { defineStore } from 'pinia';
import state from './state';
import actions from './actions';
import getters from './getters';

const useAdminStore = defineStore('admin', {
  state,
  actions,
  getters,
});

export default useAdminStore;
