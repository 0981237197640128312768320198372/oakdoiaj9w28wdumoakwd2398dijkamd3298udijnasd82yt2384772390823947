/* eslint-disable @next/next/next-script-for-ga */
/* eslint-disable @typescript-eslint/no-unused-vars */
import Authenticator from '@/components/Private/admin/Authenticator';
import '@/styles/globals.css';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-aktivGroteskRegular min-h-screen bg-dark-800 text-light-200 overflow-x-hidden selection:bg-primary/10 selection:text-primary flex flex-col justify-start w-full items-center">
        <Authenticator>{children}</Authenticator>
      </body>
    </html>
  );
}
