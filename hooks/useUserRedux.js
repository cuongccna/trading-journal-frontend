'use client';
import { useSelector } from "react-redux";

export function useUserRedux() {
  const user = useSelector((state) => state.user);
  return user;
}
