"use client"

import ActivityLogs from "@/components/ActivityLogs"
import PageHeadline from "@/components/PageHeadline"

const AdminPageContent = () => {
  const handleLogout = () => {
    localStorage.removeItem("auth")
    location.reload()
  }

  return (
    <>
      <PageHeadline
        headline='Admin Panel'
        description='A streamlined page for tracking client activities, sales stats, transactions, and deposits, with easy management tools for smooth operations.'
      />
      <button
        onClick={handleLogout}
        className='bg-red-500/30 text-red-500 px-2 py-1 rounded'
      >
        Logout
      </button>
      <ActivityLogs />
    </>
  )
}

export default AdminPageContent
