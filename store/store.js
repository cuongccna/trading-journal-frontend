// src/store/store.js
'use client';
import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice.js"; // hoặc './userSlice.js'

export const store = configureStore({
  reducer: {
    user: userReducer,
    // ... các slice khác
  },
});
