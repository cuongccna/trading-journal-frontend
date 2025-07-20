'use client';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setUser, clearUser } from '../store/userSlice';

export default function useFetchUser() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Phải chạy trên client!
    const token = localStorage.getItem('token');
    if (!token) {
      dispatch(clearUser());
      return;
    }
    fetch('/api/users/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(user => dispatch(setUser(user)))
      .catch(() => dispatch(clearUser()));
  }, [dispatch]);
}
