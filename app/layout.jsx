import "antd/dist/reset.css";
import '../styles/globals.css';
import Providers from '../components/Providers';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
