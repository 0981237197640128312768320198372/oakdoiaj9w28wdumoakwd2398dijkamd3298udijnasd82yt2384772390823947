/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import React, { useEffect, useState, useRef } from "react"
import { MdOutlineMarkEmailUnread } from "react-icons/md"
import { FiInbox } from "react-icons/fi"
import { RiSpam2Line } from "react-icons/ri"
import { LuMails } from "react-icons/lu"
import { TbRefresh } from "react-icons/tb"
import { GoArrowUpRight } from "react-icons/go"

interface Email {
  uid: string
  from: string
  subject: string
  body: string
  date: string
}

const EmailsViewer = () => {
  const [emails, setEmails] = useState<Email[]>([])
  const [filteredEmails, setFilteredEmails] = useState<Email[]>([]) // Store filtered emails
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [folder, setFolder] = useState<string>("inbox") // Default folder
  const [searchTerm, setSearchTerm] = useState<string>("") // Search term state
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
      setFilteredEmails(data) // Set initial filtered emails
    } catch (error) {
      console.error("Error fetching emails:", error)
      setEmails([])
      setFilteredEmails([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmails(folder)
  }, [folder])

  useEffect(() => {
    if (selectedEmail && modalRef.current) {
      modalRef.current.focus() // Automatically focus the modal
    }
  }, [selectedEmail])

  useEffect(() => {
    // Dynamically filter emails based on the search term
    const filtered = emails.filter(
      (email) =>
        email.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.body.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredEmails(filtered)
  }, [searchTerm, emails]) // Update filtered emails when searchTerm or emails change

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
          <button
            onClick={() => fetchEmails(folder)} // Calls the fetchEmails function for the active folder
            className='p-1 text-sm rounded-sm font-aktivGroteskBold bg-primary text-dark-800 hover:bg-primary/70 hover:text-dark-800'
            title='Refresh emails'
          >
            <TbRefresh className='text-xl' />
          </button>
        </div>
      </div>

      <input
        type='text'
        placeholder='Search email...'
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className='w-full mb-5 border-[1px] border-primary/40 p-2 px-3 bg-dark-600 text-sm focus:outline-none focus:ring-1 focus:ring-primary'
      />

      <div className='w-full overflow-hidden'>
        {loading ? (
          <div className='w-full max-h-96 flex flex-col overflow-y-scroll __dokmai_scrollbar'>
            <div className='border-b-[1px] border-dark-500 px-5 py-2 text-xs cursor-pointer bg-dark-600 hover:bg-dark-600/40'>
              <div className='w-52 h-5 bg-dark-500 mt-2 animate-pulse' />
              <div className='w-80 h-5 bg-dark-500 mt-2 animate-pulse' />
              <div className='w-96 h-5 bg-dark-500 mt-2 animate-pulse' />
            </div>
            <div className='border-b-[1px] border-dark-500 px-5 py-2 text-xs cursor-pointer bg-dark-600 hover:bg-dark-600/40'>
              <div className='w-52 h-5 bg-dark-500 mt-2 animate-pulse' />
              <div className='w-80 h-5 bg-dark-500 mt-2 animate-pulse' />
              <div className='w-96 h-5 bg-dark-500 mt-2 animate-pulse' />
            </div>
            <div className='border-b-[1px] border-dark-500 px-5 py-2 text-xs cursor-pointer bg-dark-600 hover:bg-dark-600/40'>
              <div className='w-52 h-5 bg-dark-500 mt-2 animate-pulse' />
              <div className='w-80 h-5 bg-dark-500 mt-2 animate-pulse' />
              <div className='w-96 h-5 bg-dark-500 mt-2 animate-pulse' />
            </div>
            <div className='border-b-[1px] border-dark-500 px-5 py-2 text-xs cursor-pointer bg-dark-600 hover:bg-dark-600/40'>
              <div className='w-52 h-5 bg-dark-500 mt-2 animate-pulse' />
              <div className='w-80 h-5 bg-dark-500 mt-2 animate-pulse' />
              <div className='w-96 h-5 bg-dark-500 mt-2 animate-pulse' />
            </div>
            <div className='border-b-[1px] border-dark-500 px-5 py-2 text-xs cursor-pointer bg-dark-600 hover:bg-dark-600/40'>
              <div className='w-52 h-5 bg-dark-500 mt-2 animate-pulse' />
              <div className='w-80 h-5 bg-dark-500 mt-2 animate-pulse' />
              <div className='w-96 h-5 bg-dark-500 mt-2 animate-pulse' />
            </div>
            <div className='border-b-[1px] border-dark-500 px-5 py-2 text-xs cursor-pointer bg-dark-600 hover:bg-dark-600/40'>
              <div className='w-52 h-5 bg-dark-500 mt-2 animate-pulse' />
              <div className='w-80 h-5 bg-dark-500 mt-2 animate-pulse' />
              <div className='w-96 h-5 bg-dark-500 mt-2 animate-pulse' />
            </div>
          </div>
        ) : (
          <div className='w-full max-h-96 flex flex-col overflow-y-scroll __dokmai_scrollbar'>
            {filteredEmails.reverse().map((email) => (
              <div
                key={email.uid}
                className='border-b-[1px] border-dark-500 px-5 py-2 text-xs cursor-pointer bg-dark-600 hover:border-s-2 hover:border-s-primary hover:bg-dark-600/40'
                onClick={() => setSelectedEmail(email)}
              >
                <p className='text-xs'>{formatISODate(email.date)}</p>
                <p className='text-xs font-aktivGroteskThin'>
                  From: {email.from}
                </p>
                <p className='font-aktivGroteskBold text-sm justify-between flex'>
                  {email.subject} <GoArrowUpRight />
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedEmail && (
        <div
          className='fixed inset-0 z-50 bg-black/70 backdrop-blur flex items-center justify-center focus:outline-none focus:outline-0 focus:right-0  focus:ring-0 '
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setSelectedEmail(null)
            }
          }}
          tabIndex={-1} // Makes the div focusable for keydown events
          ref={modalRef}
        >
          <div
            ref={modalRef}
            className='relative w-[85%] lg:w-[60%] p-5 rounded border-[1px] border-dark-500 bg-dark-800 shadow-lg'
          >
            <button
              onClick={() => setSelectedEmail(null)}
              className='absolute top-2 right-2 bg-red-500/20 hover:bg-red-500/30 rounded-sm text-red-500 font-aktivGroteskBold px-2 py-1 text-sm'
            >
              Close
            </button>
            <p className='font-aktivGroteskBold text-sm'>
              {selectedEmail.subject}
            </p>
            <p className='text-xs font-aktivGroteskThin'>
              From: {selectedEmail.from}
            </p>
            <p className='text-xs'>{formatISODate(selectedEmail.date)}</p>
            <div
              className='text-light-100 whitespace-pre-wrap overflow-auto max-h-[70vh] bg-dark-700 mt-5 __dokmai_scrollbar'
              ref={modalRef}
            >
              <div dangerouslySetInnerHTML={{ __html: selectedEmail.body }} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EmailsViewer
