import { Inter } from "next/font/google";
import SessionProviderAuth from "@/app/components/sessionProviderAuth";
import './globals.css'
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({ children }) {
  return (
      <html lang="en">
      <SessionProviderAuth>
        <body className={inter.className}>{children}</body>
      </SessionProviderAuth>
      </html>
  );
}
