/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import LoadingAnimation from "@/components/Loading"

interface AuthData {
  name: string
  jobDesk: string
  username: string
  role: "admin" | "staff"
  expiration: number
}

const EXPIRATION_TIME = 2 * 24 * 60 * 60 * 1000 // 2 days in milliseconds

const Authenticator = ({ children }: { children: React.ReactNode }) => {
  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
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
          const currentPath = window.location.pathname // Use `window.location.pathname` to get the current path

          if (parsedAuth.role === "admin" && currentPath.startsWith("/staff")) {
            router.replace("/admin") // Redirect admin to /admin
          } else if (
            parsedAuth.role === "staff" &&
            currentPath.startsWith("/admin")
          ) {
            router.replace("/staff") // Redirect staff to /staff
          } else {
            setAuthenticated(true) // Only set authenticated if the user is in the correct path
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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)
    const formData = new FormData(event.currentTarget)
    const username = formData.get("username") as string
    const password = formData.get("password") as string

    try {
      const response = await fetch("/api/authenticate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        setIsSubmitting(false)

        if (response.status === 403) {
          // Handle blocked user
          setError("Too many failed attempts. You are temporarily blocked.")
        } else {
          setError(errorData.error || "Invalid credentials. Please try again.")
        }
        return
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
      setError("An error occurred. Please try again later.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return <LoadingAnimation />
  }

  if (!authenticated) {
    return (
      <div className='flex flex-col items-center justify-center mt-20'>
        <div className='p-5 border border-dark-500 w-96 bg-dark-700'>
          {error && <p className='text-red-500 text-sm mb-3'>{error}</p>}
          <form onSubmit={handleSubmit} className='flex flex-col  gap-3'>
            <input
              required
              type='text'
              name='username'
              placeholder='Username'
              className='border border-primary p-2 w-full focus:border-primary focus:outline-none focus:ring-0 bg-transparent text-sm'
            />
            <input
              required
              type='password'
              name='password'
              placeholder='Password'
              className='border border-primary p-2 w-full focus:border-primary focus:outline-none focus:ring-0 bg-transparent text-sm'
            />
            <button
              disabled={isSubmitting}
              type='submit'
              className='bg-primary text-dark-800 font-aktivGroteskBold px-4 py-2 w-full hover:bg-primary/90 active:bg-primary/80 disabled:bg-primary/50'
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export default Authenticator
