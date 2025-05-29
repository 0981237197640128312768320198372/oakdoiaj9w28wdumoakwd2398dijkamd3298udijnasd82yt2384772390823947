import React, { useState } from "react"
import { FaCheck } from "react-icons/fa"
import { PiCopySimpleLight } from "react-icons/pi"

interface CopyToClipboardProps {
  textToCopy: string
}

const CopyToClipboard: React.FC<CopyToClipboardProps> = ({ textToCopy }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy)
      setCopied(true)

      setTimeout(() => setCopied(false), 1500)
    } catch (error) {
      console.error("Failed to copy text:", error)
    }
  }

  return (
    <button
      onClick={handleCopy}
      className='flex items-center text-light-800 hover:text-white'
    >
      {copied ? <FaCheck className='text-primary' /> : <PiCopySimpleLight />}
    </button>
  )
}

export default CopyToClipboard
