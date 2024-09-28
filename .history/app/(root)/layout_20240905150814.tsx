import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "Watch Series Now!",
  description: "watch series now website for payment",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className='antialiased fontwsn'
      >
        {children}
      </body>
    </html>
  );
}
