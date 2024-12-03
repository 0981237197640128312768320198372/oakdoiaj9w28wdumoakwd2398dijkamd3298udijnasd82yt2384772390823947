import { generateMetadata } from "@/lib/utils"
import Link from "next/link"

export const metadata = generateMetadata({
  title: "404 Not Found",
})
export default function NotFound() {
  return (
    <main className='flex flex-col justify-center items-center min-h-screen bg-dark-900 text-light-100'>
      <h1 className='text-6xl font-bold'>404</h1>
      <p className='mt-4 text-xl'>Oops! Page not found.</p>
      <Link href='/'>
        <p className='mt-6 px-4 py-2 bg-primary text-dark-800 font-aktivGroteskBold rounded-sm hover:bg-primary-dark transition duration-300'>
          Go Back Home
        </p>
      </Link>
    </main>
  )
}
