"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import ActivityLogs from "@/components/ActivityLogs"
import PageHeadline from "@/components/PageHeadline"

const AdminPage = () => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [authenticated, setAuthenticated] = useState(false)
  const router = useRouter()

  const handleLogin = async () => {
    setError(null)

    try {
      const response = await fetch("/api/authenticate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })

      if (!response.ok) {
        throw new Error("Invalid credentials")
      }

      const data = await response.json()

      if (data.role === "admin") {
        setAuthenticated(true)
      } else if (data.role === "staff") {
        router.push("/staff") // Redirect staff to /staff
      } else {
        setError("Unauthorized access")
      }
    } catch (err) {
      console.log(err)
      setError("Failed to authenticate")
    }
  }

  if (!authenticated) {
    return (
      <div className='flex flex-col items-center justify-center h-screen'>
        <div className='p-5 border border-gray-300 rounded shadow-lg bg-white'>
          <h2 className='text-lg font-bold mb-4'>Admin Login</h2>
          <input
            type='text'
            placeholder='Username'
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className='border p-2 mb-3 w-full'
          />
          <input
            type='password'
            placeholder='Password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className='border p-2 mb-3 w-full'
          />
          <button
            onClick={handleLogin}
            className='bg-blue-500 text-white px-4 py-2 rounded w-full'
          >
            Login
          </button>
          {error && <p className='text-red-500 text-sm mt-2'>{error}</p>}
        </div>
      </div>
    )
  }

  return (
    <div className='flex flex-col justify-center w-full items-center px-5 xl:px-0 pt-10 xl:pt-28 __container'>
      <PageHeadline
        headline='Admin Panel'
        description='A streamlined page for tracking client activities, sales stats, transactions, and deposits, with easy management tools for smooth operations.'
      />
      <ActivityLogs />
    </div>
  )
}

export default AdminPage
