/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import dokmaithinoutlinelogo from "@/assets/images/dokmaithinoutline.png"
import dokmaicoin from "@/assets/images/dokmaicoin.png"
import { FaUserLock } from "react-icons/fa6"
import { accountBadge } from "@/constant"
import netflixpremiumlogo from "@/assets/images/netflixpremiumuhd.png"
import primevideo from "@/assets/images/amazonprimevideo.png"
import { PiWallet } from "react-icons/pi"
import Link from "next/link"
import Loading from "@/components/Loading"
import EmailList from "./EmailList"
import CopyToClipboard from "./CopyToClipboard"
import { logActivity } from "@/lib/utils"
import { parse, isValid } from "date-fns"
import ShowHideText from "./ShowHideText"

export const ShowPremiumApps = () => {
  const [inputPersonalKey, setInputPersonalKey] = useState<string>("")
  const [personalKey, setPersonalKey] = useState<string | null>(null)
  const [userInfo, setUserInfo] = useState<any>(null)
  const [premiumData, setPremiumData] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [checkingLocalStorage, setCheckingLocalStorage] = useState(true)
  const [validatingPersonalKey, setValidatingPersonalKey] = useState(false)
  const [fetchingData, setFetchingData] = useState(false)
  const [emails, setEmails] = useState([])
  const [searchEmail, setSearchEmail] = useState("")
  const [lastSearchedEmail, setLastSearchedEmail] = useState("")
  const [hasSearched, setHasSearched] = useState(false)
  const [loadingEmail, setLoadingEmail] = useState(false)
  const [refreshCountdown, setRefreshCountdown] = useState(120)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState<string>("")

  const fetchEmails = async (email: string) => {
    setLoadingEmail(true)
    setIsRefreshing(true)
    try {
      const response = await fetch(
        `/api/emails_reset_password?search=${encodeURIComponent(
          email
        )}&t=${Date.now()}`
      )
      if (!response.ok) {
        throw new Error("Failed to fetch emails")
      }
      const data = await response.json()
      setEmails(data)
    } catch (error) {
      console.error("Error fetching emails:", error)
    } finally {
      setLoadingEmail(false)
      setIsRefreshing(false)
      setHasSearched(true)
    }
  }

  const emailAllowedReset = premiumData
    .filter(
      (item: any) =>
        item.accessType && item.accessType.includes("Family Access")
    )
    .map((item: any) => item.email)
    .filter((email: string | undefined) => email !== undefined) as string[]

  const handleSearch = () => {
    if (emailAllowedReset.includes(searchEmail.trim())) {
      setError(null)
      fetchEmails(searchEmail)
      setLastSearchedEmail(searchEmail)
      setRefreshCountdown(120)
    } else {
      setError("This email is not allowed for reset.")
    }
  }

  const onSubmitForm = (e: React.FormEvent) => {
    e.preventDefault()
    handleSearch()
  }
  useEffect(() => {
    let countdownInterval: NodeJS.Timeout
    if (
      hasSearched &&
      searchEmail.trim() &&
      searchEmail === lastSearchedEmail
    ) {
      countdownInterval = setInterval(() => {
        setRefreshCountdown((prevCountdown) => {
          if (prevCountdown === 1) {
            fetchEmails(searchEmail)
            return 120
          } else {
            return prevCountdown - 1
          }
        })
      }, 1000)
    }
    return () => {
      if (countdownInterval) {
        clearInterval(countdownInterval)
      }
    }
  }, [hasSearched, searchEmail, lastSearchedEmail])

  useEffect(() => {
    const storedPersonalKey = localStorage.getItem("personalKey")
    if (storedPersonalKey) {
      setPersonalKey(storedPersonalKey)
      validatePersonalKey(storedPersonalKey)
    } else {
      setCheckingLocalStorage(false)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputPersonalKey) return
    setPersonalKey(inputPersonalKey)
    setValidatingPersonalKey(true)
    await validatePersonalKey(inputPersonalKey)
    setValidatingPersonalKey(false)
  }

  const validatePersonalKey = async (key: string) => {
    try {
      setError(null)
      const userInfoRes = await fetch("/api/get_info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personalKey: key }),
      })

      if (userInfoRes.ok) {
        await logActivity("Login", key, {
          description: "Logged in successfully",
        })
        const userInfoData = await userInfoRes.json()
        setUserInfo(userInfoData.data)
        localStorage.setItem("personalKey", key)
        fetchPremiumData(key)
      } else {
        const errorData = await userInfoRes.json()
        setError(errorData.error || "Invalid Personal Key.")
        setUserInfo(null)
        localStorage.removeItem("personalKey")
      }
    } catch (err) {
      setError("An error occurred. Please try again later.")
    } finally {
      setCheckingLocalStorage(false)
      setValidatingPersonalKey(false)
    }
  }
  const parseDate = (dateString: string): Date | null => {
    // Try native Date parsing
    const parsedDate = new Date(dateString.trim())

    if (isValid(parsedDate)) {
      return parsedDate // Return valid native Date
    }

    // Try specific patterns using date-fns
    const patterns = [
      "dd MMMM yyyy 'at' HH:mm", // With 'at'
      "dd MMMM yyyy HH:mm", // Without 'at'
      "dd MMMM yyyy", // Date only
    ]

    for (const pattern of patterns) {
      try {
        const parsed = parse(dateString.trim(), pattern, new Date())
        if (isValid(parsed)) {
          return parsed // Return valid parsed Date object
        }
      } catch {
        // Ignore errors and try the next pattern
      }
    }

    console.warn(`Unrecognized date format: ${dateString}`)
    return null // Return null for invalid dates
  }

  const fetchPremiumData = async (key: string) => {
    setFetchingData(true)
    try {
      const premiumDataRes = await fetch("/api/your_premium_apps_data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personalKey: key }),
      })

      if (premiumDataRes.ok) {
        const premiumAppsData = await premiumDataRes.json()

        const sortedData = premiumAppsData.data.sort((a: any, b: any) => {
          const dateA = parseDate(a.orderDate)?.getTime() || 0
          const dateB = parseDate(b.orderDate)?.getTime() || 0
          return dateB - dateA // Latest date first
        })

        setPremiumData(sortedData)
      } else {
        const errorData = await premiumDataRes.json()
        setError(errorData.error || "No premium data found.")
        setPremiumData([])
      }
    } catch (err) {
      console.log(err)
      setError("Failed to fetch premium data. Please try again.")
    } finally {
      setFetchingData(false)
    }
  }

  const handleLogout = async () => {
    await logActivity("Logout", personalKey || "Unknown", {
      description: "Logged out successfully",
    })
    localStorage.removeItem("personalKey")
    setPersonalKey(null)
    setUserInfo(null)
    setPremiumData([])
    setError(null)
    setInputPersonalKey("")
  }

  const getLabelDisplayName = (label: string) =>
    ({
      orderDate: "Order Date",
      expireDate: "Expire Date",
      email: "Email",
      password: "Password",
      profile: "Profile",
      pin: "PIN",
    }[label] || null)

  const filteredPremiumData = premiumData.filter((item: any) => {
    const searchQuery = searchTerm.toLowerCase()
    return (
      item.email?.toLowerCase().includes(searchQuery) ||
      item.appName?.toLowerCase().includes(searchQuery) ||
      item.orderDate?.toLowerCase().includes(searchQuery) ||
      item.expireDate?.toLowerCase().includes(searchQuery) ||
      item.password?.toLowerCase().includes(searchQuery) ||
      item.accessType?.toLowerCase().includes(searchQuery)
    )
  })

  return (
    <div className='w-full justify-center items-center'>
      {checkingLocalStorage && <Loading />}
      {!checkingLocalStorage && !personalKey && (
        <div className='w-full flex flex-col min-h-96 justify-center items-start h-full gap-10'>
          <div className='text-light-300'>
            <h2 className='text-2xl font-bold mb-2'>
              ทำความรู้จักกับ Personal Key
            </h2>
            <p>
              <strong>Personal Key</strong>{" "}
              คือรหัสเฉพาะที่ไม่ซ้ำกันและเป็นของคุณคนเดียว!
              คุณจะได้รับรหัสนี้เพียงหนึ่งชุดเท่านั้น
              ซึ่งช่วยให้คุณจัดการข้อมูลและการเข้าถึงบัญชีของคุณอย่างปลอดภัย
              รวมถึงการซื้อแอปพรีเมียมเพิ่มเติมได้สะดวกยิ่งขึ้น
            </p>
          </div>
          <form
            onSubmit={handleSubmit}
            className='mb-4 w-full flex flex-col md:flex-row'
          >
            <input
              type='text'
              placeholder='Enter your Personal Key (#ABCD1234)'
              className='border-[1px] border-primary p-2 px-3 w-full focus:outline-none focus:ring-0 bg-transparent text-sm'
              value={inputPersonalKey.toUpperCase()}
              onChange={(e) => setInputPersonalKey(e.target.value)}
            />
            <button
              type='submit'
              className='bg-primary text-dark-800 px-4 py-2 w-full md:w-fit font-aktivGroteskBold'
            >
              Submit
            </button>
          </form>
        </div>
      )}
      {validatingPersonalKey && <Loading text='กำลังเช็คข้อมูลของคุณ...' />}
      {!checkingLocalStorage && !validatingPersonalKey && userInfo && (
        <div className='flex gap-5 flex-col lg:flex-row'>
          <div className='bg-white/10 relative rounded-lg overflow-hidden md:min-w-96 h-fit group md:w-fit w-full'>
            <div className='bg-gradient-to-tl from-white/5 to-dark-800 rounded-lg p-5 w-full'>
              <div className='flex gap-2 items-start select-none w-full justify-between mb-10'>
                <div className='flex gap-2 h-14 items-center'>
                  <Image
                    src={dokmaicoin}
                    width={300}
                    height={300}
                    className='w-10 h-10'
                    alt='Dokmai Coin Icon'
                  />
                  <span className='gap-0 text-xs'>
                    Dokmai Coin
                    <p className='text-xl font-aktivGroteskBold'>
                      <ShowHideText text={userInfo.balance} />
                    </p>
                  </span>
                </div>
                <Link
                  href='/deposit'
                  className='flex gap-2 items-center bg-white/10 text-xs hover:bg-primary/10 hover:text-primary rounded p-1 z-30'
                >
                  <PiWallet className='w-5 h-5 ' />
                  Deposit
                </Link>
              </div>
              <div className='flex flex-col items-start justify-center gap-2'>
                <div className='flex gap-2 items-center'>
                  {accountBadge(userInfo.badge)}
                </div>
                <div className='flex gap-2 items-center'>
                  <FaUserLock className='w-8 h-8 text-white p-2 bg-white/10 rounded-lg' />
                  <p className='text-lg select-none'>
                    <ShowHideText text={userInfo.personalKey} />
                  </p>
                </div>
              </div>
              <div className='w-full flex justify-end'>
                <button
                  onClick={handleLogout}
                  className=' bg-red-500/20 hover:bg-red-500/40 text-red-500 text-xs rounded px-2 py-1 font-aktivGroteskRegular border-[1px] border-red-500/40'
                >
                  Logout
                </button>
              </div>
              <Image
                src={dokmaithinoutlinelogo}
                alt='Dokmai Store Logo'
                width={300}
                height={300}
                className='absolute -bottom-5 -right-5 opacity-30 group-hover:opacity-50 select-none duration-1000 -z-40'
              />
            </div>
          </div>
          <div className='text-light-300 text-xs'>
            <h3 className='text-xl font-semibold mt-4'>
              ทำไมต้องเก็บ Personal Key ให้ปลอดภัย?
            </h3>
            <ul className='list-disc ml-6 text-light-500'>
              <li>
                <strong>ง่ายและสะดวก:</strong> ไม่ต้องจำอีเมลหรือรหัสผ่านมากมาย
                แค่รหัส 8 หลัก (ประกอบด้วยตัวอักษร 4 ตัว และตัวเลข 4 ตัว)
                คุณก็สามารถใช้งานได้เลย
              </li>
              <li>
                <strong>ใช้ในการตรวจสอบตัวตน:</strong>{" "}
                ใช้รหัสนี้เพื่อเข้าถึงข้อมูลบัญชีแอปพรีเมียม
                และดูรายละเอียดการซื้อของคุณ
              </li>
              <li>
                <strong>เครื่องมือเข้าถึงพิเศษ:</strong>{" "}
                ใช้รหัสนี้เพื่อรีเซ็ตรหัสผ่านของบัญชีแอปพรีเมียม
                ซื้อแอปพรีเมียมเพิ่มเติม และเข้าถึงยอด{" "}
                <strong>Dokmai Coin</strong> ของคุณ
              </li>
            </ul>

            <h3 className='text-xl font-semibold mt-4'>
              สิ่งที่ควรจำเกี่ยวกับ Personal Key
            </h3>
            <p>
              โปรดเก็บรักษารหัสนี้เป็นความลับ! หากมีใครได้รู้รหัสของคุณ
              พวกเขาจะสามารถ:
            </p>
            <ul className='list-disc ml-6 text-light-500'>
              <li>ดูข้อมูลบัญชีแอปพรีเมียมที่คุณซื้อ</li>
              <li>เข้าถึงยอด Dokmai Coin และข้อมูลสำคัญอื่นๆ ในบัญชีของคุณ</li>
            </ul>

            <p className='mt-4'>
              ด้วย Personal Key
              คุณสามารถจัดการและรักษาความปลอดภัยของบัญชีได้อย่างง่ายดาย
              มั่นใจในความปลอดภัย และสะดวกสบายกับการใช้งานทุกฟีเจอร์ของเรา!
            </p>
          </div>
        </div>
      )}

      {fetchingData && <Loading text='กำลังโหลดข้อมูลของคุณ...' />}

      {!checkingLocalStorage &&
        !validatingPersonalKey &&
        !fetchingData &&
        premiumData.length > 0 && (
          <div className='mt-32 w-full max-md:justify-center'>
            <h2 className='font-aktivGroteskBold text-2xl text-light-100 mb-24'>
              Your Ordered{" "}
              <span className='text-dark-800 bg-primary p-1'>Premium Apps</span>
            </h2>
            <input
              type='text'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder='Search your premium apps...'
              className='mb-5  border-[1px] border-primary/40 p-2 px-3 w-full focus:outline-none focus:ring-0 bg-transparent text-sm'
            />
            <div className='grid flex-col grid-cols-1 lg:grid-cols-2 gap-5 w-full max-h-[650px] overflow-y-scroll px-5 pb-5 border-t-0 border-[1px] border-dark-500 __dokmai_scrollbar'>
              {(searchTerm ? filteredPremiumData : premiumData)
                .reverse()
                .map((item: any, index: any) => (
                  <div
                    key={index}
                    className='shadow pt-5 pb-10 flex flex-col gap-2 border-b-[1px] border-white/20 bg-dark-700 px-5'
                  >
                    <div className='w-full flex flex-row-reverse items-start justify-between'>
                      {Object.entries(item).map(([label, value], idx) => (
                        <>
                          {String(label) === "accessType" ? (
                            <span
                              className='text-xs font-aktivGroteskThin text-white/70'
                              key={idx}
                            >
                              {String(value)}
                            </span>
                          ) : null}
                          {String(value) === "Netflix Premium" ? (
                            <Image
                              src={netflixpremiumlogo}
                              alt='Netflix Premium Ultra HD Icon'
                              width={50}
                              height={50}
                            />
                          ) : null}
                          {String(value) === "Prime Video" ? (
                            <Image
                              src={primevideo}
                              alt='Prime Video Icon'
                              width={75}
                              height={75}
                            />
                          ) : null}
                        </>
                      ))}
                    </div>

                    {Object.entries(item).map(([label, value], idx) => (
                      <div className='flex flex-col' key={idx}>
                        <p className='font-aktivGroteskMedium text-white/60 text-[7px] md:text-xs '>
                          {getLabelDisplayName(String(label))}
                        </p>
                        <p className='font-aktivGroteskBold flex gap-2 text-[10px] md:text-sm items-center'>
                          {String(label) !== "accessType" &&
                          String(label) !== "appName" ? (
                            <>
                              {String(value)}{" "}
                              {String(label) !== "accessType" &&
                              String(label) !== "orderDate" &&
                              String(label) !== "appName" ? (
                                <CopyToClipboard textToCopy={String(value)} />
                              ) : null}
                            </>
                          ) : null}
                        </p>
                      </div>
                    ))}
                  </div>
                ))}
            </div>
            {premiumData.filter(
              (item: any) =>
                item.accessType && item.accessType.includes("Family Access")
            ).length > 0 && (
              <div className='w-full flex flex-col justify-center items-center pt-48 pb-40'>
                <h2 className='font-aktivGroteskBold text-2xl text-light-100 mb-24'>
                  Get Email{" "}
                  <span className='text-dark-800 bg-primary p-1'>
                    Link Or Code
                  </span>{" "}
                  For Your{" "}
                  <span className='text-dark-800 bg-primary p-1'>
                    Premium Apps
                  </span>{" "}
                  Here
                </h2>
                <div className='flex w-full justify-start items-start gap-5 flex-col lg:flex-row '>
                  <div className='w-full h-full flex flex-col gap-5 '>
                    <form
                      onSubmit={onSubmitForm}
                      className='w-full flex border-[1px] border-primary/40 rounded-sm'
                    >
                      <select
                        required
                        value={searchEmail}
                        onChange={(e) => setSearchEmail(e.target.value)}
                        className='px-3 w-full focus:outline-none focus:ring-0 bg-transparent text-sm'
                      >
                        <option value='' disabled>
                          Select an email
                        </option>
                        {premiumData
                          .filter(
                            (item: any) =>
                              item.accessType &&
                              item.accessType.includes("Family Access")
                          )
                          .map((item: any, index: number) => {
                            const email = item.email
                            return email ? (
                              <option key={index} value={email}>
                                {email}
                              </option>
                            ) : null
                          })}
                      </select>
                      <button
                        type='submit'
                        className='ml-4 bg-primary hover:bg-primary/70 active:bg-primary/50 text-sm text-dark-800 px-4 py-2 font-aktivGroteskBold'
                      >
                        Submit
                      </button>
                    </form>
                    <div className='flex w-full h-full'>
                      {loadingEmail ? (
                        <Loading text='กรุณารอสักครู่...' />
                      ) : (
                        <>
                          {hasSearched ? (
                            <div className='w-full'>
                              <div className='flex items-center justify-between mb-2'>
                                {/* Display countdown timer */}
                                <p className='text-gray-500'>
                                  Refreshing ({lastSearchedEmail})
                                  <br className='md:hidden' /> in{" "}
                                  {refreshCountdown} seconds...
                                </p>
                                {/* Show "Refreshing..." message when refreshing */}
                                {isRefreshing && (
                                  <p className='text-blue-500 animate-pulse'>
                                    Refreshing emails...
                                  </p>
                                )}
                              </div>
                              <EmailList emails={emails} />
                            </div>
                          ) : null}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      {!checkingLocalStorage &&
        !validatingPersonalKey &&
        !fetchingData &&
        error && (
          <div className='w-full p-5 justify-center'>
            <p className='px-2 py-1 bg-red-600/20 rounded border-[1px] border-red-500/70 text-red-500 w-fit'>
              {error}
            </p>
          </div>
        )}
    </div>
  )
}
