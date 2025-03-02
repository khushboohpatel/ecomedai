import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/organisms/Header";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata = {
  title: "EcoMed.AI",
  description: "EcoMed.AI",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <Header />
        {children}
      </body>
    </html>
  );
}
