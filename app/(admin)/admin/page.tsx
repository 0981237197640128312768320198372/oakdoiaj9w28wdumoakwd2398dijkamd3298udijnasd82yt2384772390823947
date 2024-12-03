import AdminPageContent from "@/components/AdminPageContent"
import Authenticator from "@/components/Authenticator"
import { generateMetadata } from "@/lib/utils"

export const metadata = generateMetadata({
  title: "Admin Panel",
  description:
    "A streamlined page for tracking client activities, sales stats, transactions, and deposits, with easy management tools for smooth operations.",
})
export default function AdminPage() {
  return (
    <Authenticator>
      <AdminPageContent />
    </Authenticator>
  )
}
