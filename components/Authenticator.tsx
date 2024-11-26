"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Loading from "@/components/Loading"

interface AuthData {
  username: string
  role: "admin" | "staff"
  expiration: number
}

const EXPIRATION_TIME = 2 * 24 * 60 * 60 * 1000 // 2 days in milliseconds

const Authenticator = ({ children }: { children: React.ReactNode }) => {
  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const validateAuth = (authData: AuthData): boolean => {
    const now = new Date().getTime()
    return authData.expiration > now && authData.role !== undefined
  }

  useEffect(() => {
    const authData = localStorage.getItem("auth")

    if (authData) {
      try {
        const parsedAuth: AuthData = JSON.parse(authData)

        if (validateAuth(parsedAuth)) {
          if (parsedAuth.role === "admin") {
            setAuthenticated(true)
          } else if (parsedAuth.role === "staff") {
            router.push("/staff")
          } else {
            localStorage.removeItem("auth") // Invalid data
          }
        } else {
          localStorage.removeItem("auth") // Expired or invalid
        }
      } catch (error) {
        console.error("Error parsing auth data:", error)
        localStorage.removeItem("auth") // Cleanup invalid auth data
      }
    }

    setLoading(false)
  }, [router])

  const handleLogin = async () => {
    const username = (document.getElementById("username") as HTMLInputElement)
      .value
    const password = (document.getElementById("password") as HTMLInputElement)
      .value

    try {
      const response = await fetch("/api/authenticate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })

      if (!response.ok) {
        throw new Error("Invalid credentials")
      }

      const data: { role: "admin" | "staff" } = await response.json()

      const expiration = new Date().getTime() + EXPIRATION_TIME
      localStorage.setItem(
        "auth",
        JSON.stringify({ username, role: data.role, expiration })
      )

      if (data.role === "admin") {
        setAuthenticated(true)
      } else if (data.role === "staff") {
        router.push("/staff")
      }
    } catch (err) {
      console.error(err)
      alert("Invalid username or password")
    }
  }

  if (loading) {
    return <Loading />
  }

  if (!authenticated) {
    return (
      <div className='flex flex-col items-center justify-center h-screen'>
        <div className='p-5 border border-dark-500 rounded shadow-lg bg-dark-700'>
          <h2 className='text-lg font-bold mb-4'>Admin Login</h2>
          <input
            type='text'
            placeholder='Username'
            id='username'
            className='border border-primary p-2 mb-3 w-full focus:border-primary focus:outline-none focus:ring-0 bg-transparent text-sm'
          />
          <input
            type='password'
            placeholder='Password'
            id='password'
            className='border border-primary p-2 mb-3 w-full focus:border-primary focus:outline-none focus:ring-0 bg-transparent text-sm'
          />
          <button
            onClick={handleLogin}
            className='bg-primary text-dark-800 font-aktivGroteskBold px-4 py-2 rounded w-full'
          >
            Login
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export default Authenticator
