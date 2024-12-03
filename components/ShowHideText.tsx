import React, { useState } from "react"
import { FaEye, FaEyeSlash } from "react-icons/fa"

interface ShowHideTextProps {
  text: string
}

const ShowHideText: React.FC<ShowHideTextProps> = ({ text }) => {
  const [isVisible, setIsVisible] = useState(false)

  const handleToggleVisibility = () => {
    setIsVisible((prev) => !prev)
  }

  return (
    <div className='flex items-center gap-2'>
      <button
        onClick={handleToggleVisibility}
        className='flex items-center text-light-800 hover:text-white'
        aria-label={isVisible ? "Hide Text" : "Show Text"}
      >
        {isVisible ? <FaEyeSlash /> : <FaEye />}
      </button>
      <span>{isVisible ? text : text.replace(/./g, " • ")}</span>
    </div>
  )
}

export default ShowHideText
