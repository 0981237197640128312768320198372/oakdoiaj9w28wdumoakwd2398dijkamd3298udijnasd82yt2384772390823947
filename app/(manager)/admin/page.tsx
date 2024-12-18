import AdminPageContent from "@/components/AdminPageContent"
import { generateMetadata } from "@/lib/utils"

export const metadata = generateMetadata({
  title: "Admin Panel",
  description:
    "A streamlined page for tracking client activities, sales stats, transactions, and deposits, with easy management tools for smooth operations.",
})
export default function AdminPage() {
  return <AdminPageContent />
}
