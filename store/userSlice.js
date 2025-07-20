// src/store/userSlice.js
import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: "user",
  initialState: {
    info: null,
    loading: false,
    error: null,
    // ...
  },
  reducers: {
    setUser: (state, action) => ({ ...state, info: action.payload, loading: false, error: null }),
    setLoading: (state, action) => ({ ...state, loading: action.payload }),
    setError: (state, action) => ({ ...state, error: action.payload, loading: false }),
    clearUser: (state) => ({ info: null, loading: false, error: null }),
    updatePlan: (state, action) => ({ ...state, info: { ...state.info, plan: action.payload } }),
  }
});
export const { setUser, setLoading, setError, clearUser, updatePlan } = userSlice.actions;
export default userSlice.reducer;
