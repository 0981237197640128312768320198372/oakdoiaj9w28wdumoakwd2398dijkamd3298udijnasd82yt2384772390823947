/* eslint-disable @next/next/next-script-for-ga */
/* eslint-disable @typescript-eslint/no-unused-vars */
import Authenticator from "@/components/Authenticator"
import "@/styles/globals.css"
import Image from "next/image"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en'>
      <head>
        <meta name='viewport' content='width=device-width, initial-scale=1.0' />
      </head>
      <body className='font-aktivGroteskRegular min-h-screen bg-dark-800 text-light-200 overflow-x-hidden selection:bg-primary/10 selection:text-primary flex flex-col justify-start w-full items-center p-5 xl:p-10'>
        <Authenticator>{children}</Authenticator>
      </body>
    </html>
  )
}
