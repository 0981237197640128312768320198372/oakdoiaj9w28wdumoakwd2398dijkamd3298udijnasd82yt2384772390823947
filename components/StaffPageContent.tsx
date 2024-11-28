"use client"

import PageHeadline from "@/components/PageHeadline"
import EmailsViewer from "./EmailsViewer"

const AdminPageContent = () => {
  const handleLogout = () => {
    localStorage.removeItem("auth")
    location.reload()
  }

  return (
    <>
      <PageHeadline
        headline='Staff Panel'
        description='A streamlined page for Staff, and let staff easily manage any data for smooth operations.'
      />
      <div className='w-full flex items-center justify-end mb-10'>
        <button
          onClick={handleLogout}
          className='bg-red-500 text-dark-800 hover:bg-red-500/90 active:bg-red-500/80 px-1 font-aktivGroteskBold'
        >
          Logout
        </button>
      </div>
      <div className='flex flex-col lg:flex-row gap-10 justify-center items-start w-full'>
        <EmailsViewer />
      </div>
    </>
  )
}

export default AdminPageContent
