/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import React, { useEffect, useState, useRef } from "react"
import { MdOutlineMarkEmailUnread } from "react-icons/md"
import Loading from "./Loading"
import { FiInbox } from "react-icons/fi"
import { RiSpam2Line } from "react-icons/ri"
import { LuMails } from "react-icons/lu"

interface Email {
  uid: string
  from: string
  subject: string
  body: string
  date: string
}

const EmailsViewer = () => {
  const [emails, setEmails] = useState<Email[]>([])
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [folder, setFolder] = useState<string>("inbox") // Default folder
  const modalRef = useRef<HTMLDivElement | null>(null)

  const fetchEmails = async (folder: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/fetch_emails?folder=${folder}`)
      if (!response.ok) {
        throw new Error("Failed to fetch emails.")
      }
      const data = await response.json()
      setEmails(data)
    } catch (error) {
      console.error("Error fetching emails:", error)
      setEmails([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmails(folder)
  }, [folder])

  const formatISODate = (isoDate: string): string => {
    if (!isoDate) return "Invalid Date"

    const date = new Date(isoDate)

    if (isNaN(date.getTime())) {
      return "Invalid Date" // Handle invalid date
    }

    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }

    return date.toLocaleString(undefined, options) // Uses user's locale
  }

  const handleOutsideClick = (event: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      setSelectedEmail(null)
    }
  }

  useEffect(() => {
    if (selectedEmail) {
      document.addEventListener("mousedown", handleOutsideClick)
    } else {
      document.removeEventListener("mousedown", handleOutsideClick)
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick)
    }
  }, [selectedEmail])

  const mailButtons = [
    {
      folder: "inbox",
      icon: <FiInbox className='inline-block mr-1' />,
      label: "Inbox",
    },
    {
      folder: "spam",
      icon: <RiSpam2Line className='inline-block mr-1' />,
      label: "Spam",
    },
    {
      folder: "all",
      icon: <LuMails className='inline-block mr-1' />,
      label: "All",
    },
  ]
  return (
    <div className='min-h-fit w-full lg:max-w-[700px] overflow-y-scroll flex flex-col items-center p-5 text-light-100 border-[1px] border-dark-500 bg-dark-700 rounded'>
      <div className='w-full max-w-4xl flex justify-between items-start border-b-[1px] border-dark-500 mb-5'>
        <h3 className='flex items-center gap-2 font-bold mb-5'>
          <MdOutlineMarkEmailUnread />
          Email
        </h3>
        <div className='flex gap-1 mb-5'>
          {mailButtons.map(({ folder: btnFolder, icon, label }) => (
            <button
              key={btnFolder}
              onClick={() => setFolder(btnFolder)}
              className={`px-2 py-1 text-sm rounded-sm font-aktivGroteskBold items-center ${
                btnFolder === folder
                  ? "bg-primary text-dark-800"
                  : "bg-dark-800 text-light-100 hover:bg-primary/70 hover:text-dark-800"
              }`}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className='w-full overflow-hidden'>
        {loading ? (
          <Loading />
        ) : (
          <div className='w-full max-h-96 flex flex-col-reverse overflow-y-scroll'>
            {emails.map((email) => (
              <div
                key={email.uid}
                className='border-b-[1px] border-dark-500 px-5 py-2 text-xs cursor-pointer bg-dark-600 hover:bg-dark-600/40'
                onClick={() => setSelectedEmail(email)}
              >
                <p className='text-xs'>{formatISODate(email.date)}</p>
                <p className='text-xs font-aktivGroteskThin'>
                  From: {email.from}
                </p>
                <p className='font-aktivGroteskBold text-sm'>{email.subject}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Email Popup */}
      {selectedEmail && (
        <div className='fixed inset-0 z-50 bg-black/50 backdrop-blur flex items-center justify-center'>
          <button
            onClick={() => setSelectedEmail(null)}
            className='absolute top-10 right-10 bg-red-500 rounded-sm text-dark-800 font-aktivGroteskBold px-2 py-1 text-sm'
          >
            Close
          </button>
          <div
            ref={modalRef}
            className='relative w-[85%] lg:w-[60%] p-5 rounded border-[1px] border-dark-500 bg-dark-800 shadow-lg'
          >
            <p className='font-aktivGroteskBold text-sm'>
              {selectedEmail.subject}
            </p>
            <p className='text-xs font-aktivGroteskThin'>
              From: {selectedEmail.from}
            </p>
            <p className='text-xs'>{formatISODate(selectedEmail.date)}</p>
            <div className='text-light-100 whitespace-pre-wrap overflow-auto max-h-[70vh] bg-dark-700 mt-5'>
              <div dangerouslySetInnerHTML={{ __html: selectedEmail.body }} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EmailsViewer
