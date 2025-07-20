
"use client";

import { Provider } from "react-redux";
import { store } from "@/store/store";

import Providers from "../components/Providers";

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
