"use client"

import ActivityLogs from "@/components/ActivityLogs"
import PageHeadline from "@/components/PageHeadline"
import AdminDeposit from "./AdminDeposit"
import EmailsViewer from "./EmailsViewer"
import ManageHelps from "./ManageHelps"

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
          className='bg-red-500 text-dark-800 hover:bg-red-500/90 active:bg-red-500/80 px-1 font-aktivGroteskBold'
        >
          Logout
        </button>
      </div>
      <div className='flex justify-between flex-col items-center gap-10 w-full'>
        <div className='flex flex-col-reverse lg:flex-row gap-10 justify-center items-start w-full'>
          <EmailsViewer />
          <AdminDeposit />
        </div>
        <ActivityLogs />
        <ManageHelps />
      </div>
    </>
  )
}

export default AdminPageContent
