"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import dokmaithinoutlinelogo from "@/assets/images/dokmaithinoutline.png"
import dokmaicoin from "@/assets/images/dokmaicoin.png"
import { FaUserLock } from "react-icons/fa6"
import { accountBadge } from "@/constant"
import netflixpremiumlogo from "@/assets/images/netflixpremiumuhd.png"
import primevideo from "@/assets/images/amazonprimevideo.png"

export default function YourPremiumApps() {
  const [inputSecretKey, setInputSecretKey] = useState<string>("")
  const [secretKey, setSecretKey] = useState<string | null>(null)
  const [userInfo, setUserInfo] = useState<any>(null)
  const [premiumData, setPremiumData] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  const [checkingLocalStorage, setCheckingLocalStorage] = useState(true)
  const [validatingSecretKey, setValidatingSecretKey] = useState(false)
  const [fetchingData, setFetchingData] = useState(false)

  useEffect(() => {
    const storedSecretKey = localStorage.getItem("secretKey")
    if (storedSecretKey) {
      setSecretKey(storedSecretKey)
      validateSecretKey(storedSecretKey)
    } else {
      setCheckingLocalStorage(false)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputSecretKey) return
    setSecretKey(inputSecretKey)
    setValidatingSecretKey(true)
    await validateSecretKey(inputSecretKey)
    setValidatingSecretKey(false)
  }

  const validateSecretKey = async (key: string) => {
    try {
      setError(null)
      const userInfoRes = await fetch("/api/get_info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secretKey: key }),
      })

      if (userInfoRes.ok) {
        const userInfoData = await userInfoRes.json()
        setUserInfo(userInfoData.data)
        localStorage.setItem("secretKey", key)
        fetchPremiumData(key)
      } else {
        const errorData = await userInfoRes.json()
        setError(errorData.error || "Invalid Secret Key.")
        setUserInfo(null)
        localStorage.removeItem("secretKey")
      }
    } catch (err) {
      setError("An error occurred. Please try again later.")
    } finally {
      setCheckingLocalStorage(false)
      setValidatingSecretKey(false)
    }
  }

  const fetchPremiumData = async (key: string) => {
    setFetchingData(true)
    try {
      const premiumDataRes = await fetch("/api/your_premium_apps_data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secretKey: key }),
      })

      if (premiumDataRes.ok) {
        const premiumAppsData = await premiumDataRes.json()
        setPremiumData(premiumAppsData.data)
      } else {
        const errorData = await premiumDataRes.json()
        setError(errorData.error || "No premium data found.")
        setPremiumData([])
      }
    } catch (err) {
      setError("Failed to fetch premium data. Please try again.")
    } finally {
      setFetchingData(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("secretKey")
    setSecretKey(null)
    setUserInfo(null)
    setPremiumData([])
    setError(null)
    setInputSecretKey("") // Reset the input field as well
  }

  return (
    <div className='__container flex justify-center items-start flex-col w-full px-5 lg:p-0 mt-36 '>
      {checkingLocalStorage && <p>Loading...</p>}
      {!checkingLocalStorage && !secretKey && (
        <form onSubmit={handleSubmit} className='mb-4'>
          <input
            type='text'
            placeholder='Enter Secret Key'
            className='border rounded p-2 w-full mb-2'
            value={inputSecretKey}
            onChange={(e) => setInputSecretKey(e.target.value)}
          />
          <button
            type='submit'
            className='bg-blue-500 text-white rounded px-4 py-2'
          >
            Submit
          </button>
        </form>
      )}
      {validatingSecretKey && <p>Validating Secret Key...</p>}
      {!checkingLocalStorage && !validatingSecretKey && userInfo && (
        <div className='mb-4 w-fit'>
          <div className='bg-white/10 relative rounded-xl overflow-hidden group min-w-96 w-fit'>
            <div className='bg-gradient-to-tl from-white/10 to-dark-800 rounded-lg p-5 w-full'>
              <div className='justify-end flex items-start'>
                <div className='flex gap-2 items-center select-none'>
                  <Image
                    src={dokmaicoin}
                    width={500}
                    height={500}
                    className=' w-6 h-6'
                    alt='Dokmai Coin Icon'
                  />
                  <p className='text-2xl font-aktivGroteskBold'>
                    {userInfo.balance}
                  </p>
                </div>
              </div>
              <div className='flex flex-col items-start justify-center gap-2'>
                <div className='flex gap-2 items-center'>
                  <FaUserLock className='w-8 h-8 text-white p-2 bg-white/10 rounded-lg' />
                  <p className='text-lg select-none'>{userInfo.secretKey}</p>
                </div>
                <div className='flex gap-2 items-center'>
                  {accountBadge(userInfo.badge)}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className='mt-8 bg-white/10 hover:bg-red-500/40 text-white text-xs rounded px-2 py-1 font-aktivGroteskRegular'
              >
                Logout
              </button>

              <Image
                src={dokmaithinoutlinelogo}
                alt='Dokmai Store Logo'
                width={150}
                height={150}
                className='absolute -bottom-5 -right-5 opacity-40 group-hover:opacity-100 select-none'
              />
            </div>
          </div>
        </div>
      )}

      {fetchingData && <p>Loading premium apps data...</p>}

      {!checkingLocalStorage &&
        !validatingSecretKey &&
        !fetchingData &&
        premiumData.length > 0 && (
          <div className='mt-24 w-full'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-10'>
              {premiumData.map((item, index) => (
                <div
                  key={index}
                  className='shadow pt-5 pb-10 flex flex-col gap-2 border-b-[1px] border-white/50'
                >
                  {Object.entries(item).map(([label, value], idx) => (
                    <>
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
                          alt='Netflix Premium Ultra HD Icon'
                          width={75}
                          height={75}
                        />
                      ) : null}
                      {String(label) === "accessType" ? (
                        <span className='text-xs font-aktivGroteskThin text-white/70'>
                          {String(value)}
                        </span>
                      ) : null}
                    </>
                  ))}
                  {Object.entries(item).map(([label, value], idx) => (
                    <div className='flex flex-col ml-7'>
                      <p className='font-aktivGroteskMedium text-white/60 text-xs '>
                        {String(label) !== "accessType" &&
                        String(label) !== "appName"
                          ? String(label)
                          : null}
                      </p>
                      <p className='text-xl'>
                        {String(label) !== "accessType" &&
                        String(label) !== "appName"
                          ? String(value)
                          : null}
                      </p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

      {!checkingLocalStorage &&
        !validatingSecretKey &&
        !fetchingData &&
        error && <p className='text-red-500 mt-4'>{error}</p>}

      {!checkingLocalStorage &&
        !validatingSecretKey &&
        !fetchingData &&
        premiumData.length === 0 &&
        !error && <p>No premium apps data found for this Secret Key.</p>}
    </div>
  )
}
