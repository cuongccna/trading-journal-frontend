import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  info: null,   // Chứa data user
  loading: true,
  error: "",
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser(state, action) {
      state.info = action.payload;
      state.loading = false;
      state.error = "";
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
      state.loading = false;
    },
    updatePlan(state, action) {
      if (state.info) state.info.plan = action.payload;
    },
  },
});

export const { setUser, setLoading, setError, updatePlan } = userSlice.actions;
export default userSlice.reducer;
