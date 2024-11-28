import Authenticator from "@/components/Authenticator"
import StaffPageContent from "@/components/StaffPageContent"
import { generateMetadata } from "@/lib/utils"

export const metadata = generateMetadata({
  title: "Staff Panel",
  description:
    "A streamlined page for Staff, and let staff easily manage any data for smooth operations.",
})
export default function StaffPage() {
  return (
    <div className='flex flex-col justify-center w-full items-center px-5 xl:px-0 pt-10 xl:pt-28 __container'>
      <Authenticator>
        <StaffPageContent />
      </Authenticator>
    </div>
  )
}
