import PageHeadline from "@/components/PageHeadline"
import ShowHelpList from "@/components/ShowHelpList"
import { generateMetadata } from "@/lib/utils"

export const metadata = generateMetadata({
  title: "Help Center",
  description: "You can find any help here.",
  url: "https://www.dokmaistore.com/help",
  keywords: "help center",
})

const Page = () => {
  return (
    <main className='flex flex-col justify-center w-full items-center px-5 xl:px-0 pt-10 xl:pt-28 __container'>
      <PageHeadline
        headline='Help Center'
        description='You can find any help here.'
      />
      <ShowHelpList />
    </main>
  )
}

export default Page
