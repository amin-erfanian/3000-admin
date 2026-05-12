export default {
  payload: (state) => ({
    ...state.step1,
    ...state.step2,
    ...state.step3,
    ...state.step4,
  }),
};
