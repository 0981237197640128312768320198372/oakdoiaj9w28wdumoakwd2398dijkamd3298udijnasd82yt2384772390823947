/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import Image from "next/image"
import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { BiSolidEdit } from "react-icons/bi"
import { RiArrowDownWideLine, RiArrowUpWideLine } from "react-icons/ri"
import { PiPlusSquare } from "react-icons/pi"
import { MdOutlineLiveHelp } from "react-icons/md"
import { FiEdit3 } from "react-icons/fi"
import { RxTrash } from "react-icons/rx"

interface HelpStep {
  step: string
  description: string
  picture: string
}

interface HelpItem {
  id: string
  title: string
  description: string
  categories: string[]
  steps: HelpStep[]
}

const ManageHelps: React.FC = () => {
  const [helps, setHelps] = useState<HelpItem[]>([])
  const [selectedHelp, setSelectedHelp] = useState<HelpItem | null>(null)
  const [editingStepIndex, setEditingStepIndex] = useState<number | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{
    message: string
    type: "success" | "error"
  } | null>(null)
  const [showAddHelpForm, setShowAddHelpForm] = useState(false)
  const [showEditSteps, setShowEditSteps] = useState(false)
  const [showAddStepForm, setShowAddStepForm] = useState(false)
  const [pictureUrl, setPictureUrl] = useState<string>("") // To store the uploaded picture URL
  const [isUploading, setIsUploading] = useState<boolean>(false)

  const animationVariants = {
    hidden: { opacity: 0, y: 30 }, // Initial state: faded out and slightly below
    visible: { opacity: 1, y: 0 }, // Final state: fully visible and at its position
    exit: { opacity: 0, y: -30 }, // Exit state: faded out and slightly above
  }

  useEffect(() => {
    const fetchHelps = async () => {
      if (loading) {
        try {
          const response = await fetch("/api/get_helps?fetchall=true")
          if (!response.ok) throw new Error("Failed to fetch helps")

          const data = await response.json()
          setHelps(data.helps) // Avoid appending to helps multiple times
        } catch (error) {
          console.error(error)
          setFeedback({ message: "Failed to fetch helps", type: "error" })
        } finally {
          setLoading(false)
        }
      }
    }

    fetchHelps()
  }, [loading]) // Only runs if loading is true

  const handleFeedback = (message: string, type: "success" | "error") => {
    setFeedback({ message, type })
    setTimeout(() => setFeedback(null), 3000)
  }

  const handleAddHelp = async (newHelp: Partial<HelpItem>) => {
    setActionLoading("addingHelp")
    const id = `${newHelp.title?.toLowerCase().replace(/\s+/g, "-")}-${
      helps.length
    }`

    const helpToAdd: HelpItem = {
      id,
      title: newHelp.title || "",
      description: newHelp.description || "",
      categories: newHelp.categories || [],
      steps: newHelp.steps || [],
    }

    try {
      const response = await fetch("/api/manage_helps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add", help: helpToAdd }),
      })

      if (!response.ok) throw new Error("Failed to add new help")

      setHelps((prev) => [...prev, helpToAdd])
      handleFeedback("Help added successfully!", "success")
    } catch (error) {
      handleFeedback("Failed to add new help.", "error")
    } finally {
      setActionLoading(null)
      setShowAddHelpForm(false)
    }
  }

  const handleUpdateHelp = async (
    id: string,
    updatedHelp: Partial<HelpItem>
  ) => {
    setActionLoading("updatingHelp")
    try {
      const response = await fetch("/api/manage_helps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update", id, updatedHelp }),
      })

      if (!response.ok) throw new Error("Failed to update help")

      setHelps((prev) =>
        prev.map((help) =>
          help.id === id ? { ...help, ...updatedHelp } : help
        )
      )
      handleFeedback("Help updated successfully!", "success")
      setSelectedHelp(null)
    } catch (error) {
      handleFeedback("Failed to update help.", "error")
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteHelp = async (id: string) => {
    setActionLoading(id)
    try {
      const response = await fetch("/api/manage_helps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id }),
      })

      if (!response.ok) throw new Error("Failed to delete help")

      setHelps((prev) => prev.filter((help) => help.id !== id))
      handleFeedback("Help deleted successfully!", "success")
    } catch (error) {
      handleFeedback("Failed to delete help.", "error")
    } finally {
      setActionLoading(null)
    }
  }

  const handleAddStep = async (helpId: string, newStep: HelpStep) => {
    if (actionLoading === "addingStep") return // Prevent duplicate actions

    setActionLoading("addingStep")
    try {
      const response = await fetch("/api/manage_helps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "addStep", helpId, newStep }),
      })

      if (!response.ok) throw new Error("Failed to add step")

      const addedStep = await response.json()

      // Log added step for debugging
      console.log("Added step:", addedStep)

      // Update selectedHelp state
      setSelectedHelp((prev) =>
        prev
          ? {
              ...prev,
              steps: [...prev.steps, addedStep], // Add new step
            }
          : prev
      )

      // Update global helps state
      setHelps((prevHelps) =>
        prevHelps.map((help) =>
          help.id === helpId
            ? { ...help, steps: [...help.steps, addedStep] }
            : help
        )
      )

      // Optional: Add delay to ensure image availability
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Show success feedback and close form
      handleFeedback("Step added successfully!", "success")
      setShowAddStepForm(false) // Close the form
    } catch (error) {
      console.error("Error adding step:", error)
      handleFeedback("Failed to add step.", "error")
    } finally {
      setActionLoading(null) // Clear loading state
    }
  }

  const handleUpdateStep = async (
    helpId: string,
    stepIndex: number,
    updatedStep: HelpStep
  ) => {
    setActionLoading(`editingStep-${stepIndex}`)
    try {
      const response = await fetch("/api/manage_helps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updateStep",
          helpId,
          stepIndex,
          updatedStep,
        }),
      })

      if (!response.ok) throw new Error("Failed to update step")

      setHelps((prev) =>
        prev.map((help) =>
          help.id === helpId
            ? {
                ...help,
                steps: help.steps.map((step, index) =>
                  index === stepIndex ? updatedStep : step
                ),
              }
            : help
        )
      )
      handleFeedback("Step updated successfully!", "success")
      setEditingStepIndex(null)
    } catch (error) {
      handleFeedback("Failed to update step.", "error")
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteStep = async (helpId: string, stepIndex: number) => {
    setActionLoading(`deletingStep-${stepIndex}`) // Show action loading for the specific step
    try {
      const response = await fetch("/api/manage_helps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deleteStep", helpId, stepIndex }),
      })

      if (!response.ok) {
        throw new Error("Failed to delete step")
      }

      // Update the selectedHelp's steps
      setSelectedHelp((prevSelectedHelp) => {
        if (prevSelectedHelp && prevSelectedHelp.id === helpId) {
          const updatedSteps = prevSelectedHelp.steps.filter(
            (_, index) => index !== stepIndex
          )
          return { ...prevSelectedHelp, steps: updatedSteps }
        }
        return prevSelectedHelp
      })

      // Update the global helps state
      setHelps((prevHelps) =>
        prevHelps.map((help) =>
          help.id === helpId
            ? {
                ...help,
                steps: help.steps.filter((_, index) => index !== stepIndex),
              }
            : help
        )
      )

      handleFeedback("Step deleted successfully!", "success")
    } catch (error) {
      console.error("Error deleting step:", error)
      handleFeedback("Failed to delete step.", "error")
    } finally {
      setActionLoading(null) // Clear action loading
    }
  }

  const handlePictureUpload = async (file: File) => {
    try {
      setIsUploading(true)

      const folderName = "help_images" // Replace with your dynamic folder logic
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch(
        `/api/upload_file?foldername=${folderName}`,
        {
          method: "POST",
          body: formData,
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to upload picture`)
      }

      const data = await response.json()
      setPictureUrl(data.publicUrl)
    } catch (error) {
      console.error("Error uploading picture:", error)
      setPictureUrl("") // Reset picture URL on error
      alert("Failed to upload picture. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className='w-full border-[1px] border-dark-500 p-5 rounded bg-dark-700'>
      <div className='w-full flex justify-between'>
        <h3 className='flex items-center gap-2 font-bold mb-5'>
          <MdOutlineLiveHelp />
          Manage Helps
        </h3>
        <button
          className={`p-1 text-sm rounded-sm h-fit font-aktivGroteskBold bg-primary text-dark-800 hover:bg-primary/70 hover:text-dark-800 ${
            actionLoading && "cursor-not-allowed bg-primary/80"
          }`}
          onClick={() => setShowAddHelpForm(true)}
          disabled={actionLoading === "addingHelp"}
        >
          {actionLoading === "addingHelp" ? (
            "Adding..."
          ) : (
            <PiPlusSquare className='text-xl' />
          )}
        </button>
      </div>
      {loading ? (
        <div className='flex flex-row gap-5 overflow-x-auto __dokmai_scrollbar border-[1px] border-dark-500 p-5 rounded bg-dark-700'>
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className='p-5 bg-dark-600 text-light-100 rounded shadow min-w-96 w-96 animate-pulse'
            >
              <div className='h-6 bg-dark-500 rounded w-3/4 mb-2'></div>
              <div className='h-4 bg-dark-500 rounded w-full mb-4'></div>
              <div className='flex justify-end gap-2'>
                <div className='h-4 bg-dark-500 rounded w-1/4'></div>
                <div className='h-4 bg-dark-500 rounded w-1/4'></div>
                <div className='h-4 bg-dark-500 rounded w-1/4'></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className='flex flex-row gap-5 overflow-x-auto __dokmai_scrollbar border-[1px] border-dark-500 p-5 rounded bg-dark-700'>
            {helps.map((help) => (
              <div
                key={help.id}
                className='bg-dark-600 p-4 min-w-96 flex flex-col justify-start gap-5 rounded-md'
              >
                <div>
                  <h2 className='text-lg font-aktivGroteskBold truncate'>
                    {help.title}
                  </h2>
                  <p className='text-xs text-light-800 font-aktivGroteskLight truncate'>
                    {help.description}
                  </p>
                  {help.categories.map((category) => (
                    <span
                      key={category}
                      className='bg-dark-400 text-light-600 text-xs px-2 py-1 rounded mr-1'
                    >
                      {category}
                    </span>
                  ))}
                </div>

                <div className='flex justify-between items-end'>
                  <p className='text-xs bg-primary/20 px-2 py-1 text-primary rounded'>
                    <strong className='font-aktivGroteskBold'>
                      {help.steps.length}
                    </strong>{" "}
                    Steps
                  </p>
                  <div className='flex items-center gap-2'>
                    <button
                      className='p-1 flex items-center gap-1 text-xs rounded-sm h-full font-aktivGroteskBold bg-primary text-dark-800 hover:bg-primary/70 hover:text-dark-800'
                      onClick={() => setSelectedHelp(help)} // Remove the dependency on showEditHelpForm
                    >
                      <FiEdit3 /> Edit
                    </button>
                    <button
                      className={`p-1 flex items-center gap-1 text-xs rounded-sm h-full font-aktivGroteskBold bg-red-500 text-dark-800 hover:bg-red-500/70 hover:text-dark-800 ${
                        actionLoading === help.id &&
                        "cursor-not-allowed bg-red-500/80"
                      }`}
                      onClick={() => handleDeleteHelp(help.id)}
                      disabled={actionLoading === help.id}
                    >
                      {actionLoading === help.id ? (
                        "Deleting..."
                      ) : (
                        <>
                          <RxTrash /> Delete
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {showAddHelpForm && (
            <div className='fixed inset-0 bg-dark-800/80 backdrop-blur-xl flex justify-center items-center z-50'>
              <button
                type='button'
                className='absolute top-10 right-10 bg-red-500 text-dark-800 px-2 py-1 gap-2 flex justify-center items-center font-aktivGroteskBold'
                onClick={() => setShowAddHelpForm(false)}
              >
                Close
              </button>
              <div className='bg-dark-800 p-10 w-96 rounded border-[1px] border-dark-400'>
                <h3 className='flex items-center gap-2 mb-5 p-2 border-b-[1px] border-dark-400'>
                  <PiPlusSquare className='text-xl' />
                  Add New Help
                </h3>
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    const formData = new FormData(e.currentTarget)
                    const newHelp = {
                      title: formData.get("title") as string,
                      description: formData.get("description") as string,
                      categories:
                        (formData.get("categories") as string)?.split(",") ||
                        [],
                      steps: [],
                    }
                    handleAddHelp(newHelp)
                  }}
                  className='flex flex-col gap-3'
                >
                  <input
                    type='text'
                    name='title'
                    placeholder='Title'
                    required
                    className='p-2 bg-dark-600  border border-primary/70 bg-transparent focus:outline-none focus:ring-1 focus:ring-primary text-white'
                  />
                  <textarea
                    name='description'
                    placeholder='Description'
                    required
                    className='p-2 bg-dark-600  border border-primary/70 bg-transparent focus:outline-none focus:ring-1 focus:ring-primary text-white'
                  />
                  <input
                    type='text'
                    name='categories'
                    placeholder='Categories (comma-separated)'
                    className='p-2 bg-dark-600  border border-primary/70 bg-transparent focus:outline-none focus:ring-1 focus:ring-primary text-white'
                  />
                  <div className='flex justify-between mt-5'>
                    <button
                      type='submit'
                      className={`bg-primary text-dark-800 px-2 py-1 gap-2 flex justify-center items-center font-aktivGroteskBold ${
                        actionLoading === "addingHelp" &&
                        "cursor-not-allowed bg-primary/80"
                      }`}
                      disabled={actionLoading === "addingHelp"}
                    >
                      {actionLoading === "addingHelp" ? (
                        "Adding..."
                      ) : (
                        <>
                          <PiPlusSquare /> Add Help
                        </>
                      )}
                    </button>{" "}
                    <button
                      type='button'
                      className='bg-red-500 text-dark-800 px-2 py-1 gap-2 flex justify-center items-center font-aktivGroteskBold'
                      onClick={() => setShowAddHelpForm(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {feedback && (
            <div
              className={`fixed top-10 right-10 z-40 px-4 py-2 bg-dark-800 rounded shadow text-white `}
            >
              <p
                className={`p-2 border rounded-md ${
                  feedback.type === "success"
                    ? "border-green-500 text-green-500 bg-green-500/20"
                    : "border-red-500 text-red-500 bg-red-500/20"
                }`}
              >
                {feedback.message}
              </p>
            </div>
          )}
        </>
      )}
      {selectedHelp && (
        <div className='fixed inset-0 bg-dark-800/80 backdrop-blur-xl flex flex-col justify-center items-center z-50 '>
          <button
            type='button'
            className='absolute top-10 right-10 bg-red-500 text-dark-800 w-fit py-1 px-2 gap-2 justify-center items-center font-aktivGroteskBold border-dark-500'
            onClick={() => setSelectedHelp(null)}
          >
            Close
          </button>
          <div className='relative p-5 flex flex-col bg-dark-800 border-dark-400 border-[1px] w-[400px] h-[700px] max-h-[80vh] max-w-[80vw] overflow-y-auto __dokmai_scrollbar rounded'>
            <div
              className={`bg-dark-700 border border-dark-400 p-5 rounded ${
                showEditSteps ? "hidden" : "block"
              }`}
            >
              <h3 className='flex gap-2 items-center font-bold mb-5 border-b-[1px] border-dark-500 pb-3'>
                <BiSolidEdit />
                Edit Help
              </h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  const formData = new FormData(e.currentTarget)
                  const updatedHelp = {
                    title: formData.get("title") as string,
                    description: formData.get("description") as string,
                    categories:
                      (formData.get("categories") as string)?.split(",") || [],
                  }
                  handleUpdateHelp(selectedHelp.id, updatedHelp)
                }}
                className='flex flex-col gap-3'
              >
                <input
                  type='text'
                  name='title'
                  defaultValue={selectedHelp.title}
                  placeholder='Title'
                  required
                  className='p-2 bg-dark-600  border border-primary/70 bg-transparent focus:outline-none focus:ring-1 focus:ring-primary text-white'
                />
                <textarea
                  name='description'
                  defaultValue={selectedHelp.description}
                  placeholder='Description'
                  required
                  className='p-2 bg-dark-600  border border-primary/70 bg-transparent focus:outline-none focus:ring-1 focus:ring-primary text-white'
                />
                <input
                  type='text'
                  name='categories'
                  placeholder='Categories'
                  defaultValue={selectedHelp.categories.join(",")}
                  className='p-2 bg-dark-600  border border-primary/70 bg-transparent focus:outline-none focus:ring-1 focus:ring-primary text-white'
                />
                <div className='flex gap-2'>
                  <button
                    type='submit'
                    className={`bg-primary text-dark-800 font-aktivGroteskBold w-full py-2 ${
                      actionLoading === "updatingHelp" &&
                      "cursor-not-allowed bg-primary/80"
                    }`}
                    disabled={actionLoading === "updatingHelp"}
                  >
                    {actionLoading === "updatingHelp"
                      ? "Updating..."
                      : "Update"}
                  </button>
                </div>
              </form>
            </div>
            <motion.div
              initial='hidden'
              animate='visible'
              exit='exit'
              variants={animationVariants}
              transition={{ duration: 0.3 }}
              className={`w-full gap-5 px-5 flex justify-between ${
                showEditSteps
                  ? "sticky top-0 z-10 shadow-lg shadow-black"
                  : "mt-auto"
              }`}
            >
              <button
                className={` w-full py-2 flex gap-2 justify-center items-center font-aktivGroteskBold ${
                  showEditSteps
                    ? "bg-dark-800/80 backdrop-blur text-primary border-[1px] border-primary"
                    : "bg-primary text-dark-800"
                }`}
                onClick={() => setShowEditSteps((prev) => !prev)}
                type='button'
              >
                {showEditSteps ? (
                  <>
                    <RiArrowDownWideLine />
                    Hide Steps
                  </>
                ) : (
                  <>
                    <RiArrowUpWideLine />
                    Show Steps
                  </>
                )}
              </button>
              <button
                type='button'
                className={`bg-primary text-dark-800 w-full py-2 gap-2 justify-center items-center font-aktivGroteskBold border-dark-500 ${
                  showEditSteps ? "flex mb-auto" : "hidden"
                } ${showAddStepForm && "cursor-not-allowed bg-primary/80"}`}
                disabled={showAddStepForm}
                onClick={() => setShowAddStepForm(true)}
              >
                <PiPlusSquare /> Add Step
              </button>
              <button
                type='button'
                className={`bg-red-500 text-dark-800 w-full py-2 gap-2 justify-center items-center font-aktivGroteskBold border-dark-500 ${
                  showEditSteps ? "hidden" : ""
                }`}
                onClick={() => setSelectedHelp(null)}
              >
                Cancel
              </button>
            </motion.div>
            {showEditSteps && (
              <>
                {showAddStepForm && (
                  <motion.div
                    initial='hidden'
                    animate='visible'
                    exit='exit'
                    variants={animationVariants}
                    transition={{ duration: 0.3 }}
                    className={`bg-dark-700 border-dark-400 border-[1px] p-5 rounded ${
                      showAddStepForm ? "mt-10" : ""
                    }`}
                  >
                    <h3 className='flex gap-2 items-center font-bold mb-5 border-b-[1px] border-dark-400 pb-3'>
                      <PiPlusSquare />
                      Add Step
                    </h3>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault()
                        {
                          console.log(pictureUrl)
                        }
                        if (!pictureUrl) {
                          alert("Please upload a picture before submitting.")
                          return
                        }

                        const formData = new FormData(e.currentTarget)
                        const newStep = {
                          step: formData.get("step") as string,
                          description: formData.get("description") as string,
                          picture: pictureUrl,
                        }

                        handleAddStep(selectedHelp.id, newStep)
                      }}
                      className='flex flex-col gap-3'
                    >
                      <input
                        type='text'
                        name='step'
                        placeholder='Step Title'
                        required
                        className='p-2 bg-dark-600 border border-primary/70 bg-transparent focus:outline-none focus:ring-1 focus:ring-primary text-white'
                      />
                      <textarea
                        name='description'
                        placeholder='Step Description'
                        required
                        className='p-2 bg-dark-600 border border-primary/70 bg-transparent focus:outline-none focus:ring-1 focus:ring-primary text-white'
                      />
                      <input
                        type='file'
                        name='picture'
                        accept='image/*'
                        required
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            handlePictureUpload(file) // Upload the file when selected
                          }
                        }}
                        className='p-2 bg-dark-600 border border-primary/70 bg-transparent focus:outline-none focus:ring-1 focus:ring-primary text-white file:mr-4 file:py-1 file:px-4 file:rounded-sm file:border-0 file:font-aktivGroteskBold file:text-sm file:bg-primary file:text-dark-800 hover:file:bg-primary/80'
                      />
                      {isUploading && (
                        <p className='text-primary'>Uploading picture...</p>
                      )}
                      <div className='flex justify-between'>
                        <button
                          type='submit'
                          className={`px-3 py-1 h-fit font-aktivGroteskBold ${
                            actionLoading === "addingStep"
                              ? " bg-dark-100 text-light-800 cursor-not-allowed"
                              : " bg-primary text-dark-800"
                          }`}
                          disabled={
                            actionLoading === "addingStep" || isUploading
                          }
                        >
                          {actionLoading === "addingStep" ? "Adding..." : "Add"}
                        </button>
                        <button
                          type='button'
                          className='bg-red-500 text-dark-800 px-3 py-1 h-fit font-aktivGroteskBold'
                          onClick={() => setShowAddStepForm(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}
                <motion.div
                  initial='hidden'
                  animate='visible'
                  exit='exit'
                  variants={animationVariants}
                  transition={{ duration: 0.5 }}
                  className='mt-10 p-5 bg-dark-700 rounded flex flex-col justify-center items-start w-full border border-dark-400'
                >
                  {selectedHelp.steps.length > 0 ? (
                    <div className='h-full flex flex-col gap-12 w-full overflow-y-auto __dokmai_scrollbar'>
                      {selectedHelp.steps.map((step, index) => (
                        <div key={index} className='mb-5 bg-dark-600'>
                          {editingStepIndex === index ? (
                            <form
                              onSubmit={(e) => {
                                e.preventDefault()
                                const formData = new FormData(e.currentTarget)
                                const updatedStep = {
                                  step: formData.get("step") as string,
                                  description: formData.get(
                                    "description"
                                  ) as string,
                                  picture: pictureUrl || step.picture,
                                }
                                handleUpdateStep(
                                  selectedHelp.id,
                                  index,
                                  updatedStep
                                )
                              }}
                              className='flex flex-col gap-3 bg-dark-600 p-5 rounded'
                            >
                              <input
                                type='text'
                                name='step'
                                defaultValue={step.step}
                                required
                                className='p-2 bg-dark-600  border border-primary/70 bg-transparent focus:outline-none focus:ring-1 focus:ring-primary text-white'
                              />
                              <textarea
                                name='description'
                                defaultValue={step.description}
                                required
                                className='p-2 bg-dark-600  border border-primary/70 bg-transparent focus:outline-none focus:ring-1 focus:ring-primary text-white'
                              />
                              <input
                                type='file'
                                name='picture'
                                accept='image/*'
                                onChange={(e) => {
                                  const file = e.target.files?.[0]
                                  if (file) {
                                    handlePictureUpload(file) // Upload the new file if selected
                                  }
                                }}
                                className='p-2 bg-dark-600  border border-primary/70 bg-transparent focus:outline-none focus:ring-1 focus:ring-primary text-white file:mr-4 file:py-1 file:px-4 file:rounded-sm file:border-0 file:font-aktivGroteskBold file:text-sm file:bg-primary file:text-dark-800 hover:file:bg-primary/80'
                              />
                              {isUploading && (
                                <p className='text-blue-400 text-sm'>
                                  Uploading new picture...
                                </p>
                              )}
                              <div className='flex justify-between'>
                                <button
                                  type='submit'
                                  className={`px-3 py-1 h-fit font-aktivGroteskBold ${
                                    actionLoading === "addingStep"
                                      ? " bg-dark-100 text-light-800 cursor-not-allowed"
                                      : " bg-primary text-dark-800"
                                  }`}
                                  disabled={
                                    actionLoading === "updatingStep" ||
                                    isUploading
                                  }
                                >
                                  {actionLoading === "updatingStep"
                                    ? "Updating..."
                                    : "Update"}
                                </button>
                                <button
                                  type='button'
                                  className='bg-red-500 text-dark-800 px-3 py-1 h-fit font-aktivGroteskBold'
                                  onClick={() => setEditingStepIndex(null)}
                                >
                                  Cancel
                                </button>
                              </div>
                            </form>
                          ) : (
                            <div className='w-full flex flex-col justify-start items-start gap-8 p-5'>
                              <div className='gap-0'>
                                <h3 className='font-aktivGroteskBold'>
                                  {step.step}
                                </h3>
                                <p className='text-xs font-aktivGroteskLight line-clamp-2'>
                                  {step.description}
                                </p>
                              </div>
                              <Image
                                src={step.picture}
                                alt={step.step}
                                width={250}
                                height={250}
                                className='rounded h-[250px] w-auto'
                              />
                              <div className='flex gap-2'>
                                <button
                                  className='p-1 flex items-center gap-1 text-xs rounded-sm h-full font-aktivGroteskBold bg-primary text-dark-800 hover:bg-primary/70 hover:text-dark-800'
                                  onClick={() => setEditingStepIndex(index)}
                                >
                                  <FiEdit3 /> Edit
                                </button>

                                <button
                                  className={`p-1 flex items-center gap-1 text-xs rounded-sm h-full font-aktivGroteskBold bg-red-500 text-dark-800 hover:bg-red-500/70 hover:text-dark-800 ${
                                    actionLoading === `deletingStep-${index}` &&
                                    "cursor-not-allowed bg-red-500/80"
                                  }`}
                                  disabled={
                                    actionLoading === `deletingStep-${index}`
                                  }
                                  onClick={() =>
                                    handleDeleteStep(selectedHelp.id, index)
                                  }
                                >
                                  {actionLoading === `deletingStep-${index}` ? (
                                    "Deleting..."
                                  ) : (
                                    <>
                                      <RxTrash /> Delete
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className='p-2 border text-center rounded-md border-red-500 text-red-500 bg-red-500/10 w-full'>
                      Empty Step
                    </p>
                  )}
                </motion.div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ManageHelps
