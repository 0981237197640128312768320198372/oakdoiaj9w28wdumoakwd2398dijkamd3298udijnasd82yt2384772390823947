"use client"

import ActivityLogs from "@/components/ActivityLogs"
import PageHeadline from "@/components/PageHeadline"
import AdminDeposit from "./AdminDeposit"

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
      <div className='w-full flex items-center justify-end mb-10'>
        <button
          onClick={handleLogout}
          className='bg-red-500/20 text-red-500 hover:bg-red-500/30 active:bg-red-500/40 px-2 py-1 rounded'
        >
          Logout
        </button>
      </div>
      <div className='flex flex-col lg:flex-row justify-between items-center lg:items-start w-full gap-10'>
        <AdminDeposit />
        <ActivityLogs />
      </div>
    </>
  )
}

export default AdminPageContent
