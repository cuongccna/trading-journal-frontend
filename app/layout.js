import "antd/dist/reset.css";
import '../styles/globals.css';
import useFetchUser from '../hooks/useFetchUser';
export default function RootLayout({ children }) {
  useFetchUser();
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
