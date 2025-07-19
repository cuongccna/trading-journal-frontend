import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { setUser, setLoading, setError } from "@/store/userSlice";

export function useUserRedux() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.info);
  const loading = useSelector((state) => state.user.loading);
  const error = useSelector((state) => state.user.error);

  useEffect(() => {
    if (!user) {
      dispatch(setLoading(true));
      axios
        .get("/api/users/me")
        .then((res) => dispatch(setUser(res.data)))
        .catch(() => dispatch(setError("Không lấy được thông tin user.")));
    }
    // eslint-disable-next-line
  }, []);

  return { user, loading, error };
}
