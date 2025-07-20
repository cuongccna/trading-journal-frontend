'use client';
import { useSelector } from 'react-redux';

function Header() {
  const user = useSelector(state => state.user);
  return (
    <div>
      {user.uid
        ? <span>Chào {user.displayName || user.email} ({user.plan})</span>
        : <span>Bạn chưa đăng nhập</span>}
    </div>
  );
}

export default Header;
