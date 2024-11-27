import Authenticator from "@/components/Authenticator"
import AdminPageContent from "@/components/AdminPageContent"
import { generateMetadata } from "@/lib/utils"

export const metadata = generateMetadata({
  title: "Admin Panel",
  description:
    "A streamlined page for tracking client activities, sales stats, transactions, and deposits, with easy management tools for smooth operations.",
})
export default function AdminPage() {
  return (
    <div className='flex flex-col justify-center w-full items-center px-5 xl:px-0 pt-10 xl:pt-28 __container'>
      <Authenticator>
        <AdminPageContent />
      </Authenticator>
    </div>
  )
}
